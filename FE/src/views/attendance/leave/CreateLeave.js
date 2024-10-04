/* eslint-disable */
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'store';

import { Formik, useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
    Button,
    FormHelperText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputLabel,
    Slide,
    TextField,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material';

// project imports
import { gridSpacing, LeaveTypes, roles } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { DatePicker } from '@mui/x-date-pickers';
import { openSnackbar } from 'store/slices/snackbar';
import { LeaveActions } from 'store/slices/leave';
import { LoadingButton } from '@mui/lab';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { findKeyInObject } from 'utils/findKeyInObjects';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateCheckIn = ({ openDialog, handleCloseDialog, selectedRow, setSelectedRow, page, limit }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { role, user } = useAuth();
    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { createLeave, fetchLeaves, updateLeave } = LeaveActions;

    const { employee } = useSelector((state) => state.employee);
    const { loading, leaveDetails } = useSelector((state) => state.leave);

    const [selectedEmployeeLeaves, setSelectedEmployeeLeaves] = useState();

    const initialValues = useMemo(
        () => ({
            user_id: leaveDetails?.user_id ? leaveDetails?.user_id : role === roles.EMPLOYEE ? user?.user_id : '',
            leave_name: leaveDetails?.leave_name || '',
            leave_type: leaveDetails?.leave_type || '',
            leave_start_date: leaveDetails?.leave_start_date || new Date(),
            leave_end_date: leaveDetails?.leave_end_date || new Date(),
            leave_description: leaveDetails?.leave_description || '',
            leave_status: leaveDetails?.leave_status || 'PENDING'
        }),
        [leaveDetails]
    );

    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required('Employee name is required'),
        leave_name: Yup.string().required('Leave name is required.'),
        leave_type: Yup.string().required('Leave type is required'),
        leave_start_date: Yup.date().required('Start date is required'),
        leave_end_date: Yup.date().when(
            'start_time',
            (leave_start_date, schema) => leave_start_date && schema.min(leave_start_date, 'End date must be later than start date')
        ),
        leave_description: Yup.string().notRequired(),
        leave_status: Yup.string().required('Leave status is required.')
    });

    const onSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
            let response;
            if (!selectedRow) {
                response = await dispatch(createLeave(values));
            } else {
                const data = {
                    values,
                    id: selectedRow?.leave_id
                };
                response = await dispatch(updateLeave(data));
            }

            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: !selectedRow ? 'Leave added successfully.' : 'Leave updated successfully.',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                handleCloseClick();
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(fetchLeaves({ page: page + 1, limit: limit, search: '' }));
                window.location.reload();
            } else {
                dispatch(
                    openSnackbar({
                        open: true,
                        message:
                            findKeyInObject(response?.payload, `message`) ||
                            findKeyInObject(response?.payload, `error`) ||
                            'Internal server error',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (err) {
            console.error(err);
            setStatus({ success: false });
            setErrors({ submit: 'Invalid credentials' });
            setSubmitting(false);
        }
    };

    const { values, handleSubmit, handleChange, handleBlur, errors, setFieldValue, touched, isSubmitting } = useFormik({
        onSubmit,
        initialValues,
        validationSchema,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true
    });

    const handleCloseClick = () => {
        setSelectedRow();
        handleCloseDialog();
    };

    const fetchSelectedEmployeeLeaves = async (user_id) => {
        try {
            const res = await axiosServices.get(`/leave/leavesStats/${user_id}`);
            setSelectedEmployeeLeaves(res.data);
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Add To Cart Success',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: false
                })
            );
            console.log(error);
        }
    };

    useEffect(() => {
        if (values.user_id) {
            fetchSelectedEmployeeLeaves(values.user_id);
        }
    }, [values.user_id]);

    useEffect(() => {
        dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
    }, []);

    return (
        <Dialog
            open={openDialog}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleCloseDialog}
            sx={{
                '&>div:nth-of-type(3)': {
                    justifyContent: 'flex-end',
                    '&>div': {
                        m: 0,
                        borderRadius: '0px',
                        maxWidth: 450,
                        maxHeight: '100%',
                        height: '100%'
                    }
                }
            }}
        >
            {openDialog && (
                <form onSubmit={handleSubmit}>
                    <>
                        <DialogTitle>{selectedRow ? 'Edit' : 'Create'} Leave</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={gridSpacing} sx={{ mt: 0.25 }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Employee Name">
                                        <InputLabel id="gender-label">Select Employee Name</InputLabel>
                                        <Select
                                            id="user_id"
                                            name="user_id"
                                            value={values.user_id}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Select Employee Name"
                                            disabled={role === roles.EMPLOYEE}
                                        >
                                            {role !== roles.EMPLOYEE ? (
                                                employee &&
                                                employee.map((emp) => {
                                                    return (
                                                        <MenuItem value={emp?.user_id} key={emp.user_id}>
                                                            {emp.user_name}
                                                        </MenuItem>
                                                    );
                                                })
                                            ) : (
                                                <MenuItem value={user?.user_id} key={user.user_id}>
                                                    {user.user_name}
                                                </MenuItem>
                                            )}
                                        </Select>
                                        {touched.user_id && errors.user_id && <FormHelperText error>{errors.user_id}</FormHelperText>}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Log Type">
                                        <InputLabel id="gender-label">Select Leave Type</InputLabel>
                                        <Select
                                            id="leave_type"
                                            name="leave_type"
                                            value={values.leave_type}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Select Leave Type"
                                        >
                                            {selectedEmployeeLeaves?.sick_leaves > 0 && (
                                                <MenuItem value={LeaveTypes.SICK}>Sick Leave</MenuItem>
                                            )}
                                            {selectedEmployeeLeaves?.casual_leaves > 0 && (
                                                <MenuItem value={LeaveTypes.CASUAL}>Casual Leave</MenuItem>
                                            )}
                                            {selectedEmployeeLeaves?.earned_leaves > 0 && (
                                                <MenuItem value={LeaveTypes.EARNED}>Earned Leave</MenuItem>
                                            )}
                                            {selectedEmployeeLeaves?.compunsatory_leaves && (
                                                <MenuItem value={LeaveTypes.COMPUNSATORY}>Compunsatory Leave</MenuItem>
                                            )}
                                        </Select>
                                        {touched.leave_type && errors.leave_type && (
                                            <FormHelperText error>{errors.leave_type}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="leave_name"
                                        placeholder="Leave Name"
                                        label="Leave Name"
                                        value={values.leave_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <DatePicker
                                        disablePast
                                        label="Start date"
                                        name="leave_start_date"
                                        value={values.leave_start_date}
                                        onBlur={handleBlur}
                                        onChange={(value) => setFieldValue('leave_start_date', value, true)}
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                        )}
                                    />
                                    {touched.leave_start_date && errors.leave_start_date && (
                                        <FormHelperText error>{errors.leave_start_date}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <DatePicker
                                        disablePast
                                        label="End date"
                                        name="leave_end_date"
                                        value={values.leave_end_date}
                                        onBlur={handleBlur}
                                        onChange={(value) => setFieldValue('leave_end_date', value, true)}
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                        )}
                                    />
                                    {touched.leave_end_date && errors.leave_end_date && (
                                        <FormHelperText error>{errors.leave_end_date}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="leave_description"
                                        placeholder="Leave Description"
                                        label="Leave Description"
                                        value={values.leave_description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Leave Status">
                                        <InputLabel id="gender-label">Select Leave Status</InputLabel>
                                        <Select
                                            id="leave_status"
                                            name="leave_status"
                                            value={values.leave_status}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            disabled={!selectedRow || role === roles.EMPLOYEE}
                                            defaultValue="PENDING"
                                            label="Select Leave Status"
                                        >
                                            <MenuItem value="PENDING">PENDING</MenuItem>
                                            <MenuItem value="APPROVED">APPROVED</MenuItem>
                                            <MenuItem value="REJECTED">REJECTED</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <AnimateButton>
                                <LoadingButton
                                    onClick={handleSubmit}
                                    variant="contained"
                                    sx={{ bgcolor: theme.palette.secondary.main, '&:hover': { bgcolor: theme.palette.secondary.dark } }}
                                    loading={isSubmitting || loading}
                                >
                                    {selectedRow ? 'Edit' : 'Add'}
                                </LoadingButton>
                            </AnimateButton>
                            <Button variant="text" color="error" onClick={handleCloseClick}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                </form>
            )}
        </Dialog>
    );
};

CreateCheckIn.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateCheckIn;
