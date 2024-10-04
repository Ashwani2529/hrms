/* eslint-disable */
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'store';

import { Formik } from 'formik';
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
import { attendanceStatuses, gridSpacing } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { ShiftActions } from 'store/slices/shift';
import { CheckInActions } from 'store/slices/checkin';
import { DatePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { openSnackbar } from 'store/slices/snackbar';
import { AttendanceActions } from 'store/slices/attendance';
import moment from 'moment';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

// tags list & style

function getStyles(name, personName, theme) {
    return {
        fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
    };
}

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateAttendance = ({ openDialog, handleCloseDialog, selectedRow, setSelectedRow, page, limit, currMonth, edit = false }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { fetchCheckIn } = CheckInActions;
    const { fetchShifts } = ShiftActions;
    const { createAttendance, updateAttendance, fetchAttendances } = AttendanceActions;

    const { employee } = useSelector((state) => state.employee);
    const { shifts } = useSelector((state) => state.shift);

    useEffect(() => {
        dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
    }, []);

    useEffect(() => {
        dispatch(fetchShifts({ page: '', limit: '', search: '' }));
    }, []);

    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required('Employee name is required'),
        shift_id: Yup.string().nullable(),
        check_in_id: Yup.string().nullable(),
        status: Yup.string().required('Attendance type is required'),
        attendance_date: Yup.date().required('Attendance date is required')
    });

    const handleCloseClick = () => {
        setSelectedRow();
        handleCloseDialog();
    };

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
                <Formik
                    initialValues={{
                        user_id: selectedRow?.user_id || '',
                        shift_id: selectedRow?.shift_id || null,
                        check_in_id: selectedRow?.check_in_id || null,
                        status: selectedRow?.status || '',
                        attendance_date: selectedRow?.attendance_date || new Date()
                    }}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            let response;
                            if (!edit) {
                                const data = {
                                    ...values,
                                    attendance_date: moment(values?.attendance_date).toISOString()
                                };
                                response = await dispatch(createAttendance(data));
                            } else {
                                const data = {
                                    values,
                                    id: selectedRow?.attendance_id
                                };
                                response = await dispatch(updateAttendance(data));
                            }
                            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: !selectedRow ? 'Attendance added successfully.' : 'Attendance updated successfully.',
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
                                dispatch(
                                    fetchAttendances({
                                        startDate: moment(currMonth).startOf('month').toISOString(),
                                        endDate: moment(currMonth).endOf('month').toISOString()
                                    })
                                );
                                window. location. reload(); 
                            } else {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: response?.payload?.errors || response?.payload?.message || 'Internal server error',
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
                            setErrors({ submit: 'Internal server error!' });
                            setSubmitting(false);
                        }
                    }}
                    validationSchema={validationSchema}
                >
                    {({ errors, handleSubmit, handleChange, handleBlur, values, touched, setFieldValue, isSubmitting }) => (
                        <>
                            <DialogTitle>{edit ? 'Edit Attendance' : 'Create Attendance'}</DialogTitle>
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
                                            >
                                                {employee &&
                                                    employee.map((emp) => {
                                                        return (
                                                            <MenuItem value={emp?.user_id} key={emp.user_id}>
                                                                {emp.user_name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                            </Select>
                                            {touched.user_id && errors.user_id && <FormHelperText error>{errors.user_id}</FormHelperText>}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <DatePicker
                                            disableFuture
                                            label="Attendance date"
                                            name="attendance_date"
                                            value={values.attendance_date}
                                            onBlur={handleBlur}
                                            onChange={(value) => setFieldValue('attendance_date', value, true)}
                                            renderInput={(params) => (
                                                <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                            )}
                                        />
                                        {touched.attendance_date && errors.attendance_date && (
                                            <FormHelperText error>{errors.attendance_date}</FormHelperText>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Status">
                                            <InputLabel id="gender-label">Select Attendance Type</InputLabel>
                                            <Select
                                                id="status"
                                                name="status"
                                                value={values.status}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Attendance Type"
                                            >
                                                {Object.entries(attendanceStatuses).map((ele, index) => (
                                                    <MenuItem key={index + ele[0]} value={ele[1]}>
                                                        {ele[0]}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {touched.status && errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Shift Name">
                                            <InputLabel id="gender-label">Select Shift Name</InputLabel>
                                            <Select
                                                id="shift_id"
                                                name="shift_id"
                                                value={values.shift_id}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Shift Name"
                                            >
                                                {shifts &&
                                                    shifts
                                                        .filter(
                                                            (shift) =>
                                                                moment(values?.attendance_date).format('YYYY-MM-DD') ===
                                                                    moment(shift?.start_time).format('YYYY-MM-DD') &&
                                                                shift?.user_shift?.find((ele) => ele?.user?.user_id === values.user_id)
                                                        )
                                                        .map((shift) => {
                                                            return (
                                                                <MenuItem value={shift?.shift_id} key={shift.shift_id}>
                                                                    {shift.shift_name}
                                                                </MenuItem>
                                                            );
                                                        })}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* <FormControl fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="CheckIn Name">
                                            <InputLabel id="gender-label">Shift Name</InputLabel>
                                            <Select
                                                id="shift_id"
                                                name="shift_id"
                                                value={values.shift_id}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Shift Name"
                                            >
                                                {shifts && shifts.map((shift) => {
                                                    return (
                                                        <MenuItem value={shift?.shift_id} key={shift.shift_id}>
                                                            {shift.shift_name}
                                                        </MenuItem>
                                                    )
                                                })}

                                            </Select>
                                        </FormControl> */}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <AnimateButton>
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                        variant="contained"
                                        sx={{ bgcolor: theme.palette.secondary.main, '&:hover': { bgcolor: theme.palette.secondary.dark } }}
                                    >
                                        {edit ? 'Edit' : 'Add'}
                                    </Button>
                                </AnimateButton>
                                <Button variant="text" color="error" onClick={handleCloseClick}>
                                    Close
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Formik>
            )}
        </Dialog>
    );
};

CreateAttendance.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateAttendance;
