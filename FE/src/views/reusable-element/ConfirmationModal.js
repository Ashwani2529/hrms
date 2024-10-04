/* eslint-disable */

import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, useMediaQuery } from '@mui/material';
import { useSelector } from 'store';
import { useDispatch } from 'store';
import { closeConfirmationModal, showLoading } from 'store/slices/confirmationModal';
import {LoadingButton} from '@mui/lab'

// ===============================|| UI DIALOG - RESPONSIVE ||=============================== //

export default function ConfirmationModal() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const dispatch = useDispatch()
    const {open, handleConfirm, message, loading} = useSelector((state)=> state.confirmationModal)

    const handleClose = () => {
        dispatch(closeConfirmationModal());
    };

    const handleSubmit = async()=>{
        await dispatch(showLoading())
        const res = await handleConfirm();

        await dispatch(showLoading())
        dispatch(closeConfirmationModal());
    }

    return (
        <div >
            <Dialog 
                // fullScreen={fullScreen} 
                open={open} 
                onClose={handleClose} 
                aria-labelledby="responsive-dialog-title"
                sx={{
                    '& .MuiPaper-root':{
                        width:'400px'
                    }
                }}
            >
                {open && (
                    <>
                        <DialogTitle id="responsive-dialog-title">Are you sure?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <Typography variant="body2" component="span">
                                   {message}
                                </Typography>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{ pr: 2.5 }}>
                            <Button sx={{ color: theme.palette.error.dark }} autoFocus onClick={handleClose} color="secondary">
                                cancel
                            </Button>
                            <LoadingButton type="button" 
                                variant="contained" 
                                size="small" 
                                onClick={handleSubmit} 
                                autoFocus
                                loading={loading}
                            >
                                submit
                            </LoadingButton>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}
