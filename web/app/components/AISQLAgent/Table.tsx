import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';

type TableProps = {
    rows: { [key: string]: string };
};

const TableInfo = (props: TableProps) => {
    const { rows } = props;
    return (
        <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table
                    stickyHeader
                    sx={{ minWidth: 650 }}
                    size="small"
                    aria-label="a dense table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold' }}>
                                Table
                            </TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>
                                Columns
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            Object.entries(rows).map(
                                (key: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell>{key[0]}</TableCell>
                                        <TableCell>{key[1]}</TableCell>
                                    </TableRow>
                                )
                            )
                            // Object.entries(rows).map((x: DatabaseRow, idx: number) => (
                            // <TableRow key={idx}>
                            //     <TableCell>{x.tableName}</TableCell>
                            //     <TableCell>{x.columns}</TableCell>
                            // </TableRow>
                            // ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TableInfo;
