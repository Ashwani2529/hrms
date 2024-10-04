import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, Typography } from '@mui/material';
import EmployeeDetailCell from './EmployeeDetailCell';
import MusterAttendanceCell from './MusterAttendanceCell';
import { attendanceStatuses } from 'store/constant';
import moment from 'moment';

function MusterAttendanceRow({
    ele,
    theme,
    liveEmployees,
    currMonthDates,
    handleOpenCreateDialog,
    fetchAttendancesWrapper,
    handleDeleteAttendance,
    handleCreateAttendance
}) {
    const userStats = useMemo(() => {
        const data = {};
        const userAttArr = Object.values(ele[1]).map((att) => att?.status);
        if (Array.isArray(userAttArr)) {
            userAttArr.forEach((att) => {
                if (data[att]) {
                    data[att] += 1;
                } else {
                    data[att] = 1;
                }
            });
        }
        return data;
    }, [ele[1]]);

    return (
        <TableRow key={ele[0]}>
            <TableCell sx={{ border: `1px solid ${theme.palette.grey[200]}`, px: 2 }}>
                <EmployeeDetailCell empdata={liveEmployees?.find((emp) => emp?.user_id === ele[0])} />
            </TableCell>
            {Array.isArray(Object.values(ele[1])) &&
                Object.entries(ele[1])?.map((_, index) => (
                    <MusterAttendanceCell
                        key={index}
                        dateKey={currMonthDates[index]}
                        empAttendanceObj={ele[1]}
                        theme={theme}
                        handleOpenCreateDialog={handleOpenCreateDialog}
                        userId={ele[0]}
                        fetchAttendancesWrapper={fetchAttendancesWrapper}
                        handleDeleteAttendance={handleDeleteAttendance}
                        handleCreateAttendance={handleCreateAttendance}
                    />
                ))}
            {Object.keys(attendanceStatuses).map((ele, index) => (
                <TableCell key={ele + index} sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography>{userStats[attendanceStatuses[ele]] || 0}</Typography>
                </TableCell>
            ))}
        </TableRow>
    );
}

MusterAttendanceRow.propTypes = {
    ele: PropTypes.array,
    currMonthDates: PropTypes.array,
    fetchAttendancesWrapper: PropTypes.func,
    handleOpenCreateDialog: PropTypes.func,
    liveEmployees: PropTypes.array,
    theme: PropTypes.object,
    handleDeleteAttendance: PropTypes.func,
    handleCreateAttendance: PropTypes.func
};

export default MusterAttendanceRow;
