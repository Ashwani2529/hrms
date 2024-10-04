import React from 'react';
import { TableHead, TableCell } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { roles } from 'store/constant';

const tableHead = [
    {
        id: '#',
        title: '#',
        sx: {},
        align: 'left'
    },
    {
        id: 'document_name',
        title: 'Document Name',
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
        id: 'recepient',
        title: 'Recepient',
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
        id: 'view',
        title: 'View',
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

function DocumentsTableHead() {
    const { role } = useAuth();

    return (
        <TableHead>
            {tableHead.map((ele) => {
                if (ele?.id === 'action' && role === roles.EMPLOYEE) {
                    return null;
                }
                return (
                    <TableCell key={ele.id} sx={ele.sx} align={ele.align}>
                        {ele.title}
                    </TableCell>
                );
            })}
        </TableHead>
    );
}

export default DocumentsTableHead;
