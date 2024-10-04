/* eslint-disable */
import * as React from 'react';

// material-ui
import {
    Button,
    CardContent,
    Checkbox,
    Fab,
    Grid,
    Chip,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Dialog,
    Box,
    Stack,
    Card,
    Divider
} from '@mui/material';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { LoadingButton } from '@mui/lab';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { Link, useNavigate } from 'react-router-dom';
import EnhancedTableHead from './TableHeader';
import { dispatch } from 'store';
import SkeletonPayrollList from 'ui-component/skeleton/SkeletonPayrollList';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import EmployeeDetails from 'views/dashboard/Employees/dialogs/EmployeeDetails';

// hooks
import useTable, { getComparator } from 'hooks/useTable';

// assets
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { openSnackbar } from 'store/slices/snackbar';
import TableNoData from 'ui-component/extended/table/TableNoData';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { PayrollActions } from 'store/slices/payroll';
import { EmployeeActions } from 'store/slices/employee';
import UpdatePayroll from './UpdatePayroll';
import useDebounce from 'hooks/useDebounce';
import ViewPayrollSalarySlip from './dialogs/ViewPayrollSalarySlip';
import moment from 'moment';
import { useFormik } from 'formik';
import IncentiveField from './IncentiveField';
import BulkSalaryUpdate from './BulkSalaryUpdate';
import { History, ViewCompactTwoTone } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

// import Loader from 'ui-component/Loader';

// sorting
function applySortFilter({ tableData, comparator }) {
    const stabilizedThis = tableData?.map((el, index) => [el, index]);

    stabilizedThis?.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    tableData = stabilizedThis?.map((el) => el[0]);
    return tableData;
}

