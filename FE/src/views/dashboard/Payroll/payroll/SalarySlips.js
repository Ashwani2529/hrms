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
    Dialog
} from '@mui/material';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { LoadingButton } from '@mui/lab';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { useNavigate } from 'react-router-dom';
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
import payroll, { PayrollActions } from 'store/slices/payroll';
import { EmployeeActions } from 'store/slices/employee';
import UpdatePayroll from './UpdatePayroll';
import useDebounce from 'hooks/useDebounce';
import ViewPayrollSalarySlip from './dialogs/ViewPayrollSalarySlip';
import moment from 'moment';
import { useFormik } from 'formik';
import IncentiveField from './IncentiveField';
import SalaryTableHead from './SalarySlipHeader';
import { gridSpacing } from 'store/constant';

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
    const { fetchAllSalarySlips,getSalarySlip } = PayrollActions;

    const [tableData, setTableData] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [selectedSalarySlip, setSelectedSalarySlip] = React.useState();
    const [search, setSearch] = React.useState('');
    //for analytics
    const [filters, setFilters] = React.useState({
        startDate: '',
        endDate: '',
        status: '',
        approval: ''
    });

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, salarySlips, totalSalarySlips,newsalarySlips } = useSelector((state) => state.payroll);

    //State for Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);

    React.useEffect(() => {
        dispatch(
            fetchAllSalarySlips({
                page: page + 1,
                limit: rowsPerPage,
                search,
                ...filters
            })
        );
    }, [page, rowsPerPage, debouncedSearchValue, filters]);

    React.useEffect(() => {
        setTableData(salarySlips);
        
    }, [salarySlips]);

    // const handleEdit = (row) => {
    //     setSelectedRow(row);
    //     setOpenDialog(true);
    // };

    const handleFilterChange = (e) => {
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleViewSalarySlip = (row) => {
        setSelectedSalarySlip({
            salary_slip: [row],
            user: row?.employee
        });
        setOpen(true);
    };

    const handleCloseSalarySlipModal = () => {
        setSelectedSalarySlip();
        setOpen(false);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };
    //=======================

    const handleClearFilter = () => {
        setSearch('');
        setFilters({
            startDate: '',
            endDate: '',
            status: '',
            approval: ''
        });
    };
    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData?.length) : 0;

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Salary Slips: List">
            <Breadcrumbs heading="Payroll" links={[{ name: 'payroll', href: '/payroll/list' }]} />

            <MainCard title="Salary Slips" content={false}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2} flexWrap={'nowrap'}>
                        <Grid item xs={12} md={8} display="flex" alignItems="center" gap={2}>
                            <Grid container xs={12} md={12} spacing={gridSpacing}>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        size={'small'}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        name={'search'}
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                        }}
                                        placeholder="Search Username"
                                        // size="small"
                                    />
                                </Grid>
                                {/* <Grid item xs={12} md={4}>
                                    <TextField
                                        size={'small'}
                                        select
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        name={'status'}
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        placeholder="Search Salary Slip by Username"
                                        fullWidth
                                        // size="small"
                                    >
                                        <MenuItem value={''}>ALL</MenuItem>
                                        <MenuItem value={'APPROVED'}>APPROVED</MenuItem>
                                        <MenuItem value={'PENDING'}>PENDING</MenuItem>
                                        <MenuItem value={'REJECTED'}>REJECTED</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        size={'small'}
                                        select
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        name={'approval'}
                                        value={filters.approval}
                                        onChange={handleFilterChange}
                                        placeholder="Search Salary Slip by Username"
                                        // size="small"
                                    >
                                        <MenuItem value={''}>ALL</MenuItem>
                                        <MenuItem value={'APPROVED'}>APPROVED</MenuItem>
                                        <MenuItem value={'PENDING'}>PENDING</MenuItem>
                                        <MenuItem value={'REJECTED'}>REJECTED</MenuItem>
                                    </TextField> 
                                </Grid>*/}
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} justifyContent={'flex-end'}>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <TextField
                                    name={'startDate'}
                                    value={moment(filters.startDate).format('YYYY-MM-DD')}
                                    onChange={handleFilterChange}
                                    size={'small'}
                                    label={'Start Date'}
                                    type="date"
                                />
                            </Grid>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <TextField
                                    name={'endDate'}
                                    value={moment(filters.endDate).format('YYYY-MM-DD')}
                                    onChange={handleFilterChange}
                                    size={'small'}
                                    label={'End Date'}
                                    type="date"
                                />
                            </Grid>
                            <Grid item sx={{ textAlign: 'right' }}>
                                <Tooltip title="Filter">
                                    <Button onClick={handleClearFilter}>
                                        <Typography align="left" variant="subtitle1" component="div">
                                            Clear Filters
                                        </Typography>
                                        <FilterListIcon sx={{ marginLeft: '5px' }} />
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>

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
                        <SalaryTableHead
                            numSelected={selected?.length}
                            order={order}
                            orderBy={orderBy}
                            setSelected={setSelected}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => (row?.salary_slip && row?.salary_slip?.length > 0 ? row?.row?.payroll?.payroll_id : null))
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
                                        aria-checked={selected.includes(row?.payroll?.payroll_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row?.payroll?.payroll_id)}
                                    >
                                        {/* <TableCell
                                            padding="checkbox"
                                            sx={{ pl: 3, pr: 2 }}
                                         
                                        >
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(row?.payroll_id)}
                                                inputProps={{
                                                    'aria-labelledby': `enhanced-table-checkbox-${index}`
                                                }}
                                            />
                                        </TableCell> */}

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Avatar src={row?.employee?.profile_photo}>
                                                        {row?.employee?.user_name?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                </Grid>
                                                <Grid item xs zeroMinWidth>
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {row?.employee?.user_name}
                                                    </Typography>
                                                    <Typography align="left" variant="subtitle2" noWrap>
                                                        {row?.employee?.user_email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>{moment(row?.salary_slip_from_date).format('MMM DD, YYYY')}</TableCell>

                                        <TableCell>{moment(row?.salary_slip_to_date).format('MMM DD, YYYY')}</TableCell>

                                        {/* <TableCell sx={{ cursor: 'pointer' }}>
                                            <Chip
                                                label="Active"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.light + 60,
                                                    color: theme.palette.success.dark
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Chip
                                                label="Active"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.light + 60,
                                                    color: theme.palette.success.dark
                                                }}
                                            />
                                        </TableCell> */}

                                        <TableCell sx={{ cursor: 'pointer' }}>{row?.slips?.working_days}</TableCell>
                                        <TableCell sx={{ cursor: 'pointer' }}>{row?.slips?.leave_days}</TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            {row?.currency_type} {row?.slips?.salary_slip_total_earning}
                                        </TableCell>
                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            {row?.currency_type} {row?.slips?.salary_slip_total_incentive}
                                        </TableCell>

                                        <TableCell align="center">
                                            {row?.currency_type} {row?.slips?.salary_slip_total_deduction}
                                        </TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
                                            {row?.currency_type} {row?.slips?.salary_slip_total_amount}
                                        </TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
                                            <Button
                                                onClick={() => {
                                                    handleViewSalarySlip(row);
                                                }}
                                                variant="outlined"
                                            >
                                                View
                                            </Button>
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
                    count={totalSalarySlips || 0}
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
            </MainCard>
        </Page>
    );
}

export default PayrollList;
