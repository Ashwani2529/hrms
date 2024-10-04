/* eslint-disable */
import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    CardContent,
    Checkbox,
    Fab,
    Grid,
    Chip,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Button,
    Toolbar,
    Tooltip,
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import { dispatch } from 'store';
import { AttendanceActions } from 'store/slices/attendance';
import { openSnackbar } from 'store/slices/snackbar';

// import { useDispatch, useSelector } from 'store';

// assets
import DeleteIcon from '@mui/icons-material/Delete';

// import { getUsersListStyle1 } from 'store/slices/user';
// import { setEmployees, deleteEmployeeData } from 'store/slices/customer';

// import Avatar from 'ui-component/extended/Avatar';

import { useNavigate } from 'react-router-dom';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import useAuth from 'hooks/useAuth';
import { roles } from 'store/constant';
// import { openSnackbar } from 'store/slices/snackbar';

// table header options
const headCells = [
    {
        id: 'user_name',
        numeric: false,
        label: 'Employee Profile',
        align: 'left'
    },
    {
        id: 'attendance_date',
        numeric: false,
        label: 'Attendance date',
        align: 'left'
    },
    {
        id: 'status',
        numeric: false,
        label: 'Status',
        align: 'left'
    },
    {
        id: 'shift_name',
        numeric: false,
        label: 'Shift Name',
        align: 'left'
    },
    // {
    //     id: 'leave_end_date',
    //     numeric: false,
    //     label: 'End date',
    //     align: 'left'
    // },
    // {
    //     id: 'leave_type',
    //     numeric: false,
    //     label: 'Leave type',
    //     align: 'left'
    // },
    {
        id: 'time_spent',
        numeric: false,
        label: 'Time Spent',
        align: 'left'
    }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onSort, theme, selected, setSelected }) {
    const { deleteAttendance } = AttendanceActions;
    const { role } = useAuth();

    const handleDelete = async (event) => {
        const object = {
            attendances: selected
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const response = await dispatch(deleteAttendance(object));
                    if (response?.payload?.status != 201) {
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
                        setSelected([]);
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Attendance(s) deleted successfully.',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
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
                                    <Tooltip title="Delete">
                                        <IconButton size="large" onClick={(event) => handleDelete(event)}>
                                            <DeleteIcon color="error" fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
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
                {numSelected <= 0 && role !== roles.EMPLOYEE && (
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
