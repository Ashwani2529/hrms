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
import { openSnackbar } from 'store/slices/snackbar';
import { dispatch } from 'store';
import { LeaveActions } from 'store/slices/leave';

// assets
import DeleteIcon from '@mui/icons-material/Delete';
import { HolidayActions } from 'store/slices/holiday';
import { openConfirmationModal } from 'store/slices/confirmationModal';

// table header options
const headCells = [
    {
        id: 'holiday_name',
        numeric: false,
        label: 'Name',
        align: 'left'
    },
    {
        id: 'holiday_type',
        numeric: false,
        label: 'Holiday Type',
        align: 'left'
    },
    {
        id: 'weekdays',
        numeric: false,
        label: 'Week Days',
        align: 'left'
    },
    {
        id: 'holiday_date',
        numeric: false,
        label: 'Start Date',
        align: 'left'
    },
    {
        id: 'end_date',
        numeric: false,
        label: 'End Date',
        align: 'left'
    },
    {
        id: 'employees',
        numeric: false,
        label: 'Total Employees',
        align: 'left'
    },
    {
        id: 'edit',
        numeric: false,
        label: 'Actions',
        align: 'left'
    }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount, theme, selected, setSelected }) {
    const { deleteHoliday } = HolidayActions;
    const handleDelete = async () => {
        const object = {
            holidays: selected
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const response = await dispatch(deleteHoliday(object));
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
                                message: 'Holiday(s) deleted successfully.',
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
                {headCells.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.align} padding={headCell.disablePadding ? 'none' : 'normal'}>
                        {headCell.label}
                    </TableCell>
                ))}
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

    rowCount: PropTypes.number.isRequired
};

export default EnhancedTableHead;
