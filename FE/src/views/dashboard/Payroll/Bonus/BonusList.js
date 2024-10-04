/* eslint-disable */
import * as React from 'react';

// material-ui
import {
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
    InputLabel,
    MenuItem,
    FormControl,
    Dialog
} from '@mui/material';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { useNavigate } from 'react-router-dom';
import EnhancedTableHead from './TableHeader';
import { dispatch } from 'store';
import { EmployeeActions } from 'store/slices/employee';
import SkeletonEmployee from 'ui-component/skeleton/SkeletonEmployee';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import TableNoData from 'ui-component/extended/table/TableNoData';

// hooks
import useTable, { getComparator } from 'hooks/useTable';

// assets
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { openSnackbar } from 'store/slices/snackbar';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import EmployeeDetails from './dialogs/EmployeeDetails';
import { openConfirmationModal } from 'store/slices/confirmationModal';
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

function SalaryList() {
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
    const { fetchEmployees, deleteEmployee } = EmployeeActions;

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [empType, setEmpType] = React.useState('');

    //State for Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);

    const { loading, employee, totalData } = useSelector((state) => state.employee);

    React.useEffect(() => {
        dispatch(
            fetchEmployees({
                page: page + 1,
                limit: rowsPerPage,
                search,
                status,
                emp_type: empType
            })
        );
    }, [page, rowsPerPage, search, status, empType]);

    // React.useEffect(() => {
    //     setTableData(employee);
    // }, [employee]);

    //Function related to Modal=======
    const handleShowEmpDeatails = (row) => {
        setSelectedEmployee(row);
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };
    //=======================

    const handleEdit = (id) => {
        navigate(`/payroll/salary/${id}`);
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleDelete = async (user_id) => {
        const object = {
            users: [user_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    // Perform delete action on confirmation
                    const res = await dispatch(deleteEmployee(object));
                    if (res?.payload?.status !== 201) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message:  findKeyInObject(res?.payload, `message`) ||
                                findKeyInObject(res?.payload, `error`) || 'Internal Server error',
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
                                message: `Employee successfully deleted.`,
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

    const handleClearFilter = () => {
        setStatus('');
        setEmpType('');
        setSearch('');
    };

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Payroll: Salary">
            <Breadcrumbs heading="Salary" links={[{ name: 'Salary', href: 'payroll/salary/list' }]} />
            <MainCard title="Salary List" content={false}>
                <RoleBasedGuard>
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="center" spacing={2} flexWrap={'nowrap'}>
                            <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                                <TextField
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ width: '100%' }}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search Salary by name"
                                />
                                <FormControl fullWidth>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        id="status"
                                        name="status"
                                        value={status}
                                        onChange={(event) => {
                                            setStatus(event.target.value);
                                        }}
                                        label="Status"
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Tooltip title="Clear Filters">
                                    <IconButton size="large" sx={{}} onClick={handleClearFilter}>
                                        <Typography align="left" variant="subtitle1" component="div">
                                            Clear Filters
                                        </Typography>

                                        <FilterListIcon sx={{ marginLeft: '5px' }} />
                                    </IconButton>
                                </Tooltip>
                                {/* product add & dialog */}
                                <Tooltip title="Add Employess">
                                    <Fab
                                        size="small"
                                        onClick={() => navigate('/payroll/salary/add')}
                                        sx={{
                                            boxShadow: 'none',
                                            ml: 1,
                                            width: 32,
                                            height: 32,
                                            minHeight: 32,
                                            color: '#fff',
                                            bgcolor: theme.palette.secondary.main,
                                            '&:hover': { bgcolor: theme.palette.secondary.dark }
                                        }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </CardContent>
                </RoleBasedGuard>

                {/* table */}
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={selected?.length}
                            selected={selected}
                            setSelected={setSelected}
                            deleteEmployee={deleteEmployee}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row.user_id)
                                )
                            }
                            onSort={onSort}
                            rowCount={tableData?.length}
                            theme={theme}
                            setTableData={setTableData}
                        />
                        <TableBody>
                            {(loading ? [...Array(rowsPerPage)] : dataFiltered)?.map((row, index) =>
                                row ? (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        aria-checked={selected.includes(row.user_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row.user_id)}
                                    >
                                        <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row.user_id)}>
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(row.user_id)}
                                                inputProps={{
                                                    'aria-labelledby': `enhanced-table-checkbox-${index}`
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleShowEmpDeatails(row)}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Avatar src={row?.profile_photo}>{row?.user_name?.charAt(0)?.toUpperCase()}</Avatar>
                                                </Grid>
                                                <Grid item xs zeroMinWidth>
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {row.user_name}{' '}
                                                        {/* {row.status === 'ACTIVE' && (
                                                                        <CheckCircleIcon
                                                                            sx={{ color: 'success.dark', width: 14, height: 14 }}
                                                                        />
                                                                    )} */}
                                                    </Typography>
                                                    <Typography align="left" variant="subtitle2" noWrap>
                                                        {row.user_email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                        <TableCell>{row.employement_type}</TableCell>
                                        <TableCell>
                                            {row.status === 'Active' && (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    sx={{
                                                        background: theme.palette.success.light + 60,
                                                        color: theme.palette.success.dark
                                                    }}
                                                />
                                            )}
                                            {row.status === 'Inactive' && (
                                                <Chip
                                                    label="Inactive"
                                                    size="small"
                                                    sx={{
                                                        background: theme.palette.warning.light + 80,
                                                        color: theme.palette.warning.dark
                                                    }}
                                                />
                                            )}
                                            {row.status === 'Suspended' && (
                                                <Chip
                                                    label="Suspended"
                                                    size="small"
                                                    sx={{
                                                        background: theme.palette.error.light,
                                                        color: theme.palette.error.dark
                                                    }}
                                                />
                                            )}
                                        </TableCell>

                                        <RoleBasedGuard>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row?.user_id)}>
                                                    <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="large"
                                                    aria-label="more options"
                                                    onClick={() => handleDelete(row?.user_id)}
                                                >
                                                    <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                            </TableCell>
                                        </RoleBasedGuard>
                                    </TableRow>
                                ) : (
                                    !isNotFound && <SkeletonEmployee key={index} />
                                )
                            )}
                            <TableNoData isNotFound={isNotFound} />
                        </TableBody>
                    </Table>
                </TableContainer>

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
            </MainCard>
        </Page>
    );
}

export default SalaryList;
