import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    CardContent,
    Checkbox,
    Fab,
    Grid,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableContainer,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Dialog,
    Box,
    Card,
    Divider,
    Stack
} from '@mui/material';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import Page from 'ui-component/Page';
import Chip from 'ui-component/extended/Chip';
import moment from 'moment';
import { ViewAgendaTwoTone } from '@mui/icons-material';
import { IconEye, IconEyeglass } from '@tabler/icons';
import { PayrollActions } from 'store/slices/payroll';
import { useSelector, dispatch } from 'store';
import { gridSpacing } from 'store/constant';
import SkeletonSalaryStructureHistory from 'ui-component/skeleton/SkeletonSalaryStructureHistory';
import Edit from '@mui/icons-material/Edit';

const tableHead = [
    {
        id: 'id',
        title: '#',
        sx: {},
        align: 'left'
    },
    {
        id: 'payroll_frequency',
        title: 'Payroll Frequency',
        sx: {},
        align: 'left'
    },
    // {
    //     id: 'status',
    //     title: 'Status',
    //     sx: {},
    //     align: 'left'
    // },
    {
        id: 'baseSalaryAmount',
        title: 'Base Salary Amount',
        sx: {},
        align: 'left'
    },
    {
        id: 'incentives',
        title: 'Incentives',
        sx: {},
        align: 'left'
    },
    {
        id: 'currentType',
        title: 'Currency Type',
        sx: {},
        align: 'left'
    },
    {
        id: 'status',
        title: 'Status',
        sx: {},
        align: 'left'
    },

    {
        id: 'startDate',
        title: 'Start Date',
        sx: {},
        align: 'left'
    },
    {
        id: 'endDate',
        title: 'End Date',
        sx: {},
        align: 'left'
    },
    {
        id: 'actions',
        title: 'Actions',
        sx: {},
        align: 'left'
    }
];

function GetStatusChip({ status }) {
    switch (status) {
        case true:
            return <Chip chipcolor="success" label="PAID" />;
        case false:
            return <Chip chipcolor="error" label="UNPAID" />;

        default:
            return <></>;
    }
}

function SalaryStructureHistory() {
    const { id: payrollId } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        page: 1,
        limit: 25,
        startDate: '',
        endDate: ''
    });
    const { fetchSalaryStructureHistory } = PayrollActions;
    const { loading, salaryStructureHistory } = useSelector((state) => state.payroll);
    const { totalSalaryStructure = 0, salaryStructure = {} } = salaryStructureHistory;

    const handleDateRangeChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const onChangePage = (_, page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const onChangeRowsPerPage = (_, e) => {
        setFilters((prev) => ({ ...prev, limit: e.props.value }));
    };

    const handleViewSalaryStructure = (row) => {
        navigate(`/payroll/salary/view/${row?.salary_id}`);
    };

    const handleEdit = (row) => {
        console.log({ row });
        navigate(`/payroll/salary/history/edit/${row?.salary_id}`);
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 25,
            startDate: '',
            endDate: ''
        });
    };

    useEffect(() => {
        dispatch(fetchSalaryStructureHistory({ payrollId, filters }));
    }, [filters, payrollId]);

    return (
        <Page title="Salary Structure: History">
            <Breadcrumbs
                heading="Salary Structure History"
                links={[{ name: 'payroll', href: '/payroll/list' }, { name: 'Salary Structure History' }]}
            />
            <MainCard title="Salary Structure History" content={false}>
                <CardContent>
                    <Grid container xs={12} md={12} justifyContent="space-between" spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <Grid container xs={12} md={12} spacing={gridSpacing} justifyContent="flex-start" alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        name="startDate"
                                        size="small"
                                        fullWidth
                                        type="date"
                                        label="Start Date"
                                        value={filters.startDate === '' ? '-' : filters.startDate}
                                        onChange={handleDateRangeChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        name="endDate"
                                        size="small"
                                        fullWidth
                                        type="date"
                                        label="End Date"
                                        value={filters.endDate === '' ? '-' : filters.endDate}
                                        onChange={handleDateRangeChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container xs={12} md={12} justifyContent="flex-end" alignItems="flex-end">
                                <Grid item>
                                    <Button variant="outlined" onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
                <TableContainer sx={{ p: 1 }}>
                    <Divider />
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead>
                            {tableHead.map((head) => (
                                <TableCell key={head.id} sx={head.sx} align={head.align}>
                                    {head.title}
                                </TableCell>
                            ))}
                        </TableHead>
                        {loading ? (
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((ele, index) => (
                                    <SkeletonSalaryStructureHistory key={index} />
                                ))}
                            </TableBody>
                        ) : (
                            <TableBody>
                                {Array.isArray(salaryStructure) &&
                                    salaryStructure?.map((row, index) => (
                                        <TableRow key={row.salary_id}>
                                            <TableCell>
                                                <Typography>{index + 1}.</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>{row?.base_salary_type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>{row?.base_salary_amount}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>{Array.isArray(row?.incentive) ? row?.incentive[0]?.amount : '-'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>{row?.currency_type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <GetStatusChip status={row?.generated_salary_slip} />
                                            </TableCell>

                                            <TableCell>
                                                <Typography>{moment(row?.from_date).format('ddd, MMM DD YYYY')}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>
                                                    {row?.end_date ? moment(row.end_date).format('ddd, MMM DD YYYY') : '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    {!row?.generated_salary_slip && (
                                                        <Tooltip title="Edit">
                                                            <IconButton onClick={() => handleEdit(row)}>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="View">
                                                        <IconButton onClick={() => handleViewSalaryStructure(row)}>
                                                            <IconEye />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        )}
                    </Table>
                    <TablePagination
                        size="small"
                        rowsPerPageOptions={[25, 50, 100]}
                        component="div"
                        count={totalSalaryStructure || 0}
                        rowsPerPage={filters.limit}
                        page={filters.page - 1}
                        onPageChange={onChangePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                    />
                </TableContainer>
            </MainCard>
        </Page>
    );
}

export default SalaryStructureHistory;
