/* eslint-disable */
import { useEffect, useRef, useState } from 'react';

// material-ui
import { Button, Dialog, Typography, useMediaQuery, Box, Grid } from '@mui/material';

// third-party
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import PerfectScrollbar from 'react-perfect-scrollbar';
import interactionPlugin from '@fullcalendar/interaction';

// redux
import { useDispatch, useSelector } from 'store';
import { ShiftActions } from 'store/slices/shift';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import CalendarStyled from '../CalendarStyled';
import Toolbar from '../Toolbar';
import AddEventForm from './dialogs/AddEventForm';
import ClientMenu from './ClientMenu';

// assets
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';
import { AttendanceActions } from 'store/slices/attendance';
import { openSnackbar } from 'store/slices/snackbar';
import { CheckCircle, ErrorRounded } from '@mui/icons-material';
import AttendanceSummary from './AttendanceSummary';
import { ClientActions } from 'store/slices/client';
import ShiftSearch from './ShiftSearch';
import { EmployeeActions } from 'store/slices/employee';
import { IconLayoutGrid, IconTemplate, IconLayoutList, IconListNumbers } from '@tabler/icons';
import RoleBasedGuard from 'utils/route-guard/RoleBasedGuard';
import { findKeyInObject } from 'utils/findKeyInObjects';
import ShiftLegends from './ShiftLegends';

// ==============================|| APPLICATION CALENDAR ||============================== //

