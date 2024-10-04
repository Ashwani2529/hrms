import React, { useState } from 'react';
import * as Yup from 'yup';
import { DialogContent, DialogActions, Typography, Button, TextField, Stack, CardContent, IconButton, Box, Divider } from '@mui/material';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useFormik } from 'formik';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKTextfield from 'views/ui-elements/form/FKTextfield';
import { INSERT_IMAGE_COMMAND } from '../plugins/InsertImagePlugin';
import MainCard from 'ui-component/cards/MainCard';
import { Close } from '@mui/icons-material';
import FKSingleUpload from 'views/ui-elements/form/FKSingleUpload';
import uploadFileToS3 from 'utils/uploadFileToS3';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { LoadingButton } from '@mui/lab';

function InsertImageDialog({ closeInputModal, ...props }) {
    const [editor] = useLexicalComposerContext();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        imageUrl: ''
    };

    const validationSchema = Yup.object({
        imageUrl: Yup.string().required()
    });

    const onSubmit = async (values) => {
        try {
            console.log({ values });
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: 'image',
                src: values.imageUrl
            });
            closeInputModal();
        } catch (error) {
            console.log({ error });
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        enableReinitialize: true,
        validateOnBlur: false,
        validateOnChange: false
    });

    const { values, errors } = formik;

    const handleImageUpload = async (file) => {
        setLoading(true);
        try {
            const url = await uploadFileToS3(file[0]);
            if (url) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Image uploaded successfully!',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
            }
            setLoading(false);
            return url;
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Failed to upload image!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            console.log({ error });
            setLoading(false);
            return '';
        }
    };

    return (
        <>
            <DialogContent sx={{ minWidth: 500, p: 0 }}>
                <Box py={2} px={3}>
                    <Stack sx={{ p: 0, m: 0 }} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                        <Typography variant="h3">Upload Image</Typography>
                        <IconButton size="small" onClick={closeInputModal}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>
                <Divider />
                <Box py={2} px={3}>
                    <FKProvider value={formik}>
                        <FKTextfield name="imageUrl" label="Image URL" />
                        <Typography textAlign="center" variant="h3">
                            OR
                        </Typography>
                        <FKSingleUpload name="imageUrl" onDrop={handleImageUpload} />
                        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1}>
                            <LoadingButton loading={loading} type="submit" variant="contained">
                                Add Image
                            </LoadingButton>
                            <Button onClick={closeInputModal} variant="outlined">
                                Close
                            </Button>
                        </Stack>
                    </FKProvider>
                </Box>
            </DialogContent>
        </>
    );
}

export default InsertImageDialog;
