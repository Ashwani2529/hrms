/* eslint-disable */
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Tab, Tabs, Alert, AlertTitle } from '@mui/material';

// project imports
import Profile from './Profile';

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import LibraryBooksTwoToneIcon from '@mui/icons-material/LibraryBooksTwoTone';

import SalaryDetails from './SalaryDetails';
import { EmployeeActions } from 'store/slices/employee';
import { dispatch, useSelector } from 'store';
import useAuth from 'hooks/useAuth';
import SalarySlipTable from './salary-slip/SalarySlipTable';
import { HolidayVillageTwoTone } from '@mui/icons-material';
// import LeavesHistory from './leaves/LeavesHistory';

// tabs panel
function TabPanel({ children, value, index, ...other }) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

// tabs option
const tabsOption = [
    {
        label: 'Profile',
        icon: <AccountCircleTwoToneIcon sx={{ fontSize: '1.3rem' }} />
    },
    {
        label: 'Salary Details',
        icon: <DescriptionTwoToneIcon sx={{ fontSize: '1.3rem' }} />
    },
    {
        label: 'Salary Slips',
        icon: <LibraryBooksTwoToneIcon sx={{ fontSize: '1.3rem' }} />
    }
    // {
    //     label: 'Leaves',
    //     icon: <HolidayVillageTwoTone sx={{ fontSize: '1.3rem' }} />
    // }
];

// ==============================|| PROFILE 1 ||============================== //

const Profile1 = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();

    const { fetchEmployeeById } = EmployeeActions;
    const { singleEmployee } = useSelector((state) => state.employee);

    useEffect(() => {
        dispatch(fetchEmployeeById(user?.user_id));
    }, [user]);

    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid sx={{ height: '100%' }}>
            {singleEmployee.hasOwnProperty('user_id') && singleEmployee?.status !== 'Active' && (
                <Grid item xs={12} mb={2}>
                    <Alert severity="warning" variant="outlined" sx={{ borderColor: 'warning.dark', backgroundColor: '#ffffff' }}>
                        <AlertTitle>Alert!</AlertTitle>
                        Your Profile verification is pending.
                        <strong> It usually takes upto 24 hrs.</strong>
                    </Alert>
                </Grid>
            )}
            <Grid sx={{ height: '100%' }}>
                <MainCard sx={{ height: '100%' }}>
                    <Grid container spacing={gridSpacing} sx={{ height: '100%' }}>
                        <Grid item xs={12} sx={{ height: '100%' }}>
                            <Tabs
                                value={value}
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={handleChange}
                                aria-label="simple tabs example"
                                variant="scrollable"
                                sx={{
                                    mb: 3,
                                    '& a': {
                                        minHeight: 'auto',
                                        minWidth: 10,
                                        py: 1.5,
                                        px: 1,
                                        mr: 2.25,
                                        color: theme.palette.grey[600],
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    '& a.Mui-selected': {
                                        color: theme.palette.primary.main
                                    },
                                    '& .MuiTabs-indicator': {
                                        bottom: 2
                                    },
                                    '& a > svg': {
                                        marginBottom: '0px !important',
                                        mr: 1.25
                                    }
                                }}
                            >
                                {tabsOption.map((tab, index) => (
                                    <Tab key={index} component={Link} to="#" icon={tab.icon} label={tab.label} {...a11yProps(index)} />
                                ))}
                            </Tabs>
                            <TabPanel value={value} index={0}>
                                <Profile singleEmployee={singleEmployee} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <SalaryDetails payroll={singleEmployee?.payroll} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <SalarySlipTable payroll={singleEmployee?.payroll} />
                            </TabPanel>
                            {/* <TabPanel value={value} index={3}>
                                <LeavesHistory payroll={singleEmployee?.payroll} />
                            </TabPanel> */}
                        </Grid>
                    </Grid>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default Profile1;
