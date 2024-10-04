import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import moment from 'moment';
import React, { useState } from 'react';

const headCells = [
    {
        id: 'shift_code',
        numeric: false,
        label: 'Shift Code',
        align: 'left'
    },
    {
        id: 'shift_name',
        numeric: false,
        label: 'Shift Name',
        align: 'left'
    },
    {
        id: 'client_name',
        numeric: false,
        label: 'Client',
        align: 'left'
    },
    {
        id: 'shift_color',
        numeric: false,
        label: 'Color',
        align: 'left'
    },
    {
        id: 'start_time',
        numeric: false,
        label: 'Start Time',
        align: 'left'
    },
    {
        id: 'end_time',
        numeric: false,
        label: 'End Time',
        align: 'left'
    }
];

const ShiftLegends = ({ data, clients }) => {
    console.log(data);

    return (
        <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                <TableHead>
                    <TableRow>
                        {headCells?.map((headCell) => (
                            <TableCell key={headCell.id} align={headCell.align} padding={headCell.disablePadding ? 'none' : 'normal'}>
                                {headCell.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data?.map((e) => (
                        <TableRow key={e?.shift_id}>
                            <TableCell>{e?.sno}</TableCell>
                            <TableCell>{e?.shift_name}</TableCell>
                            <TableCell>{clients?.find((client) => client?.client_id === e?.client_id)?.client_name ?? '--'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={e?.shift_color}
                                    size="small"
                                    sx={{
                                        background: e?.shift_color,
                                        color: 'white'
                                    }}
                                />
                            </TableCell>
                            <TableCell>{moment(e?.start_time).format('hh:mm a')}</TableCell>
                            <TableCell>{moment(e?.end_time).format('hh:mm a')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ShiftLegends;
