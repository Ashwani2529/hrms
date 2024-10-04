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
import { gridSpacing, TIKCET_TYPE, roles } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { DatePicker } from '@mui/x-date-pickers';
import { openSnackbar } from 'store/slices/snackbar';
import { LoadingButton } from '@mui/lab';
import useAuth from 'hooks/useAuth';
import { TicketActions } from 'store/slices/tickets';
import moment from 'moment';
import { findKeyInObject } from 'utils/findKeyInObjects';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateTicket = ({ openDialog, handleCloseDialog, page, limit, selectedRow }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const { role, user } = useAuth();
    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { createTickets, editTickets, fetchAllTickets } = TicketActions;

    const { employee } = useSelector((state) => state.employee);
    const { loading } = useSelector((state) => state.tickets);

    const initialValues = useMemo(
        () => ({
            user_id: selectedRow?.user_id ?? role === roles.EMPLOYEE ? user?.user_id : '',
            ticket_title: selectedRow?.ticket_title ?? '',
            ticket_type: selectedRow?.ticket_type ?? '',
            ticket_date: new Date(selectedRow?.ticket_date) ?? new Date(),
            ticket_description: selectedRow?.ticket_description ?? ''
        }),
        [selectedRow]
    );

    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required('Employee name is required'),
        ticket_title: Yup.string().required('Ticket title is required.'),
        ticket_type: Yup.string().required('Ticket type is required'),
        ticket_date: Yup.date().required('Date is required'),
        ticket_description: Yup.string().notRequired()
    });

    const onSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
            let response;

            if (!selectedRow) {
                response = await dispatch(createTickets(values));
            } else {
                const data = {
                    values,
                    id: selectedRow?.ticket_id
                };
                response = await dispatch(editTickets(data));
            }

            console.log(response);

            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: !selectedRow ? 'Ticket added successfully.' : 'Ticket updated successfully.',
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
                dispatch(fetchAllTickets({ page: page + 1, limit: limit, search: '' }));
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
                        <DialogTitle>{selectedRow ? 'Edit' : 'Create'} Ticket</DialogTitle>
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
                                        <InputLabel id="gender-label">Select Ticket Type</InputLabel>
                                        <Select
                                            id="ticket_type"
                                            name="ticket_type"
                                            value={values.ticket_type}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            label="Select Leave Type"
                                        >
                                            {Object.keys(TIKCET_TYPE)?.map((e) => (
                                                <MenuItem value={e}>{TIKCET_TYPE[e]}</MenuItem>
                                            ))}
                                        </Select>
                                        {touched.ticket_type && errors.ticket_type && (
                                            <FormHelperText error>{errors.ticket_type}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="ticket_title"
                                        placeholder="Ticket Title"
                                        label="Ticket Title"
                                        value={values.ticket_title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <DatePicker
                                        label="Ticket Date"
                                        name="ticket_date"
                                        value={values.ticket_date}
                                        onBlur={handleBlur}
                                        onChange={(value) => setFieldValue('ticket_date', moment(value).startOf('day'), true)}
                                        renderInput={(params) => (
                                            <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                        )}
                                    />
                                    {touched.ticket_date && errors.ticket_date && (
                                        <FormHelperText error>{errors.ticket_date}</FormHelperText>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic2"
                                        fullWidth
                                        name="ticket_description"
                                        placeholder="Ticket Description"
                                        label="Ticket Description"
                                        value={values.ticket_description}
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

CreateTicket.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateTicket;
