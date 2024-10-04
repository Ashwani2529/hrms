import React, { useState } from 'react';
import {
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Autocomplete,
    Avatar,
    Button,
    Divider,
    Stack,
    IconButton,
    Checkbox,
    Grid
} from '@mui/material';
import SalaryExcelComponent from './SalaryExcelComponent';
import MainCard from 'ui-component/cards/MainCard';
import { useSelector, dispatch } from 'store';
import Chip from 'ui-component/extended/Chip';
import { PayrollActions } from 'store/slices/payroll';
import axiosServices from 'utils/axios';
import Close from '@mui/icons-material/Close';

function BulkSalaryUpdate({ toggleBulkSalaryUpdateDialog, fetchPayrollsWrapper }) {
    const [selectedPayrolls, setSelectedpayrolls] = useState([]);
    const [generatingExcel, setGeneratingExcel] = useState(false);

    // const { createBulkUpdateExcel } = PayrollActions;

    const { payroll = [] } = useSelector((state) => state.payroll);

    const handleGenerateExcelSheet = async () => {
        setGeneratingExcel(true);
        try {
            const payrollIds = selectedPayrolls?.map((ele) => ele?.payroll_id);
            // const res = await axiosServices.post('/payroll/generateSampleExcel', { payrollIds });
            const res = await axiosServices.post(
                '/payroll/generateSampleExcel',
                { payrollIds },
                {
                    responseType: 'blob'
                }
            );
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadExcelObjectURL = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadExcelObjectURL;
            downloadLink.download = 'generated_excel.xlsx';
            document.body.appendChild(downloadLink);
            downloadLink.click(); // Trigger the download
            document.body.removeChild(downloadLink); // Clean up
        } catch (error) {
            console.log(error);
        }
        setGeneratingExcel(false);
    };

    const handleSelectAll = (e, selectAll) => {
        if (selectAll) {
            setSelectedpayrolls(payroll);
        } else {
            setSelectedpayrolls([]);
        }
    };

    return (
        <Box>
            <MainCard>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h3">Bulk Salary Update</Typography>
                    <IconButton onClick={toggleBulkSalaryUpdateDialog}>
                        <Close />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 1, mb: 3 }} />
                <Stack alignItems="flex-end" gap={2}>
                    <Autocomplete
                        size="large"
                        InputLabelProps={{ shrink: true }}
                        notched
                        shrink
                        multiple
                        fullWidth
                        disableCloseOnSelect
                        renderTags={(value) =>
                            value?.map((val) => (
                                <Chip
                                    variant="outlined"
                                    chipcolor="secondary"
                                    avatar={<Avatar src={val?.user?.profilePhoto}>{val?.user?.firstname?.charAt(0)?.toUpperCase()}</Avatar>}
                                    label={`${val?.user?.firstname} ${val?.user?.lastname}`}
                                    // onClick={handleClick}
                                    onDelete={() =>
                                        setSelectedpayrolls((prev) => prev?.filter((ele) => ele?.payroll_id !== val?.payroll_id))
                                    }
                                />
                            ))
                        }
                        getOptionLabel={(option) =>
                            `${option?.user?.firstname} ${option?.user?.middlename || ''} ${option?.user?.lastname}`
                        }
                        value={selectedPayrolls || []}
                        onChange={(e, newValue) => setSelectedpayrolls(newValue)}
                        renderInput={(params) => (
                            <TextField size="small" fullWidth InputLabelProps={{ shrink: true }} label="Select Employees" {...params} />
                        )}
                        filterSelectedOptions
                        options={payroll}
                    />
                    <Grid container xs={12} md={12} justifyContent="space-between" alignItems="flex-start">
                        <Grid item xs={12} md={4} alignItems="flex-start">
                            <Stack direction="row" alignItems="center">
                                <Checkbox
                                    size="small"
                                    checked={payroll.length !== 0 && selectedPayrolls.length === payroll.length}
                                    onChange={handleSelectAll}
                                />
                                <Typography>Select all employees</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4} textAlign="right">
                            <Button variant="outlined" onClick={handleGenerateExcelSheet} disabled={generatingExcel}>
                                Generate Excel Sheet
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <SalaryExcelComponent
                    toggleBulkSalaryUpdateDialog={toggleBulkSalaryUpdateDialog}
                    fetchPayrollsWrapper={fetchPayrollsWrapper}
                />
            </MainCard>
        </Box>
    );
}

export default BulkSalaryUpdate;
