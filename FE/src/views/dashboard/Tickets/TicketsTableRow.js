/* eslint-disable */
import * as React from 'react';

// material-ui
import {
    Checkbox,
    Grid,
    Chip,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';

import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';

// hooks

// assets
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import EventBusyTwoToneIcon from '@mui/icons-material/EventBusyTwoTone';

import { DOCUMENT_STATUS, REQUEST_TYPE, roles, TIKCET_TYPE } from 'store/constant';


function TicketTableRow({ row, index, selected, onSelectRow, detailedView, handleApproveTicket, handleRejectTicket, handleEdit, handleDelete }) {

    const {role} = useAuth()

    return (
        <TableRow
            hover
            role="checkbox"
            aria-checked={selected?.includes(row?.ticket_id)}
            tabIndex={-1}
            key={index}
            selected={selected?.includes(row?.ticket_id)}
        >
            <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row?.ticket_id)}>
                <Checkbox
                    color="primary"
                    checked={selected?.includes(row?.ticket_id)}
                    inputProps={{
                        'aria-labelledby': `enhanced-table-checkbox-${index}`
                    }}
                />
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar src={row?.user?.profile_photo}>{row?.user?.user_name?.charAt(0)?.toUpperCase()}</Avatar>
                    </Grid>
                    <Grid item xs zeroMinWidth>
                        <Typography align="left" variant="subtitle1" component="div">
                            {row?.user?.user_name}
                        </Typography>
                        <Typography align="left" variant="subtitle2" noWrap>
                            {row?.user?.user_email}
                        </Typography>
                    </Grid>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.ticket_title}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography
                        sx={{
                            color: `${
                                row?.ticket_status === 'APPROVED' ? '#3bc73b' : row?.ticket_status === 'REJECTED' ? '#f73a3a' : '#bfbf02'
                            }`,
                            fontWeight: '900'
                        }}
                        align="left"
                        variant="subtitle1"
                        component="div"
                    >
                        {row?.ticket_status}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {TIKCET_TYPE[row?.ticket_type]}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {format(new Date(row?.ticket_date), 'd MMM yyyy')}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell>
                <Tooltip title="Ticket Details">
                    <IconButton size="large" aria-label="more options" onClick={() => detailedView(row)}>
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="center" sx={{ pr: 3 }}>
                {row?.ticket_status === 'PENDING' && role !== roles.EMPLOYEE && (
                    <Tooltip title={'Approve'}>
                        <IconButton size="large" aria-label="more options" onClick={() => handleApproveTicket(row)}>
                            <FileDownloadDoneIcon color="success" sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                )}
                {row?.ticket_status === 'PENDING' && role !== roles.EMPLOYEE && (
                    <Tooltip title={'Reject'}>
                        <IconButton size="large" aria-label="more options" onClick={() => handleRejectTicket(row)}>
                            <EventBusyTwoToneIcon color="error" sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                )}

                 {row?.ticket_status === 'PENDING' && (<Tooltip title="Edit">
                    <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                        <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>)}
                
                {!(row?.ticket_status === 'PENDING' && role === roles.EMPLOYEE) && <Tooltip title="Delete">
                    <IconButton
                        size="large"
                        aria-label="more options"
                        onClick={() => {
                            handleDelete(row?.ticket_id);
                        }}
                    >
                        <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>}
            </TableCell>
        </TableRow>
    );
}

export default TicketTableRow;
