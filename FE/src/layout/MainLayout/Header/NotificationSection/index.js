import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Avatar,
    Box,
    Button,
    CardActions,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    MenuItem,
    Badge
} from '@mui/material';
// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

// assets
import { IconBell } from '@tabler/icons';
import { useSelector } from 'react-redux';

// notification status options
const status = [
    {
        value: 'all',
        label: 'All Notification'
    },
    {
        value: 'read',
        label: 'Read'
    },
    {
        value: 'unread',
        label: 'Unread'
    }
];

// ==============================|| NOTIFICATION ||============================== //

const NotificationSection = () => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [showAll, setShowAll] = useState(false);
    const { notificationsUnread } = useSelector((state) => state.notifications);

    const [unreadNotificationNum, setUnreadNotificationNum] = useState(0);

    /**
     * anchorRef is used on different componets and specifying one type leads to other components throwing an error
     * */
    const anchorRef = useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    const handleChange = (event) => setValue(event?.target.value);

    useEffect(() => {
        if (Array.isArray(notificationsUnread)) {
            setUnreadNotificationNum(notificationsUnread.length);
        }
    }, [notificationsUnread]);

    return (
        <>
            <Box
                sx={{
                    ml: 2,
                    mr: 3,
                    [theme.breakpoints.down('md')]: {
                        mr: 2
                    }
                }}
            >
                <Badge badgeContent={Number(unreadNotificationNum)} color="primary">
                    <Avatar
                        variant="rounded"
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                            color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                            '&[aria-controls="menu-list-grow"],&:hover': {
                                background: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                                color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                            }
                        }}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        color="inherit"
                    >
                        <IconBell stroke={1.5} size="20px" />
                    </Avatar>
                </Badge>
            </Box>

            <Popper
                placement={matchesXs ? 'bottom' : 'bottom-end'}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [matchesXs ? 5 : 0, 20]
                        }
                    }
                ]}
            >
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={handleClose}>
                        <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
                            <Paper>
                                {open && (
                                    <MainCard
                                        border={false}
                                        elevation={16}
                                        content={false}
                                        boxShadow
                                        shadow={theme.shadows[16]}
                                        sx={{ minWidth: 300 }}
                                    >
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item xs={12}>
                                                <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                                                    <Grid item>
                                                        <Stack direction="row" spacing={2}>
                                                            <Typography variant="subtitle1">Notifications</Typography>
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <PerfectScrollbar
                                                    style={{
                                                        height: '100%',
                                                        maxHeight: 'calc(100vh - 205px)',
                                                        overflowX: 'hidden'
                                                    }}
                                                >
                                                    <Grid container direction="column" spacing={2}>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ px: 2, pt: 0.25 }}>
                                                                <TextField
                                                                    id="outlined-select-currency-native"
                                                                    select
                                                                    fullWidth
                                                                    value={value}
                                                                    onChange={handleChange}
                                                                    SelectProps={{
                                                                        native: true
                                                                    }}
                                                                    defaultValue="all"
                                                                >
                                                                    {status.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </TextField>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} p={0}>
                                                            <Divider sx={{ my: 0 }} />
                                                        </Grid>
                                                    </Grid>
                                                    <NotificationList value={value} handleToggle={handleToggle} showAll={showAll} />
                                                </PerfectScrollbar>
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                        <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setShowAll((prev) => !prev);
                                                }}
                                                disableElevation
                                            >
                                                {showAll ? 'Show Less' : 'Show All'}
                                            </Button>
                                        </CardActions>
                                    </MainCard>
                                )}
                            </Paper>
                        </Transitions>
                    </ClickAwayListener>
                )}
            </Popper>
        </>
    );
};

export default NotificationSection;
