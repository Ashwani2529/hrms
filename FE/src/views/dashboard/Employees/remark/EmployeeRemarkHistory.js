/* eslint-disable camelcase */
import { Close } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import React, { useEffect } from 'react';
import TImelineCard from './TImelineCard';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import SkeletonRemarkTimeline from 'ui-component/skeleton/SkeletonRemarkTimeline';
import { RemarkActions } from 'store/slices/remarks';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import moment from 'moment';
import EmptyContent from 'ui-component/extended/EmptyContent';
import { REMARK_TYPE } from 'store/constant';

function EmployeeRemarkHistory({ handleCloseRemarkHistory, handleOpenAddRemark, selectedItem }) {
    const isEdit = !!selectedItem?.remark_id;
    const user_id = selectedItem?.user_id;

    const { fetchUserRemarks } = RemarkActions;
    const { loading, remarks } = useSelector((state) => state.remarks);
    // const { loading } = useSelector((state) => state.remarks);

    // const remarks = [
    //     {
    //         remark_title: 'Test',
    //         remark_description: 'This is some description of remark',
    //         remark_date: new Date().toISOString(),
    //         remark_level: 8,
    //         remark_type: REMARK_TYPE.CONFLICT
    //     }
    // ];

    useEffect(() => {
        if (isEdit) return;
        dispatch(fetchUserRemarks(user_id));
    }, [user_id]);

    return (
        <Box sx={{ width: 600, px: 3, pt: 4, pb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h3">Remarks History Timeline</Typography>
                <IconButton onClick={handleCloseRemarkHistory}>
                    <Close />
                </IconButton>
            </Stack>
            <Box>
                {loading ? (
                    <SkeletonRemarkTimeline />
                ) : (
                    <Timeline
                        sx={{
                            [`& .${timelineItemClasses.root}:before`]: {
                                flex: 0,
                                padding: 0
                            }
                        }}
                    >
                        {Array.isArray(remarks) &&
                            remarks.map((remark, index) => (
                                <TimelineItem key={remark?.remark_id} sx={{ my: 1 }}>
                                    {/* <TimelineOppositeContent color="textSecondary">
                                        {moment(remark?.remark_date).format('MMM DD, YYYY')}
                                    </TimelineOppositeContent> */}
                                    <TimelineSeparator>
                                        <TimelineDot />
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <TImelineCard remark={remark} handleOpenAddRemark={handleOpenAddRemark} />
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                    </Timeline>
                )}

                {!remarks?.length && (
                    <EmptyContent
                        title="No Remarks Found"
                        sx={{
                            '& span.MuiBox-root': { height: 160 }
                        }}
                    />
                )}
            </Box>
            {/* <Box>
                <SkeletonRemarkTimeline />
            </Box> */}
        </Box>
    );
}

export default EmployeeRemarkHistory;
