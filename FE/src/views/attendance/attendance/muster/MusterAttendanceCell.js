import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TableCell, Tooltip, Typography } from '@mui/material';
import { attendanceGraphColors, attendanceStatuses, MusterStatuses, roles } from 'store/constant';
import { shadeColor } from 'utils/colorShade';
import moment from 'moment';
import { useDispatch } from 'store';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import { openConfirmationModal } from 'store/slices/confirmationModal';

const getBGColor = (status) => (attendanceGraphColors[status] ? shadeColor(attendanceGraphColors[status]) : '');

function MusterAttendanceCell({
    theme,
    userId,
    dateKey,
    fetchAttendancesWrapper,
    empAttendanceObj,
    handleDeleteAttendance,
    handleCreateAttendance,
    ...props
}) {
    const { role } = useAuth();
    const data = empAttendanceObj[dateKey];
    const dispatch = useDispatch();

    const initStatus = MusterStatuses[data?.status];
    const [att, setAtt] = useState(MusterStatuses[data?.status]);
    const handleAttChange = (e) => {
        if (role === roles.EMPLOYEE) return;
        setAtt(e.target.value.toUpperCase());
    };

    const handleAttSubmit = async () => {
        if (initStatus === att) return;

        // if (!Object.values(MusterStatuses).includes(att))
        if (!['A', 'P'].includes(att))
            // eslint-disable-next-line consistent-return
            return dispatch(
                openSnackbar({
                    open: true,
                    message: 'Please provide a valid value',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );

        const attendaceValueIndex = Object.values(MusterStatuses).indexOf(att);
        if (attendaceValueIndex === -1) return;

        if (initStatus === MusterStatuses[attendanceStatuses.NO_DATA] && initStatus !== att) {
            if (!data?.shift?.shift_id) {
                dispatch(
                    openConfirmationModal({
                        open: true,
                        message: 'There exists no shift for the employee on the day you are trying to mark an attendance. Are you sure?',
                        handleConfirm: () => {
                            handleCreateAttendance({
                                user_id: userId,
                                shift_id: null,
                                check_in_id: null,
                                status: Object.keys(MusterStatuses)[attendaceValueIndex],
                                attendance_date: moment(dateKey).toISOString()
                            });
                        }
                    })
                );
            } else {
                handleCreateAttendance({
                    user_id: userId,
                    shift_id: data?.shift?.shift_id,
                    check_in_id: null,
                    status: Object.keys(MusterStatuses)[attendaceValueIndex],
                    attendance_date: moment(dateKey).toISOString()
                });
            }
        } else if (!att || att === MusterStatuses[attendanceStatuses.NO_DATA]) {
            // Delete Logic
            handleDeleteAttendance(data?.attendance_id);
        } else if (initStatus !== MusterStatuses[attendanceStatuses.NO_DATA] && initStatus !== att) {
            // Update Logic
            const values = {
                ...data,
                id: data?.attendance_id,
                status: Object.keys(MusterStatuses)[attendaceValueIndex]
            };

            delete values?.attendance_id;
            delete values?.checkin;
            delete values?.id;
            delete values?.createdAt;
            delete values?.ot_hours;
            delete values?.shift;
            delete values?.updatedAt;
            delete values?.user;

            try {
                const response = await axiosServices.put(`/attendance/${data?.attendance_id}`, values);
                if (response.status === 201) {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: 'Attendance updated successfully',
                            variant: 'alert',
                            alert: {
                                color: 'success'
                            },
                            close: true
                        })
                    );
                    fetchAttendancesWrapper();
                } else {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: 'Failed to update attendance',
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
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Failed to update attendance',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        }
    };

    useEffect(() => {
        setAtt(MusterStatuses[data?.status]);
    }, [data?.status]);

    return (
        <Tooltip title={data?.status}>
            <TableCell
                // onClick={handleNoDataCellClick}
                sx={{ border: `1px solid ${theme.palette.grey[200]}`, background: getBGColor(data?.status), textAlign: 'center' }}
            >
                {moment().isSameOrBefore(moment(dateKey)) ? (
                    <Typography
                        sx={{
                            width: '20px',
                            color:
                                att === MusterStatuses[attendanceStatuses.NO_DATA]
                                    ? theme.palette.primary.main
                                    : attendanceGraphColors[data?.status]
                        }}
                    >
                        {att || '-'}
                    </Typography>
                ) : (
                    <input
                        value={att}
                        onChange={handleAttChange}
                        onBlur={handleAttSubmit}
                        style={{
                            textAlign: 'center',
                            width: '20px',
                            outline: 'none',
                            border: 'none',
                            background: 'transparent',
                            color:
                                att === MusterStatuses[attendanceStatuses.NO_DATA]
                                    ? theme.palette.primary.main
                                    : attendanceGraphColors[data?.status]
                        }}
                        {...props}
                    />
                )}
            </TableCell>
        </Tooltip>
    );
}

MusterAttendanceCell.propTypes = {
    dateKey: PropTypes.string,
    empAttendanceObj: PropTypes.object,
    theme: PropTypes.object,
    fetchAttendancesWrapper: PropTypes.func,
    handleOpenCreateDialog: PropTypes.func,
    handleCreateAttendance: PropTypes.func,
    handleDeleteAttendance: PropTypes.func,
    userId: PropTypes.string
};

export default MusterAttendanceCell;
