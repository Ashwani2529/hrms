import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    Avatar,
    Stack,
    useTheme,
    CircularProgress
} from '@mui/material';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getMusterAttendance } from 'utils/getMusterAttendance';
import MusterAttendanceCell from './MusterAttendanceCell';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { AttendanceActions } from 'store/slices/attendance';
import { AnalyticsActions } from 'store/slices/analytics';
import { HolidayActions } from 'store/slices/holiday';
import { LeaveActions } from 'store/slices/leave';
import { attendanceGraphColors, MusterStatuses } from 'store/constant';
import MusterAttendanceRow from './MusterAttendanceRow';
import SkeletonMuster from 'ui-component/skeleton/SkeletonMuster';
import { openSnackbar } from 'store/slices/snackbar';
import { ShiftActions } from 'store/slices/shift';

const MusterTable = ({ handleOpenCreateDialog, currMonth, handleDeleteAttendance }) => {
    const theme = useTheme();

    const [musterData, setMusterData] = useState({});
    const [parsing, setParsing] = useState(false);
    const today = moment();

    const { getLiveEmployees } = AnalyticsActions;
    const { fetchAttendances, createAttendance } = AttendanceActions;
    const { fetchHoliday } = HolidayActions;
    const { fetchLeaves } = LeaveActions;
    const { fetchShifts } = ShiftActions;

    const { liveEmployees, loading: employeesLoading } = useSelector((state) => state.analytics);
    const { leaves, loading: leavesLoading } = useSelector((state) => state.leave);
    const { holidays, loading: holidaysLoading } = useSelector((state) => state?.holiday);
    const { attendances, loading: attendanceLoading } = useSelector((state) => state.attendance);
    const { shifts, loading: shiftLoading } = useSelector((state) => state.shift);

    const fetchAttendancesWrapper = () => {
        dispatch(
            fetchAttendances({
                startDate: currMonth.startOf('month').toISOString(),
                endDate: currMonth.endOf('month').toISOString()
            })
        );
    };

    const handleCreateAttendance = async (data) => {
        try {
            const response = await dispatch(createAttendance(data));
            if (response?.payload?.status === 201 || response?.payload?.status === 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Attendance added successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );

                // fetchAttendancesWrapper();
            } else {
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
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAttendancesWrapper();
        dispatch(getLiveEmployees());
        dispatch(
            fetchLeaves({
                page: 1,
                limit: 50,
                search: '',
                startDate: currMonth.startOf('month').format('YYYY-MM-DD'),
                endDate: currMonth.endOf('month').format('YYYY-MM-DD')
            })
        );
        dispatch(
            fetchHoliday({
                startDate: currMonth.startOf('month').format('YYYY-MM-DD'),
                endDate: currMonth.endOf('month').format('YYYY-MM-DD')
            })
        );
        dispatch(
            fetchShifts({
                startDate: currMonth.startOf('month').format('YYYY-MM-DD'),
                endDate: currMonth.endOf('month').format('YYYY-MM-DD')
            })
        );
    }, [currMonth.format('YYYY-MM-DD')]);

    const currMonthDates = useMemo(() => {
        const startDate = currMonth.startOf('month');
        return [...Array(currMonth.daysInMonth())].map((ele, index) => startDate.clone().add(index, 'day').format('YYYY-MM-DD'));
    }, [currMonth]);

    const calculateMusterAttendance = async () => {
        setParsing(true);
        try {
            const parsedData = await getMusterAttendance({ currMonthDates, attendances, liveEmployees, holidays, leaves, shifts });
            setMusterData(parsedData);
        } catch (error) {
            console.log(error);
            setMusterData({});
        }
        setParsing(false);
    };

    console.log(musterData);

    useEffect(() => {
        calculateMusterAttendance();
    }, [currMonthDates, liveEmployees, holidays, leaves, shifts]);

    return (
        <Box>
            {employeesLoading || leavesLoading || holidaysLoading || shiftLoading || parsing ? (
                <SkeletonMuster />
            ) : (
                <TableContainer>
                    <Table sx={{ borderCollapse: 'collapse' }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                                    <Typography sx={{ width: 200 }}>Employee</Typography>
                                </TableCell>
                                {currMonthDates?.map((date) => (
                                    <TableCell
                                        sx={{
                                            border: `1px solid ${theme.palette.grey[200]}`,
                                            background: today.isSame(moment(date), 'date') ? theme.palette.primary.main : '',
                                            width: '20px',
                                            px: 0
                                        }}
                                        key={date}
                                    >
                                        <Typography
                                            sx={{
                                                color: today.isSame(moment(date), 'date') ? '#fff' : theme.palette.primary.main,
                                                width: '20px',
                                                textAlign: 'center',
                                                mx: 'auto'
                                            }}
                                        >
                                            {moment(date).format('DD dd')}
                                        </Typography>
                                    </TableCell>
                                ))}
                                {Object.entries(attendanceGraphColors).map(([name, color], index) => (
                                    <TableCell sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                                        <Stack direction="row" gap={1} alignItems="center" key={name + color}>
                                            <Box width={10} height={10} sx={{ background: color }} />
                                            <Typography variant="subtitle2">({MusterStatuses[name]})</Typography>
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                            {Object.entries(musterData).map((ele) => (
                                <MusterAttendanceRow
                                    key={JSON.stringify(ele)}
                                    ele={ele}
                                    currMonthDates={currMonthDates}
                                    fetchAttendancesWrapper={fetchAttendancesWrapper}
                                    handleOpenCreateDialog={handleOpenCreateDialog}
                                    liveEmployees={liveEmployees}
                                    theme={theme}
                                    handleDeleteAttendance={handleDeleteAttendance}
                                    handleCreateAttendance={handleCreateAttendance}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

MusterTable.propTypes = {
    handleOpenCreateDialog: PropTypes.func,
    currMonth: PropTypes.object,
    handleDeleteAttendance: PropTypes.func
};

export default MusterTable;
