import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Button, Chip, Divider, Grid, List, ListItem, Typography, Box, Stack } from '@mui/material';
import { useSelector } from 'store';
import useSockets from 'hooks/useSockets';
import { markNotificationAsRead } from 'store/slices/notifications';
import { styled, useTheme } from '@mui/material/styles';

const ListItemWrapper = styled('div')(({ theme }) => ({
    cursor: 'pointer',
    padding: 16,
    '&:hover': {
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light
    },
    '& .MuiListItem-root': {
        padding: 0
    },
    '&.read': {
        background: theme.palette.grey[300] // Example of styling read notifications
    }
}));

const NotificationList = ({ value, showAll, handleToggle }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { markAsReadEmitter } = useSockets();
    const [notificationsArr, setNotificationsArr] = useState([]);
    const { notificationsRead, notificationsUnread } = useSelector((state) => state.notifications);
    const [reloadList, setReloadList] = useState(false);

    const handleNotificationAsRead = (notification) => {
        markAsReadEmitter(notification.notification_id);
        markNotificationAsRead(notification);
        setReloadList(true);
    };

    useEffect(() => {
        setNotificationsArr([...notificationsUnread, ...notificationsRead]);
    }, [notificationsRead, notificationsUnread, reloadList]);

    useEffect(() => {
        if (reloadList) {
            setReloadList(false);
        }
    }, [reloadList]);

    const GetLinkChip = ({ notification }) => {
        const { notification_type: notificationType } = notification;
        switch (notificationType) {
            case 'Attendance':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/attendance/list');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="success"
                    />
                );
            case 'Shift':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/shift/manage-shifts');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="warning"
                    />
                );
            case 'Letter':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/documents/list');
                        }}
                        variant="outlined"
                        color="warning"
                        label={notificationType}
                    />
                );
            case 'Leave':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/attendance/leave');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="error"
                    />
                );
            case 'Payroll':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/payroll/list');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="info"
                    />
                );
            case 'Requests':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/requests/list');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="info"
                    />
                );
            case 'Tickets':
                return (
                    <Chip
                        onClick={() => {
                            handleToggle();
                            navigate('/tickets/list');
                        }}
                        label={notificationType}
                        variant="outlined"
                        color="success"
                    />
                );
            default:
                return <></>;
        }
    };

    return (
        <List
            sx={{
                width: '100%',
                maxWidth: 330,
                py: 0,
                borderRadius: '10px',
                [theme.breakpoints.down('md')]: {
                    maxWidth: 300
                },
                '& .MuiListItemSecondaryAction-root': {
                    top: 22
                },
                '& .MuiDivider-root': {
                    my: 0
                },
                '& .list-container': {
                    pl: 7
                }
            }}
        >
            {notificationsArr
                .slice(0, showAll ? notificationsArr.length : 5)
                .filter((notification) => {
                    if (value === 'read') {
                        return notification.notification_status === 'Read';
                    }
                    if (value === 'unread') {
                        return notification.notification_status === 'Pending';
                    }
                    return true;
                })
                .map((notification, index) => (
                    <React.Fragment key={notification.id}>
                        <ListItemWrapper
                            className={notification.notification_status === 'Read' ? 'read' : ''}
                            onClick={() => {
                                handleNotificationAsRead(notification);
                            }}
                            sx={{
                                backgroundColor: '#fff',
                                my: 1,
                                py: 2
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h5" pr={1}>
                                        {notification.title}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" whiteSpace="nowrap">
                                    {moment(notification.createdAt).fromNow(true)} ago
                                </Typography>
                            </Stack>

                            <Grid container direction="column">
                                <Grid item xs={12} sx={{ py: 1 }}>
                                    <Typography variant="subtitle2">{notification.description}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container justifyContent="space-between">
                                        <Grid item>
                                            <GetLinkChip notification={notification} />
                                        </Grid>
                                        {notification.notification_status === 'Pending' && (
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    color="info"
                                                    size="small"
                                                    onClick={() => {
                                                        handleNotificationAsRead(notification);
                                                    }}
                                                >
                                                    Mark as read
                                                </Button>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </ListItemWrapper>
                        <Divider />
                    </React.Fragment>
                ))}
        </List>
    );
};

export default NotificationList;
