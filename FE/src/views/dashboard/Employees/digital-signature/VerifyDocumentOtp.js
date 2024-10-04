import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, DialogContent, Divider, IconButton, Stack, Typography } from '@mui/material';
import FKProvider from 'views/ui-elements/form/FKProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FKTextfield from 'views/ui-elements/form/FKTextfield';
import { LoadingButton } from '@mui/lab';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { Close } from '@mui/icons-material';
import moment from 'moment';

function VerifyDocumentOtp({ sendingOtp, resendOtpTimer, sendVerificationOtp, otpSent, handleSend, handleCloseOtpModal }) {
    const initialValues = {
        code: ''
    };

    const validationSchema = Yup.object({
        code: Yup.string().required('Please provide OTP')
    });

    const onSubmit = async (values) => {
        await handleSend(values.code);
        handleCloseOtpModal();
        window.location.reload();
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        validateOnBlur: false,
        validateOnChange: false
    });

    const { isSubmitting } = formik;

    return (
        <DialogContent sx={{ minWidth: 300, width: '40vw', maxWidth: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h3">Verify OTP</Typography>
                <IconButton onClick={handleCloseOtpModal}>
                    <Close />
                </IconButton>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle">Note: Please check your email for the verification OTP</Typography>
            <Box mt={2}>
                <FKProvider value={formik}>
                    <FKTextfield name="code" type="number" min={0} label="OTP" />
                    <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={2}>
                        <LoadingButton onClick={sendVerificationOtp} disabled={resendOtpTimer} loading={sendingOtp} variant="outlined">
                            {resendOtpTimer ? `${resendOtpTimer}s` : 'Resend OTP'}
                        </LoadingButton>
                        <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
                            Verify
                        </LoadingButton>
                    </Stack>
                </FKProvider>
            </Box>
        </DialogContent>
    );
}

export default VerifyDocumentOtp;
