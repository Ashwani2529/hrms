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
    useTheme
} from '@mui/material';

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
import CreateCheckIn from './CreateCheckIn';
import TableNoData from 'ui-component/extended/table/TableNoData';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useDebounce from 'hooks/useDebounce';
import SkeletonClient from 'ui-component/skeleton/SkeletonClient';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { roles } from 'store/constant';
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

function CheckIn() {
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
    const { fetchCheckIn, deleteCheckIn } = CheckInActions;

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, checkIn, totalData } = useSelector((state) => state.checkIn);

    React.useEffect(() => {
        dispatch(fetchCheckIn({ page: page + 1, limit: rowsPerPage, search }));
    }, [page, rowsPerPage, debouncedSearchValue]);

    React.useEffect(() => {
        setTableData(checkIn);
    }, [checkIn]);

    const handleEdit = (row) => {
        setSelectedRow(row);
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

    const handleDelete = async (checkin_id) => {
        const object = {
            checkins: [checkin_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const res = await dispatch(deleteCheckIn(object));
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
                                message: 'Checkin deleted successfully.',
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
        <Page title="Attendance: CheckIn">
            <Breadcrumbs heading="CheckIn" links={[{ name: 'checkin', href: '/attendance/checkin' }]} />
            {/* <DetailsModal open={open} setOpen={setOpen}/> */}
            <MainCard title="CheckIn" content={false}>
                <CardContent>
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
                                placeholder="Search CheckIn by shift"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large">
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                            {/* product add & dialog */}
                            <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                                <Tooltip title="Add CheckIn">
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
                                            bgcolor: theme.palette.secondary.main,
                                            '&:hover': { bgcolor: theme.palette.secondary.dark }
                                        }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Fab>
                                </Tooltip>
                            </RoleBasedGuard>
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
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row.checkin_id)
                                )
                            }
                            selected={selected}
                            setSelected={setSelected}
                            onSort={onSort}
                            rowCount={tableData?.length}
                            theme={theme}
                        />
                        <TableBody>
                            {(loading ? [...Array(rowsPerPage)] : dataFiltered).map((row, index) =>
                                row ? (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        aria-checked={selected.includes(row.checkin_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row.checkin_id)}
                                    >
                                        <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row.checkin_id)}>
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(row.checkin_id)}
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
                                                        {row?.user?.user_name}{' '}
                                                    </Typography>
                                                    <Typography align="left" variant="subtitle2" noWrap>
                                                        {row?.user.user_email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography
                                                    sx={{
                                                        color: `${row?.log_type === 'IN' ? '#3bc73b' : '#f73a3a'}`,
                                                        fontWeight: '900'
                                                    }}
                                                    align="left"
                                                    variant="subtitle1"
                                                    component="div"
                                                >
                                                    {row?.log_type}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography align="left" variant="subtitle1" component="div">
                                                    {format(new Date(row?.log_time), 'd MMM yyyy h:mm a')}
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
                                        {/* 
                                                <TableCell
                                                >
                                                    <IconButton size="large" aria-label="more options" onClick={detailedView}>
                                                        <ArticleIcon color='primary' sx={{ fontSize: '1.3rem' }} />
                                                    </IconButton>

                                                </TableCell> */}

                                        <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                                                    <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                                <IconButton
                                                    size="large"
                                                    aria-label="more options"
                                                    onClick={() => {
                                                        handleDelete(row?.checkin_id);
                                                    }}
                                                >
                                                    <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                                                </IconButton>
                                            </TableCell>
                                        </RoleBasedGuard>
                                    </TableRow>
                                ) : (
                                    !isNotFound && <SkeletonClient key={index} />
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
            </MainCard>
        </Page>
    );
}

export default CheckIn;
