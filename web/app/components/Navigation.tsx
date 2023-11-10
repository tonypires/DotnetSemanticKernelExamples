'use client';
import { AppBar, Button, Stack, Toolbar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ScienceIcon from '@mui/icons-material/Science';

export default function Navigation() {
    const currentPath = usePathname();
    return (
        <AppBar component="nav">
            <Toolbar>
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ alignItems: 'center' }}
                >
                    <ScienceIcon />
                    <Link href="/">
                        <Button
                            color="secondary"
                            variant={
                                currentPath == '/' ? 'contained' : 'outlined'
                            }
                        >
                            AI SQL Agent
                        </Button>
                    </Link>

                    <Link href="/doc-chat">
                        <Button
                            color="secondary"
                            variant={
                                currentPath == '/doc-chat'
                                    ? 'contained'
                                    : 'outlined'
                            }
                        >
                            PDF Chat Bot
                        </Button>
                    </Link>

                    <Link href="/sentiment">
                        <Button
                            color="secondary"
                            variant={
                                currentPath == '/sentiment'
                                    ? 'contained'
                                    : 'outlined'
                            }
                        >
                            Sentiment Analysis
                        </Button>
                    </Link>

                    <Link href="/search">
                        <Button
                            color="secondary"
                            variant={
                                currentPath == '/search'
                                    ? 'contained'
                                    : 'outlined'
                            }
                        >
                            Semantic Search
                        </Button>
                    </Link>

                    <Link href="/summarize">
                        <Button
                            color="secondary"
                            variant={
                                currentPath == '/summarize'
                                    ? 'contained'
                                    : 'outlined'
                            }
                        >
                            Summarize
                        </Button>
                    </Link>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
