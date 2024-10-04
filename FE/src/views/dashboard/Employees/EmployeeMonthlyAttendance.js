import React, { useMemo } from 'react';
import { Table, TableBody, TableContainer, TableRow, TableCell, Box, Typography, useTheme, Tooltip } from '@mui/material';
import { getMonthlyAtt } from 'utils/getEmpMonthlyAttendance';
import { weekDays, attendanceGraphColors, attendaceGraphWeight, attendanceStatuses } from 'store/constant';
import { shadeColor } from 'utils/colorShade';
import moment from 'moment';

function EmployeeMonthlyAttendance({ employeeAttendanceGraphData }) {
    const theme = useTheme();
    const today = moment().format('YYYY-MM-DD');

    const monthlyAttData = useMemo(() => getMonthlyAtt({ employeeAttendanceGraphData }), [employeeAttendanceGraphData]);

    return (
        <Box>
            <TableContainer>
                <Table sx={{ borderCollapse: 'collapse' }}>
                    <TableRow>
                        <TableCell sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                            <Typography>-</Typography>
                        </TableCell>
                        {weekDays?.map((day, index) => (
                            <TableCell key={day + index} sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                                <Typography>{day.toUpperCase()}</Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                    {Object.entries(monthlyAttData).map((week, index) => (
                        <TableRow key={week[0] + index}>
                            <TableCell sx={{ border: `1px solid ${theme.palette.grey[200]}` }}>
                                <Typography>{week[0]}</Typography>
                            </TableCell>
                            {weekDays.map((day, index) =>
                                monthlyAttData[week[0]][day] ? (
                                    <Tooltip title={monthlyAttData[week[0]][day]?.status}>
                                        <TableCell
                                            key={day + index}
                                            sx={{
                                                border: `1px solid ${theme.palette.grey[200]}`,
                                                background: shadeColor(attendanceGraphColors[monthlyAttData[week[0]][day]?.status])
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: attendanceGraphColors[monthlyAttData[week[0]][day]?.status],
                                                    textDecoration:
                                                        monthlyAttData[week[0]][day]?.date === today ? 'underline 2px solid red' : 'none'
                                                }}
                                            >
                                                {monthlyAttData[week[0]][day]?.date
                                                    ? moment(monthlyAttData[week[0]][day]?.date).format('DD')
                                                    : '-'}
                                            </Typography>
                                        </TableCell>
                                    </Tooltip>
                                ) : (
                                    <TableCell
                                        key={day + index}
                                        sx={{
                                            border: `1px solid ${theme.palette.grey[200]}`
                                        }}
                                    >
                                        {/* This will remain empty as this does not fall in the current month */}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    ))}
                </Table>
            </TableContainer>
        </Box>
    );
}

export default EmployeeMonthlyAttendance;
