'use client';
import { useState } from 'react';
import AlertDialog from '../components/AlertDialog';
import styles from '../page.module.css';
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import LoadingDialog from '../components/LoadingDialog';
import { FileObject } from '../client-api/common';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { performSearch } from '../client-api/search-api';
import React from 'react';
import Highlighter from 'react-highlight-words';
import { format } from 'date-fns';

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

type Partition = {
    lastUpdate: string;
    relevance: number;
    text: string;
};

type Result = {
    link: string;
    partitions: Partition[];
    sourceName: string;
    sourceContentType: string;
    tags: string[];
};
type Response = {
    query: string;
    results: Result[];
};

export default function Search() {
    const [toast, setToast] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [searchQuery, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState({} as FileObject);
    const [response, setResponse] = useState({} as Response);

    const reset = () => {
        setIsLoading(false);
        setSelectedFileName('');
        setSearchTerm('');
        setSelectedFile({} as FileObject);
        setResponse({} as Response);
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

    async function handleSearch() {
        showLoading('Searching...');

        try {
            var response = await performSearch(searchQuery, selectedFile);
            var body = await response.json();

            if (!!response.ok) {
                setResponse(body);
            }
        } catch (error: any) {
            showAlert('An error occurred, check the console');
            console.error(error);
        }

        hideLoading();
    }

    const handleViewMore = () => {};

    const handleFileSelect = (e: SelectChangeEvent) => {
        setSelectedFileName(e.target.value);
        const file = FILES.find((f: FileObject) => f.id == e.target.value);
        if (!!file) {
            setSelectedFile(file);
        } else {
            showAlert("Coudln't find the selected file from the array.");
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
                        AI Semantic Search
                    </Typography>
                    <Divider />
                    <Stack spacing={1}>
                        <Typography>
                            Select a file and perform a Google-like search
                            against it.
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
                                        Select file
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
                            <Grid item xs={16}>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="search-label"
                                        label="Enter your search term"
                                        fullWidth
                                        disabled={!selectedFileName}
                                        value={searchQuery}
                                        onChange={(x) =>
                                            setSearchTerm(x.currentTarget.value)
                                        }
                                    />
                                    <Button
                                        disabled={
                                            !searchQuery || !selectedFileName
                                        }
                                        variant="outlined"
                                        onClick={handleSearch}
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        disabled={
                                            !searchQuery || !selectedFileName
                                        }
                                        variant="outlined"
                                        onClick={() => reset()}
                                    >
                                        Clear
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid
                                item
                                xs={16}
                                visibility={
                                    Object.keys(response).length == 0
                                        ? 'hidden'
                                        : 'visible'
                                }
                            >
                                <Paper elevation={3}>
                                    <List dense>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton
                                                    onClick={handleViewMore}
                                                >
                                                    <ReadMoreIcon />
                                                </IconButton>
                                            }
                                        >
                                            <Box>
                                                {Object.keys(response).length >
                                                    0 &&
                                                    response.results.map(
                                                        (
                                                            x: Result,
                                                            idx: number
                                                        ) =>
                                                            x.partitions.map(
                                                                (
                                                                    y: Partition,
                                                                    idx2: number
                                                                ) => (
                                                                    <>
                                                                        <ListItemText
                                                                            key={`${idx}-${idx2}-txt`}
                                                                        >
                                                                            {
                                                                                <Highlighter
                                                                                    key={`${idx}-${idx2}-highlight`}
                                                                                    searchWords={searchQuery.split(
                                                                                        ' '
                                                                                    )}
                                                                                    autoEscape
                                                                                    textToHighlight={
                                                                                        y.text
                                                                                    }
                                                                                />
                                                                                // y.text.slice(
                                                                                // 0,
                                                                                // 800
                                                                                // )
                                                                            }
                                                                            ...
                                                                        </ListItemText>
                                                                        <Stack
                                                                            direction="row"
                                                                            spacing={
                                                                                2
                                                                            }
                                                                            key={`${idx}-${idx2}-stack`}
                                                                        >
                                                                            <Chip
                                                                                key={`${idx}-${idx2}-chip1`}
                                                                                label={`relevance: ${y.relevance}%`}
                                                                                color="success"
                                                                                size="small"
                                                                                sx={{
                                                                                    mt: 1,
                                                                                    mb: 1,
                                                                                }}
                                                                            />
                                                                            <Chip
                                                                                key={`${idx}-${idx2}-chip2`}
                                                                                label={`source: ${x.sourceName}`}
                                                                                color="success"
                                                                                size="small"
                                                                                sx={{
                                                                                    mt: 1,
                                                                                    mb: 1,
                                                                                }}
                                                                            />
                                                                            <Chip
                                                                                key={`${idx}-${idx2}-chip3`}
                                                                                label={`last updated: ${format(
                                                                                    new Date(
                                                                                        y.lastUpdate
                                                                                    ),
                                                                                    'MMMM Lo, yyyy'
                                                                                )}`}
                                                                                color="success"
                                                                                size="small"
                                                                                sx={{
                                                                                    mt: 1,
                                                                                    mb: 1,
                                                                                }}
                                                                            />
                                                                        </Stack>
                                                                        <Divider
                                                                            key={`${idx}-${idx2}-divider`}
                                                                            sx={{
                                                                                m: 2,
                                                                            }}
                                                                        />
                                                                    </>
                                                                )
                                                            )
                                                    )}
                                            </Box>
                                        </ListItem>
                                        <Divider />
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
}
