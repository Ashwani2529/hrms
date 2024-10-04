import React from 'react';
import { Grid, Skeleton, Stack, TableCell, TableRow } from '@mui/material';

function SkeletonCompanyDetails() {
    return (
        <Stack sx={{ p: 3, m: 'auto', maxWidth: 600 }} direction="column" gap={3}>
            <Skeleton height={30} variant="rounded" width="100%" />
            <Skeleton height={30} variant="rounded" width="100%" />
            <Skeleton height={30} variant="rounded" width="100%" />
            <Skeleton height={30} variant="rounded" width="100%" />
            <Skeleton height={30} variant="rounded" width="100%" />
            <Stack direction="row" justifyContent="flex-end">
                <Skeleton height={30} variant="rounded" width={100} />
            </Stack>
        </Stack>
    );
}

export default SkeletonCompanyDetails;
