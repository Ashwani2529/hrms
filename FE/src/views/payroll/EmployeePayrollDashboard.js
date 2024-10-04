import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainCard from '../attendance/leave/MainCard';
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
import { useDispatch, useSelector } from 'react-redux';
import { PayrollActions } from 'store/slices/payroll';
import { EmployeeActions } from 'store/slices/employee';
import useAuth from 'hooks/useAuth';
import { roles } from 'store/constant';

const EmployeePayrollDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { role, user } = useAuth();

    const { fetchPayrolls, fetchPayrollId, fetchUserPayrollData } = PayrollActions;
    const { fetchEmployees } = EmployeeActions;
    const { totalData, payroll, UserPayrollData } = useSelector((state) => state.payroll);
    const { employee } = useSelector((state) => state.employee);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUserPayrollData(id));
        dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
    }, [id]);

    return (
        <Page title="Employee: Salary Revision">
            <Breadcrumbs heading="Salary Revision Dashboard" links={[{ name: 'payroll', href: `/payroll/salary-revision/${id}` }]} />
            <MainCard content={false} title="Salary Revision Dashboard">
                <Box mt={2} p={2}>
                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Employee Name">
                        <InputLabel id="employee-label">Employee Name</InputLabel>
                        <Select
                            id="user_id"
                            name="user_id"
                            value={id}
                            onChange={(e) => {
                                navigate(`/payroll/salary-revision/${e.target.value}`);
                            }}
                            label="Select Employee"
                            disabled={role === roles.EMPLOYEE}
                        >
                            {role !== roles.EMPLOYEE ? (
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
                </Box>
                <Box p={2}>
                    <Typography variant="h5" gutterBottom>
                        Salary Revision
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Last Revision</TableCell>
                                <TableCell>Median Revision Period</TableCell>
                                <TableCell>Max Revision Period</TableCell>
                                <TableCell>Effective Date</TableCell>
                                <TableCell>Payout Month</TableCell>
                                <TableCell>MONTHLY CTC</TableCell>
                                <TableCell>Designation</TableCell>
                                <TableCell>Department</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                {/* <TableCell>{new Date(pay?.createdAt).toLocaleDateString()}</TableCell> */}
                                <TableCell>{UserPayrollData?.user?.user_name}</TableCell>
                                <TableCell>9</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>3</TableCell>
                                <TableCell>6</TableCell>
                                <TableCell>3</TableCell>
                                <TableCell>{UserPayrollData?.user?.role?.role_name}</TableCell>
                                <TableCell>{UserPayrollData?.user?.department}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            </MainCard>
        </Page>
    );
};

export default EmployeePayrollDashboard;
