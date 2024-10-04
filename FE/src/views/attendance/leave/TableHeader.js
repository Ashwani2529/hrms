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
import { openConfirmationModal } from 'store/slices/confirmationModal';


// table header options
const headCellsQueue = [

    {
        id: 'user_name',
        numeric: false,
        label: 'Employee Profile',
        align: 'left'
    },
    {
        id: 'leave_name',
        numeric: false,
        label: 'Leave Name',
        align: 'left'
    },
    {
        id: 'leave_status',
        numeric: false,
        label: 'Leave Status',
        align: 'left'
    },
    {
        id: 'leave_start_date',
        numeric: false,
        label: 'Start date',
        align: 'left'
    },
    {
        id: 'leave_end_date',
        numeric: false,
        label: 'End date',
        align: 'left'
    },
    {
        id: 'leave_type',
        numeric: false,
        label: 'Leave type',
        align: 'left'
    },
    {
        id: 'details',
        numeric: false,
        label: 'Details',
        align: 'left'
    },

];

const headCellsStats = [

    {
        id: 'user_name',
        numeric: false,
        label: 'Employee Profile',
        align: 'left'
    },
    {
        id: 'sick_leave',
        numeric: false,
        label: 'Sick Leave',
        align: 'left'
    },
    {
        id: 'Casual_leave',
        numeric: false,
        label: 'Casual Leave',
        align: 'left'
    },
    {
        id: 'complementary_leave',
        numeric: false,
        label: 'Complementary Leave',
        align: 'left'
    },
    {
        id: 'earned_leave',
        numeric: false,
        label: 'Earned Leave',
        align: 'left'
    },
    {
        id: 'stats',
        numeric: false,
        label: 'View Stats',
        align: 'left'
    },

];

const overviewCells=[
    {
        id: 'user_name',
        numeric: false,
        label: 'Employee Profile',
        align: 'left'
    },
    {
        id:'granted',
        numeric: false,
        label: 'Granted',
        align: 'left'
    },
    {
        id:'availed',
        numeric: false,
        label: 'Availed',
        align: 'left'
    },
    {
        id:'applied',
        numeric: false,
        label: 'Applied',
        align: 'left'
    },
    {
        id:'lapsed',
        numeric: false,
        label: 'Lapsed',
        align: 'left'
    },
    {
        id:'balance',
        numeric: false,
        label: 'Balance',
        align: 'left'
    },
    {
        id: 'stats',
        numeric: false,
        label: 'View Stats',
        align: 'left'
    }
];
// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onSort, theme, selected, setSelected, tabSelected }) {
    const { deleteLeave } = LeaveActions
    const handleDelete = async () => {
        const object = {
            leaves: selected
        }

        dispatch(
            openConfirmationModal({
                open: true,
                message: "This action is not reversible.",
                handleConfirm: async () => {
                    const response = await dispatch(deleteLeave(object))
                    if (response?.payload?.status != 201) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: response?.payload?.message || "Internal server error",
                                variant: 'alert',
                                alert: {
                                    color: "error"
                                },
                                close: true
                            })
                        )
                    }
                    else {
                        setSelected([]);
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: "Leave(s) deleted successfully.",
                                variant: 'alert',
                                alert: {
                                    color: "success"
                                },
                                close: true
                            })
                        )
                    }
                },
            })
        )


    }

    return (
        <TableHead>
            <TableRow>
                {tabSelected === "queue" && <>
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
                                            <DeleteIcon color='error' fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Toolbar>
                        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
                    </TableCell>
                )}
                </>}
                {numSelected <= 0 &&
                    (tabSelected === "queue" ? headCellsQueue : tabSelected ==="stats" ? headCellsStats:overviewCells).map((headCell) => (
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
                {tabSelected === "queue" && numSelected <= 0 && (
                    <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                        <Typography variant="subtitle1" sx={{ color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.900' }}>
                            Action
                        </Typography>
                    </TableCell>
                )}
            </TableRow>
        </TableHead >
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
    rowCount: PropTypes.number.isRequired,
    tabSelected: PropTypes.oneOf(['queue', 'stats','viewAll']).isRequired
};

export default EnhancedTableHead;