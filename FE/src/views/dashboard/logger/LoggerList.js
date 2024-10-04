/* eslint-disable */
import * as React from 'react';

// material-ui
import {
    Button,
    CardContent,
    Chip,
    Dialog,
    Grid,
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
    MenuItem
} from '@mui/material';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { DatePicker } from '@mui/x-date-pickers';

// project imports
import { useNavigate } from 'react-router-dom';
import { dispatch, useSelector } from 'store';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SkeletonPayrollList from 'ui-component/skeleton/SkeletonPayrollList';
import MainCard from './MainCard';
import EnhancedTableHead from './TableHeader';

// hooks
import useTable, { getComparator } from 'hooks/useTable';

// assets
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import useDebounce from 'hooks/useDebounce';
import { LoggerActions } from 'store/slices/logger';
import Avatar from '@mui/material/Avatar';
import { PayrollActions } from 'store/slices/payroll';
import TableNoData from 'ui-component/extended/table/TableNoData';
import ViewMoreModal from './dialogs/ViewMore';

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

function LoggerList() {
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

    const { fetchLogs } = LoggerActions;

    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [selectedSalarySlip, setSelectedSalarySlip] = React.useState();

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    //for analytics
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [logType, setLogType] = React.useState('');

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, logger, totalData } = useSelector((state) => state.logger);

    React.useEffect(() => {
        dispatch(
            fetchLogs({
                page: page + 1,
                limit: rowsPerPage,
                search: search,
                status: logType,
                startDate,
                endDate
            })
        );
    }, [page, rowsPerPage, debouncedSearchValue, logType, endDate, startDate]);

    React.useEffect(() => {
        setTableData(logger);
    }, [logger]);

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

    const handleClearFilter = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setLogType('');
    };

    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData?.length) : 0;

    const isNotFound = !loading && !dataFiltered?.length;

    return (
        <Page title="Logger: List">
            <Breadcrumbs heading="Logger List" links={[{ name: 'logger', href: '/logger/list' }]} />

            <MainCard title="Logger List" content={false}>
                <CardContent>
                    <Grid container justifyContent="flex-start" alignItems="center" spacing={2} flexWrap={'nowrap'} xs={12} sm={12}>
                        <Grid item xs={15} sm={8} display="flex" alignItems="center" gap={2}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: '#462F4D' }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ width: '1200px' }}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search logger by name"
                            />
                            <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Log Type">
                                <InputLabel id="gender-label">Select log type</InputLabel>
                                <Select
                                    id="log_type"
                                    name="log_type"
                                    value={logType}
                                    onChange={(event) => {
                                        setLogType(event.target.value);
                                    }}
                                    label="Select log type"
                                >
                                    <MenuItem value="Create">Create</MenuItem>
                                    <MenuItem value="Update">Update</MenuItem>
                                </Select>
                            </FormControl>

                            <Grid item xs={12} sm={6} display={'flex'} gap={3}>
                                <DatePicker
                                    label="Start date"
                                    name="start_data"
                                    value={startDate}
                                    onChange={(value) => setStartDate(value.toISOString().split('T')[0])}
                                    renderInput={(params) => (
                                        <TextField {...params} InputLabelProps={{ shrink: true }} error={false} sx={{ width: '300px' }} />
                                    )}
                                />
                                <DatePicker
                                    label="End date"
                                    name="end_date"
                                    value={endDate}
                                    sx={{ width: '200px' }}
                                    onChange={(value) => setEndDate(value.toISOString().split('T')[0])}
                                    renderInput={(params) => (
                                        <TextField {...params} InputLabelProps={{ shrink: true }} error={false} sx={{ width: '300px' }} />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                            <Tooltip title="Filter">
                                <IconButton size="large" onClick={handleClearFilter}>
                                    <Typography align="left" variant="subtitle1" component="div">
                                        Clear Filters
                                    </Typography>
                                    <FilterListIcon sx={{ marginLeft: '5px' }} />
                                </IconButton>
                            </Tooltip>
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
                                    tableData?.map((row) => row?.payroll_id)
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
                                        aria-checked={selected.includes(row?.logger_id)}
                                        tabIndex={-1}
                                        key={index}
                                        selected={selected.includes(row?.logger_id)}
                                    >
                                        {/* <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row?.payroll_id)}>
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
                                                {/* <Grid item>
                                                    <Avatar src={row?.user?.profile_photo}>
                                                        {row?.user?.user_name?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                </Grid> */}
                                                <Grid item xs zeroMinWidth>
                                                    {/* <Typography align="left" variant="subtitle1" component="div">
                                                        {row?.user?.user_name}
                                                    </Typography> */}
                                                    <Typography align="left" variant="subtitle2" noWrap>
                                                        {row?.user_email}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            {row.log_type === 'Update' && (
                                                <Chip
                                                    label="Update"
                                                    size="small"
                                                    sx={{
                                                        background: theme.palette.success.light + 60,
                                                        color: theme.palette.success.dark
                                                    }}
                                                />
                                            )}
                                            {row.log_type === 'Create' && (
                                                <Chip
                                                    label="Create"
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
                                                    {row?.text_info}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <Typography align="left" variant="subtitle1" component="div">
                                                    {row?.createdAt ? format(new Date(row?.createdAt), 'd MMM yyyy h:mm a') : null}
                                                </Typography>
                                            </Grid>
                                        </TableCell>

                                        <TableCell sx={{ cursor: 'pointer' }}>
                                            <Grid container alignItems="center">
                                                <AnimateButton>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{ whiteSpace: 'nowrap' }}
                                                        onClick={() => handleViewSalarySlip(row)}
                                                        // disabled={!row?.salary_slip || row?.salary_slip?.length === 0}
                                                    >
                                                        View
                                                    </Button>
                                                </AnimateButton>
                                            </Grid>
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
                        <ViewMoreModal selectedRow={selectedSalarySlip} handleModalClose={handleCloseSalarySlipModal} />
                    </Dialog>
                )}
            </MainCard>
        </Page>
    );
}

export default LoggerList;
