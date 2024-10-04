/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Alert, AlertTitle, Button, Stack } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { dispatch } from 'store';
import { EmployeeActions } from 'store/slices/employee';
import { openSnackbar } from 'store/slices/snackbar';
import sampleFile from 'assets/images/users/sampleFile.xlsx';
import { PayrollActions } from 'store/slices/payroll';
import { findKeyInObject } from 'utils/findKeyInObjects';

const SalaryExcelComponent = ({ toggleBulkSalaryUpdateDialog, fetchPayrollsWrapper }) => {
    const [isSubmitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const [erroState, setErrorState] = useState(false);

    const navigate = useNavigate();

    const { bulkSalaryUpdate } = PayrollActions;

    const handleFileChange = async (event) => {
        const file = event.target?.files[0];
        setSelectedFile(file);
        setErrorState(false);
    };

    const handleBulkSalaryExcelUpload = async () => {
        try {
            if (!selectedFile) {
                setErrorState(true);
                return;
            }

            setErrorState(false);
            setSubmitting(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await dispatch(bulkSalaryUpdate(formData));

            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: res?.payload?.data?.message || `Payrolls Updated successfully`,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                setSubmitting(false);
                fetchPayrollsWrapper();
                navigate('/payroll/list');
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
            }
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: `Error in file uploading ${error}`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        }
        setSubmitting(false);
        setSelectedFile();
    };

    return (
        <Stack>
            <Grid item xs={12} lg={8}>
                <Alert
                    icon={<FileUploadIcon fontSize="inherit" sx={{ color: 'black' }} />}
                    severity="info"
                    variant="outlined"
                    sx={{
                        borderColor: erroState ? 'red' : 'black',
                        backgroundColor: '#E7E7E7',
                        display: 'flex',
                        justifyContent: 'center',
                        filter: isSubmitting > 0 ? 'blur(1px)' : 'none'
                    }}
                >
                    <AlertTitle>Excel Upload</AlertTitle>
                    {!selectedFile && (
                        <input
                            accept=".xlsx, .xls"
                            type="file"
                            id="excel-file-input"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    )}
                    <label htmlFor="excel-file-input">
                        <strong style={{ cursor: 'pointer' }}>{selectedFile ? selectedFile?.name : 'Browse file'}</strong>
                    </label>
                </Alert>
            </Grid>
            <Grid xs={12} lg={3} mt={2} item display={{ xs: 'flex' }} justifyContent={{ xs: 'end' }} gap={2}>
                <AnimateButton>
                    <LoadingButton loading={isSubmitting} variant="contained" onClick={handleBulkSalaryExcelUpload}>
                        Save
                    </LoadingButton>
                </AnimateButton>

                <AnimateButton>
                    <Button onClick={toggleBulkSalaryUpdateDialog} variant="outlined">
                        Close
                    </Button>
                </AnimateButton>
            </Grid>
        </Stack>
    );
};

export default SalaryExcelComponent;
