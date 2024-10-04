/* eslint-disable */
import * as React from 'react';
import { format } from 'date-fns';

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
import { EmployeeActions } from 'store/slices/employee';
import { ClientActions } from 'store/slices/client';
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
import ClientAddEdit from './ClientAddEdit';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useDebounce from 'hooks/useDebounce';
import SkeletonClient from 'ui-component/skeleton/SkeletonClient';
import { findKeyInObject } from 'utils/findKeyInObjects';
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

function ClientList() {
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

    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const theme = useTheme();
    const { fetchClients, deleteClient } = ClientActions;

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const { loading, clients, totalData } = useSelector((state) => state.client);

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    React.useEffect(() => {
        dispatch(fetchClients({ page: page + 1, limit: rowsPerPage, search }));
    }, [page, rowsPerPage, debouncedSearchValue]);

    React.useEffect(() => {
        setTableData(clients);
    }, [clients]);

    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleDelete = async (client_id) => {
        const object = {
            clients: [client_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const res = await dispatch(deleteClient(object));
                    //  console.log(res);
                    if (res?.payload?.status !== 201) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message:
                                    findKeyInObject(res?.payload, `message`) ||
                                    findKeyInObject(res?.payload, `error`) ||
                                    'Internal Server error',
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
                                message: `Client successfully deleted.`,
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

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Dashboard: Clients">
            <Breadcrumbs heading="Clients" links={[{ name: 'Clients', href: '/dashboard/clients' }]} />
            <MainCard title="Client List" content={false}>
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
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search client by name"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large">
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                            {/* product add & dialog */}
                            <Tooltip title="Add Client">
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
                        </Grid>
                    </Grid>
                    <ClientAddEdit
                        page={page}
                        limit={rowsPerPage}
                        openDialog={openDialog}
                        handleCloseDialog={handleCloseDialog}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                    />
                </CardContent>

                {/* table */}
                <TableContainer>
                    <Table sx={{ minWidth: 1050 }} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={selected?.length}
                            selected={selected}
                            setSelected={setSelected}
                            deleteClient={deleteClient}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row.client_id)
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
                                        aria-checked={selected.includes(row.client_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row.client_id)}
                                    >
                                        <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row.client_id)}>
                                            <Checkbox
                                                color="primary"
                                                checked={selected.includes(row.client_id)}
                                                inputProps={{
                                                    'aria-labelledby': `enhanced-table-checkbox-${index}`
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Avatar
                                                    // src={row?.client_logo}
                                                    >
                                                        {row?.client_name?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                </Grid>
                                                <Grid item xs zeroMinWidth>
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {row.client_name}{' '}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>{row.client_details}</TableCell>
                                        <TableCell>
                                            <Typography align="left" variant="subtitle1" component="div">
                                                {format(new Date(row?.day_hour_start), 'h:mm a')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography align="left" variant="subtitle1" component="div">
                                                {format(new Date(row?.night_hour_start), 'h:mm a')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
                                            <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                                                <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                            </IconButton>
                                            <IconButton size="large" aria-label="more options" onClick={() => handleDelete(row?.client_id)}>
                                                <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                                            </IconButton>
                                        </TableCell>
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

export default ClientList;
