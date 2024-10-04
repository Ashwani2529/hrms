import React from 'react';
import { TableRow, TableCell, TableHead } from '@mui/material';

const tableHead = [
    {
        id: 'id',
        title: '#',
        sx: {},
        align: 'left'
    },
    {
        id: 'title',
        title: 'Title',
        sx: {},
        align: 'left'
    },
    {
        id: 'desc',
        title: 'Description',
        sx: {},
        align: 'left'
    },
    {
        id: 'varNo',
        title: 'Variables',
        sx: {},
        align: 'left'
    },
    {
        id: 'action',
        title: 'Actions',
        sx: {},
        align: 'left'
    }
];

function TemplateTableHeader() {
    return (
        <TableHead>
            {tableHead.map((ele) => (
                <TableCell key={ele.id} align={ele.align} sx={ele.sx}>
                    {ele.title}
                </TableCell>
            ))}
        </TableHead>
    );
}

export default TemplateTableHeader;
