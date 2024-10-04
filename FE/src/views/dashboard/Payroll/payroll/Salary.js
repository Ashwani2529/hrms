import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { styled, alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import MainCard from './MainCard';
import useAuth from 'hooks/useAuth';
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
    Typography,
    Tooltip,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Page from 'ui-component/Page';
import { PayrollActions } from 'store/slices/payroll';
import { EmployeeActions } from 'store/slices/employee';
import { useDispatch, useSelector } from 'react-redux';
import { roles } from 'store/constant';
import UpdateSalary from './UpdateSalary';

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
        padding: theme.spacing(0.5, 1),
        margin: theme.spacing(0.2, 0)
    },
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3
        }
    },
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
    }
}));

function ExpandIcon(props) {
    return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function CollapseIcon(props) {
    return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function EndIcon(props) {
    return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

function Salary() {
    const { role, user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [heading, setHeading] = useState('Detailed Salary');
    const { fetchUserPayrollData } = PayrollActions;
    const dispatch = useDispatch();
    const { UserPayrollData } = useSelector((state) => state.payroll);
    const { fetchEmployees } = EmployeeActions;
    const { employee } = useSelector((state) => state.employee);
    const [pay, setPay] = useState({});
    const [constantValue, setConstantValue] = useState('N/A');
    const [openDialog, setOpenDialog] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [arrayPay, setArrayPay] = useState({
        deduction: 0,
        incentive: 0,
        earning: 0,
        allowance: 0,
        performance: 0,
        performanceBonus: 0,
        healthInsurance: 0,
        incomeTax: 0
    });
    function handleItemClick(heading, value) {
        setHeading(heading);
        setConstantValue(value);
    }
    useEffect(() => {
        dispatch(fetchUserPayrollData(id));
        dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
    }, [dispatch, id]);
    function calculateTotal(arr) {
        return arr ? arr.reduce((acc, curr) => acc + (curr.amount ?? 0), 0) : 0;
    }

    useEffect(() => {
        if (UserPayrollData && UserPayrollData.salary) {
            setPay(UserPayrollData);
            const deduction = calculateTotal(UserPayrollData.salary.deduction);
            const incentive = calculateTotal(UserPayrollData.salary.incentive);
            const earning = calculateTotal(UserPayrollData.salary.earnings);

            const findAmount = (arr, name) => {
                if (!arr) return 0;
                const item = arr.find((item) => item.name === name);
                return item ? item.amount ?? 0 : 0;
            };

            const allowance = findAmount(UserPayrollData.salary.earnings, 'Allowance');
            const performance = findAmount(UserPayrollData.salary.earnings, 'Performance');
            const performanceBonus = findAmount(UserPayrollData.salary.incentive, 'Performance Bonus');
            const healthInsurance = findAmount(UserPayrollData.salary.deduction, 'Health Insurance');
            const incomeTax = findAmount(UserPayrollData.salary.deduction, 'Income Tax');

            setArrayPay({
                deduction,
                incentive,
                earning,
                allowance: allowance ?? 0,
                performance: performance ?? 0,
                performanceBonus: performanceBonus ?? 0,
                healthInsurance: healthInsurance ?? 0,
                incomeTax: incomeTax ?? 0
            });
        }
    }, [UserPayrollData, UserPayrollData.salary, UserPayrollData.paySlip, UserPayrollData?.user, id]);

    const treeData = [
        {
            label: 'Employee Details',
            itemId: 'employeeDetails',
            value: 'N/A',
            children: [
                { label: 'Name', itemId: 'name', value: `${user?.user_name ?? 'N/A'}` },
                { label: 'Employee ID', itemId: 'employeeId', value: `${user?.user_id ?? 'N/A'}` }
            ]
        },
        {
            label: 'Attendance',
            itemId: 'attendance',
            value: 'N/A',
            children: [
                { label: 'Month Days', itemId: 'monthDays', value: 'N/A' },
                { label: 'Present Days', itemId: 'presentDays', value: `${UserPayrollData?.paySlip?.working_days ?? 'N/A'}` }
            ]
        },
        {
            label: 'Salary Components',
            itemId: 'salaryComponents',
            value: 'N/A',
            children: [
                { label: 'Basic', itemId: 'basic', value: `${pay?.salary?.base_salary_amount ?? 'N/A'}` },
                { label: 'HRA', itemId: 'hra', value: 'N/A' },
                { label: 'LTA', itemId: 'lta', value: 'N/A' },
                {
                    label: 'Total Incentive',
                    itemId: 'statuaryBonus',
                    value: `${UserPayrollData?.paySlip?.salary_slip_total_incentive ?? 'N/A'}`
                },
                { label: 'Medical', itemId: 'medical', value: `${arrayPay?.healthInsurance ?? 0}` },
                { label: 'Allowance', itemId: 'specialAllowance', value: `${arrayPay?.allowance ?? 0}` }
            ]
        },
        {
            label: 'Total Earnings',
            itemId: 'totalEarnings',
            value: `${UserPayrollData?.paySlip?.salary_slip_total_earning ?? 'N/A'}`,
            children: [
                { label: 'Performance', itemId: 'totalGross', value: `${arrayPay?.performance ?? 0}` },
                { label: 'Overtime Incentive', itemId: 'overtimeIncentive', value: `${pay?.salary?.ot_hours_amount ?? 'N/A'}` },
                { label: 'Leave Encashment', itemId: 'leaveEncashment', value: `${pay?.salary?.paid_leave_encashment ?? 'N/A'}` },
                { label: 'Performance Bonus', itemId: 'nhPayout', value: `${arrayPay?.performanceBonus ?? 0}` }
            ]
        },
        {
            label: 'Deductions',
            itemId: 'deductions',
            value: `${UserPayrollData?.paySlip?.salary_slip_total_deduction ?? 'N/A'}`,
            children: [{ label: 'Income Tax', itemId: 'advanceDeduction', value: `${arrayPay?.incomeTax ?? 0}` }]
        },
        { label: 'Extra Tax', itemId: 'totalExtra', value: 'N/A' }
    ];
    const handleEdit = (row) => {
        setSelectedRow(row);
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        // setSelectedEmployee(null);
    };
    //  export const Data=treeData;
    const renderTree = (nodes) =>
        nodes.map((node) => (
            <CustomTreeItem
                key={node.itemId}
                onClick={() => handleItemClick(node.label, node.value)}
                itemId={node.itemId}
                label={node.label}
            >
                {node.children && renderTree(node.children)}
            </CustomTreeItem>
        ));
    return (
        <Page title="Employee: Salary">
            <Breadcrumbs heading="Salary Dashboard" links={[{ name: 'payroll', href: `/payroll/salary/${id}` }]} />
            <MainCard content={false} title="Salary Dashboard">
                <Box mt={2} p={2}>
                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Employee Name">
                        <InputLabel id="employee-label">Employee Name</InputLabel>
                        <Select
                            id="user_id"
                            name="user_id"
                            value={id}
                            onChange={(e) => {
                                navigate(`/payroll/salary/${e.target.value}`);
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

                <Box sx={{ width: '100%', bgcolor: 'background.paper', display: 'flex' }}>
                    <Box mt={2} p={2} sx={{ width: '50%' }}>
                        <SimpleTreeView
                            aria-label="customized"
                            defaultExpandedItems={['employeeDetails', 'deductions']}
                            slots={{
                                expandIcon: ExpandIcon,
                                collapseIcon: CollapseIcon,
                                endIcon: EndIcon
                            }}
                            sx={{ overflowX: 'hidden', minHeight: 270, flexGrow: 1, maxWidth: 400 }}
                        >
                            {renderTree(treeData)}
                        </SimpleTreeView>
                    </Box>

                    <Box p={2} sx={{ width: '50%', position: 'fixed', marginLeft: '28%' }}>
                        <Box display="flex" justifyContent="flex-end" marginRight="4%">
                            <Tooltip title="Edit">
                                <IconButton size="large" aria-label="more options" onClick={() => handleEdit()}>
                                    <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="h5" gutterBottom>
                            {heading}
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Designation</TableCell>
                                    <TableCell>Data</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{UserPayrollData?.user?.user_name}</TableCell>
                                    <TableCell>{UserPayrollData?.user?.user_email}</TableCell>
                                    <TableCell>{UserPayrollData?.user?.role?.role_name}</TableCell>
                                    <TableCell>{constantValue}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                    <UpdateSalary openDialog={openDialog} handleCloseDialog={handleCloseDialog} />
                </Box>
            </MainCard>
        </Page>
    );
}

export default Salary;
