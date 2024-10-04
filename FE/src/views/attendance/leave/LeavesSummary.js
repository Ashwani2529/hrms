/* eslint-disable */
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
// assets
import {
    IconUserCheck,
    IconAccessPoint,
    IconCircles,
    IconCreditCard,
    IconWorldOff,
    IconMoodSick,
    IconCoinMonero,
    IconCake,
    IconHomeDollar,
    IconMoneybag
} from '@tabler/icons';
import userOff from 'assets/images/users/user-off.png';
import userCancel from 'assets/images/users/user-cancel.png';
import userQuestion from 'assets/images/users/user-question.png';
import { AnalyticsActions } from 'store/slices/analytics';
import { useEffect, useState } from 'react';
import { dispatch } from 'store';
import { useSelector } from 'react-redux';
import { borderTop, borderTopColor } from '@mui/system';
import useAuth from 'hooks/useAuth';
import { LeaveActions } from 'store/slices/leave';
import { HolidayVillageTwoTone } from '@mui/icons-material';

function LeavesSummary({ startDate, endDate }) {
    const theme = useTheme();
    const { user } = useAuth();
    const { fetchLeaveStats } = LeaveActions;
    const { loading, leaveStats } = useSelector((state) => state.leave);
    const matchDownXs = useMediaQuery(theme.breakpoints.down('sm'));

    const blockSX = {
        p: 2.5,
        borderLeft: '1px solid ',
        borderBottom: '1px solid ',
        borderTop: '1px solid ',
        borderTopColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[200],
        borderLeftColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[200],
        borderBottomColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[200]
    };
    const svgClass = {
        width: '50px',
        height: '50px',
        color: theme.palette.secondary.main,
        borderRadius: '14px',
        padding: '10px',
        backgroundColor: '#e7e7e7'
    };

    useEffect(() => {
        dispatch(fetchLeaveStats(user?.user_id));
    }, []);

    return (
        <MainCard
            content={false}
            sx={{
                width: '100%',
                display: 'flex',
                marginBottom: '20px',
                '& svg': svgClass
            }}
        >
            <Grid container alignItems="center" spacing={0}>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={'flex-start'}>
                        <Grid item>
                            <IconMoodSick stroke={1.5} />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {leaveStats?.sick_leaves || 0}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        SICK LEAVES LEFT
                                    </Typography>
                                </>
                            ) : (
                                <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                    <Skeleton width={20} />
                                    <Skeleton width={40} />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Grid item>
                            <HolidayVillageTwoTone stroke={1.5} />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {leaveStats?.casual_leaves || 0}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        CASUAL LEAVES LEFT
                                    </Typography>
                                </>
                            ) : (
                                <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                    <Skeleton width={20} />
                                    <Skeleton width={40} />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container alignItems="center" spacing={0}>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Grid item>
                            {/* <img src={userOff} alt="icon" style={svgClass} /> */}
                            <IconHomeDollar />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {leaveStats?.earned_leaves || 0}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        EARNED LEAVES LEFT
                                    </Typography>
                                </>
                            ) : (
                                <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                    <Skeleton width={20} />
                                    <Skeleton width={40} />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Grid item>
                            {/* <img src={userQuestion} alt="icon" style={svgClass} /> */}
                            <IconMoneybag />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {leaveStats?.compunsatory_leaves || 0}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        COMPUNSATORY LEAVES LEFT
                                    </Typography>
                                </>
                            ) : (
                                <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                    <Skeleton width={20} />
                                    <Skeleton width={40} />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default LeavesSummary;
