import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

type LoadingType = {
    open: boolean;
    msg: string;
};

export default function LoadingDialog(props: LoadingType) {
    return (
        <Dialog
            open={props.open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {props.msg || 'Loading...'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <LinearProgress sx={{ width: '500px' }} />
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}
