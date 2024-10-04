/* eslint-disable */
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
// assets
import { IconUserCheck, IconAccessPoint, IconCircles, IconCreditCard } from '@tabler/icons';
import userOff from 'assets/images/users/user-off.png'
import userCancel from 'assets/images/users/user-cancel.png'
import userQuestion from 'assets/images/users/user-question.png'
import { AnalyticsActions } from 'store/slices/analytics';
import { useEffect } from 'react';
import { dispatch } from 'store';
import { useSelector } from 'react-redux';

function AttendanceSummary({startDate, endDate}) {
    const theme = useTheme();
    const matchDownXs = useMediaQuery(theme.breakpoints.down('sm'));

    const { getAttendanceAnalytics } = AnalyticsActions

    const { loading, attendanceReport } = useSelector((state) => state.analytics)

    useEffect(() => {
        dispatch(getAttendanceAnalytics({
            startDate: new Date(startDate).toISOString() || new Date().toISOString(), 
            endDate: new Date(endDate).toISOString() || new Date().toISOString()
        }));
    }, [startDate, endDate])

    const blockSX = {
        p: 2.5,
        borderLeft: '1px solid ',
        borderBottom: '1px solid ',
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
    }
    return (
        <MainCard
            content={false}
            sx={{
                width: "100%",
                display: 'flex',
                marginBottom: '20px',
                '& svg':
                    svgClass

            }}
        >
            <Grid container alignItems="center" spacing={0}>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Grid item>
                            <IconUserCheck stroke={1.5} />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {attendanceReport?.present}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        PRESENT
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
                            {/* <IconAccessPoint stroke={1.5} /> */}
                            <img src={userCancel} alt='icon' style={svgClass} />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {attendanceReport?.expected}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        EXPECTED
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
                            <img src={userOff} alt='icon' style={svgClass} />

                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {attendanceReport?.absent}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        ABSENT
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
                            <img src={userQuestion} alt='icon' style={svgClass} />
                        </Grid>
                        <Grid item sm zeroMinWidth>
                            {!loading ? (
                                <>
                                    <Typography variant="h5" align="center">
                                        {attendanceReport?.onleave}
                                    </Typography>
                                    <Typography variant="subtitle2" align="center">
                                        ON LEAVE
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

export default AttendanceSummary;
