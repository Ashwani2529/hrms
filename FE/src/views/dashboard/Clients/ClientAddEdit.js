/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useDispatch } from 'store';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Button,
    FormHelperText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Slide,
    TextField,
    InputAdornment
} from '@mui/material';
import { MobileTimePicker } from '@mui/x-date-pickers';

// project imports
import { gridSpacing } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { openSnackbar } from 'store/slices/snackbar';
import { ClientActions } from 'store/slices/client';
import { LoadingButton } from '@mui/lab';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const ClientAddEdit = ({ openDialog, handleCloseDialog, selectedRow, setSelectedRow, page, limit }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    // set image upload progress
    const { fetchClients, addClient, updateClient } = ClientActions;

    const validationSchema = Yup.object().shape({
        client_name: Yup.string().required('Client name is required'),
        client_details: Yup.string().required('Client details is required'),
        day_hour_payment: Yup.number().required('This field is required'),
        night_hour_payment: Yup.number().required('This field is required'),
        day_hour_start: Yup.date().typeError('Invalid Date!').required('This field is required'),
        night_hour_start: Yup.date().typeError('Invalid Date!').required('This field is required')
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
                        maxHeight: '100%'
                    }
                }
            }}
        >
            {openDialog && (
                <Formik
                    initialValues={{
                        client_name: selectedRow?.client_name || '',
                        client_details: selectedRow?.client_details || '',
                        day_hour_payment: selectedRow?.day_hour_payment || null,
                        night_hour_payment: selectedRow?.night_hour_payment || null,
                        day_hour_start: selectedRow?.day_hour_start || '',
                        night_hour_start: selectedRow?.night_hour_start || ''
                    }}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            let { day_hour_start, night_hour_start, ...newValues } = values;
                            day_hour_start = 'T' + day_hour_start?.split('T')[1];
                            night_hour_start = 'T' + night_hour_start?.split('T')[1];
                            let response;
                            if (!selectedRow) {
                                response = await dispatch(addClient((values = { ...newValues, day_hour_start, night_hour_start })));
                                // console.log(response)
                            } else {
                                const data = {
                                    data: { ...newValues, day_hour_start, night_hour_start },
                                    id: selectedRow?.client_id
                                };
                                // console.log(data)
                                response = await dispatch(updateClient(data));
                            }
                            if (!response?.payload?.errors && response?.payload?.status == 201 || response?.payload?.status == 200) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: !selectedRow ? 'Client added successfully.' : 'CLient updated successfully.',
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
                                dispatch(fetchClients({ page: page + 1, limit: limit, search: '' }));
                                window.location.reload();
                            } else {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: response?.payload?.errors || 'Internal server error',
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
                    }}
                    validationSchema={validationSchema}
                >
                    {({ errors, handleSubmit, handleChange, handleBlur, values, touched, setFieldValue, isSubmitting }) => (
                        <>
                            <DialogTitle>{selectedRow ? 'Edit Client' : 'Create Client'}</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={gridSpacing} sx={{ mt: 0.25 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic2"
                                            fullWidth
                                            name="client_name"
                                            label="Client Name"
                                            value={values?.client_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {touched.client_name && errors.client_name && (
                                            <FormHelperText error>{errors.client_name}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic2"
                                            fullWidth
                                            name="client_details"
                                            label="Client Details"
                                            value={values?.client_details}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {touched.client_details && errors.client_details && (
                                            <FormHelperText error>{errors.client_details}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic2"
                                            fullWidth
                                            type="number"
                                            name="day_hour_payment"
                                            label="Day Hour Payment"
                                            value={values?.day_hour_payment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {touched.day_hour_payment && errors.day_hour_payment && (
                                            <FormHelperText error>{errors.day_hour_payment}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id="outlined-basic2"
                                            fullWidth
                                            type="number"
                                            name="night_hour_payment"
                                            label="Night Hour Payment"
                                            value={values?.night_hour_payment}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {touched.night_hour_payment && errors.night_hour_payment && (
                                            <FormHelperText error>{errors.night_hour_payment}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <MobileTimePicker
                                            label="Day Start Hour"
                                            value={values.day_hour_start}
                                            // inputFormat="dd/MM/yyyy hh:mm a"
                                            onChange={(date) => {
                                                setFieldValue('day_hour_start', date.toJSON());
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    error={Boolean(touched.day_hour_start && errors.day_hour_start)}
                                                    helperText={touched.day_hour_start && errors.day_hour_start}
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
                                        <MobileTimePicker
                                            label="Night Start Hour"
                                            value={values.night_hour_start}
                                            // inputFormat="dd/MM/yyyy hh:mm a"
                                            onChange={(date) => {
                                                setFieldValue('night_hour_start', date.toJSON());
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    error={Boolean(touched.night_hour_start && errors.night_hour_start)}
                                                    helperText={touched.night_hour_start && errors.night_hour_start}
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
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <AnimateButton>
                                    <LoadingButton loading={isSubmitting} onClick={handleSubmit} variant="contained">
                                        {selectedRow ? 'Edit' : 'Add'}
                                    </LoadingButton>
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

ClientAddEdit.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default ClientAddEdit;
