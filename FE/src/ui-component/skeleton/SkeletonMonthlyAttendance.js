import React from 'react';
import { Skeleton, Stack } from '@mui/material';
import { weekDays } from 'store/constant';

function SkeletonMonthlyAttendance() {
    return (
        <Stack direction="column" gap={1}>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" width={75} height={60} />
                {weekDays.map((day, index) => (
                    <Skeleton variant="rectangular" key={day + index} width={75} height={60} />
                ))}
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" width={75} height={60} />
                {weekDays.map((day, index) => (
                    <Skeleton variant="rectangular" key={day + index} width={75} height={60} />
                ))}
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" width={75} height={60} />
                {weekDays.map((day, index) => (
                    <Skeleton variant="rectangular" key={day + index} width={75} height={60} />
                ))}
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" width={75} height={60} />
                {weekDays.map((day, index) => (
                    <Skeleton variant="rectangular" key={day + index} width={75} height={60} />
                ))}
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" width={75} height={60} />
                {weekDays.map((day, index) => (
                    <Skeleton variant="rectangular" key={day + index} width={75} height={60} />
                ))}
            </Stack>
        </Stack>
    );
}

export default SkeletonMonthlyAttendance;
