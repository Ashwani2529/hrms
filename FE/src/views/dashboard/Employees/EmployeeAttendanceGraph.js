import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Tooltip, Box, Typography, Tab, Tabs, Grid, TextField, Container } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import ActivityCalendar from 'react-activity-calendar';
import { generateEmployeeYearlyAttendanceData } from 'utils/generateEmployeeYearlyAttendance';
import { useSelector, dispatch } from 'store';
import { EmployeeActions } from '../../../store/slices/employee';
import moment from 'moment';
import { attendanceGraphColors } from 'store/constant';
import EmployeeMonthlyAttendance from './EmployeeMonthlyAttendance';
import SkeletonMonthlyAttendance from 'ui-component/skeleton/SkeletonMonthlyAttendance';

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function CustomTabPanel({ active, value, children }) {
    return value === active ? <>{children}</> : <></>;
}

function EmployeeAttendanceGraph({ selectedEmployee }) {
    const { getSelectedEmployeeAttendence } = EmployeeActions;
    const { selectedEmployeeAttendance, loading } = useSelector((state) => state.employee);
    const [tab, setTab] = useState(0);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });

    const employeeAttendanceGraphData = useMemo(
        () => generateEmployeeYearlyAttendanceData(selectedEmployeeAttendance, filters),
        [selectedEmployeeAttendance, tab]
    );

    const handleChange = (event, newValue) => {
        setTab(newValue);
        setFilters({
            startDate: newValue === 1 ? moment().startOf('month').format('YYYY-MM-DD') : '',
            endDate: newValue === 1 ? moment().endOf('month').format('YYYY-MM-DD') : ''
        });
    };

    const handleSelectMonth = (e) => {
        setFilters({
            startDate: moment(e.target.value).startOf('month').format('YYYY-MM-DD'),
            endDate: moment(e.target.value).endOf('month').format('YYYY-MM-DD')
        });
    };

    useEffect(() => {
        dispatch(getSelectedEmployeeAttendence({ employeeId: selectedEmployee.user_id, filters }));
    }, [selectedEmployee, filters]);

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Tabs value={tab} onChange={handleChange}>
                    <Tab label="Yearly" {...a11yProps(0)} />
                    <Tab label="Monthly" {...a11yProps(1)} />
                </Tabs>
                {tab === 1 && (
                    <TextField
                        size="small"
                        type="month"
                        defaultValue={moment().format('YYYY-MM')}
                        label="Select Month"
                        onChange={handleSelectMonth}
                    />
                )}
            </Stack>
            <Stack justifyContent="center" alignItems="center" mt={2}>
                <CustomTabPanel active={tab} value={0}>
                    <ActivityCalendar
                        data={employeeAttendanceGraphData}
                        maxLevel={10}
                        hideTotalCount
                        hideColorLegend
                        loading={loading}
                        theme={{ dark: Object.values(attendanceGraphColors) }}
                        blockSize={tab * 8 + 12}
                        renderBlock={(block, data) => (
                            <Tooltip title={`${Object.keys(attendanceGraphColors)[data.level]} on ${data.date}`}>{block}</Tooltip>
                        )}
                    />
                </CustomTabPanel>
                <CustomTabPanel active={tab} value={1}>
                    {loading ? (
                        <SkeletonMonthlyAttendance />
                    ) : (
                        <EmployeeMonthlyAttendance employeeAttendanceGraphData={employeeAttendanceGraphData} />
                    )}
                </CustomTabPanel>
            </Stack>

            <Stack direction="row" alignItems="center" rowGap={1} columnGap={3} mt={2} flexWrap="wrap">
                {Object.entries(attendanceGraphColors).map(([name, color]) => (
                    <Stack direction="row" gap={1} alignItems="center" key={name + color}>
                        <Box width={10} height={10} sx={{ background: color }} />
                        <Typography variant="subtitle2">{name}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}

EmployeeAttendanceGraph.propTypes = {
    selectedEmployee: PropTypes.object
};

export default EmployeeAttendanceGraph;
