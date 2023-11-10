'use client';
import { useState } from 'react';
import styles from '../page.module.css';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import {
    Alert,
    Button,
    Container,
    Divider,
    Grid,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AlertDialog from '../components/AlertDialog';
import LoadingDialog from '../components/LoadingDialog';
import { getSentiment } from '../client-api/sentiment-api';

export default function Sentiment() {
    const [toast, setToast] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentimentState, setSentimentState] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [input, setInput] = useState('');

    const reset = () => {
        setToast('');
        setInput('');
        setLoadingMsg('');
        setIsLoading(false);
        setSentimentState('');
        setReasoning('');
    };

    const showAlert = (msg: string) => {
        setAlertMsg(msg);
        setOpenAlert(true);
    };

    async function handlePerform() {
        setIsLoading(true);
        setLoadingMsg('Analysing...');

        try {
            var response = await getSentiment(input);
            var body = await response.json();

            if (!!response.ok) {
                setIsLoading(false);
                setSentimentState(body.sentiment);
                setReasoning(body.reasoning);
            } else {
                showAlert('An error occurred, check the console');
                console.error(body);
                reset();
            }
        } catch (error: any) {
            showAlert('An error occurred, check the console');
            console.error(error);
            reset();
        }

        setIsLoading(false);
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
                        AI Sentiment Analysis
                    </Typography>
                    <Divider />
                    <Stack spacing={1}>
                        <Typography>
                            Enter some text below to analyze its sentiment. For
                            example: A review of a product, feedback for an
                            application, etc.
                        </Typography>
                        <Grid
                            container
                            spacing={2}
                            columns={16}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Grid item xs={16}>
                                <TextField
                                    id="response-label"
                                    multiline
                                    label="Text to analyse"
                                    variant="outlined"
                                    fullWidth
                                    rows={6}
                                    onChange={(e) =>
                                        setInput(e.currentTarget.value)
                                    }
                                ></TextField>
                            </Grid>
                            <Grid item xs={16}>
                                <Button
                                    variant="contained"
                                    onClick={handlePerform}
                                >
                                    Perform Analysis
                                </Button>
                            </Grid>
                            <Grid
                                item
                                xs={16}
                                sx={{
                                    textAlign: 'center',
                                }}
                            >
                                {sentimentState == 'POSITIVE' && (
                                    <SentimentVerySatisfiedIcon
                                        sx={{ fontSize: 100 }}
                                        color="success"
                                    />
                                )}
                                {sentimentState == 'NEGATIVE' && (
                                    <SentimentVeryDissatisfiedIcon
                                        sx={{ fontSize: 100 }}
                                        color="error"
                                    />
                                )}
                                {sentimentState == 'NEUTRAL' && (
                                    <SentimentNeutralIcon
                                        sx={{ fontSize: 100 }}
                                        color="warning"
                                    />
                                )}
                                <Typography>{sentimentState}</Typography>
                            </Grid>
                            <Grid item xs={16}>
                                {!!reasoning && (
                                    <TextField
                                        id="reasoning-label"
                                        multiline
                                        label="Reasoning"
                                        variant="outlined"
                                        fullWidth
                                        rows={6}
                                        value={reasoning}
                                        InputLabelProps={{
                                            shrink: !!reasoning,
                                        }}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
}
