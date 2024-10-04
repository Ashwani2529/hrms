import React, { useEffect, useState } from 'react';
import MainCard from './MainCard';
import { Box, Breadcrumbs, Card, CardContent, Typography } from '@mui/material';
import Page from 'ui-component/Page';
import useAuth from 'hooks/useAuth';
import { styled } from '@mui/system';
import { PieChart } from '@mui/x-charts/PieChart';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { useDispatch, useSelector } from 'react-redux';
import { PayrollActions } from 'store/slices/payroll';

const PayrollOverview = () => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const InfoCard = styled(Card)(({ theme }) => ({
        minWidth: 100,
        minHeight: 220
    }));
    const { fetchUserPayrollData } = PayrollActions;
    const { UserPayrollData } = useSelector((state) => state.payroll);
    const [grossPay, setGrossPay] = useState([44221, 2146, 42075]);
    const labels = [
        {
            label: 'Gross Pay',
            value: grossPay[0]
        },
        {
            label: 'Deduction',
            value: grossPay[1]
        },
        {
            label: 'Net Pay',
            value: grossPay[2]
        }
    ];
    // Function to calculate Gross Pay, Deductions, and Net Pay
    function calculatePayrollData(userPayrollData) {
        // Sum amounts in the provided array of objects
        const sumAmounts = (arr) => arr.reduce((total, item) => total + (item.amount || 0), 0);

        // Calculate total for Gross Pay components
        const baseSalary = userPayrollData.base_salary_amount || 0;
        const paidLeaveEncashment = userPayrollData.paid_leave_encashment || 0;
        const otHoursAmount = userPayrollData.ot_hours_amount || 0;
        const incentiveTotal = sumAmounts(userPayrollData.incentive || []);
        const earningsTotal = sumAmounts(userPayrollData.earnings || []);

        // Calculate Deductions
        const deductionsTotal = sumAmounts(userPayrollData.deduction || []);

        // Gross Pay is base salary plus all additional earnings
        const grossPay = baseSalary + paidLeaveEncashment + otHoursAmount + incentiveTotal + earningsTotal;

        // Net Pay is Gross Pay minus Deductions
        const netPay = grossPay - deductionsTotal;

        return {
            grossPay,
            deductionsTotal,
            netPay
        };
    }
    useEffect(() => {
        if (user?.user_id) {
            dispatch(fetchUserPayrollData(user.user_id));
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (UserPayrollData && UserPayrollData.salary) {
            const { grossPay, deductionsTotal, netPay } = calculatePayrollData(UserPayrollData.salary);
            setGrossPay([grossPay, deductionsTotal, netPay]);
        }
    }, [UserPayrollData]);

    const mappedData = [
        ...labels.map((v) => ({
            ...v,
            label: v.label,
            value: v.value
        }))
    ];
    const valueFormatter = (item) => `₹${item.value}`;
    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 28,
        height: 16,
        padding: 0,
        display: 'flex',
        '&:active': {
            '& .MuiSwitch-thumb': {
                width: 15
            },
            '& .MuiSwitch-switchBase.Mui-checked': {
                transform: 'translateX(9px)'
            }
        },
        '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
                transform: 'translateX(12px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: '#1890ff',
                    ...theme.applyStyles('dark', {
                        backgroundColor: '#177ddc'
                    })
                }
            }
        },
        '& .MuiSwitch-thumb': {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            width: 12,
            height: 12,
            borderRadius: 6,
            transition: theme.transitions.create(['width'], {
                duration: 200
            })
        },
        '& .MuiSwitch-track': {
            borderRadius: 16 / 2,
            opacity: 1,
            backgroundColor: 'rgba(0,0,0,.25)',
            boxSizing: 'border-box',
            ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(255,255,255,.35)'
            })
        }
    }));

    return (
        <Page title="Payout Overview">
            <Breadcrumbs heading="Overview" links={[{ name: 'leave', href: '/attendance/leave' }]} />
            <MainCard content={false} title="Payout Details">
                <Box display="flex" justifyContent="space-between" p={2}>
                    <Box display="block" justifyContent="space-between" p={2} width="50%">
                        <table className="table borderless">
                            <tbody>
                                <tr style={{ display: 'flex' }}>
                                    <td>
                                        <div>
                                            {/* Self-closing span and style prop fixed */}
                                            <span className="color-box" style={{ backgroundColor: '#a6b7f7' }} />
                                            <Typography variant="h4" component="div">
                                                Rs {grossPay[2]}
                                            </Typography>
                                            <Typography variant="h6" component="div">
                                                Net Pay
                                            </Typography>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <Box sx={{ width: '100%' }}>
                            <PieChart
                                height={200}
                                series={[
                                    {
                                        data: mappedData.slice(0, 3),
                                        innerRadius: 50,
                                        arcLabel: (params) => params.label ?? '',
                                        arcLabelMinAngle: 20,
                                        valueFormatter
                                    }
                                ]}
                                skipAnimation={false}
                            />
                        </Box>
                        <Box sx={{ width: '85%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <table className="table borderless">
                                <tbody>
                                    <tr style={{ display: 'flex', gap: '40px' }}>
                                        <td>
                                            <div>
                                                {/* Self-closing span and style prop fixed */}
                                                <span className="color-box" style={{ backgroundColor: '#a6b7f7' }} />
                                                <span className="secondary-info ng-binding">Rs {grossPay[0]}</span>
                                            </div>
                                            <div className="card-subinfo ptl1">Gross Pay</div>
                                        </td>
                                        <td>
                                            <div>
                                                {/* Self-closing span and style prop fixed */}
                                                <span className="color-box" style={{ backgroundColor: '#71dbe3' }} />
                                                <span className="secondary-info ng-binding">Rs {grossPay[1]}</span>
                                            </div>
                                            <div className="card-subinfo ptl1">Deductions</div>
                                        </td>
                                        <td>
                                            <div>
                                                {/* Self-closing span and style prop fixed */}
                                                <span className="color-box" style={{ backgroundColor: '#37C0D3' }} />
                                                <span className="secondary-info ng-binding">31</span>
                                            </div>
                                            <div className="card-subinfo ptl1">Work Days</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Box>
                    </Box>
                    {/* Side Card for Selecting Employee and Remaining Leaves */}
                    <Box width="50%" display="flex" flexDirection="column" justifyContent="center">
                        <Typography variant="h4" component="div" gutterBottom>
                            Employee Details
                        </Typography>
                        <Card variant="outlined">
                            <CardContent>
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
                                    <Box mt={2}>
                                        <div style={{ backgroundColor: '#fcf0f0', padding: '15px', maxWidth: '100%' }}>
                                            <Typography variant="h3" component="div">
                                                3
                                            </Typography>
                                            <Typography variant="h6" component="div">
                                                Total Employees
                                            </Typography>
                                            <Typography variant="h6" component="div">
                                                -61 vs previous month
                                            </Typography>
                                        </div>
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'start' }}>
                                            <table className="table borderless">
                                                <tbody style={{ display: 'grid', gap: '30px', padding: '10px' }}>
                                                    <tr style={{ display: 'flex', gap: '40px' }}>
                                                        <td>
                                                            <div>
                                                                {/* Self-closing span and style prop fixed */}
                                                                <span className="color-box" style={{ backgroundColor: '#a6b7f7' }} />
                                                                <span className="secondary-info ng-binding">03</span>
                                                            </div>
                                                            <div className="card-subinfo ptl1">Addition</div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {/* Self-closing span and style prop fixed */}
                                                                <span className="color-box" style={{ backgroundColor: '#71dbe3' }} />
                                                                <span className="secondary-info ng-binding">01</span>
                                                            </div>
                                                            <div className="card-subinfo ptl1">Settlements</div>
                                                        </td>
                                                    </tr>
                                                    <tr style={{ display: 'flex', gap: '40px' }}>
                                                        <td>
                                                            <div>
                                                                {/* Self-closing span and style prop fixed */}
                                                                <span className="color-box" style={{ backgroundColor: '#37C0D3' }} />
                                                                <span className="secondary-info ng-binding">02</span>
                                                            </div>
                                                            <div className="card-subinfo ptl1">Exclusion</div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {/* Self-closing span and style prop fixed */}
                                                                <span className="color-box" style={{ backgroundColor: '#37C0D3' }} />
                                                                <span className="secondary-info ng-binding">04</span>
                                                            </div>
                                                            <div className="card-subinfo ptl1">Separation</div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <div style={{ padding: '15px', Width: '100%', display: 'grid', gap: '30px' }}>
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>Payroll Inputs</span>
                                                <span>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                        <Typography>Off</Typography>
                                                        <AntSwitch defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                                                        <Typography>On</Typography>
                                                    </Stack>
                                                </span>
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>Employee View Release</span>
                                                <span>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                        <Typography>Off</Typography>
                                                        <AntSwitch defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                                                        <Typography>On</Typography>
                                                    </Stack>
                                                </span>
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>IT Statement Employee View</span>
                                                <span>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                        <Typography>Off</Typography>
                                                        <AntSwitch defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                                                        <Typography>On</Typography>
                                                    </Stack>
                                                </span>
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>Payroll</span>
                                                <span>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                        <Typography>Off</Typography>
                                                        <AntSwitch defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                                                        <Typography>On</Typography>
                                                    </Stack>
                                                </span>
                                            </Typography>
                                        </div>
                                    </Box>
                                </div>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </MainCard>
            <Box
                width="100%"
                display="grid"
                justifyContent="space-between"
                gridTemplateRows="repeat(2, 1fr)"
                gridTemplateColumns="repeat(3, 1fr)"
                gap="10px"
                mt={2}
            >
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Negative Salary
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Stop Salary Processing
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Settled Employees
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Hold Salary Payout
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Payout Pending
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
                <Box>
                    <InfoCard>
                        <CardContent>
                            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 17, fontWeight: 'bold' }}>
                                Locations Without PT State
                            </Typography>
                        </CardContent>
                    </InfoCard>
                </Box>
            </Box>
        </Page>
    );
};

export default PayrollOverview;
