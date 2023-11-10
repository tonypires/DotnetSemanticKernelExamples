import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import AlertDialog from './AlertDialog';
import {
    connect,
    generateSchema,
    getSchema,
    learnSchema,
} from '../client-api/sql-agent-api';
import TableInfo from './AISQLAgent/Table';
import LoadingDialog from './LoadingDialog';
import { gruvboxDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactSyntaxHighlighter from 'react-syntax-highlighter';

const AISQLAgent = () => {
    const [connection, setConnection] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [availableDbs, setAvailableDbs] = useState([] as string[]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [tableRows, setTableRows] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [toast, setToast] = useState('');
    const [learningComplete, setLearningComplete] = useState(false);
    const [memories, setMemories] = useState('');

    const showAlert = (msg: string) => {
        setAlertMsg(msg);
        setOpenAlert(true);
    };

    const showLoading = (title: string) => {
        setLoadingMsg(title);
        setIsLoading(true);
    };

    const closeLoading = () => {
        setIsLoading(false);
    };

    const reset = () => {
        setConnected(false);
        setConnecting(false);
        setConnection('');
        setAvailableDbs([]);
        setSelectedDatabase('');
        setTableRows(null);
        setPrompt('');
        setToast('');
        setLearningComplete(false);
    };

    async function handleLearn() {
        showLoading(`Learning ${selectedDatabase}...`);

        try {
            const response = await learnSchema(connection, selectedDatabase);
            const body = await response.json();

            if (!!response.ok) {
                setToast('Learning complete');
                setLearningComplete(true);
            } else {
                showAlert(
                    JSON.stringify(
                        'An error occurred, review the console for details.'
                    )
                );
                console.error(response);
            }
        } catch (error: any) {
            showAlert(error);
            console.error(error);
        }

        closeLoading();
    }

    async function handleSendPrompt() {
        showLoading('Generating SQL...');

        try {
            const response = await generateSchema(
                connection,
                selectedDatabase,
                prompt
            );
            const body = await response.json();

            if (!!response.ok) {
                setOutput(body.response);
                setMemories(body.memories);
            } else {
                showAlert(JSON.stringify(body.errors));
                console.error(body);
            }
        } catch (error: any) {
            showAlert(error);
            console.error(error);
        }

        closeLoading();
    }

    async function handleDatabaseChange(event: SelectChangeEvent) {
        const { value } = event.target;

        showLoading('Retrieving database schema...');
        setSelectedDatabase(value);

        const response = await getSchema(connection, value);
        const body = await response.json();

        if (!!response.ok) {
            setTableRows(body);
        } else {
            let error = !!body.errors
                ? JSON.stringify(body.errors)
                : 'An error occurred generating the schema, please try again';
            showAlert(error);
            console.log(response);
        }
        closeLoading();
    }

    async function handleConnect() {
        // if we are connected - disconnect
        if (!!connected) {
            reset();
            return;
        }
        // validation
        if (!connection) {
            showAlert('Please enter a valid server instance');
            return;
        }

        // Attempt to connect
        setConnecting(true);

        try {
            const response = await connect(connection);
            const res = await response.json();

            if (!!response.ok) {
                setAvailableDbs(res);
                setConnected(true);
                setConnecting(false);
                setToast('Connected');
            } else {
                setConnected(false);
                showAlert(
                    'An error occurred trying to connect to that server.'
                );
                console.log(response);
                reset();
            }
        } catch (error: any) {
            showAlert(error.message);
            console.error(error);
            reset();
        }
    }

    return (
        <>
            <AlertDialog
                open={openAlert}
                handleClose={() => setOpenAlert(false)}
                msg={alertMsg}
            />
            <LoadingDialog open={isLoading} msg={loadingMsg || 'Loading...'} />
            <Snackbar
                open={!!toast}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                autoHideDuration={6000}
                onClose={() => setToast('')}
            >
                <Alert
                    onClose={() => setToast('')}
                    severity="success"
                    variant="filled"
                >
                    {toast}
                </Alert>
            </Snackbar>
            <Stack spacing={1}>
                <Typography>
                    Fill in the connection details to the database you would
                    like to connect to:
                </Typography>
                <Grid
                    container
                    spacing={2}
                    columns={16}
                    style={{ display: 'flex', alignItems: 'center' }}
                >
                    <Grid item xs={8}>
                        <TextField
                            disabled={connecting || connected}
                            required
                            style={{ width: '100%' }}
                            label="SQL Server instance"
                            variant="outlined"
                            value={connection}
                            onChange={(event) =>
                                setConnection(event.currentTarget.value)
                            }
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <Button
                            onClick={handleConnect}
                            disabled={connecting}
                            variant="outlined"
                            color={!!connected ? 'error' : 'primary'}
                        >
                            {(!!connecting && 'Connecting...') ||
                                (!connected && !connecting && 'Connect') ||
                                (!!connected && 'Disconnect')}
                        </Button>
                    </Grid>
                    <Grid item xs={16}>
                        <Stack spacing={2} direction="row">
                            <FormControl fullWidth disabled={!connected}>
                                <InputLabel id="available-dbs-select-label">
                                    Select your database
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedDatabase}
                                    label="Select your database"
                                    onChange={handleDatabaseChange}
                                >
                                    {availableDbs.map(
                                        (x: string, idx: number) => (
                                            <MenuItem key={idx} value={x}>
                                                {x}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                            <Button
                                disabled={!connected || !selectedDatabase}
                                variant="contained"
                                onClick={handleLearn}
                            >
                                Learn
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={16}>
                        {!!tableRows && <TableInfo rows={tableRows} />}
                    </Grid>
                    <Grid item xs={16}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                disabled={!connected}
                                value={prompt}
                                onChange={(evt: any) =>
                                    setPrompt(evt.currentTarget.value)
                                }
                                label="Describe the SQL statement you would like the AI SQL Agent to generate..."
                                fullWidth
                            ></TextField>
                            <Tooltip
                                title={
                                    !connected || !prompt || !learningComplete
                                        ? 'Click the Learn button above to prime the agent.'
                                        : ''
                                }
                            >
                                <Box display="flex">
                                    <Button
                                        disabled={
                                            !connected ||
                                            !prompt ||
                                            !learningComplete
                                        }
                                        variant="contained"
                                        onClick={handleSendPrompt}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </Tooltip>
                        </Stack>
                    </Grid>
                    <Grid item xs={16}>
                        <InputLabel id="sql-output-label">
                            Generated SQL
                        </InputLabel>
                        <ReactSyntaxHighlighter
                            showLineNumbers
                            language="sql"
                            style={gruvboxDark}
                        >
                            {output}
                        </ReactSyntaxHighlighter>
                        {/* <TextField */}
                        {/*     id="generated-output-label" */}
                        {/*     InputLabelProps={{ shrink: !!output }} */}
                        {/*     multiline */}
                        {/*     label="Generated SQL" */}
                        {/*     fullWidth */}
                        {/*     rows={12} */}
                        {/*     value={output} */}
                        {/*     variant="filled" */}
                        {/*     InputProps={{ */}
                        {/*         readOnly: true, */}
                        {/*     }} */}
                        {/* ></TextField> */}
                    </Grid>
                    <Grid item xs={16}>
                        <TextField
                            id="generated-output-label"
                            InputLabelProps={{ shrink: !!memories }}
                            multiline
                            label="Similary memories from the Vector db"
                            fullWidth
                            rows={30}
                            value={memories}
                            variant="filled"
                            InputProps={{
                                readOnly: true,
                            }}
                        ></TextField>
                    </Grid>
                </Grid>
            </Stack>
        </>
    );
};

export default AISQLAgent;
