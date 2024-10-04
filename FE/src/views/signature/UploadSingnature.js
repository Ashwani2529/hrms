import React from 'react';
import { Box, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKSingleUpload from 'views/ui-elements/form/FKSingleUpload';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

function UploadSingnature({ setUploadedSignatureUrl, uploadedSignatureUrl }) {
    const initialValues = {
        file: uploadedSignatureUrl || ''
    };
    const validationSchema = Yup.object({});
    const onSubmit = async () => {};

    const formik = useFormik({
        validationSchema,
        initialValues,
        onSubmit
    });

    const { setFieldValue } = formik;

    const handleDrop = (files) => {
        if (!Array.isArray(files) || !files[0])
            return dispatch(
                openSnackbar({
                    open: true,
                    message: `No file was recieved as input!`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        const fileUrl = URL.createObjectURL(files[0]);
        setUploadedSignatureUrl(fileUrl);
        setFieldValue('');
        console.log(files[0]);
        return null;
    };

    return (
        <Box>
            <FKProvider value={formik}>
                <FKSingleUpload name="file" onDrop={handleDrop} />
            </FKProvider>
        </Box>
    );
}

export default UploadSingnature;
