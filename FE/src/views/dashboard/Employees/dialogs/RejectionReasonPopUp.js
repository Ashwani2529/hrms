/* eslint-disable */
import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Dialog, DialogActions, DialogContent, Grid,  Stack, Button, DialogTitle, Divider} from "@mui/material";
import { LoadingButton } from '@mui/lab';

import { gridSpacing } from "store/constant";
import { useTheme } from '@mui/material/styles';
import { EmployeeActions } from "store/slices/employee";
import { dispatch } from "store";
import { openSnackbar } from "store/slices/snackbar";
import { findKeyInObject } from "utils/findKeyInObjects";


const RejectionReasonModal = ({ openRejectDialog, setOpenRejectDialog, handleModalClose, selectedEmployee}) => {
    const theme = useTheme();

    const {verifyEmployeeData, fetchEmployees} = EmployeeActions;
    const [text, setText] = useState("");
    const [isSubmitting, setSubmitting] = useState(false)

    const handleChange = (value) => {
        console.log(value)
        setText(value);
    };
    const sendRejectionEmail = async()=>{
        //Send email
        const data = {
            user_id: selectedEmployee?.user_id,
            status: 'REJECT',
            reject_reason : text,
        }
        setSubmitting(true)
        const res = await dispatch(verifyEmployeeData({data}))
        if (res?.payload?.status === 200 || res?.payload?.status === 201) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: `Status updated successfully`,
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            setSubmitting(false);
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    message:  findKeyInObject(res?.payload, `message`) ||
                    findKeyInObject(res?.payload, `error`) || `Internal server error.`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            setSubmitting(false);
        }
        handleModalClose()
        dispatch(fetchEmployees({ page: 1, limit: 25, search: "", status: "", emp_type: ""}))
    }

    return (
        <Dialog maxWidth="sm" fullWidth open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
            <DialogTitle sx={{padding:'6px 24px'}}>
                Rejection reason
            </DialogTitle>
            <Divider />

            <DialogContent fullWidth>
            <Grid item xs={12}>
                    <Stack
                        spacing={gridSpacing}
                        sx={{
                            '& .quill': {
                                bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                                borderRadius: '12px',
                                '& .ql-toolbar': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.100',
                                    borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.light + 20 : 'primary.light',
                                    borderTopLeftRadius: '12px',
                                    borderTopRightRadius: '12px'
                                },
                                '& .ql-container': {
                                    borderColor:
                                        theme.palette.mode === 'dark' ? `${theme.palette.dark.light + 20} !important` : 'primary.light',
                                    borderBottomLeftRadius: '12px',
                                    borderBottomRightRadius: '12px',
                                    '& .ql-editor': {
                                        minHeight: 135
                                    }
                                }
                            }
                        }}
                    >
                        <ReactQuill value={text}  onChange={handleChange}/>
                    </Stack>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Grid container justifyContent="flex-end" alignItems="center">
                    <Grid item>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button type="button" variant="outlined" onClick={() => setOpenRejectDialog(false)}>
                                Cancel
                            </Button>
                            <LoadingButton 
                                variant="contained" 
                                onClick={sendRejectionEmail}
                                loading={isSubmitting}
                            >
                                Submit
                            </LoadingButton>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    )
}

export default RejectionReasonModal;