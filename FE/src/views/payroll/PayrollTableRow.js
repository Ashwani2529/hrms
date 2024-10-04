import { Avatar, IconButton, TableCell, TableRow, Tooltip, Typography, Grid } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';

const PayrollTableRow = ({ row, selected, onSelectRow, index, detailedView, tabSelected }) => {
    const navigate = useNavigate();
    const renderPayrollData = (row, navigate) => (
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
            <TableCell>
                <Tooltip title="Details">
                    <IconButton size="large" aria-label="more options" onClick={() => navigate(`/payroll/salary-revision/${row?.user_id}`)}>
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );

    const renderReimbursementData = (row, navigate) => (
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
            <TableCell>
                <Tooltip title="Reimbursement Type">
                    <Typography align="left" variant="subtitle2" noWrap>
                        {row?.reimbursement_type}
                    </Typography>
                </Tooltip>
            </TableCell>
            <TableCell>
                <Tooltip title="Details">
                    <IconButton size="large" aria-label="more options" onClick={() => navigate(`/payroll/salary-revision/${row?.user_id}`)}>
                        <ArticleIcon color="primary" sx={{ fontSize: '1.3rem', alignItems: 'center' }} />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </>
    );

    return (
        <TableRow
            hover
            role="checkbox"
            aria-checked={selected.includes(row?.user_id)}
            tabIndex={-1}
            selected={selected.includes(row?.user_id)}
        >
            {tabSelected === 'salary-revision' && renderPayrollData(row, navigate)}
            {tabSelected === 'reimbursement' && renderReimbursementData(row, navigate)}
        </TableRow>
    );
};

PayrollTableRow.propTypes = {
    row: PropTypes.object.isRequired,
    selected: PropTypes.array.isRequired,
    onSelectRow: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    detailedView: PropTypes.func.isRequired,
    tabSelected: PropTypes.oneOf(['salary-revision', 'reimbursement']).isRequired
};

export default PayrollTableRow;
