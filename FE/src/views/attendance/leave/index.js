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
    Box,
    Tabs,
    Tab
} from '@mui/material';

// project imports
import MainCard from './MainCard';
import { useSelector } from 'store';
import Page from 'ui-component/Page';
import { useNavigate } from 'react-router-dom';
import EnhancedTableHead from './TableHeader';
import { dispatch } from 'store';
import { CheckInActions } from 'store/slices/checkin';
import SkeletonLeave from 'ui-component/skeleton/SkeletonLeave';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { openSnackbar } from 'store/slices/snackbar';

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
import CreateCheckIn from './CreateLeave';
import leave, { LeaveActions } from 'store/slices/leave';
import TableNoData from 'ui-component/extended/table/TableNoData';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useDebounce from 'hooks/useDebounce';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { roles } from 'store/constant';
import useAuth from 'hooks/useAuth';
import LeavesSummary from './LeavesSummary';
import EventBusyTwoToneIcon from '@mui/icons-material/EventBusyTwoTone';
import { findKeyInObject } from 'utils/findKeyInObjects';
import LeaveTableRow from './LeaveTableRow';
import { toInteger } from 'lodash';
// import Loader from 'ui-component/Loader';

// sorting
export function applySortFilter({ tableData, comparator }) {
    const stabilizedThis = tableData?.map((el, index) => [el, index]);

    stabilizedThis?.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    tableData = stabilizedThis?.map((el) => el[0]);
    return tableData;
}

function Leave() {
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
    const { fetchLeaves, deleteLeave, updateLeave } = LeaveActions;

    const { role } = useAuth();

    const [search, setSearch] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [selectedTab, setSelectedTab] = React.useState('queue');

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, leaves, totalData } = useSelector((state) => state.leave);
    const { employee } = useSelector((state) => state.employee);
    const { allUsers } = useSelector((state) => state.employee);
    const [tableData, setTableData] = React.useState([]);

    React.useEffect(() => {
        dispatch(fetchLeaves({ page: page + 1, limit: rowsPerPage, search }));
    }, [page, rowsPerPage, debouncedSearchValue]);

    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };

    React.useEffect(() => {
        if (selectedTab === 'queue') {
            setTableData(leaves);
        } else if (selectedTab === 'stats') {
            setTableData(employee);
        }
        else {
            setTableData(allUsers);
        }
    }, [selectedTab, leaves, allUsers, employee]);

    const dataFiltered = applySortFilter({ tableData, comparator: getComparator(order, orderBy) });

    const detailedView = (row) => {
        setOpen(true);
        setSelectedRow(row);
    };

    const handleCloseDialog = () => {
        setSelectedRow();
        setOpenDialog(false);
    };

    const handleApproveLeave = async (row) => {
        const data = { ...row, leave_status: 'APPROVED' };
        delete data?.createdAt;
        delete data?.updatedAt;
        delete data?.user;
        delete data?.leave_id;
        dispatch(
            openConfirmationModal({
                open: true,
                message: 'Please click on submit to approve the leave',
                handleConfirm: async () => {
                    const res = await dispatch(updateLeave({ id: row?.leave_id, values: data }));
                    if (res?.payload?.status === 201 || res?.payload?.status === 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Leave approved successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        dispatch(fetchLeaves({ page: page + 1, limit: rowsPerPage, search }));
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message:
                                    findKeyInObject(res?.payload, `message`) ||
                                    findKeyInObject(res?.payload, `error`) ||
                                    'Internal server error',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
    };

    const handleRejectLeave = async (row) => {
        const data = { ...row, leave_status: 'REJECTED' };

        delete data?.createdAt;
        delete data?.updatedAt;
        delete data?.user;
        delete data?.leave_id;

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'Please click on submit to reject the leave',
                handleConfirm: async () => {
                    const res = await dispatch(updateLeave({ id: row?.leave_id, values: data }));
                    if (res?.payload?.status === 201 || res?.payload?.status === 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Leave rejected successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        dispatch(fetchLeaves({ page: page + 1, limit: rowsPerPage, search }));
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message:
                                    findKeyInObject(res?.payload, `message`) ||
                                    findKeyInObject(res?.payload, `error`) ||
                                    'Internal server error',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
    };

    const handleDelete = async (leave_id) => {
        const object = {
            leaves: [leave_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const res = await dispatch(deleteLeave(object));

                    if (res?.payload?.status != 201) {
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
                                message: 'Leave deleted successfully',
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

        // dispatch(fetchLeaves())
    };

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Attendance: Leave">
            <Breadcrumbs heading="Leave Dashboard" links={[{ name: 'leave', href: '/attendance/leave' }]} />
            <DetailsModal open={open} setOpen={setOpen} selectedRow={selectedRow} />
            <MainCard content={false} title=" ">
                <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: '-20px', pl: '20px' }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, value) => setSelectedTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                        TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                paddingLeft: 0,
                                marginLeft: 0
                            }
                        }}
                    >
                        <Tab
                            value={'queue'}
                            label={'Approval Queue'}
                            sx={{
                                minWidth: 'auto',
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                        />
                        <Tab
                            value={'stats'}
                            label={'Employee Stats'}
                            sx={{
                                minWidth: 'auto',
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                        />
                        <Tab
                            value={'viewAll'}
                            label={'Overview'}
                            sx={{
                                minWidth: 'auto',
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                        />
                    </Tabs>
                </Box>
                <CardContent>
                    <RoleBasedGuard restrictedRoles={[roles.ADMIN]}>
                        <LeavesSummary />
                    </RoleBasedGuard>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search leave by name"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large">
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Create Leave">
                                <Fab
                                    size="small"
                                    onClick={() => {
                                        setSelectedRow();
                                        setOpenDialog(true);
                                    }}
                                    sx={{
                                        boxShadow: 'none',
                                        ml: 1,
                                        width: 32,
                                        height: 32,
                                        minHeight: 32,
                                        color: '#fff',
                                        bgcolor: 'secondary.main',
                                        '&:hover': { bgcolor: 'secondary.dark' }
                                    }}
                                >
                                    <AddIcon fontSize="small" />
                                </Fab>
                            </Tooltip>
                            <CreateCheckIn
                                page={page}
                                limit={rowsPerPage}
                                openDialog={openDialog}
                                handleCloseDialog={handleCloseDialog}
                                selectedRow={selectedRow}
                                setSelectedRow={setSelectedRow}
                            />
                        </Grid>
                    </Grid>
                </CardContent>

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
                                    tableData?.map((row) => row?.leave_id)
                                )
                            }
                            selected={selected}
                            onSort={onSort}
                            rowCount={tableData?.length}
                            theme={theme}
                            tabSelected={selectedTab}
                        />
                        <TableBody>
                            {(loading ? [...Array(rowsPerPage)] : dataFiltered)?.map((row, index) =>
                                row ? (
                                    <LeaveTableRow
                                        key={index}
                                        row={row}
                                        selected={selected}
                                        onSelectRow={onSelectRow}
                                        index={index}
                                        detailedView={detailedView}
                                        handleApproveLeave={handleApproveLeave}
                                        handleRejectLeave={handleRejectLeave}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        tabSelected={selectedTab}
                                    />
                                ) : (
                                    !isNotFound && <SkeletonLeave key={index} />
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
                    count={selectedTab === 'queue' ? totalData : selectedTab === 'stats' ? employee?.length || 0 : allUsers?.length || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={onChangePage}
                    onRowsPerPageChange={onChangeRowsPerPage}
                />
            </MainCard>
        </Page>
    );
}

export default Leave;