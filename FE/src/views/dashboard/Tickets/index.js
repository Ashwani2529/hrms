import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CardContent,
    Fab,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TablePagination,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import EmptyContent from 'ui-component/extended/EmptyContent';
import SkeletonDocument from 'ui-component/skeleton/SkeletonDocuments';
import useDebounce from 'hooks/useDebounce';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import AddIcon from '@mui/icons-material/AddTwoTone';
import Createticket from './CreateTicket';
import { TicketActions } from 'store/slices/tickets';
import useTable, { getComparator } from 'hooks/useTable';
import DetailsModal from './DetailsModal';
import EnhancedTableHead from './TicketsTableHead';
import { openSnackbar } from 'store/slices/snackbar';
import { applySortFilter } from 'views/attendance/leave';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { findKeyInObject } from 'utils/findKeyInObjects';
import { TIKCET_TYPE } from 'store/constant';
import TicketTableRow from './TicketsTableRow';

function TicketsList() {
    const theme = useTheme();

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

    const { fetchAllTickets, editTickets, deleteTickets } = TicketActions;
    const { loading, tickets, totalData } = useSelector((state) => state.tickets);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [openDetails, setOpenDetails] = React.useState(false);
    const [tableData, setTableData] = React.useState([]);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        dispatch(fetchAllTickets({ page: page + 1, limit: rowsPerPage, search }));
    }, [page, rowsPerPage, debouncedSearch]);

    React.useEffect(() => {
        setTableData(tickets);
    }, [tickets]);

    const handleCloseDialog = () => {
        setSelectedRow();
        setOpenDialog(false);
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleApproveticket = async (row) => {
        const data = { ...row, ticket_status: 'APPROVED' };
        delete data?.createdAt;
        delete data?.updatedAt;
        delete data?.user;
        delete data?.ticket_id;
        dispatch(
            openConfirmationModal({
                open: true,
                message: 'Please click on submit to approve the ticket',
                handleConfirm: async () => {
                    const res = await dispatch(editTickets({ id: row?.ticket_id, values: data }));
                    if (res?.payload?.status === 201 || res?.payload?.status === 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Ticket approved successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        dispatch(fetchAllTickets({ page: page + 1, limit: rowsPerPage, search }));
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

    const handleRejectticket = async (row) => {
        const data = { ...row, ticket_status: 'REJECTED' };
        delete data?.createdAt;
        delete data?.updatedAt;
        delete data?.user;
        delete data?.ticket_id;
        dispatch(
            openConfirmationModal({
                open: true,
                message: 'Please click on submit to reject the ticket',
                handleConfirm: async () => {
                    const res = await dispatch(editTickets({ id: row?.ticket_id, values: data }));
                    if (res?.payload?.status === 201 || res?.payload?.status === 200) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Ticket rejected successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        dispatch(fetchAllTickets({ page: page + 1, limit: rowsPerPage, search }));
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

    const handleDelete = async (ticketId) => {
        const object = {
            tickets: [ticketId]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const res = await dispatch(deleteTickets(object));

                    if (res?.payload?.status !== 201) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: res?.payload?.message || 'Internal server error',
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
                                message: 'Tickets deleted successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        dispatch(fetchAllTickets({ page: page + 1, limit: rowsPerPage, search }));
                    }
                }
            })
        );
    };

    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };

    const detailedView = (row) => {
        setOpenDetails(true);
        setSelectedRow(row);
    };

    useEffect(() => {
        dispatch(fetchAllTickets());
    }, []);

    const handleStatusChange = (e) => {
        dispatch(fetchAllTickets({ page: page + 1, limit: rowsPerPage, search, type: e.target.value }));
    };

    return (
        <Page title="Tickets: List">
            <Breadcrumbs heading="Tickets" links={[{ name: 'Tickets', href: '/tickets/list' }]} />
            <DetailsModal open={openDetails} setOpen={setOpenDetails} selectedRow={selectedRow} />
            <MainCard title="Tickets List" content={false}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Stack direction="row" gap={2} alignItems="center">
                                <TextField
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search ticket by title"
                                />

                                <TextField select onChange={handleStatusChange} sx={{ width: '200px' }} name="status" label="Ticket Status">
                                    <MenuItem value="">All</MenuItem>
                                    {Object.entries(TIKCET_TYPE).map((ele, index) => (
                                        <MenuItem key={ele[0] + index} value={ele[0]}>
                                            {ele[1]}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large">
                                    <FilterListIcon />
                                </IconButton>
                            </Tooltip>
                            {/* product add & dialog */}
                            {/* <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}> */}
                            <Tooltip title="Create ticket">
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
                            {/* </RoleBasedGuard> */}
                            <Createticket
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

                <TableContainer sx={{ mt: 3 }}>
                    <Table>
                        <EnhancedTableHead
                            numSelected={selected?.length}
                            order={order}
                            orderBy={orderBy}
                            setSelected={setSelected}
                            onSelectAllClick={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData?.map((row) => row?.ticket_id)
                                )
                            }
                            selected={selected}
                            onSort={onSort}
                            rowCount={tableData?.length}
                            theme={theme}
                        />
                        <TableBody>
                            {loading
                                ? [1, 2, 3, 4, 5].map((ele, index) => <SkeletonDocument key={ele + index} />)
                                : dataFiltered?.map((row, index) => (
                                      <TicketTableRow
                                          key={row?.ticket_id}
                                          row={row}
                                          index={page * rowsPerPage + index}
                                          selected={selected}
                                          onSelectRow={onSelectRow}
                                          detailedView={detailedView}
                                          handleApproveTicket={handleApproveticket}
                                          handleRejectTicket={handleRejectticket}
                                          handleDelete={handleDelete}
                                          handleEdit={handleEdit}
                                      />
                                  ))}
                        </TableBody>
                    </Table>
                    {!loading && tickets.length === 0 && <EmptyContent title="No tickets found!" />}
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100]}
                        component="div"
                        count={totalData || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={onChangePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                    />
                </TableContainer>
            </MainCard>
        </Page>
    );
}

export default TicketsList;
