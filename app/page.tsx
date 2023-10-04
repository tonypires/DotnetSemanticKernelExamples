'use client';
import Image from 'next/image';
import styles from './page.module.css';
import {
    Box,
    Container,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import AISQLAgent from './components/AISQLAgent';
import Link from 'next/link';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Home() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    return (
        <>
            <Container className={styles.main}>
                <Stack spacing={2}>
                    <Typography variant="h3" textAlign={'center'}>
                        AI POCs
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange}>
                                <Tab label="AI SQL" {...a11yProps(0)} />
                                <Tab label="AI PDF" {...a11yProps(1)} />
                                <Tab
                                    label="AI App Documentation"
                                    {...a11yProps(2)}
                                />
                                <Tab label="AI PowerPoint" {...a11yProps(3)} />
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            <AISQLAgent />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            Upload a pdf file and ask questions against it
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            Specify the path to an application (e.g. a node app
                            or c# web api) for it to read the contents and put
                            together some documentation.
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={3}>
                            Describe a powerpoint presentation to generate.
                            Build a form which describes how many slides (at
                            least), how concise it should be, etc. Look at{' '}
                            <Link
                                href="https://github.com/CyberTimon/Powerpointer-For-Local-LLMs/tree/main"
                                target="_blank"
                            >
                                https://github.com/CyberTimon/Powerpointer-For-Local-LLMs/tree/main
                            </Link>
                        </CustomTabPanel>
                    </Box>
                </Stack>
            </Container>
        </>
    );
}
