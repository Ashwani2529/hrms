import React from 'react';
import { Box, TableCell, TableHead, TableRow } from '@mui/material';

const tableHead = [
    {
        id: 'index',
        title: '#',
        sx: {},
        align: 'left'
    },
    {
        id: 'Start Date',
        title: 'Start Date',
        sx: {},
        align: 'left'
    },
    {
        id: 'End Date',
        title: 'End Date',
        sx: {},
        align: 'left'
    },
    {
        id: 'overtime',
        title: 'Overtime',
        sx: {},
        align: 'left'
    },
    {
        id: 'shifts',
        title: 'Standard Shifts',
        sx: {},
        align: 'left'
    },
    {
        id: 'halfday',
        title: 'Min Halfday Working',
        sx: {},
        align: 'left'
    },
    {
        id: 'base_salary_type',
        title: 'Base Salary Type',
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

function CompanyDetailsTableHead() {
    return (
        <TableHead sx={{ width: '100%' }}>
            {tableHead?.map((head) => (
                <TableCell key={head.id} sx={head.sx} align={head.align}>
                    {head.title}
                </TableCell>
            ))}
        </TableHead>
    );
}

export default CompanyDetailsTableHead;
