import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from './MainCard';
import {
    Avatar,
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import Page from 'ui-component/Page';
import Chart from 'react-apexcharts';
import { LeaveActions } from 'store/slices/leave';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeActions } from 'store/slices/employee';
import useAuth from 'hooks/useAuth';
import { roles } from 'store/constant';

const EmployeeLeaveDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { role, user } = useAuth();

    const { fetchLeaveStats } = LeaveActions;
    const { fetchEmployees } = EmployeeActions;
    const { leaveStats, loading } = useSelector((state) => state.leave);
    const { employee } = useSelector((state) => state.employee);
    const dispatch = useDispatch();
    const [chartData, setChartData] = useState([0, 0, 0]);

    useEffect(() => {
        if (id) {
            dispatch(fetchLeaveStats(id));
            dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
        }
    }, [id]);

    useEffect(() => {
        if (leaveStats) {
            setChartData([leaveStats?.usedLeaves ?? 0, leaveStats?.remaining ?? 0, 0]);
        }
    }, [leaveStats]);

    return (
        <Page title="Employee: Leave">
            <Breadcrumbs
                heading="Employee Leave Dashboard"
                links={[
                    { name: 'leave', href: '/attendance/leave' },
                    { name: 'employee', href: `/attendance/leave/employee/${id}` }
                ]}
            />
            <MainCard content={false} title="Employee Leave Dashboard">
                <Box display="flex" justifyContent="space-between" p={2}>
                    <Box width="50%">
                        <Chart
                            options={{
                                chart: {
                                    type: 'pie'
                                },
                                labels: ['Used Leaves', 'Remaining Leaves', 'Lapsed Leaves'],
                                responsive: [
                                    {
                                        breakpoint: 480,
                                        options: {
                                            chart: {
                                                width: 300
                                            },
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }
                                ]
                            }}
                            series={chartData}
                            type="pie"
                            width="400"
                        />
                    </Box>

                    {/* Side Card for Selecting Employee and Remaining Leaves */}
                    <Box width="45%" display="flex" flexDirection="column" justifyContent="center">
                        <Card variant="outlined">
                            <CardContent>
                                <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Employee Name">
                                    <InputLabel id="gender-label">Select Employee Name</InputLabel>
                                    <Select
                                        id="user_id"
                                        name="user_id"
                                        value={id}
                                        // onBlur={handleBlur}
                                        onChange={(e) => {
                                            navigate(`/attendance/leave/employee/${e.target.value}`);
                                        }}
                                        label="Select Employee"
                                        disabled={role === roles.EMPLOYEE}
                                    >
                                        {role !== roles?.EMPLOYEE ? (
                                            employee.map((emp) => (
                                                <MenuItem value={emp?.user_id} key={emp.user_id}>
                                                    {emp?.user_name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value={user?.user_id} key={user?.user_id}>
                                                {user?.user_name}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                <Box mt={2}>
                                    <Typography variant="h5" component="div">
                                        Remaining Leaves
                                    </Typography>
                                    <Typography variant="h2" component="div">
                                        {leaveStats?.remaining ?? '--'}
                                    </Typography>
                                    <Typography color="textSecondary">out of {leaveStats?.totalData ?? '--'} total leaves</Typography>
                                    <Box mt={2}>
                                        <Typography variant="h6">Sick Leaves: {leaveStats?.sick_leaves}</Typography>
                                        <Typography variant="h6">Casual Leaves: {leaveStats?.casual_leaves}</Typography>
                                        <Typography variant="h6">Earned Leaves: {leaveStats?.earned_leaves}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Leave History Section */}
                <Box mt={4} p={2}>
                    <Typography variant="h5" gutterBottom>
                        Leave History
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Leave Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>No. Of Leaves</TableCell>
                                <TableCell>Trans. Status</TableCell>
                                <TableCell>Balance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaveStats?.leaveHistory?.map((leave, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(leave?.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{leave?.leave_type}</TableCell>
                                    <TableCell>{leave?.leave_status}</TableCell>
                                    <TableCell>{leave?.trans_status === 'CREDIT' ? leave?.credit_amt : leave?.debit_amt}</TableCell>
                                    <TableCell>
                                        {leave?.trans_status === 'CREDIT' ? (
                                            <Chip label="Credit" color="success" />
                                        ) : (
                                            <Chip label="Debit" color="warning" />
                                        )}
                                    </TableCell>
                                    <TableCell>{leave?.balance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </MainCard>
        </Page>
    );
};

export default EmployeeLeaveDashboard;
