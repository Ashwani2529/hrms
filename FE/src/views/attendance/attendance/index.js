/* eslint-disable */
import * as React from 'react';

import moment from 'moment';

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
    Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { useNavigate } from 'react-router-dom';
import EnhancedTableHead from './TableHeader';
import { dispatch } from 'store';
import { CheckInActions } from 'store/slices/checkin';
import SkeletonEmployee from 'ui-component/skeleton/SkeletonEmployee';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

// hooks
import useTable, { getComparator } from 'hooks/useTable';

// assets
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import { format } from 'date-fns';
import DetailsModal from './DetailsModal';
import CreateAttendance from './CreateAttendance';
import { AttendanceActions } from 'store/slices/attendance';
import { openSnackbar } from 'store/slices/snackbar';
import TableNoData from 'ui-component/extended/table/TableNoData';
import AttendanceSummary from './AttendanceSummary';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useDebounce from 'hooks/useDebounce';
import SkeletonAttendance from 'ui-component/skeleton/SkeletonAttendance';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { roles } from 'store/constant';
import useAuth from 'hooks/useAuth';
import MusterRoll from './muster';
// import Loader from 'ui-component/Loader';

// sorting
function applySortFilter({ tableData, comparator }) {
    // const stabilizedThis = tableData?.map((el, index) => [el, index]);

    // stabilizedThis?.sort((a, b) => {
    //     const order = comparator(a[0], b[0]);
    //     if (order !== 0) return order;
    //     return a[1] - b[1];
    // });

    // tableData = stabilizedThis?.map((el) => el[0]);
    return tableData;
}

function Attendance() {
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
    const { fetchAttendances, deleteAttendance } = AttendanceActions;

    const { role } = useAuth();

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [currMonth, setCurrMont] = React.useState(moment().format('YYYY-MM'));

    const handleMonthChange = (e) => {
        setCurrMont(e.target.value);
    };

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    //for analytics
    const [startDate, setStartDate] = React.useState(new Date().toISOString());
    const [endDate, setEndDate] = React.useState(new Date().toISOString());

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, attendances, totalData } = useSelector((state) => state.attendance);

    // React.useEffect(() => {
    //     dispatch(fetchAttendances({ page: page + 1, limit: rowsPerPage, search }));
    // }, [page, rowsPerPage, debouncedSearchValue]);

    React.useEffect(() => {
        setTableData(attendances);
    }, [attendances]);

    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };

    const handleOpenCreateDialog = (data) => {
        setSelectedRow(data);
        setOpenDialog(true);
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const detailedView = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleDeleteAttendance = async (attendance_id) => {
        const object = {
            attendances: [attendance_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const response = await dispatch(deleteAttendance(object));
                    if (response?.payload?.status != 201) {
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
                                message: 'Attendance deleted successfully.',
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

    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData?.length) : 0;

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Attendance: List">
            <Breadcrumbs heading="Attendance List" links={[{ name: 'attendance', href: '/attendance/list' }]} />
            <DetailsModal open={open} setOpen={setOpen} />
            <MainCard title="Attendance List" content={false}>
                <CardContent>
                    <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                        <Box>
                            <Grid container justifyContent="space-between" alignItems="center" spacing={2} flexWrap={'nowrap'}>
                                {/* <Grid item xs={12} sm={6}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search attendance by name"
                                // size="small"
                            />
                        </Grid> */}
                                <Grid item xs={12} sm={6} display={'flex'} gap={3}>
                                    <DatePicker
                                        label="Start date"
                                        name="start_data"
                                        value={startDate}
                                        // onBlur={handleBlur}
                                        onChange={(value) => setStartDate(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                InputLabelProps={{ shrink: true }}
                                                error={false}
                                                sx={{ width: '300px' }}
                                            />
                                        )}
                                    />
                                    <DatePicker
                                        label="End date"
                                        name="end_date"
                                        value={endDate}
                                        sx={{ width: '200px' }}
                                        // onBlur={handleBlur}
                                        onChange={(value) => setEndDate(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                InputLabelProps={{ shrink: true }}
                                                error={false}
                                                sx={{ width: '300px' }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                    <Tooltip title="Filter">
                                        <IconButton size="large">
                                            <FilterListIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                                        <Tooltip title="Create Leave">
                                            <Fab
                                                size="small"
                                                onClick={() => {
                                                    handleOpenCreateDialog();
                                                }}
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
                                    </RoleBasedGuard>
                                    <CreateAttendance
                                        page={page}
                                        limit={rowsPerPage}
                                        openDialog={openDialog}
                                        handleCloseDialog={handleCloseDialog}
                                        selectedRow={selectedRow}
                                        setSelectedRow={setSelectedRow}
                                        currMonth={currMonth}
                                    />
                                </Grid>
                            </Grid>

                            <AttendanceSummary startDate={startDate} endDate={endDate} />
                        </Box>
                    </RoleBasedGuard>

                    <Box mt={2}>
                        <MusterRoll
                            currMonth={currMonth}
                            handleMonthChange={handleMonthChange}
                            handleOpenCreateDialog={handleOpenCreateDialog}
                            handleEdit={handleEdit}
                            handleDeleteAttendance={handleDeleteAttendance}
                        />
                    </Box>
                </CardContent>

                {/* table */}
                {/* <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={selected?.length}
                            order={order}
                            orderBy={orderBy}
                            setSelected={setSelected}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row.attendance_id)
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
                                        aria-checked={selected.includes(row.attendance_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row.attendance_id)}
                                    >
                                        <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row.attendance_id)}>
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(row.attendance_id)}
                                                inputProps={{
                                                    'aria-labelledby': `enhanced-table-checkbox-${index}`
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
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

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography align="left" variant="subtitle1" component="div">
                                                    {format(new Date(row?.attendance_date), 'd MMM yyyy h:mm a')}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography align="left" variant="subtitle1" component="div">
                                                    {row?.status}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography align="left" variant="subtitle1" component="div">
                                                    {row?.shift?.shift_name}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            <Typography align="left" variant="subtitle1" component="div">
                                                {moment
                                                    .utc(moment(row?.checkin[0]?.log_time).diff(moment(row?.checkin[1]?.log_time)))
                                                    .format('h')}{' '}
                                                Hours
                                            </Typography>
                                        </TableCell>

                                        {role !== roles.EMPLOYEE && (
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                                                    <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="large"
                                                    aria-label="more options"
                                                    onClick={() => {
                                                        handleDelete(row?.attendance_id);
                                                    }}
                                                >
                                                    <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ) : (
                                    !isNotFound && <SkeletonAttendance key={index} />
                                )
                            )}
                            <TableNoData isNotFound={isNotFound} />
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={totalData || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={onChangePage}
                    onRowsPerPageChange={onChangeRowsPerPage}
                /> */}
            </MainCard>
        </Page>
    );
}

export default Attendance;
