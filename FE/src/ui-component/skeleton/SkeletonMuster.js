import React from 'react';
import { Skeleton, Box, Stack } from '@mui/material';

function SkeletonMuster() {
    return (
        <Stack direction="column" gap={1} p={1} sx={{ width: '100%' }}>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" height={50} width={200} />
                <Skeleton variant="rectangular" height={50} width="100%" />
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" height={50} width={200} />
                <Skeleton variant="rectangular" height={50} width="100%" />
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" height={50} width={200} />
                <Skeleton variant="rectangular" height={50} width="100%" />
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" height={50} width={200} />
                <Skeleton variant="rectangular" height={50} width="100%" />
            </Stack>
            <Stack direction="row" gap={1}>
                <Skeleton variant="rectangular" height={50} width={200} />
                <Skeleton variant="rectangular" height={50} width="100%" />
            </Stack>
        </Stack>
    );
}

export default SkeletonMuster;
