import React from 'react';
import { Skeleton, Box, Stack, Grid } from '@mui/material';

function SkaletonHolidaysCalender() {
    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={2}>
                <Skeleton variant="text" height={20} width={100} />
                <Skeleton variant="text" height={20} width={100} />
                <Skeleton variant="text" height={20} width={100} />
            </Stack>
            <Skeleton variant="text" height={150} width={300} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <Skeleton variant="text" height={20} width={100} />
                <Skeleton variant="text" height={20} width={100} />
            </Stack>
            <Grid mt={2} container xs={12} md={12} spacing={1} justifyContent="center" alignItems="center">
                {[...Array(35)].map((ele, index) => (
                    <Grid item key={index} xs={1.71} md={1.71}>
                        <Skeleton variant="rectangular" height={100} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default SkaletonHolidaysCalender;
