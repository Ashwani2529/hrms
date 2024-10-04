import React from 'react';
import { Box, Button, DialogContent, Divider, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import * as Yup from 'yup';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKSelect from 'views/ui-elements/form/FKSelect';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import axiosServices from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { downloadBlobFile } from 'utils/downloadBlobFile';
import sampleFile from 'assets/images/users/sampleFile.xlsx';

function DownloadBulkCreateTemplate({ handleCloseDownloadTemplate }) {
    const { templates = [] } = useSelector((state) => state.templates);

    const initialValues = {
        templateId: ''
    };

    const validationSchema = Yup.object({
        templateId: Yup.string().required('Please select a template')
    });

    const onSubmit = async (values) => {
        try {
            if (values?.templateId !== 'NONE') {
                const res = await axiosServices.post('/user/generateSampleExcel', values, {
                    responseType: 'blob'
                });
                downloadBlobFile(
                    res,
                    `create_bulk_employees_[${values?.templateId}].xlsx`,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
            } else {
                const res = await axiosServices.post(
                    '/user/generateSampleExcel',
                    {},
                    {
                        responseType: 'blob'
                    }
                );
                downloadBlobFile(res, `samplefile.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            }
            handleCloseDownloadTemplate();
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || 'Failed to download!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
            console.log(error);
        }
    };

    const formik = useFormik({
        validationSchema,
        initialValues,
        onSubmit,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true
    });

    const { errors, isSubmitting } = formik;

    return (
        <DialogContent>
            <Box sx={{ width: 500 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h3">Download Template</Typography>
                        <Typography variant="subtitle2">Select a template to send letter to the employees</Typography>
                    </Box>
                    <IconButton onClick={handleCloseDownloadTemplate}>
                        <Close />
                    </IconButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <FKProvider value={formik}>
                    <FKSelect name="templateId" label="Select Template">
                        <MenuItem value="NONE">Default Onboarding Template</MenuItem>
                        {templates
                            ?.filter((e) => !e?.default)
                            ?.map((template) => (
                                <MenuItem key={template?.template_id} value={template?.template_id}>
                                    {template?.template_name}
                                </MenuItem>
                            ))}
                    </FKSelect>
                    <Stack>
                        <LoadingButton loading={isSubmitting} type="submit" size="large" variant="contained">
                            Download
                        </LoadingButton>
                    </Stack>
                </FKProvider>
            </Box>
        </DialogContent>
    );
}

export default DownloadBulkCreateTemplate;
