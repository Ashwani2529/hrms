import { Avatar, Checkbox, Grid, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import EventBusyTwoToneIcon from '@mui/icons-material/EventBusyTwoTone';
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const LeaveTableRow = ({
    row,
    selected,
    onSelectRow,
    index,
    detailedView,
    handleApproveLeave,
    handleRejectLeave,
    handleEdit,
    handleDelete,
    tabSelected
}) => {
    const navigate = useNavigate();
    const renderQueueContent = (
        row,
        selected,
        index,
        onSelectRow,
        detailedView,
        handleApproveLeave,
        handleRejectLeave,
        handleEdit,
        handleDelete
    ) => (
        <>
            <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }} onClick={() => onSelectRow(row.leave_id)}>
                <Checkbox
                    color="primary"
                    checked={selected.includes(row?.leave_id)}
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
                        {row?.leave_name}
                    </Typography>
                </Grid>
            </TableCell>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography
                        sx={{
                            color: (() => {
                                if (row?.leave_status === 'APPROVED') return '#3bc73b';
                                if (row?.leave_status === 'REJECTED') return '#f73a3a';
                                return '#bfbf02';
                            })(),
                            fontWeight: '900'
                        }}
                        align="left"
                        variant="subtitle1"
                        component="div"
                    >
                        {row?.leave_status}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.leave_start_date && format(new Date(row?.leave_start_date), 'd MMM yyyy h:mm a')}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.leave_end_date && format(new Date(row?.leave_end_date), 'd MMM yyyy h:mm a')}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.leave_type}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell>
                <Tooltip title="Leave Details">
                    <IconButton size="large" aria-label="more options" onClick={() => detailedView(row)}>
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="center" sx={{ pr: 3 }}>
                {row?.leave_status === 'PENDING' && (
                    <>
                        <Tooltip title="Approve">
                            <IconButton size="large" aria-label="more options" onClick={() => handleApproveLeave(row)}>
                                <FileDownloadDoneIcon color="success" sx={{ fontSize: '1.5rem' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                            <IconButton size="large" aria-label="more options" onClick={() => handleRejectLeave(row)}>
                                <EventBusyTwoToneIcon color="error" sx={{ fontSize: '1.5rem' }} />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
                <Tooltip title="Edit">
                    <IconButton size="large" aria-label="more options" onClick={() => handleEdit(row)}>
                        <EditIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton
                        size="large"
                        aria-label="more options"
                        onClick={() => {
                            handleDelete(row?.leave_id);
                        }}
                    >
                        <DeleteIcon color="error" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );
    const renderOverview = (row, navigate) => (
        <>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar src={row?.profile_photo}>{row?.user_name?.charAt(0)?.toUpperCase()}</Avatar>
                    </Grid>
                    <Grid item xs zeroMinWidth>
                        <Typography align="left" variant="subtitle1" component="div">
                            {row?.user_name}
                        </Typography>
                        <Typography align="left" variant="subtitle2" noWrap>
                            {row?.user_email}
                        </Typography>
                    </Grid>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.granted}
                    </Typography>
                </Grid>
            </TableCell>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.accepted}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.applied}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.lapsed}
                    </Typography>
                </Grid>
            </TableCell>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.current}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell>
                <Tooltip title="Overview">
                    <IconButton
                        size="large"
                        aria-label="more options"
                        onClick={() => navigate(`/attendance/leave/employee/${row?.user_id}`)}
                    >
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );
    const renderStatsContent = (row, navigate) => (
        <>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar src={row?.profile_photo}>{row?.user_name?.charAt(0)?.toUpperCase()}</Avatar>
                    </Grid>
                    <Grid item xs zeroMinWidth>
                        <Typography align="left" variant="subtitle1" component="div">
                            {row?.user_name}
                        </Typography>
                        <Typography align="left" variant="subtitle2" noWrap>
                            {row?.user_email}
                        </Typography>
                    </Grid>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.sick_leaves}
                    </Typography>
                </Grid>
            </TableCell>
            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.casual_leaves}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.compunsatory_leaves}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell sx={{ cursor: 'pointer' }}>
                <Grid container alignItems="center">
                    <Typography align="left" variant="subtitle1" component="div">
                        {row?.earned_leaves}
                    </Typography>
                </Grid>
            </TableCell>

            <TableCell>
                <Tooltip title="Leave Stats">
                    <IconButton
                        size="large"
                        aria-label="more options"
                        onClick={() => navigate(`/attendance/leave/employee/${row?.user_id}`)}
                    >
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );

    return (
        <TableRow
            hover
            role="checkbox"
            aria-checked={selected.includes(row.leave_id)}
            tabIndex={-1}
            selected={selected.includes(row.leave_id)}
        >
            {tabSelected === 'queue' &&
                renderQueueContent(
                    row,
                    selected,
                    index,
                    onSelectRow,
                    detailedView,
                    handleApproveLeave,
                    handleRejectLeave,
                    handleEdit,
                    handleDelete
                )}
            {tabSelected === 'stats' && renderStatsContent(row, navigate)}
            {tabSelected === 'viewAll' && renderOverview(row, navigate)}
        </TableRow>
    );
};

LeaveTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.array,
    onSelectRow: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    detailedView: PropTypes.func.isRequired,
    handleApproveLeave: PropTypes.func.isRequired,
    handleRejectLeave: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    tabSelected: PropTypes.oneOf(['queue', 'stats', 'viewAll']).isRequired
};

export default LeaveTableRow;
