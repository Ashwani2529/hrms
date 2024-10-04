/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Alert, AlertTitle, Button, Dialog, DialogContent, Box, Stack, MenuItem, Typography } from '@mui/material';
import * as Yup from 'yup';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { dispatch } from 'store';
import { EmployeeActions } from 'store/slices/employee';
import { openSnackbar } from 'store/slices/snackbar';
import sampleFile from 'assets/images/users/sampleFile.xlsx';
import DownloadBulkCreateTemplate from './dialogs/DownloadBulkCreateTemplate';
import { gridSpacing } from 'store/constant';
import { useFormik } from 'formik';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKSingleUpload from 'views/ui-elements/form/FKSingleUpload';
import FKSelect from 'views/ui-elements/form/FKSelect';
import { useSelector } from 'react-redux';
import { findKeyInObject } from 'utils/findKeyInObjects';

const ExcelUploadComponent = () => {
    const navigate = useNavigate();
    // const [selectedFile, setSelectedFile] = useState();
    // const [erroState, setErrorState] = useState(false);
    const [openDownloadTemplate, setOpenDownloadTemplate] = useState(false);
    // const [selectedFile, setSelectedFile] = useState();

    const { createMultipleEmployee } = EmployeeActions;
    // const { templates } = useSelector((state) => state.templates);

    const initialValues = {
        templateId: '',
        file: undefined
    };

    const onSubmit = async (values) => {
        try {
            const templateId = /\[(.*)\]/g.exec(values.file.name);
            const formData = new FormData();
            formData.append('file', values.file);
            formData.append('templateId', templateId ? templateId[1] : '');

            const res = await dispatch(createMultipleEmployee(formData));

            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: res?.payload?.data?.message || `Employees created successfully`,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                navigate('/employees/list');
            } else {
                throw new Error(findKeyInObject(res?.payload, `message`) ||
                findKeyInObject(res?.payload, `error`));
            }
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || 'Failed to process the file!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        }
    };

    const validationSchema = Yup.object({
        templateId: Yup.string(),
        file: Yup.mixed().required('Please provide an excel file')
    });

    const formik = useFormik({
        validationSchema,
        initialValues,
        onSubmit,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true
    });

    const { isSubmitting, handleSubmit, handleReset } = formik;

    const handleExcelUpload = async (files) => {
        console.log({ files });
        return files[0];
    };

    const handleOpenDownloadTemplate = () => {
        setOpenDownloadTemplate(true);
    };

    const handleCloseDownloadTemplate = () => {
        setOpenDownloadTemplate(false);
    };

    return (
        <>
            <Box sx={{ width: '60%', minWidth: 300, mx: 'auto' }}>
                <FKProvider value={formik}>
                    <FKSingleUpload
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        name="file"
                        onDrop={handleExcelUpload}
                    />
                    <Typography>
                        NOTE: Please do not change the id ( enclosed within [ ] ) provided in the filename of the downloaded sample sheet
                    </Typography>
                </FKProvider>
                <Stack mt={2} direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Button onClick={handleOpenDownloadTemplate} variant="contained" sx={{ minWidth: '175px' }}>
                        Download Sample Excel
                    </Button>
                    <Stack gap={gridSpacing} direction="row" justifyContent="flex-end" alignItems="center">
                        <LoadingButton loading={isSubmitting} variant="contained" onClick={handleSubmit}>
                            Save
                        </LoadingButton>
                        <LoadingButton variant="outlined" onClick={handleReset}>
                            Reset
                        </LoadingButton>
                    </Stack>
                </Stack>
            </Box>
            <Dialog open={openDownloadTemplate} onClose={handleCloseDownloadTemplate}>
                <DownloadBulkCreateTemplate handleCloseDownloadTemplate={handleCloseDownloadTemplate} />
            </Dialog>
        </>
    );
};

export default ExcelUploadComponent;
