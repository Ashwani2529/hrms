/* eslint-disable */
import { useRef, useEffect, useState } from 'react';

import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

import { Grid, Typography, Avatar, Box, Tabs, Tab, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { ShiftActions } from 'store/slices/shift';

// project imports
import CalendarStyled from '../CalendarStyled';
import Toolbar from '../Toolbar';
import { openSnackbar } from 'store/slices/snackbar';
import { ClientActions } from 'store/slices/client';
import TransferShift from './dialogs/TransferShift';

// third-party
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import MainCard from 'ui-component/cards/MainCard';
import PerfectScrollbar from 'react-perfect-scrollbar';

// assets
import { IconLayoutGrid, IconTemplate, IconLayoutList } from '@tabler/icons';
import { CheckCircle, ErrorRounded } from '@mui/icons-material';
import { AnalyticsActions } from 'store/slices/analytics';
import useAuth from 'hooks/useAuth';
import { roles } from 'store/constant';
import { HolidayActions } from 'store/slices/holiday';

const viewOptions = [
    {
        label: 'Day',
        value: 'resourceTimelineDay',
        icon: IconLayoutList
    },
    {
        label: 'Week',
        value: 'resourceTimelineWeek',
        icon: IconTemplate
    },
    {
        label: 'Month',
        value: 'resourceTimelineMonth',
        icon: IconLayoutGrid
    }
];

// fade color
function shadeColor(color) {
    if (!color) return color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.2)`;
}

// shift time overlap
function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
    if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
    if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
    if (b_start <= a_start && a_end <= b_end) return true; // a in b
    return false;
}

const EmployeeShiftCalender = () => {
    const theme = useTheme();

    const { role, user } = useAuth();

    const [events, setEvents] = useState([]);
    const [active, setActive] = useState('employee');
    const [transferDialog, setTransferDialog] = useState(false);
    const [mergeDialog, setMergeDialog] = useState(false);
    const [overlappingShift, setOverlappingShift] = useState();
    const [fromUser, setFromUser] = useState();
    const [toUser, setToUser] = useState();
    const [selectedClient, setSelectedClient] = useState(null);
    const [holidayEventsData, setholidayEventsData] = useState([]);
    // const [currTime, setCurrTime] = useState(new Date);

    const { fetchAllUserShifts, swapShift, fetchAllClientShifts, fetchShiftLegends, assignShift } = ShiftActions;
    const { getLiveEmployees } = AnalyticsActions;
    const { fetchClients } = ClientActions;
    const { fetchHoliday, createHoliday } = HolidayActions;

    const { liveEmployees } = useSelector((state) => state.analytics);
    const { allUserShifts, allClientShifts, shiftLegends } = useSelector((state) => state.shift);
    const { clients } = useSelector((state) => state.client);
    const { holidays, loading: holidaysLoading } = useSelector((state) => state?.holiday);

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('resourceTimelineMonth');

    useEffect(() => {
        let data = holidayEventsData;

        holidays?.WEEKOFF?.Edited?.forEach((holiday) => {
            data = data?.filter((e)=>!(e?.holiday_id === holiday?.repeatId && moment(e?.start_time).startOf('day').isSame(moment(holiday?.holiday_date).startOf("day"))))

            holiday?.user_holiday?.forEach((user_holiday) => {
                data.push({
                    user_id: user_holiday?.user?.user_id,
                    isHoliday: true,
                    isEdited:true,
                    shift_color: '#33383D',
                    start_time: moment(holiday?.holiday_date).toDate(),
                    end_time: moment(holiday?.holiday_date).toDate(),
                    shift_name: 'OFF',
                });
            });
        });

        setEvents([...allUserShifts, ...data]);
    }, [allUserShifts, holidayEventsData]);


    useEffect(() => {
        let data = [];

        holidays?.WEEKOFF?.Normal?.forEach((holiday) => {
            holiday?.user_holiday?.forEach((user_holiday) => {
                const datesArray = [];
                if (holiday?.holiday_type === 'WEEKOFF_NON_REPEAT') {
                    data.push({
                        user_id: user_holiday?.user?.user_id,
                        isHoliday: true,
                        shift_color: '#33383D',
                        start_time: moment(holiday?.holiday_date).toDate(),
                        end_time: moment(holiday?.holiday_date).toDate(),
                        shift_name: 'OFF',
                        holiday_id:holiday?.holiday_id
                    });
                } else {
                    let currentDate = moment(holiday?.holiday_date)?.clone();
                    while (currentDate.isSameOrBefore(holiday?.end_date || moment(date).endOf('month').format('YYYY-MM-DD'), 'day')) {
                        if (holiday?.custom_repeat?.includes(currentDate.format('dddd'))) {
                            datesArray.push(currentDate.format('YYYY-MM-DD'));
                        }
                        currentDate.add(1, 'day'); // Increment by one day
                    }
                    data.push(
                        datesArray?.map((date) => ({
                            user_id: user_holiday?.user?.user_id,
                            isHoliday: true,
                            shift_color: '#33383D',
                            start_time: moment(date).toDate(),
                            end_time: moment(date).add(1, 'day').toDate(),
                            shift_name: 'OFF',
                            holiday_id:holiday?.holiday_id
                        }))
                    );
                }
            });
        });

        holidays?.HOLIDAY?.forEach((holiday) => {
            holiday?.user_holiday?.forEach((user_holiday) => {
                data.push({
                    user_id: user_holiday?.user?.user_id,
                    isHoliday: true,
                    shift_color: '#EF333F',
                    start_time: moment(holiday?.holiday_date).toDate(),
                    end_time: moment(holiday?.holiday_date).toDate(),
                    shift_name: 'HOLIDAY'
                });
            });
        });

        setholidayEventsData(data.flat());
    }, [holidays]);


    useEffect(() => {
        dispatch(getLiveEmployees());
        dispatch(fetchAllClientShifts());
        dispatch(fetchClients({ page: '', limit: '', search: '' }));
        dispatch(fetchAllUserShifts({ search: '' }));
        dispatch(fetchShiftLegends());
    }, []);

    useEffect(() => {
        dispatch(
            fetchHoliday({
                startDate: moment(date).startOf('month').format('YYYY-MM-DD'),
                endDate: moment(date).endOf('month').format('YYYY-MM-DD')
            })
        );
    }, [date]);

    const calendarRef = useRef(null);
    let keypressHandler = null;

    // calendar toolbar events
    const handleDateToday = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.today();
            setDate(calendarApi.getDate());
        }
    };

    const handleViewChange = (newView) => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.changeView(newView);
            setView(newView);
        }
    };

    const handleDatePrev = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.prev();
            setDate(calendarApi.getDate());
        }
    };

    const handleDateNext = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.next();
            setDate(calendarApi.getDate());
        }
    };

    const handleShiftMove = async (e) => {
        const { user_shift_id, start_time, end_time, shift_id } = e?.event?.extendedProps;
        const to_user_id = e?.newResource?.id;
        setFromUser(user_shift_id);
        setToUser(to_user_id);
        const overlappingEvent = events?.find(
            (event) => event?.user_id === to_user_id && dateRangeOverlaps(event?.start_time, event?.end_time, start_time, end_time)
        );
        if (overlappingEvent?.shift_id === shift_id) {
            e.revert();
        } else if (overlappingEvent?.user_shift_id) {
            setOverlappingShift(overlappingEvent?.user_shift_id);
            setMergeDialog(true);
        } else {
            setTransferDialog(true);
        }
    };

    // merge shift
    const handleShiftMerge = async (swapType) => {
        const response = await dispatch(
            swapShift({
                from_user_shift_id: fromUser,
                to_user_id: toUser,
                swap_type: 'SWAP',
                swap_conflict: swapType,
                conflict_shift_id: overlappingShift
            })
        );
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
            const newShifts = events?.filter((event) => event?.user_shift_id !== fromUser && event?.user_shift_id !== overlappingShift);
            setEvents([...newShifts, response?.payload?.data]);
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Shifts Merged successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            dispatch(getLiveEmployees());
            setMergeDialog(false);
        }
    };

    // transfer shift
    const handleShiftTransfer = async (swapType) => {
        const response = await dispatch(
            swapShift({ from_user_shift_id: fromUser, to_user_id: toUser, swap_type: swapType, swap_conflict: 'NONE' })
        );
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
            if (swapType == 'SWAP') {
                const newShifts = events?.filter((event) => event?.user_shift_id !== fromUser);
                setEvents([...newShifts, response?.payload?.data]);
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Shift moved successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
            } else {
                setEvents([...events, response?.payload?.data]);
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Shift copied successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
            }
            dispatch(getLiveEmployees());
            setTransferDialog(false);
        }
    };

    // select shift from keypress
    const detectShiftOnKeypress = (key) => {
        if (shiftLegends && shiftLegends?.length > 0) {
            const data = shiftLegends?.find((e) => e.sno == key);
            return data?.shift_name;
        }
        return null;
    };

    // Handler for keypress event
    const handleKeypress = async (e, data, calendarApi, keypressHandler) => {
        if (e?.key == 0) {
            // delete the shift and then create holiday ----------
            await dispatch(
                assignShift({
                    ...data,
                    shift_name: '',
                    delete_shift: true
                })
            );

            dispatch(fetchAllUserShifts({ search: '' }));
            dispatch(
                fetchHoliday({
                    startDate: moment(date).startOf('month').format('YYYY-MM-DD'),
                    endDate: moment(date).endOf('month').format('YYYY-MM-DD')
                })
            );
        } else {
            const shift_name = detectShiftOnKeypress(e?.key);
            if (shift_name) {
                await dispatch(
                    assignShift({
                        ...data,
                        shift_name: shift_name,
                        delete_shift: false
                    })
                );
                dispatch(fetchAllUserShifts({ search: '' }));
                dispatch(
                    fetchHoliday({
                        startDate: moment(date).startOf('month').format('YYYY-MM-DD'),
                        endDate: moment(date).endOf('month').format('YYYY-MM-DD')
                    })
                );
            }
        }
        if (calendarApi) {
            calendarApi.unselect();
        }
        document.removeEventListener('keypress', keypressHandler);
    };

    // select shift from legends
    const handleRangeSelect = async (arg) => {
        if (keypressHandler) {
            document.removeEventListener('keypress', keypressHandler);
        }

        const calendarEl = calendarRef.current;

        // if (calendarEl) {
        //     calendarEl.getApi().unselect();
        // }

        if (selectedClient) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Reset Client to Assign Shifts',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            return;
        }

        const data = {
            start_date: arg.start,
            end_date: arg.end,
            user_id: arg?.resource?._resource?.id
        };

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            keypressHandler = (e) => handleKeypress(e, data, calendarApi, keypressHandler);
            document.addEventListener('keypress', keypressHandler, { once: true });
        }
    };

    const getTimeDifference = (start, end) => {
        var duration = moment.duration(moment(end).diff(moment(start)));
        var hours = duration.hours();
        var minutes = duration.minutes();
        return `${hours}:${minutes}h`;
    };

    const applyClientFilter = (id) => {
        if (id === 'reset') {
            setSelectedClient(null);
            dispatch(fetchAllUserShifts({ search: '', client: '' }));
        } else {
            setSelectedClient(id);
            dispatch(fetchAllUserShifts({ search: '', client: id }));
        }
    };

    return (
        <MainCard title="Employee Shift Calendar">
            {mergeDialog && (
                <TransferShift
                    setDialog={setMergeDialog}
                    openDialog={mergeDialog}
                    handleSubmit={handleShiftMerge}
                    options={[
                        { label: 'Merge Shifts', value: 'MERGE' },
                        { label: 'Replace Existing Shift', value: 'REPLACE' }
                    ]}
                />
            )}
            {transferDialog && (
                <TransferShift
                    setDialog={setTransferDialog}
                    openDialog={transferDialog}
                    handleSubmit={handleShiftTransfer}
                    options={[
                        { label: 'Copy Shift', value: 'CLONE' },
                        { label: 'Transfer Shift', value: 'SWAP' }
                    ]}
                />
            )}
            <PerfectScrollbar>
                <Grid container display={'flex'} gap={1} flexWrap={'nowrap'}>
                    <Grid item minWidth={900} width={'100%'}>
                        <CalendarStyled>
                            <Toolbar
                                viewOptions={viewOptions}
                                date={date}
                                view={view}
                                droppable
                                onClickNext={handleDateNext}
                                onClickPrev={handleDatePrev}
                                onClickToday={handleDateToday}
                                onChangeView={handleViewChange}
                            />

                            {active === 'employee' && role !== roles.EMPLOYEE && (
                                <Stack
                                    direction="row"
                                    alignItems="start"
                                    justifyContent={'space-between'}
                                    gap={10}
                                    sx={{ marginY: '13px' }}
                                >
                                    <Stack direction="row" alignItems="center" rowGap={1} flexWrap={'wrap'} columnGap={2}>
                                        <Typography
                                            fontSize={12}
                                            sx={{
                                                backgroundColor: '#33383D',
                                                borderRadius: '10px',
                                                padding: '4px 8px',
                                                color: 'white'
                                            }}
                                        >
                                            0-OFF
                                        </Typography>
                                        {shiftLegends?.map((legend, index) => (
                                            <Typography
                                                key={index}
                                                fontSize={12}
                                                sx={{
                                                    backgroundColor: legend?.shift_color,
                                                    borderRadius: '10px',
                                                    padding: '4px 8px',
                                                    color: 'white'
                                                }}
                                            >
                                                {legend?.sno + ' - ' + legend?.shift_name}
                                            </Typography>
                                        ))}
                                        <Typography
                                            fontSize={12}
                                            sx={{
                                                backgroundColor: '#EF333F',
                                                borderRadius: '10px',
                                                padding: '4px 8px',
                                                color: 'white'
                                            }}
                                        >
                                            HOLIDAY
                                        </Typography>
                                    </Stack>

                                    <FormControl label="Payroll Status" sx={{ minWidth: '200px' }}>
                                        <InputLabel id="gender-label">Select Client</InputLabel>
                                        <Select
                                            id="client"
                                            value={selectedClient}
                                            onChange={(e) => {
                                                applyClientFilter(e?.target?.value);
                                            }}
                                            label="Select Client"
                                        >
                                            <MenuItem value={'reset'}>Reset</MenuItem>
                                            {clients?.map((e) => (
                                                <MenuItem value={e?.client_id}>{e?.client_name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            )}

                            <Tabs value={active} onChange={(e, newValue) => setActive(newValue)}>
                                <Tab value="employee" label="Employee Shift Calender" />
                                {role !== roles.EMPLOYEE && <Tab value="client" label="Client Shift Calender" />}
                            </Tabs>
                            {active === 'employee' ? (
                                <FullCalendar
                                    weekends
                                    editable
                                    selectable={role !== roles.EMPLOYEE && view === 'resourceTimelineMonth'}
                                    // selectAllow={(info) => {
                                    //     return moment(info.start) > moment().subtract(1, 'day');
                                    // }}
                                    nowIndicator
                                    eventDurationEditable={false}
                                    eventAllow={(dropInfo, draggedEvent) => {
                                        let oldStart = draggedEvent?.extendedProps?.start_time;
                                        let newStart = new Date(dropInfo?.startStr)?.toISOString();
                                        return oldStart === newStart;
                                    }}
                                    events={events?.map((event) => ({
                                        ...event,
                                        title: event?.shift_name,
                                        start: event?.start_time,
                                        end: event?.end_time,
                                        color: shadeColor(event?.shift_color),
                                        textColor: event?.shift_color,
                                        borderColor: event?.shift_color,
                                        resourceId: event?.user_id,
                                        status: event?.user_shift_status,
                                        isHoliday: event?.isHoliday || false
                                    }))}
                                    resources={liveEmployees?.map((event) => ({
                                        ...event,
                                        id: event?.user_id,
                                        title: event?.user_name
                                    }))}
                                    resourceAreaHeaderContent={'Employees'}
                                    resourceLabelContent={(info) => {
                                        const data = info?.resource?.extendedProps;
                                        return (
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Avatar sizes="small" src={data?.profile_photo}>
                                                        {data?.user_name?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                </Grid>
                                                <Grid item xs zeroMinWidth>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography align="left" variant="subtitle1" component="div">
                                                            {data.user_name}
                                                        </Typography>
                                                        {data?.is_late ? (
                                                            <ErrorRounded color="error" sx={{ width: 16, height: 16 }} />
                                                        ) : data?.on_leave ? (
                                                            <ErrorRounded color="warning" sx={{ width: 16, height: 16 }} />
                                                        ) : (
                                                            <CheckCircle color="#fff" sx={{ width: 14, height: 14 }} />
                                                        )}
                                                    </Box>
                                                    <Typography align="left" variant="subtitle2">
                                                        {(data?.current_shift?.start_time || data?.upcoming_shift?.start_time) && (
                                                            <>
                                                                {data?.current_shift?.start_time
                                                                    ? `${getTimeDifference(
                                                                          data?.current_shift?.user_checkin || new Date(),
                                                                          data?.current_shift?.user_checkout || new Date()
                                                                      )} / ${getTimeDifference(
                                                                          data?.current_shift?.start_time,
                                                                          data?.current_shift?.end_time
                                                                      )}`
                                                                    : data?.upcoming_shift?.start_time
                                                                    ? `00:00h / ${getTimeDifference(
                                                                          data?.upcoming_shift?.start_time,
                                                                          data?.upcoming_shift?.end_time
                                                                      )}`
                                                                    : ''}
                                                            </>
                                                        )}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        );
                                    }}
                                    eventContent={(eventInfo) => {
                                        return (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    overflow: 'hidden',
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Typography fontSize={12}>{eventInfo.event.title}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {eventInfo.event?.extendedProps?.user_shift_status === 'Leave_Conflict' ? (
                                                        <ErrorRounded color="warning" sx={{ width: 16, height: 16 }} />
                                                    ) : eventInfo.event._def.extendedProps?.user_shift_status === 'Late_Conflict' ? (
                                                        <ErrorRounded color="error" sx={{ width: 16, height: 16 }} />
                                                    ) : (
                                                        <CheckCircle color="#fff" sx={{ width: 14, height: 14 }} />
                                                    )}
                                                </Box>
                                            </div>
                                        );
                                    }}
                                    resourceAreaWidth={200}
                                    ref={calendarRef}
                                    rerenderDelay={10}
                                    initialDate={date}
                                    initialView={view}
                                    dayMaxEventRows={3}
                                    eventDisplay="block"
                                    headerToolbar={false}
                                    allDayMaintainDuration
                                    eventResizableFromStart
                                    select={handleRangeSelect}
                                    eventDrop={handleShiftMove}
                                    height={'auto'}
                                    plugins={[
                                        listPlugin,
                                        dayGridPlugin,
                                        timelinePlugin,
                                        timeGridPlugin,
                                        interactionPlugin,
                                        resourceTimelinePlugin
                                    ]}
                                />
                            ) : (
                                <FullCalendar
                                    weekends
                                    nowIndicator
                                    // editable
                                    // eventDurationEditable={false}
                                    eventAllow={(dropInfo, draggedEvent) => {
                                        let oldStart = draggedEvent?.extendedProps?.start_time;
                                        let newStart = new Date(dropInfo?.startStr)?.toISOString();
                                        return oldStart === newStart;
                                    }}
                                    events={allClientShifts?.map((event) => ({
                                        ...event,
                                        title: event?.shift_name,
                                        start: event?.start_time,
                                        end: event?.end_time,
                                        color: shadeColor(event?.shift_color),
                                        textColor: event?.shift_color,
                                        borderColor: event?.shift_color,
                                        resourceId: event?.client_id
                                    }))}
                                    resources={clients?.map((event) => ({
                                        ...event,
                                        id: event?.client_id,
                                        title: event?.client_name
                                    }))}
                                    resourceAreaHeaderContent={'Employees'}
                                    resourceLabelContent={(info) => {
                                        const data = info?.resource?.extendedProps;
                                        return (
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs zeroMinWidth>
                                                    <Typography align="left" variant="subtitle1" component="div">
                                                        {data.client_name}{' '}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        );
                                    }}
                                    eventContent={(eventInfo) => {
                                        return (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    overflow: 'hidden',
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Typography fontSize={12}>{eventInfo.event.title}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {eventInfo.event?.extendedProps?.user_shift_status === 'Leave_Conflict' ? (
                                                        <ErrorRounded color="warning" sx={{ width: 16, height: 16 }} />
                                                    ) : eventInfo.event._def.extendedProps?.user_shift_status === 'Late_Conflict' ? (
                                                        <ErrorRounded color="error" sx={{ width: 16, height: 16 }} />
                                                    ) : (
                                                        <CheckCircle color="#fff" sx={{ width: 14, height: 14 }} />
                                                    )}
                                                </Box>
                                            </div>
                                        );
                                    }}
                                    resourceAreaWidth={250}
                                    ref={calendarRef}
                                    rerenderDelay={10}
                                    initialDate={date}
                                    initialView={view}
                                    dayMaxEventRows={3}
                                    eventDisplay="block"
                                    headerToolbar={false}
                                    allDayMaintainDuration
                                    eventResizableFromStart
                                    select={handleRangeSelect}
                                    eventDrop={handleShiftMove}
                                    // eventClick={handleEventSelect}
                                    height={'auto'}
                                    plugins={[
                                        listPlugin,
                                        dayGridPlugin,
                                        timelinePlugin,
                                        timeGridPlugin,
                                        interactionPlugin,
                                        resourceTimelinePlugin
                                    ]}
                                />
                            )}
                        </CalendarStyled>
                    </Grid>
                </Grid>
            </PerfectScrollbar>
        </MainCard>
    );
};

EmployeeShiftCalender.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default EmployeeShiftCalender;
