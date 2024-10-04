import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import moment from 'moment';
import { monthsArr } from 'store/constant';

function CalenderHeader({ current, mode, prev, next, onClickPrev, onClickNext }) {
    return (
        <Box>
            <Stack gap={1} direction="row" justifyContent="flex-start" alignItems="flex-end">
                <Typography variant="h1">{monthsArr[current.month]}</Typography>
                <Typography mb={0.5}>{current.year}</Typography>
            </Stack>
            <Box py={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box onClick={onClickPrev}>
                        <Typography color="red">{monthsArr[prev.month]}</Typography>
                    </Box>
                    <Box onClick={onClickNext}>
                        <Typography color="red">{monthsArr[next.month]}</Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}

export default CalenderHeader;
