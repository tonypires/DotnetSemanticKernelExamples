'use client';
import styles from './page.module.css';
import { Box, Container, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import AISQLAgent from './components/AISQLAgent';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export default function Home() {
    return (
        <>
            <Container className={styles.main}>
                <Stack spacing={2}>
                    <Typography variant="h3" textAlign={'center'}>
                        AI SQL Agent
                    </Typography>
                    <Divider />
                    <Box sx={{ width: '100%' }}>
                        <AISQLAgent />
                    </Box>
                </Stack>
            </Container>
        </>
    );
}
