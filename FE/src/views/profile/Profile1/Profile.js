/* eslint-disable */
import PropTypes from 'prop-types';

// material-ui
import {
    Box,
    Button,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from '@mui/material';

// project imports
import useAuth from 'hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Avatar from 'ui-component/extended/Avatar';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconEdit } from '@tabler/icons';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';
import PinDropTwoToneIcon from '@mui/icons-material/PinDropTwoTone';
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import AnimateButton from 'ui-component/extended/AnimateButton';

// progress
function LinearProgressWithLabel({ value, ...others }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    mr: 1
                }}
            >
                <LinearProgress value={value} {...others} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(value)}%`}</Typography>
            </Box>
        </Box>
    );
}

LinearProgressWithLabel.propTypes = {
    value: PropTypes.number
};

// personal details table
/** names Don&apos;t look right */
function createData(name, colon, data) {
    return { name, colon, data };
}

// ==============================|| PROFILE 1 - PROFILE ||============================== //

const Profile = ({ singleEmployee }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const rows = [
        createData('Full Name', ':', singleEmployee?.firstname?.concat(' ', singleEmployee?.middlename, ' ', singleEmployee?.lastname)),
        createData(
            'Address',
            ':',
            Object?.entries(singleEmployee?.user_address || {}).reduce((address, [key, value]) => {
                address += value + ', ';
                return address;
            }, '')
        ),
        createData('Phone', ':', singleEmployee?.phone_number || '-'),
        createData('Personal Email', ':', singleEmployee?.personal_email || '-')
    ];


    const user_documents = {
        Aadhar: singleEmployee?.user_documents?.aadhar,
        'PAN Card': singleEmployee?.user_documents?.pan,
        Cheque: singleEmployee?.user_documents?.cheque,
        'Graduation marksheet': singleEmployee?.user_documents?.graduation,
        Masters: singleEmployee?.user_documents?.masters
        
    };

    const handleViewFile = (url) => {
        try {
            new URL(url);
            window.open(url, '_blank');
          } catch (_) {
            window.open(`https://hrms-employee-images.s3.ap-south-1.amazonaws.com/${url}`, '_blank');
          }
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item lg={4} xs={12}>
                <SubCard
                    title={
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <Avatar src={user?.profile_photo}>{user?.user_name?.charAt(0)?.toUpperCase()}</Avatar>
                            </Grid>

                            <Grid item xs zeroMinWidth>
                                <Typography align="left" variant="subtitle1">
                                    {user?.user_name}
                                </Typography>
                                <Typography align="left" variant="subtitle2">
                                    {user?.role?.role_name}
                                </Typography>
                            </Grid>
                            {/* <Grid item>
                                <Chip size="small" label="Pro" color="primary" />
                            </Grid> */}
                        </Grid>
                    }
                >
                    <List component="nav" aria-label="main mailbox folders">
                        <ListItemButton>
                            <ListItemIcon>
                                <MailTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="subtitle1">Email</Typography>} />
                            <ListItemSecondaryAction>
                                <Typography variant="subtitle2" align="right">
                                    {user?.user_email}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                        <Divider />
                        <ListItemButton>
                            <ListItemIcon>
                                <PhonelinkRingTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="subtitle1">Phone</Typography>} />
                            <ListItemSecondaryAction>
                                <Typography variant="subtitle2" align="right">
                                {user?.phone_number ||'-'}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                        <Divider />
                        <ListItemButton>
                            <ListItemIcon>
                                <PinDropTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="subtitle1">Location</Typography>} />
                            <ListItemSecondaryAction>
                                <Typography variant="subtitle2" align="right">
                                    {user?.user_address?.country || 'India'}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    </List>
                </SubCard>
            </Grid>
            <Grid item lg={8} xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <SubCard
                            title="Personal Details"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontWeight: 700
                                }
                            }}
                            secondary={
                                <Button aria-label="Edit Details" onClick={() => navigate('/user/details')}>
                                    <IconEdit stroke={1.5} size="20px" />
                                </Button>
                            }
                        >
                            <Grid container spacing={2}>
                                <Divider sx={{ pt: 1 }} />
                                <Grid item xs={12}>
                                    <TableContainer>
                                        <Table
                                            sx={{
                                                '& td': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                            size="small"
                                        >
                                            <TableBody>
                                                {rows.map((row) => (
                                                    <TableRow key={row?.name}>
                                                        <TableCell variant="head">{row?.name}</TableCell>
                                                        <TableCell>{row?.colon}</TableCell>
                                                        <TableCell>{row?.data}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </SubCard>
                    </Grid>
                </Grid>
                <Grid container spacing={gridSpacing} mt={1}>
                    <Grid item xs={12}>
                        <SubCard
                            title="Documents"
                            sx={{
                                '& .MuiTypography-root': {
                                    fontWeight: 700
                                }
                            }}
                        >
                            <Grid container spacing={2}>
                                <Divider sx={{ pt: 1 }} />
                                <Grid item xs={12}>
                                    <TableContainer>
                                        <Table
                                            sx={{
                                                '& td': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                            size="small"
                                        >
                                            <TableBody>
                                                {Object.entries(user_documents)?.map(([key, value]) => (
                                                    <TableRow key={key}>
                                                        <TableCell variant="head">{key}</TableCell>
                                                        <TableCell> : </TableCell>
                                                        <TableCell>
                                                            <AnimateButton>
                                                                <Button
                                                                    variant="contained"
                                                                    size="large"
                                                                    onClick={() => handleViewFile(value)}
                                                                    sx={{
                                                                        height: '35px',
                                                                        padding: '0px 14px'
                                                                    }}
                                                                    disabled={value?.length === 0 || !value}
                                                                >
                                                                    View
                                                                </Button>
                                                            </AnimateButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </SubCard>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Profile;
