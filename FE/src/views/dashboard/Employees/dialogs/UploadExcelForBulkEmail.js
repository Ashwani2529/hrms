import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import React from 'react';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import axiosServices from 'utils/axios';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKSingleUpload from 'views/ui-elements/form/FKSingleUpload';
import * as Yup from 'yup';

function UploadExcelForBulk({ handleCloseSendBulkEmailModal }) {
    const initialValues = {
        file: undefined
    };

    const validationSchema = Yup.object({
        file: Yup.mixed().required('Please upload a file')
    });

    const onSubmit = async (values) => {
        try {
            if (!values.file) throw new Error('File not found');
            const { name } = values?.file;
            if (!name) throw new Error('Could not read name of the given file!');
            const templateId = /\[(.*)\]/g.exec(name)[1];
            if (!templateId) throw new Error('No template_id was found in the filename');
            const formData = new FormData();
            formData.append('file', values.file);
            formData.append('template_id', templateId);
            const res = await axiosServices.post('/user-doc/create-multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/formdata'
                }
            });

            if (res.status === 201) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Request processed Successfully!',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: false
                    })
                );
                handleCloseSendBulkEmailModal();
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || 'Failed to process the request!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        validateOnBlur: false,
        validateOnChange: false
    });

    const { error, isSubmitting } = formik;

    const handleExcelUpload = async (files) => {
        console.log({ files });
        return files[0];
    };

    return (
        <FKProvider value={formik}>
            <FKSingleUpload name="file" label="Upload Excel" onDrop={handleExcelUpload} />
            <LoadingButton variant="outlined" size="large" type="submit" loading={isSubmitting}>
                Upload
            </LoadingButton>
        </FKProvider>
    );
}

export default UploadExcelForBulk;
