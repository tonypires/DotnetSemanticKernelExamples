import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number
) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
];

const TableInfo = () => {
    return (
        <TableContainer component={Paper}>
            <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="a dense table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell style={{ fontWeight: "bold" }}>
                            Table Name
                        </TableCell>
                        <TableCell style={{ fontWeight: "bold" }}>
                            List of columns
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow key={1}>
                        <TableCell>Test Table</TableCell>
                        <TableCell>Id, Name, CreatedAt, UpdatedAt</TableCell>
                    </TableRow>
                    <TableRow key={2}>
                        <TableCell>Test table 2</TableCell>
                        <TableCell>Id, Name, CreatedAt</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const AISQLAgent = () => {
    return (
        <Stack spacing={1}>
            <Typography>
                Fill in the connection details to the database you would like to
                connect to:
            </Typography>
            <Grid
                container
                spacing={2}
                columns={16}
                style={{ display: "flex", alignItems: "center" }}
            >
                <Grid item xs={8}>
                    <TextField
                        style={{ width: "100%" }}
                        label="Connection string to the database"
                        variant="outlined"
                    />
                </Grid>
                <Grid item xs={8}>
                    <Button onClick={() => {}} variant="outlined">
                        Connect
                    </Button>
                </Grid>
                <Grid item xs={16}>
                    <FormControl fullWidth>
                        <InputLabel id="available-dbs-select-label">
                            Select your database
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            //   value={age}
                            label="Select your database"
                            //   onChange={handleChange}
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={16}>
                    <TableInfo />
                </Grid>
                <Grid item xs={16}>
                    <TextField
                        multiline
                        label="Generated output"
                        fullWidth
                        rows={12}
                        InputProps={{
                            readOnly: true,
                        }}
                    ></TextField>
                </Grid>
                <Grid item xs={16}>
                    <Stack direction="row" spacing={2}>
                        <TextField label="Your prompt" fullWidth></TextField>
                        <Button variant="contained">Send</Button>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
};

export default AISQLAgent;
