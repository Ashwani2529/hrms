/* eslint-disable */
import React, { useState } from 'react';

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
    Card,
    Box,
    Container,
    CircularProgress,
    Tabs,
    Tab,
    Button,
    Stack
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
import Calendar from 'react-awesome-calendar';

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
import CreateHoliday from './CreateHoliday';
import { LeaveActions } from 'store/slices/leave';
import TableNoData from 'ui-component/extended/table/TableNoData';
import { HolidayActions } from 'store/slices/holiday';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useDebounce from 'hooks/useDebounce';
import { parseHolidayData } from 'utils/parseHolidayData';
import moment from 'moment';
import useAuth from 'hooks/useAuth';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import SkaletonHolidaysCalender from 'ui-component/skeleton/SkaletonHolidaysCalender';
import { roles, CalendarView, HOLIDAY_TYPES, gridSpacing } from 'store/constant';
import SkeletonHolidayList from 'ui-component/skeleton/SkeletonHolidayList';
// import Loader from 'ui-component/Loader';

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

function Holiday() {
    const { page, order, orderBy, rowsPerPage } = useTable();
    const calendarRef = React.useRef();
    const theme = useTheme();
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const { fetchHoliday } = HolidayActions;

    const [type, setType] = useState(HOLIDAY_TYPES.ALL); // 1 represents true
    const [activeView, setActiveView] = useState(CalendarView.CALENDAR); // 1 represents true
    const [tableData, setTableData] = React.useState([]);
    const [search, setSearch] = React.useState([]);
    const [dateFilters, setDateFilters] = useState({
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString()
    });
    const [open, setOpen] = React.useState(false);
    const [selectedRowId, setSelectedRowId] = React.useState();
    const [selectedCalendarDate, setSelectedCalendarDate] = React.useState({
        day: 1,
        mode: 'monthlyMode',
        month: moment().get('month'),
        year: moment().get('year')
    });

    const handleTypeToggle = (e, newValue) => {
        setType(newValue);
    };

    const handleViewToggle = (e) => {
        setActiveView(e.target.innerText);
        // console.log(e);
    };

    //debounced searching
    const debouncedSearchValue = useDebounce(search, 500);

    const [openDialog, setOpenDialog] = React.useState(false);
    const { loading, holidays } = useSelector((state) => state.holiday);

    const parsedDayArr = React.useMemo(() => {
        return parseHolidayData({
            holidays,
            selectedMonth: selectedCalendarDate.month,
            selectedYear: selectedCalendarDate.year,
            role,
            userId: user.user_id || '',
            type,
            activeView
        });
    }, [holidays, selectedCalendarDate.year, selectedCalendarDate.month, type, activeView]);

    const fetchHolidayWrapper = () => {
        const selectedDuration = moment(`${selectedCalendarDate.year}-${selectedCalendarDate.month + 1}-01`);
        dispatch(
            fetchHoliday({
                page: page + 1,
                limit: rowsPerPage,
                search: activeView === CalendarView.LISTVIEW ? debouncedSearchValue : '',
                startDate: activeView === CalendarView.CALENDAR ? selectedDuration.startOf('month').toISOString() : dateFilters.startDate,
                endDate: activeView === CalendarView.CALENDAR ? selectedDuration.endOf('month').toISOString() : dateFilters.endDate
            })
        );
    };

    const dataFiltered = applySortFilter({
        tableData,
        comparator: getComparator(order, orderBy)
    });

    const handleCloseDialog = () => {
        setSelectedRowId();
        setOpenDialog(false);
    };

    const handleCalenderChange = (date) => {
        setSelectedCalendarDate(date);
    };

    const handleClickEvent = (id) => {
        if (role === roles.EMPLOYEE) return;
        setSelectedRowId(id);
        setOpenDialog(true);
    };

    const handleDateFilterChange = (e) => {
        setDateFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleClearFilters = () => {
        setSearch('');
        setDateFilters({
            startDate: '',
            endDate: ''
        });
    };

    const isNotFound = !loading && !dataFiltered?.length;

    React.useEffect(() => {
        fetchHolidayWrapper();
    }, [
        page,
        rowsPerPage,
        debouncedSearchValue,
        selectedCalendarDate.month,
        selectedCalendarDate.year,
        dateFilters.startDate,
        dateFilters.endDate,
        activeView
    ]);

    React.useEffect(() => {
        setTableData(holidays);
    }, [holidays]);

    return (
        <Page title="Attendance: Holiday">
            <Breadcrumbs heading="Holiday" links={[{ name: 'holiday', href: '/attendance/holiday' }]} />
            <DetailsModal open={open} setOpen={setOpen} />
            <MainCard content={false}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Tabs value={type} onChange={handleTypeToggle}>
                                <Tab value={HOLIDAY_TYPES.ALL} label={HOLIDAY_TYPES.ALL} />
                                <Tab value={HOLIDAY_TYPES.WEEKOFF} label={HOLIDAY_TYPES.WEEKOFF} />
                                <Tab value={HOLIDAY_TYPES.HOLIDAYS} label={HOLIDAY_TYPES.HOLIDAYS} />
                            </Tabs>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
                            <Stack direction={'row'} gap={2} justifyContent={'flex-end'} alignItems={'flex-end'}>
                                <Button
                                    variant={activeView === CalendarView.CALENDAR ? 'contained' : 'outlined'}
                                    onClick={handleViewToggle}
                                >
                                    {CalendarView.CALENDAR}
                                </Button>
                                <Button
                                    variant={activeView === CalendarView.LISTVIEW ? 'contained' : 'outlined'}
                                    onClick={handleViewToggle}
                                >
                                    {CalendarView.LISTVIEW}
                                </Button>
                                <RoleBasedGuard restrictedRoles={[roles.EMPLOYEE]}>
                                    <Tooltip title="Create Holiday">
                                        <Fab
                                            size="small"
                                            onClick={() => {
                                                setSelectedRowId();
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
                            </Stack>
                            {/* product add & dialog */}

                            <CreateHoliday
                                page={page}
                                limit={rowsPerPage}
                                openDialog={openDialog}
                                handleCloseDialog={handleCloseDialog}
                                selectedRowId={selectedRowId}
                                setSelectedRowId={setSelectedRowId}
                                openConfirmationModal={openConfirmationModal}
                                fetchHolidayWrapper={fetchHolidayWrapper}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <Card>
                    {activeView === CalendarView.CALENDAR ? (
                        <Box p={3} sx={{ position: 'relative' }}>
                            <SkaletonHolidaysCalender />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '0%',
                                    left: '0%',
                                    width: '100%',
                                    height: '100%',
                                    background: theme.palette.background.paper,
                                    opacity: loading ? '0' : '1',
                                    pointerEvents: loading ? 'none' : 'all'
                                }}
                                p={3}
                            >
                                <Calendar
                                    ref={calendarRef}
                                    onChange={handleCalenderChange}
                                    events={parsedDayArr}
                                    onClickEvent={handleClickEvent}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Box p={3}>
                            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Grid container mb={2} xs={12} md={8} spacing={gridSpacing}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label={'Username'}
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                            }}
                                            fullWidth
                                            size={'small'}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack direction={'row'} gap={gridSpacing}>
                                            <TextField
                                                type="date"
                                                name={'startDate'}
                                                value={dateFilters.startDate}
                                                onChange={handleDateFilterChange}
                                                size="small"
                                                label={'Start Date'}
                                            />
                                            <TextField
                                                type="date"
                                                name={'endDate'}
                                                value={dateFilters.endDate}
                                                onChange={handleDateFilterChange}
                                                size="small"
                                                label={'End Date'}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                                <IconButton onClick={handleClearFilters}>
                                    <FilterListIcon />
                                </IconButton>
                            </Stack>
                            <Card variant="outlined">
                                <TableContainer>
                                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                                        <EnhancedTableHead />

                                        {loading ? (
                                            [...Array(10)].map((ele, index) => (
                                                <TableBody>
                                                    <SkeletonHolidayList key={ele + index} />{' '}
                                                </TableBody>
                                            ))
                                        ) : (
                                            <TableBody>
                                                {Array.isArray(parsedDayArr) &&
                                                    parsedDayArr?.map((holiday) => (
                                                        <TableRow>
                                                            <TableCell>
                                                                <Typography>{holiday?.holiday_name}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography>{holiday?.holiday_type}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography>
                                                                    {Array.isArray(holiday?.custom_repeat) &&
                                                                    holiday?.custom_repeat.length > 0
                                                                        ? holiday?.custom_repeat?.reduce(
                                                                              (prev, curr, index) => `${prev}${prev && ','} ${curr}`,
                                                                              ''
                                                                          )
                                                                        : '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography>
                                                                    {holiday?.holiday_date
                                                                        ? moment(holiday?.holiday_date).format('ddd MMM DD YYYY')
                                                                        : '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography>
                                                                    {holiday?.end_date
                                                                        ? moment(holiday?.end_date).format('ddd MMM DD YYYY')
                                                                        : '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography>
                                                                    {Array.isArray(holiday?.user_holiday) && holiday?.user_holiday.length}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        handleClickEvent(holiday?.holiday_id);
                                                                    }}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        )}
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Box>
                    )}
                </Card>
            </MainCard>
        </Page>
    );
}

export default Holiday;
