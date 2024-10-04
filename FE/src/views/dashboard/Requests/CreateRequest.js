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
import { gridSpacing, REQUEST_TYPE, roles } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { DatePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import { openSnackbar } from 'store/slices/snackbar';
import { LoadingButton } from '@mui/lab';
import useAuth from 'hooks/useAuth';
import { RequestActions } from 'store/slices/requests';
import moment from 'moment';
import { findKeyInObject } from 'utils/findKeyInObjects';
import DateRangeIcon from '@mui/icons-material/DateRange';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateRequest = ({ openDialog, handleCloseDialog, page, limit, selectedRow }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { role, user } = useAuth();
    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { createRequests, editRequests, fetchAllRequests } = RequestActions;

    const { employee } = useSelector((state) => state.employee);
    const {allUsers} = useSelector((state) => state.allUsers);
    const { loading } = useSelector((state) => state.requests);

    const initialValues = useMemo(
        () => ({
            user_id: selectedRow?.user_id ?? role === roles.EMPLOYEE ? user?.user_id : '',
            request_title: selectedRow?.request_title ?? '',
            request_type: selectedRow?.request_type ?? '',
            // request_date: new Date(selectedRow?.request_date),
            checkin_time: new Date(selectedRow?.checkin_time) ?? new Date().toDateString(),
            checkout_time: new Date(selectedRow?.checkout_time) ?? new Date().toDateString(),
            request_description: selectedRow?.request_description ?? ''
        }),
        [selectedRow]
    );

    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required('Employee name is required'),
        request_title: Yup.string().required('Request title is required.'),
        request_type: Yup.string().required('Request type is required'),
        // request_date: Yup.date().notRequired(),
        checkin_time: Yup.string().notRequired(),
        checkout_time: Yup.string().notRequired(),
        request_description: Yup.string().notRequired()
    });

    const onSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
            let response;

            if (!selectedRow) {
                response = await dispatch(createRequests(values));
            } else {
                const data = {
                    values,
                    id: selectedRow?.request_id
                };
                response = await dispatch(editRequests(data));
            }

            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: !selectedRow ? 'Request added successfully.' : 'Request updated successfully.',
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
                dispatch(fetchAllRequests({ page: page + 1, limit: limit, search: '' }));
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
        handleCloseDialog();
    };

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
                        <DialogTitle>{selectedRow ? 'Edit' : 'Create'} Request</DialogTitle>
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
                                            disabled={selectedRow || role === roles.EMPLOYEE}
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
                                        <InputLabel id="gender-label">Select Request Type</InputLabel>
                                        <Select
                                            id="request_type"
                                            name="request_type"
                                            value={values.request_type}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Select Leave Type"
                                        >
                                            {Object.keys(REQUEST_TYPE)?.map((e) => (
                                                <MenuItem value={e}>{REQUEST_TYPE[e]}</MenuItem>
                                            ))}
                                        </Select>
                                        {touched.request_type && errors.request_type && (
                                            <FormHelperText error>{errors.request_type}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="request_title"
                                        placeholder="Request Title"
                                        label="Request Title"
                                        value={values.request_title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                {/* {values.request_type !== 'ATTENDANCE_CORRECTION' ? (
                                    <Grid item xs={12}>
                                        <DatePicker
                                            label="Request Date"
                                            name="request_date"
                                            value={values.request_date}
                                            onBlur={handleBlur}
                                            onChange={(value) => setFieldValue('request_date', moment(value).startOf('day'), true)}
                                            renderInput={(params) => (
                                                <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                            )}
                                        />
                                        {touched.request_date && errors.request_date && (
                                            <FormHelperText error>{errors.request_date}</FormHelperText>
                                        )}
                                    </Grid>
                                ) : (
                                    <> */}
                                <Grid item xs={12}>
                                    <MobileDateTimePicker
                                        label="Checkin Time"
                                        value={values.checkin_time}
                                        // inputFormat="dd/MM/yyyy hh:mm a"
                                        onChange={(date) => setFieldValue('checkin_time', date?.toJSON())}
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
                                    {touched.checkin_time && errors.checkin_time && (
                                        <FormHelperText error>{errors.checkin_time}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <MobileDateTimePicker
                                        label="Checkout Time"
                                        value={values.checkout_time}
                                        // inputFormat="dd/MM/yyyy hh:mm a"
                                        onChange={(date) => setFieldValue('checkout_time', date?.toJSON())}
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
                                    {touched.checkout_time && errors.checkout_time && (
                                        <FormHelperText error>{errors.checkout_time}</FormHelperText>
                                    )}
                                </Grid>
                                {/* </>
                                )} */}
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="request_description"
                                        placeholder="Request Description"
                                        label="Request Description"
                                        value={values.request_description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
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

CreateRequest.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateRequest;
