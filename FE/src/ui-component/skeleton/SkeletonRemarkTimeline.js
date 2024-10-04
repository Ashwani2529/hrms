import React from 'react';
import { Skeleton } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';

function SkeletonRemarkTimeline() {
    return (
        <Timeline
            sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0
                }
            }}
        >
            <TimelineItem sx={{ my: 1 }}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Skeleton variant="rounded" height={150} />
                </TimelineContent>
            </TimelineItem>
            <TimelineItem sx={{ my: 1 }}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Skeleton variant="rounded" height={150} />
                </TimelineContent>
            </TimelineItem>
            <TimelineItem sx={{ my: 1 }}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Skeleton variant="rounded" height={150} />
                </TimelineContent>
            </TimelineItem>
            <TimelineItem sx={{ my: 1 }}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Skeleton variant="rounded" height={150} />
                </TimelineContent>
            </TimelineItem>
            <TimelineItem sx={{ my: 1 }}>
                <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    <Skeleton variant="rounded" height={150} />
                </TimelineContent>
            </TimelineItem>
        </Timeline>
    );
}

export default SkeletonRemarkTimeline;
