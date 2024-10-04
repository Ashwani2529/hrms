/* eslint-disable */
import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import { Box, Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Toolbar, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { LoadingButton } from '@mui/lab';
import { PayrollActions } from 'store/slices/payroll';

// project imports
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

// import { useDispatch, useSelector } from 'store';

// assets

// table header options
const headCells = [
    {
        id: 'user_name',
        numeric: false,
        label: 'Employee Profile',
        align: 'left'
    },
    {
        id: 'payroll_status',
        numeric: false,
        label: 'Payroll Status',
        align: 'left'
    },
    {
        id: 'payroll_frequency',
        numeric: false,
        label: 'Payroll Frequency',
        align: 'left'
    },
    {
        id: 'payroll_start',
        numeric: false,
        label: 'Payroll Start',
        align: 'left'
    },
    {
        id: 'incentives',
        numeric: true,
        label: 'Incentives',
        align: 'left'
    }
    // {
    //     id: 'generate_payroll',
    //     numeric: false,
    //     label: 'Generate Payroll',
    //     align: 'left'
    // },
    // {
    //     id: 'pay_slip',
    //     numeric: false,
    //     label: 'Pay Slip',
    //     align: 'left'
    // },
    // {
    //     id: 'send_slip',
    //     numeric: false,
    //     label: 'Send Slip',
    //     align: 'left'
    // }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onSort, theme, selected, setSelected }) {
    const { generateEmployeePayroll } = PayrollActions;
    const handleGeneratePayroll = async () => {
        const response = await dispatch(generateEmployeePayroll(selected));
        if (response?.payload?.status !== 200) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: response?.payload?.message || 'Internal server error',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Payroll generated successfully.',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
        }
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 3, pr: 2 }}>
                    <Checkbox
                        color="primary"
                        // indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={(event) => onSelectAllClick(event.target.checked)}
                        inputProps={{
                            'aria-label': 'select all desserts'
                        }}
                    />
                </TableCell>
                {numSelected > 0 && (
                    <TableCell padding="none" colSpan={7}>
                        <Toolbar
                            sx={{
                                p: 0,
                                pl: 1,
                                pr: 1,
                                ...(numSelected > 0 && {
                                    color: (theme) => theme.palette.secondary.main
                                })
                            }}
                        >
                            {numSelected > 0 ? (
                                <Typography color="#462F4D" variant="h4">
                                    {numSelected} Selected
                                </Typography>
                            ) : (
                                <Typography variant="h6" id="tableTitle">
                                    Nutrition
                                </Typography>
                            )}
                            <Box sx={{ flexGrow: 1 }} />
                            {numSelected > 0 && (
                                <>
                                    {/* <Tooltip title="Notify">
                                        <Button onClick={() => setOpenDialog(true)} size='small' variant="contained" sx={{ marginRight: "8px" }}>
                                            Notify
                                        </Button>
                                    </Tooltip> */}
                                    <LoadingButton
                                        variant="contained"
                                        size="small"
                                        sx={{ whiteSpace: 'nowrap' }}
                                        onClick={handleGeneratePayroll}
                                    >
                                        Generate Payrolls
                                    </LoadingButton>
                                </>
                            )}
                        </Toolbar>
                        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
                    </TableCell>
                )}
                {numSelected <= 0 &&
                    headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.align}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            {onSort ? (
                                <TableSortLabel
                                    hideSortIcon
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={() => onSort(headCell.id)}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {headCell.label}

                                    {orderBy === headCell.id ? (
                                        <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                                    ) : null}
                                </TableSortLabel>
                            ) : (
                                headCell.label
                            )}
                        </TableCell>
                    ))}
                {numSelected <= 0 && (
                    <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                        <Typography variant="subtitle1" sx={{ color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.900' }}>
                            Action
                        </Typography>
                    </TableCell>
                )}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    theme: PropTypes.object,
    selected: PropTypes.array,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

export default EnhancedTableHead;
