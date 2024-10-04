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
import { gridSpacing } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { ShiftActions } from 'store/slices/shift';
import { CheckInActions } from 'store/slices/checkin';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { openSnackbar } from 'store/slices/snackbar';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateCheckIn = ({ openDialog, handleCloseDialog, selectedRow, setSelectedRow, page, limit }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { fetchShifts } = ShiftActions;
    const { createCheckIn, fetchCheckIn, updateCheckIn } = CheckInActions

    const { employee } = useSelector((state) => state.employee);
    const { shifts } = useSelector((state) => state.shift);
    const [finalShifts, setFinalShifts] = useState()

    useEffect(() => {
        dispatch(fetchEmployees({ page: "", limit: "", search: "", status: "", emp_type: ""}))
    }, []);

    useEffect(() => {
        dispatch(fetchShifts({ page: "", limit: "", search: "" }));
    }, []);


    useEffect(() => {
        if (shifts) {
            const sortedShifts = [...shifts].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            setFinalShifts(sortedShifts);
        }
    }, [shifts]);



    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required('Employee name is required'),
        log_type: Yup.string().required('Log type is required'),
        shift_id: Yup.string().required('Shift name is required'),
        log_time: Yup.string().required('Log Time is required'),
        device_id: Yup.string().notRequired(),
    })


    const handleCloseClick = () => {
        setSelectedRow()
        handleCloseDialog();
    }


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
                        height:'100%'
                    }
                }
            }}
        >
            {openDialog && (

                <Formik
                    initialValues={{
                        user_id: selectedRow?.user_id || '',
                        log_type: selectedRow?.log_type || '',
                        shift_id: selectedRow?.shift_id || '',
                        log_time: selectedRow?.log_time || new Date(),
                        device_id: selectedRow?.device_id || ''
                    }}

                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            let response;
                            if (!selectedRow) {
                                response = await dispatch(createCheckIn(values));
                            }
                            else {
                                const data = {
                                    values,
                                    id: selectedRow?.checkin_id
                                }
                                response = await dispatch(updateCheckIn(data));
                            }
                            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: !selectedRow ? "Checkin added successfully." : "Checkin updated successfully.",
                                        variant: 'alert',
                                        alert: {
                                            color: "success"
                                        },
                                        close: true
                                    })
                                )
                                handleCloseClick()
                                setStatus({ success: true });
                                setSubmitting(false);
                                dispatch(fetchCheckIn({ page: page + 1, limit: limit, search: "" }))
                                window.location.reload();
                            }
                            else {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: response?.payload?.errors || response?.payload?.message || "Internal server error",
                                        variant: 'alert',
                                        alert: {
                                            color: "error"
                                        },
                                        close: true
                                    })
                                )
                            }

                        } catch (err) {
                            console.error(err);
                            setStatus({ success: false });
                            setErrors({ submit: "Invalid credentials" });
                            setSubmitting(false);
                        }
                    }}
                    validationSchema={validationSchema}
                >
                    {({ errors, handleSubmit, handleChange, handleBlur, values, touched, setFieldValue }) => (
                        <>
                            <DialogTitle>{selectedRow ? "Edit CheckIn" : "Create CheckIn"}</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={gridSpacing} sx={{ mt: 0.25 }}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Employee Name">
                                            <InputLabel id="gender-label">Select Employee Name</InputLabel>
                                            <Select
                                                id="user_id"
                                                name="user_id"
                                                value={values.user_id}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Employee Name"
                                            >
                                                {employee && employee.map((emp) => {
                                                    return (
                                                        <MenuItem value={emp?.user_id} key={emp.user_id}>
                                                            {emp.user_name}
                                                        </MenuItem>
                                                    )
                                                })}

                                            </Select>
                                            {touched.user_id && errors.user_id && (
                                                <FormHelperText error>
                                                    {errors.user_id}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Log Type">
                                            <InputLabel id="gender-label">Select Log Type</InputLabel>
                                            <Select
                                                id="log_type"
                                                name="log_type"
                                                value={values.log_type}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Log Type"
                                            >

                                                <MenuItem value="IN">IN</MenuItem>
                                                <MenuItem value="OUT">OUT</MenuItem>
                                            </Select>
                                            {touched.log_type && errors.log_type && (
                                                <FormHelperText error>
                                                    {errors.log_type}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Shift Name">
                                            <InputLabel id="gender-label">Select Shift Name</InputLabel>
                                            <Select
                                                id="shift_id"
                                                name="shift_id"
                                                value={values.shift_id}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select Shift Name"
                                            >
                                                {finalShifts && finalShifts?.map((shift) => {
                                                    return (
                                                        <MenuItem value={shift?.shift_id} key={shift?.shift_id}>
                                                            {`${shift?.shift_name} -- (${new Date(shift?.start_time).toLocaleDateString()})`}
                                                        </MenuItem>
                                                    )
                                                })}

                                            </Select>
                                            {touched.shift_id && errors.shift_id && (
                                                <FormHelperText error>
                                                    {errors.shift_id}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MobileDateTimePicker
                                            label="Log Time"
                                            value={values.log_time}
                                            // inputFormat="dd/MM/yyyy hh:mm a"
                                            onChange={(date) => setFieldValue('log_time', date.toJSON())}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <DateRangeIcon />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic2"
                                            fullWidth
                                            name="device_id"
                                            placeholder="Device Id"
                                            label="Device Id"
                                            disabled
                                            value="MANUAL"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </Grid>

                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <AnimateButton>
                                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: theme.palette.secondary.main, '&:hover': { bgcolor: theme.palette.secondary.dark } }}>
                                        {selectedRow ? 'Edit' : 'Add'}
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

CreateCheckIn.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateCheckIn;
