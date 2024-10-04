import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Box, Typography, CircularProgress } from '@mui/material';
import axiosServices from 'utils/axios';

function EmployeeLeaveDetailStatus({ employeeId }) {
    const [loading, setLoading] = useState(true);
    const [leaveStats, setLeaveStats] = useState({});

    const fetchLeavesStats = async () => {
        setLoading(true);
        try {
            const res = await axiosServices.get(`/leave/leavesStats/${employeeId}`);
            setLeaveStats(res.data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeavesStats();
    }, [employeeId]);

    return (
        <Box p={1}>
            {loading ? (
                <CircularProgress sx={{ color: '#fff' }} />
            ) : (
                <Stack alignItems="flex-start" gap={1}>
                    <Typography>Sick Leaves Left: {leaveStats?.sick_leaves}</Typography>
                    <Typography>Casual Leaves Left: {leaveStats?.casual_leaves}</Typography>
                    <Typography>Earned Leaves Left: {leaveStats?.earned_leaves}</Typography>
                    <Typography>Compensatory Leaves Left: {leaveStats?.compunsatory_leaves}</Typography>
                </Stack>
            )}
        </Box>
    );
}

EmployeeLeaveDetailStatus.propTypes = {
    employeeId: PropTypes.string
};

export default EmployeeLeaveDetailStatus;