function PayrollList() {
    const {
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        onSort,
        onChangePage,
        onChangeRowsPerPage
    } = useTable();

    const theme = useTheme();
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    const { fetchPayrolls, deletePayroll, sendSalarySlip, generateAllPayrollSlips, updateSalary } = PayrollActions;

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [selectedSalarySlip, setSelectedSalarySlip] = React.useState();
    const [openBulkSalaryUpdateDialog, setOpenBulkSalaryUpdateDialog] = React.useState(false);

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    //for analytics
    const [payrollStatus, setPayrollStatus] = React.useState('');

    const [openDialog, setOpenDialog] = React.useState(false);

    const { companyDetails } = useSelector((state) => state?.company);
    const { loading, payroll, totalData } = useSelector((state) => state.payroll);

    //State for Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);

    const { fetchEmployeeById } = EmployeeActions;

    const fetchPayrollsWrapper = () => {
        dispatch(
            fetchPayrolls({
                page: page + 1,
                limit: rowsPerPage,
                search: search,
                status: payrollStatus
            })
        );
    };

    React.useEffect(() => {
        fetchPayrollsWrapper();
    }, [page, rowsPerPage, debouncedSearchValue, payrollStatus]);

    React.useEffect(() => {
        setTableData(payroll);
    }, [payroll]);

    const toggleBulkSalaryUpdateDialog = () => {
        setOpenBulkSalaryUpdateDialog((prev) => !prev);
    };

    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleViewSalarySlip = (salarySlip) => {
        setSelectedSalarySlip(salarySlip);
        setOpen(true);
    };

    const handleCloseSalarySlipModal = () => {
        setSelectedSalarySlip();
        setOpen(false);
    };

    //Function related to Modal=======
    const handleShowEmpDeatails = async (id) => {
        const res = await dispatch(fetchEmployeeById(id));
        setSelectedEmployee(res?.payload);
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };
    //=======================

    // const handleGeneratePayroll = async (id) => {
    //     const response = await dispatch(generateEmployeePayroll(id));
    //     if (response?.payload?.status !== 200) {
    //         dispatch(
    //             openSnackbar({
    //                 open: true,
    //                 message: response?.payload?.message || 'Internal server error',
    //                 variant: 'alert',
    //                 alert: {
    //                     color: 'error'
    //                 },
    //                 close: true
    //             })
    //         );
    //     } else {
    //         dispatch(
    //             openSnackbar({
    //                 open: true,
    //                 message: 'Payroll generated successfully.',
    //                 variant: 'alert',
    //                 alert: {
    //                     color: 'success'
    //                 },
    //                 close: true
    //             })
    //         );
    //     }
    // }

    const handleIncentiveSubmit = async (row, incentive) => {
        try {
            const response = await dispatch(
                updateSalary({
                    salary_id: row?.salary?.salary_id,
                    data: { incentive: [{ name: 'incentive', amount: Number(incentive), type: 'NORMAL' }] }
                })
            );
            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Payroll updated successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                handleCloseClick();
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(fetchPayrolls({ page: page + 1, limit: limit, search: '', status: '' }));
            } else {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: response?.payload?.message || 'Internal server error',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSendSalarySlip = async (payroll) => {
        const id = payroll?.salary_slip[0]?.salary_slip_id; //salary slip id

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const response = await dispatch(sendSalarySlip(id));
                    if (response?.payload?.status !== 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: response?.payload?.message || 'Internal server error',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Salary slip sent successfully.',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
    };

    const handleGenerateAllSalarySlips = async () => {
        dispatch(
            openConfirmationModal({
                open: true,
                message: `This action will create all pending payroll slips from ${moment()
                    .startOf('month')
                    .format('MMM DD, YYYY')} till today (${moment().format('MMM DD, YYYY')}). This action is not reversible.`,
                handleConfirm: async () => {
                    const response = await dispatch(generateAllPayrollSlips());
                    if (response?.payload?.status !== 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: response?.payload?.message || 'Internal server error',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Salary generated successfully.',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
    };

    const handleViewSalaryStructureHistory = async (row) => {
        navigate(`/payroll/salary/history/${row?.payroll_id}`);
    };

    const handleClearFilter = () => {
        setPayrollStatus('');
        setSearch('');
    };
    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData?.length) : 0;

    const isNotFound = !loading && !dataFiltered?.length;


    return (
        <Page title="Payroll: List">
            <Breadcrumbs heading="Payroll List" links={[{ name: 'payroll', href: '/payroll/list' }]} />

            <Card>
                <CardContent>
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h3">Payroll List</Typography>
                            {/* <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" gap={1}>
                                <Typography>Default Payroll Freqnecy: </Typography>
                                <Typography sx={{ textDecoration: 'underline' }}>MONTHLY</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        navigate('/company/details');
                                    }}
                                >
                                    <OpenInNewIcon sx={{ width: 12, height: 12 }} />
                                </IconButton>
                            </Stack> */}
                        </Stack>
                    </Box>
                    <Divider />
                    <Grid sx={{ mt: 1 }} container justifyContent="space-between" alignItems="center" spacing={2} flexWrap={'nowrap'}>
                        <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                        </InputAdornment>
                                    )
                                }}
                                fullWidth
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search payroll by name"
                                // size="small"
                            />
                            <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Payroll Status">
                                <InputLabel id="gender-label">Select payroll status</InputLabel>
                                <Select
                                    id="payroll_status"
                                    name="payroll_status"
                                    value={payrollStatus}
                                    onChange={(event) => {
                                        setPayrollStatus(event.target.value);
                                    }}
                                    label="Select payroll status"
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid container spacing={2} justifyContent={'flex-end'} alignItems={'center'}>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <Tooltip title="Generate All Payrolls">
                                    <Button size="large" variant="outlined" color="primary" onClick={toggleBulkSalaryUpdateDialog}>
                                        <Typography align="left" variant="subtitle1" component="div">
                                            Bulk Salary Update
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            </Grid>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <Tooltip title="Generate All Payrolls">
                                    <Button size="large" variant="outlined" color="primary" onClick={handleGenerateAllSalarySlips}>
                                        <Typography align="left" variant="subtitle1" component="div">
                                            Generate All Payrolls
                                        </Typography>
                                    </Button>
                                </Tooltip>
                            </Grid>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <Tooltip title="Filter">
                                    <Button size="large" onClick={handleClearFilter}>
                                        <Typography align="left" variant="subtitle1" component="div">
                                            Clear Filters
                                        </Typography>
                                        <FilterListIcon sx={{ marginLeft: '5px' }} />
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>

                    <UpdatePayroll
                        page={page}
                        limit={rowsPerPage}
                        openDialog={openDialog}
                        handleCloseDialog={handleCloseDialog}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                    />

                    {/* table */}
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                            <EnhancedTableHead
                                numSelected={selected?.length}
                                order={order}
                                orderBy={orderBy}
                                setSelected={setSelected}
                                onSelectAllClick={(checked) =>
                                    onSelectAllRows(
                                        checked,
                                        tableData
                                            ?.filter((row) => row?.salary_slip && row?.salary_slip.length > 0)
                                            .map((row) => row?.payroll_id)
                                    )
                                }
                                selected={selected}
                                onSort={onSort}
                                rowCount={tableData?.length}
                                theme={theme}
                            />
                            <TableBody>
                                {(loading ? [...Array(rowsPerPage)] : dataFiltered)?.map((row, index) =>
                                    row ? (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={selected.includes(row?.payroll_id)}
                                            tabIndex={-1}
                                            key={index}
                                            selected={selected.includes(row?.payroll_id)}
                                        >
                                            <TableCell
                                                padding="checkbox"
                                                sx={{ pl: 3, pr: 2 }}
                                                onClick={
                                                    row?.salary_slip && row?.salary_slip?.length > 0
                                                        ? () => onSelectRow(row?.payroll_id)
                                                        : () => {
                                                              dispatch(
                                                                  openSnackbar({
                                                                      open: true,
                                                                      message: 'No salary slip exist!',
                                                                      variant: 'alert',
                                                                      alert: {
                                                                          color: 'error'
                                                                      },
                                                                      close: false
                                                                  })
                                                              );
                                                          }

                                                    // () => onSelectRow(row?.payroll_id)
                                                }
                                            >
                                                <Checkbox
                                                    color="primary"
                                                    checked={selected.includes(row?.payroll_id)}
                                                    inputProps={{
                                                        'aria-labelledby': `enhanced-table-checkbox-${index}`
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleShowEmpDeatails(row?.user?.user_id)}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item>
                                                        <Avatar src={row?.user?.profile_photo}>
                                                            {row?.user?.user_name?.charAt(0)?.toUpperCase()}
                                                        </Avatar>
                                                    </Grid>
                                                    <Grid item xs zeroMinWidth>
                                                        <Typography align="left" variant="subtitle1" component="div">
                                                            {row?.user?.user_name}
                                                        </Typography>
                                                        <Typography align="left" variant="subtitle2" noWrap>
                                                            {row?.user?.user_email}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </TableCell>

                                            <TableCell>
                                                {row.payroll_status === 'Active' && (
                                                    <Chip
                                                        label="Active"
                                                        size="small"
                                                        sx={{
                                                            background: theme.palette.success.light + 60,
                                                            color: theme.palette.success.dark
                                                        }}
                                                    />
                                                )}
                                                {row.payroll_status === 'Inactive' && (
                                                    <Chip
                                                        label="Inactive"
                                                        size="small"
                                                        sx={{
                                                            background: theme.palette.warning.light + 80,
                                                            color: theme.palette.warning.dark
                                                        }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ cursor: 'pointer' }}>
                                                <Grid container alignItems="center">
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {row?.payroll_frequency}
                                                    </Typography>
                                                </Grid>
                                            </TableCell>

                                            <TableCell sx={{ cursor: 'pointer' }}>
                                                <Grid container alignItems="center">
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {row?.payroll_start_date
                                                            ? format(new Date(row?.payroll_start_date), 'd MMM yyyy h:mm a')
                                                            : null}
                                                    </Typography>
                                                </Grid>
                                            </TableCell>
                                            <TableCell sx={{ cursor: 'pointer' }}>
                                                <Grid container alignItems="center">
                                                    <IncentiveField handleIncentiveSubmit={handleIncentiveSubmit} row={row} />
                                                </Grid>
                                            </TableCell>
                                            {/* <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <AnimateButton>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{ whiteSpace: 'nowrap' }}
                                                        onClick={() => handleGeneratePayroll(row?.payroll_id)}
                                                        disabled={!row?.salary || !row.payroll_status === 'Active'}
                                                    >
                                                        Generate Payroll
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
                                        </TableCell> */}
                                            {/* <TableCell sx={{ cursor: 'pointer' }}>
                                                <Grid container alignItems="center">
                                                    <AnimateButton>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleViewSalarySlip(row)}
                                                            disabled={!row?.salary_slip || row?.salary_slip?.length === 0}
                                                        >
                                                            View
                                                        </Button>
                                                    </AnimateButton>
                                                </Grid>
                                            </TableCell> */}

                                            {/* <TableCell sx={{ cursor: 'pointer' }}>
                                                <Grid container alignItems="center">
                                                    <AnimateButton>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ whiteSpace: 'nowrap' }}
                                                            onClick={() => handleSendSalarySlip(row)}
                                                            disabled={!row?.salary_slip || row?.salary_slip?.length === 0}
                                                        >
                                                            Send slip
                                                        </Button>
                                                    </AnimateButton>
                                                </Grid>
                                            </TableCell> */}

                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <Tooltip title="View Slip">
                                                    <IconButton
                                                        variant="contained"
                                                        size="large"
                                                        onClick={() => handleViewSalarySlip(row)}
                                                        disabled={!row?.salary_slip || row?.salary_slip?.length === 0}
                                                    >
                                                        <VisibilityOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Send Slip">
                                                    <IconButton
                                                        variant="contained"
                                                        size="large"
                                                        onClick={() => handleSendSalarySlip(row)}
                                                        disabled={!row?.salary_slip || row?.salary_slip?.length === 0}
                                                    >
                                                        <FileUploadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                                                        <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Structure History">
                                                    <IconButton
                                                        size="large"
                                                        aria-label="more options"
                                                        onClick={() => handleViewSalaryStructureHistory(row)}
                                                    >
                                                        <History color="primary" sx={{ fontSize: '1.3rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        !isNotFound && <SkeletonPayrollList key={index} />
                                    )
                                )}
                                <TableNoData isNotFound={isNotFound} />
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* table pagination */}
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100]}
                        component="div"
                        count={totalData || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={onChangePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                    />

                    {open && (
                        <Dialog
                            maxWidth="sm"
                            fullWidth
                            onClose={handleCloseSalarySlipModal}
                            open={open}
                            sx={{
                                '& .MuiDialog-paper': {
                                    p: 0,
                                    maxWidth: '800px'
                                }
                            }}
                        >
                            <ViewPayrollSalarySlip selectedRow={selectedSalarySlip} handleModalClose={handleCloseSalarySlipModal} />
                        </Dialog>
                    )}

                    {isModalOpen && (
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
                            <EmployeeDetails
                                selectedEmployee={selectedEmployee}
                                setSelectedEmployee={setSelectedEmployee}
                                handleModalClose={handleModalClose}
                            />
                        </Dialog>
                    )}

                    <Dialog
                        maxWidth="sm"
                        fullWidth
                        onClose={toggleBulkSalaryUpdateDialog}
                        open={openBulkSalaryUpdateDialog}
                        sx={{
                            '& .MuiDialog-paper': {
                                p: 0,
                                maxWidth: '800px'
                            }
                        }}
                    >
                        <BulkSalaryUpdate
                            fetchPayrollsWrapper={fetchPayrollsWrapper}
                            toggleBulkSalaryUpdateDialog={toggleBulkSalaryUpdateDialog}
                        />
                    </Dialog>
                </CardContent>
            </Card>
        </Page>
    );
}

export default PayrollList;
