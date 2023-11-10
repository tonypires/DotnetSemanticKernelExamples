'use client';
import {
    Alert,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import styles from '../page.module.css';
import { useState } from 'react';
import AlertDialog from '../components/AlertDialog';
import {
    chatToPdf,
    checkImported,
    processImport,
} from '../client-api/pdf-chat-api';
import LoadingDialog from '../components/LoadingDialog';
import { FileObject } from '../client-api/common';

const FILES = [
    {
        index: 'bsg',
        id: 'doc001',
        description: 'TheLastHope.pdf (small)',
        filename: 'TheLastHope.pdf',
        tags: {
            source: ['web'],
            type: ['entertainment'],
            collection: ['bsg', 'battlestar galactica'],
        },
    } as FileObject,
    {
        index: 'finance',
        id: 'doc002',
        description: 'Apple 10-K 2021 (large)',
        filename: 'Apple-2021-10K.pdf',
        tags: {
            source: ['web'],
            type: ['finance'],
            collection: ['apple', '10k'],
        },
    } as FileObject,
] as FileObject[];

export default function DocChat() {
    const [response, setResponse] = useState('');
    const [memories, setMemories] = useState('');
    const [question, setQuestion] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [importButtonLabel, setImportButtonLabel] = useState('IMPORT');
    const [selectedFile, setSelectedFile] = useState({} as FileObject);
    const [toast, setToast] = useState('');
    const [ready, setReady] = useState(false);

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

    const reset = () => {
        // dispatch({ type: 'reset' });
        setResponse('');
        setMemories('');
        setQuestion('');
        setIsLoading(false);
        setImportButtonLabel('IMPORT');
        setReady(false);
    };

    async function handleFileSelect(evt: SelectChangeEvent) {
        reset();
        setSelectedFileName(evt.target.value);
        showLoading('Checking if already indexed...');

        const file = FILES.find((f: FileObject) => f.id == evt.target.value);
        if (!!file) {
            setSelectedFile(file);
            // Call the api to see if this file has already been imported
            var response = await checkImported(file.index, file.id);
            var body = await response.json();

            if (!!response.ok) {
                if (!!body.documentExists) {
                    setImportButtonLabel('IMPORTED');
                    setToast('Ready');
                    setReady(true);
                } else {
                    reset();
                }
            } else {
                console.error(response);
            }
        }

        hideLoading();
    }

    async function handleImport() {
        showLoading('Importing...');
        const response = await processImport(selectedFile);
        const body = await response.text();

        if (!!response.ok) {
            setToast('Import completed successfully');
            setReady(true);
        } else {
            showAlert('Something went wrong, check the console');
            console.error(body);
        }

        hideLoading();
    }

    async function handleSend() {
        showLoading();
        try {
            const response = await chatToPdf(selectedFile, question);
            const body = await response.json();

            if (!!response.ok) {
                setResponse(body.response);
                setMemories(body.memories);
            } else {
                showAlert('An error occurred, check the console.');
                console.log(body);
            }
        } catch (error: any) {
            console.error(error);
        }

        hideLoading();
    }

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
                        AI PDF Q&A Chatbot
                    </Typography>
                    <Divider />
                    <Stack spacing={1}>
                        <Typography>
                            Select a pdf file to have a chat with. You can ask
                            it questions, request it to perform tasks like
                            summarize it's contents, list out key points, etc:
                        </Typography>
                        <Grid
                            container
                            spacing={2}
                            columns={16}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Grid item xs={8}>
                                <FormControl fullWidth>
                                    <InputLabel id="select-file-label">
                                        Select file to chat with
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={selectedFileName}
                                        label="Select your database"
                                        onChange={handleFileSelect}
                                    >
                                        {FILES.map(
                                            (x: FileObject, idx: number) => (
                                                <MenuItem
                                                    value={x.id}
                                                    key={idx}
                                                >
                                                    {x.description}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <Button
                                    disabled={
                                        !selectedFileName ||
                                        importButtonLabel == 'IMPORTED'
                                    }
                                    variant="outlined"
                                    onClick={handleImport}
                                >
                                    {importButtonLabel}
                                </Button>
                            </Grid>
                            <Grid item xs={16}>
                                <TextField
                                    id="response-label"
                                    InputLabelProps={{ shrink: !!response }}
                                    multiline
                                    label="Response"
                                    variant="filled"
                                    fullWidth
                                    rows={18}
                                    value={response}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                ></TextField>
                            </Grid>
                            <Grid item xs={16}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        disabled={!ready}
                                        required
                                        style={{ width: '100%' }}
                                        label="Question"
                                        onChange={(x) =>
                                            setQuestion(x.currentTarget.value)
                                        }
                                        variant="outlined"
                                    />
                                    <Button
                                        disabled={!ready}
                                        variant="outlined"
                                        onClick={handleSend}
                                    >
                                        Send
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid item xs={16}>
                                <TextField
                                    id="memories-label"
                                    InputLabelProps={{ shrink: !!memories }}
                                    multiline
                                    label="Memories"
                                    fullWidth
                                    rows={12}
                                    variant="filled"
                                    value={memories}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                ></TextField>
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
}
