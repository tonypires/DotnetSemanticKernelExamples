'use client';
import {
    Alert,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AlertDialog from '../components/AlertDialog';
import LoadingDialog from '../components/LoadingDialog';
import styles from '../page.module.css';
import { useState } from 'react';
import { FILES, FileObject } from '../client-api/common';
import { getSummary } from '../client-api/summarize-api';

export default function Summarize() {
    const [toast, setToast] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState({} as FileObject);
    const [response, setResponse] = useState('');
    const [action, setAction] = useState('');

    const reset = () => {
        setIsLoading(false);
        setSelectedFileName('');
        setSelectedFile({} as FileObject);
        setResponse('');
    };

    const showLoading = (msg?: string) => {
        setIsLoading(true);
        setLoadingMsg(msg || '');
    };

    const hideLoading = () => {
        setIsLoading(false);
    };

    const showAlert = (msg: string) => {
        setAlertMsg(msg);
        setOpenAlert(true);
    };

    async function handleSummarize(
        action: 'SUMMARIZE' | 'KEYPOINTS' | 'ELI5' | 'TOPICS'
    ) {
        showLoading('Thinking...');
        setAction(action);

        try {
            const response = await getSummary(action, selectedFile);
            const body = await response.json();

            if (!!response.ok) {
                setResponse(body.response);
            } else {
                showAlert('An error occurred, check the console');
                console.log(body);
            }
        } catch (error: any) {
            console.error(error);
        }

        hideLoading();
    }

    const handleFileSelect = (e: SelectChangeEvent) => {
        reset();
        setSelectedFileName(e.target.value);
        const file = FILES.find((f: FileObject) => f.id == e.target.value);
        if (!!file) {
            setSelectedFile(file);
        } else {
            showAlert("Couldn't find the selected file from the array.");
        }
    };
    return (
        <>
            <AlertDialog
                open={openAlert}
                handleClose={() => setOpenAlert(false)}
                msg={alertMsg}
            />
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
            <LoadingDialog open={isLoading} msg={loadingMsg || 'Thinking...'} />
            <Container className={styles.main}>
                <Stack spacing={2}>
                    <Typography variant="h3" textAlign={'center'}>
                        AI Summarization
                    </Typography>
                    <Divider />
                    <Grid
                        container
                        spacing={2}
                        columns={16}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Typography>
                            Select a file to perform any of the available
                            operations below.
                            <List>
                                <ListItem>
                                    - Summarize: Sumarizes the entire pdf file.
                                </ListItem>
                                <ListItem>
                                    - Key Points: Bullet point list of the key
                                    points.
                                </ListItem>
                                <ListItem>
                                    - ELI5 (Explain like I'm 5): Explains the
                                    pdf back to you as if you're 5 years old.
                                </ListItem>
                                <ListItem>
                                    - Topics: Returns a list of topics from the
                                    pdf file in json.
                                </ListItem>
                            </List>
                        </Typography>
                        <Grid item xs={8}>
                            <FormControl fullWidth>
                                <InputLabel id="select-file-label">
                                    Select file
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedFileName}
                                    label="Select your database"
                                    onChange={handleFileSelect}
                                >
                                    {FILES.map((x: FileObject, idx: number) => (
                                        <MenuItem value={x.id} key={idx}>
                                            {x.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={16}>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSummarize('SUMMARIZE')}
                                >
                                    Summarize
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSummarize('KEYPOINTS')}
                                >
                                    Key points
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSummarize('ELI5')}
                                >
                                    ELI5
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSummarize('TOPICS')}
                                >
                                    Topics
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={16}>
                            <TextField
                                id="output-label"
                                multiline
                                label={action}
                                variant="outlined"
                                fullWidth
                                rows={10}
                                value={response}
                                InputLabelProps={{
                                    shrink: !!response,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </>
    );
}