const viewOptions = [
    {
        label: 'Week',
        value: 'timeGridWeek',
        icon: IconTemplate
    },
    {
        label: 'Month',
        value: 'dayGridMonth',
        icon: IconLayoutGrid
    },
    // {
    //     label: 'Day',
    //     value: 'timeGridDay',
    //     icon: IconLayoutList
    // },
    // {
    //     label: 'Agenda',
    //     value: 'listWeek',
    //     icon: IconListNumbers
    // },
    {
        label: 'Shift Legends',
        value: 'legends',
        icon: IconListNumbers
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

const ShiftAddEdit = () => {
    const dispatch = useDispatch();
    const calendarRef = useRef(null);
    const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));

    // fetch events data
    const { fetchShifts, createShift, updateShift, deleteShift, resolveConflict, fetchShiftLegends } = ShiftActions;
    const { markAutoAttendance } = AttendanceActions;
    const [events, setEvents] = useState([]);
    const { shifts, shiftLegends } = useSelector((state) => state.shift);

    const { fetchClients } = ClientActions;
    const { clients } = useSelector((state) => state.client);

    useEffect(() => {
        dispatch(fetchShifts({ search: '', users: '', clients: '' }));
        dispatch(fetchClients({ page: '', limit: '', search: '' }));
        dispatch(fetchShiftLegends());
    }, []);

    useEffect(() => {
        setEvents(shifts);
    }, [shifts]);

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('legends');
    const [showLegends, setShowLegends] = useState(false);

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

        // if (calendarEl) {
        //     const calendarApi = calendarEl.getApi();

        //     calendarApi.changeView(newView);
        setView(newView);
        // }
    };

    // set calendar view
    useEffect(() => {
        handleViewChange('legends');
    }, [matchSm]);

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // calendar event select/add/edit/delete
    const handleRangeSelect = (arg) => {
        const calendarEl = calendarRef.current;
        if (arg.start < new Date()) return;
        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.unselect();
        }

        setSelectedRange({
            start: arg.start,
            end: arg.end
        });
        setIsModalOpen(true);
    };

    const handleEventSelect = (arg) => {
        if (arg.event?._def?.extendedProps) {
            const eventId = arg.event?._def?.extendedProps?.shift_id;
            const selectEvent = events.find((_event) => _event.shift_id === eventId);
            setSelectedEvent(selectEvent);
        } else {
            setSelectedEvent(null);
        }
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setSelectedRange(null);
    };

    const handleEventCreate = async (data) => {
        const res = await dispatch(createShift(data));
        if (res?.payload?.status != 201) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: findKeyInObject(res?.payload, `message`) || findKeyInObject(res?.payload, `error`) || 'Internal server error',
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
                    message: 'Shift created successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            // setEvents((prev) => {
            //     let arr = [...prev]
            //     arr.push(data)
            //     return arr;
            // })
            dispatch(fetchShifts({ search: '', users: '', clients: '' }));
            handleModalClose();
        }
    };

    const handleResolveConflict = async (data) => {
        const res = await dispatch(resolveConflict(data));
        if (res?.payload?.status != 201) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: findKeyInObject(res?.payload, `message`) || findKeyInObject(res?.payload, `error`) || 'Internal server error',
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
                    message: 'Shift resolved successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            dispatch(fetchShifts({ search: '', users: '', clients: '' }));
            handleModalClose();
        }
    };

    const handleShiftMove = async ({ event }) => {
        try {
            console.log(event);
            // dispatch(
            //     updateShift({
            //         eventId: event.shift_id,
            //         update: {
            //             allDay: event.allDay,
            //             start: event.start_time,
            //             end: event.end_time
            //         }
            //     })
            // );
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateEvent = async (eventId, update) => {
        const res = await dispatch(updateShift({ eventId, update }));
        if (res?.payload?.status != 200) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: findKeyInObject(res?.payload, `message`) || findKeyInObject(res?.payload, `error`) || 'Internal server error',
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
                    message: 'Shift updated successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            // const newdata = events?.map((obj) => (obj.shift_id === eventId ? update : obj))
            // setEvents(newdata);
            dispatch(fetchShifts({ search: '', users: '', clients: '' }));
            handleModalClose();
        }
    };

    const handleEventDelete = async (id, delete_type) => {
        try {
            const arrOfId = {
                shifts: [id],
                delete_type
            };
            const res = await dispatch(deleteShift(arrOfId));
            if (res?.payload?.status == 201) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Shift(s) deleted successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                handleModalClose();
            } else {
                dispatch(
                    openSnackbar({
                        open: true,
                        message:
                            findKeyInObject(res?.payload, `message`) || findKeyInObject(res?.payload, `error`) || 'Internal server error',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAutoAttendance = async (shift_id) => {
        const response = await dispatch(markAutoAttendance(shift_id));
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
                    message: 'Attendance marked successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
        }
    };

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    // Shift searchings
    const [selectedEmp, setSelectedEmp] = useState('');
    const [selectedClients, setSelectedClients] = useState('');
    const [selectedShift, setSelectedShift] = useState('');

    useEffect(() => {
        dispatch(fetchShifts({ search: selectedShift, users: selectedEmp, clients: selectedClients }));
    }, [selectedEmp, selectedClients, selectedShift]);

    const handleShiftFilter = (event, newValue, string) => {
        if (string === 'employee') {
            let arr = newValue.map((emp) => emp.user_id);
            arr = arr.join(',');
            setSelectedEmp(arr);
        }
        if (string === 'client') {
            let arr = newValue.map((client) => client.client_id);
            arr = arr.join(',');
            setSelectedClients(arr);
        }
        if (string === 'shift') {
            let arr = newValue.map((shift) => shift.shift_id);
            arr = arr.join(',');
            setSelectedShift(arr);
        }
    };

    return (
        <RoleBasedGuard restrictedRoles={['EMP']}>
            <MainCard
                title={view === 'legends' ? 'Shift Legends' : 'Shift Calendar'}
                secondary={
                    <Button color="secondary" variant="contained" onClick={handleAddClick}>
                        <AddAlarmTwoToneIcon fontSize="small" sx={{ mr: 0.75 }} />
                        Add New Shift
                    </Button>
                }
            >
                <AttendanceSummary />
                {/* <ShiftSearch employees={employee} clients={clients} shifts={allShifts} handleChange={handleShiftFilter} /> */}
                <CalendarStyled>
                    <Toolbar
                        date={date}
                        viewOptions={viewOptions}
                        view={view}
                        onClickNext={handleDateNext}
                        onClickPrev={handleDatePrev}
                        onClickToday={handleDateToday}
                        onChangeView={handleViewChange}
                    />
                    {/* <Grid container display="flex" fullWidth direction={'row'} flexWrap={'nowrap'} gap={2}> */}
                    {/* <Grid item width={'20%'} minWidth={250}>
                        <ClientMenu clients={clients} client={client} setClient={setClient} />
                    </Grid> */}
                    {/* <PerfectScrollbar>
                    <Grid item width={'80%'} minWidth={1200}> */}
                    <SubCard>
                        {view !== 'legends' ? (
                            <FullCalendar
                                weekends
                                // droppable
                                editable
                                eventDurationEditable={false}
                                selectable={false}
                                eventAllow={() => {
                                    return false;
                                }}
                                events={events?.map((event) => ({
                                    ...event,
                                    title: event?.shift_name,
                                    start: event?.start_time,
                                    end: event?.end_time,
                                    color: shadeColor(event?.shift_color),
                                    textColor: event?.shift_color,
                                    status: event?.status
                                }))}
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
                                // eventDrop={handleShiftMove}
                                eventClick={handleEventSelect}
                                eventResize={handleShiftMove}
                                height={matchSm ? 'auto' : 720}
                                plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
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
                                            <Typography fontSize={14}>{eventInfo.event.title}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {eventInfo.event._def.extendedProps?.status === 'Conflicted' ? (
                                                    <ErrorRounded color="warning" sx={{ width: 16, height: 16 }} />
                                                ) : eventInfo.event._def.extendedProps?.status === 'Unexpected' ? (
                                                    <ErrorRounded color="error" sx={{ width: 16, height: 16 }} />
                                                ) : (
                                                    <CheckCircle color="#fff" sx={{ width: 14, height: 14 }} />
                                                )}
                                            </Box>
                                        </div>
                                    );
                                }}
                            />
                        ) : (
                            <ShiftLegends data={shiftLegends} clients={clients} />
                        )}
                    </SubCard>
                    {/* </Grid>
                </PerfectScrollbar> */}
                    {/* </Grid> */}
                </CalendarStyled>

                {/* Dialog renders its body even if not open */}
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
                    {isModalOpen && (
                        <AddEventForm
                            clients={clients}
                            event={selectedEvent}
                            range={selectedRange}
                            onCancel={handleModalClose}
                            handleDelete={handleEventDelete}
                            handleCreate={handleEventCreate}
                            handleUpdate={handleUpdateEvent}
                            handleMarkAutoAttendance={handleMarkAutoAttendance}
                            handleResolveConflict={handleResolveConflict}
                        />
                    )}
                </Dialog>
            </MainCard>
        </RoleBasedGuard>
    );
};

export default ShiftAddEdit;
