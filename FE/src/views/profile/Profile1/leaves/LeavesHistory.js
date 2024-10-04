import React from 'react';
import {
    Box,
    TableContainer,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Table,
    Typography,
    Card,
    Button,
    TablePagination
} from '@mui/material';
import LeavesToolbar from './LeavesToolbar';
import { LeaveTypes } from 'store/constant';
import moment from 'moment';
import Chip from 'ui-component/extended/Chip';
import LeavesSummary from 'views/attendance/leave/LeavesSummary';

const tableData = [
    {
        name: 'Test Leave',
        type: LeaveTypes.CASUAL,
        status: 'PENDING',
        startDate: moment().toLocaleString(),
        endDate: moment().toLocaleString()
    },
    {
        name: 'Test Leave',
        type: LeaveTypes.CASUAL,
        status: 'APPROVED',
        startDate: moment().toLocaleString(),
        endDate: moment().toLocaleString()
    },
    {
        name: 'Test Leave',
        type: LeaveTypes.CASUAL,
        status: 'PENDING',
        startDate: moment().toLocaleString(),
        endDate: moment().toLocaleString()
    },
    {
        name: 'Test Leave',
        type: LeaveTypes.CASUAL,
        status: 'REJECTED',
        startDate: moment().toLocaleString(),
        endDate: moment().toLocaleString()
    },
    {
        name: 'Test Leave',
        type: LeaveTypes.CASUAL,
        status: 'PENDING',
        startDate: moment().toLocaleString(),
        endDate: moment().toLocaleString()
    }
];

function GetStatusChip({ status }) {
    switch (status) {
        case 'PENDING':
            return <Chip chipcolor="warning" variant="filled" label={status} />;
        case 'APPROVED':
            return <Chip chipcolor="success" variant="filled" label={status} />;
        case 'REJECTED':
            return <Chip chipcolor="error" variant="filled" label={status} />;

        default:
            return <></>;
    }
}

function LeavesHistory() {
    return (
        <Box>
            <LeavesSummary />

            <Box mb={3} mt={5}>
                <LeavesToolbar />
            </Box>

            <Card variant="outlined">
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableCell>Leave Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="center">Details</TableCell>
                        </TableHead>
                        <TableBody>
                            {tableData?.map((data, index) => (
                                <TableRow key={data.name + index}>
                                    <TableCell>
                                        <Typography>{data?.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>{data?.type}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <GetStatusChip status={data?.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography>{data?.startDate}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>{data?.endDate}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button variant="outlined">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination size="small" rowsPerPageOptions={[25, 50, 100]} component="div" count={0} rowsPerPage={25} page={1} />
                </TableContainer>
            </Card>
        </Box>
    );
}

export default LeavesHistory;
