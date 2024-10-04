/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';

import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Dialog,
    TextField,
    Stack,
    Divider,
    TablePagination
} from '@mui/material';
import { format } from 'date-fns';

// project imports
import Chip from 'ui-component/extended/Chip';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { LoadingButton } from '@mui/lab';
import ViewSalarySlip from './ViewSalarySlip';
import TableNoData from 'ui-component/extended/table/TableNoData';
import { PayrollActions } from 'store/slices/payroll';
import { dispatch, useSelector } from 'store';
import SkeletonSalarySlip from 'ui-component/skeleton/SkeletonSalarySlip';
import moment from 'moment';

// table data

// ===========================|| DATA WIDGET - PROJECT TABLE CARD ||=========================== //

const SalarySlipTable = React.memo(({ payroll }) => {
    // const salary_slips = payroll?.salary_slip;
    const [selectedRow, setSelectedRow] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [salary_slips, setSalarySlips] = useState([]);
    const [downloading, setDownloading] = useState();

    const [buttonType, setButtonType] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { getAllSalarySlipByPayrollId, downloadSalarySlip } = PayrollActions;
    const { loading, salarySlips, totalData } = useSelector((state) => state.payroll);

    useEffect(() => {
        const id = payroll?.payroll_id;
        if ((!startDate || !endDate) && buttonType !== 'All') return;
        dispatch(getAllSalarySlipByPayrollId({ id, status: '', approval: '', startDate, endDate, page: 1, limit: 25 }));
    }, [payroll, startDate, endDate]);

    useEffect(() => {
        setSalarySlips(salarySlips);
    }, [salarySlips]);

    const handleModalClose = () => {
        setSelectedRow();
        setIsModalOpen(false);
    };

    const handleViewSalarySlip = (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleDownload = async (row, index) => {
        const id = row?.salary_slip_id;
        setDownloading(index);

        const response = await dispatch(downloadSalarySlip(id));
        const pdfContent = response?.payload?.data?.pdfContent;

        const uint8Array = new Uint8Array(pdfContent?.data);
        const blob = new Blob([uint8Array], { type: 'application/pdf' });

        // Creating a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = response?.payload?.data?.pdfFileName;

        document.body.appendChild(link);
        link.click();

        // Removing the link from the body after the download
        document.body.removeChild(link);
        setDownloading();
    };

    const generateDateRange = (buttonType, e) => {
        setButtonType(buttonType);

        switch (buttonType) {
            case 'ThisMonth':
                setStartDate(moment().startOf('month').toISOString());
                setEndDate(moment().endOf('month').toISOString());
                break;

            case 'LastMonth':
                setStartDate(moment().subtract(1, 'month').startOf('month').toISOString());
                setEndDate(moment().subtract(1, 'month').endOf('month').toISOString());
                break;
            case 'setStartDate':
                if (!endDate) {
                    setStartDate(moment(e.target.value).startOf('month').toISOString());
                } else if (endDate && moment(e.target.value).isBefore(moment(endDate), 'month')) {
                    setStartDate(moment(e.target.value).startOf('month').toISOString());
                }
                break;
            case 'setEndDate':
                if (!startDate) {
                    setEndDate(moment(e.target.value).endOf('month').toISOString());
                } else if (startDate && moment(e.target.value).isAfter(moment(startDate), 'month')) {
                    setEndDate(moment(e.target.value).endOf('month').toISOString());
                }
                break;

            // case 'ThisYear':
            //     startDate = new Date(currentDate.getFullYear(), 0, 1);
            //     endDate = currentDate;
            //     break;

            // case 'LastYear':
            //     const lastYear = new Date(currentDate.getFullYear() - 1, 0, 1);
            //     startDate = new Date(lastYear.getFullYear(), 0, 1);
            //     endDate = new Date(lastYear.getFullYear(), 11, 31);
            //     break;

            default:
                // Handle invalid buttonType
                console.error('Invalid buttonType:', buttonType);
                return null;
        }
    };

    const onChangePage = (e) => {};

    const onChangeRowsPerPage = (e) => {};

    const isNotFound = !loading && (!payroll || !salary_slips || salary_slips?.length === 0);

    const memoizedComponent = useMemo(() => {
        return (
            <>
              <TableContainer sx={{ overflow: 'visible' }}>
                    <Stack direction={'row'} justifyContent={'flex-end'} alignItems={'center'} gap={2}>
                        <Button
                            variant={buttonType === 'All' ? 'contained' : 'outlined'}
                            onClick={() => {
                                setButtonType('All');
                                setStartDate('');
                                setEndDate('');
                            }}
                        >
                            All
                        </Button>
                        <Button
                            variant={buttonType === 'ThisMonth' ? 'contained' : 'outlined'}
                            onClick={() => generateDateRange('ThisMonth')}
                        >
                            This Month
                        </Button>
                        <Button
                            variant={buttonType === 'LastMonth' ? 'contained' : 'outlined'}
                            onClick={() => generateDateRange('LastMonth')}
                        >
                            Last Month
                        </Button>
                        {/* <Typography
                                variant='subtitle1'
                                sx={{ cursor: "pointer", color: `${buttonType === 'ThisYear' && '#019AFF'}` }}
                                onClick={() => generateDateRange('ThisYear')}
                            >
                                This Year
                            </Typography>
                            <Typography
                                variant='subtitle1'
                                sx={{ cursor: "pointer", color: `${buttonType === 'LastYear' && '#019AFF'}` }}
                                onClick={() => generateDateRange('LastYear')}
                            >
                                Last Year
                            </Typography> */}
                        <TextField
                            type="month"
                            size={'small'}
                            label={'Start Month'}
                            defaultValue={'-'}
                            value={moment(startDate).format('YYYY-MM') }
                            onChange={(e) => generateDateRange('setStartDate', e)}
                        />
                        <TextField
                            type="month"
                            size={'small'}
                            label={'End Month'}
                            defaultValue={'-'}
                            value={moment(endDate).format('YYYY-MM')}
                            onChange={(e) => generateDateRange('setEndDate', e)}
                        />
                    </Stack>
                    <Divider sx={{ mt: 5 }} />
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Month</TableCell>
                                <TableCell align="center">Payroll frequency</TableCell>
                                <TableCell align="center">Payroll start date</TableCell>
                                <TableCell align="center">Working days</TableCell>
                                <TableCell align="center">Base salary</TableCell>
                                <TableCell align="center">Net Salary</TableCell>
                                <TableCell align="center">Detail</TableCell>
                                <TableCell align="center">Download</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(loading ? [...Array(12)] : salary_slips)?.map((row, index) =>
                                row ? (
                                    <TableRow hover key={index} sx={{ height: '80px' }}>
                                        <TableCell align="center">
                                            {row?.salary_slip_from_date && format(new Date(row?.salary_slip_from_date), 'MMMM')}
                                        </TableCell>
                                        <TableCell align="center">{payroll?.payroll_frequency || 'Monthly'}</TableCell>
                                        <TableCell align="center">
                                            {(payroll?.payroll_start_date &&
                                                format(new Date(payroll?.payroll_start_date), 'd MMM yyyy h:mm a')) ||
                                                '10-12-2023'}
                                        </TableCell>
                                        <TableCell align="center">{row?.working_days}</TableCell>
                                        <TableCell align="center">{row?.base_salary}</TableCell>
                                        <TableCell align="center">{row?.salary_slip_total_amount}</TableCell>

                                        <TableCell align="center">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={() => handleViewSalarySlip(row)}
                                                    sx={{
                                                        height: '35px',
                                                        padding: '0px 14px'
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </AnimateButton>
                                        </TableCell>
                                        <TableCell align="center">
                                            <AnimateButton>
                                                <LoadingButton
                                                    variant="contained"
                                                    size="large"
                                                    onClick={() => handleDownload(row, index)}
                                                    sx={{
                                                        height: '35px',
                                                        padding: '0px 14px'
                                                    }}
                                                    loading={downloading === index}
                                                >
                                                    Download
                                                </LoadingButton>
                                            </AnimateButton>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <SkeletonSalarySlip />
                                )
                            )}
                        </TableBody>
                        <TableNoData isNotFound={isNotFound} />
                    </Table>
                    {/* Implement Pagination here */}
                    <TablePagination
                        size="small"
                        rowsPerPageOptions={[25, 50, 100]}
                        component="div"
                        count={0}
                        rowsPerPage={25}
                        page={1}
                        onPageChange={onChangePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                    />
                </TableContainer>

                <Dialog
                    maxWidth="sm"
                    fullWidth
                    onClose={handleModalClose}
                    open={isModalOpen}
                    sx={{
                        '& .MuiDialog-paper': {
                            p: 0,
                            maxWidth: '800px'
                        }
                    }}
                >
                    <ViewSalarySlip selectedRow={selectedRow} handleModalClose={handleModalClose} />
                </Dialog>
            </>
        );
    }, [payroll, startDate, endDate, buttonType, salary_slips, downloading, isModalOpen]);

    return memoizedComponent;
});

export default SalarySlipTable;
