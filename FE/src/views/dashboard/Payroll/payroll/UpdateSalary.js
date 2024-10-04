/* eslint-disable */
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'store';
import { useNavigate } from 'react-router-dom';

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
import { DatePicker, MobileDateTimePicker } from '@mui/x-date-pickers';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { openSnackbar } from 'store/slices/snackbar';
import { AttendanceActions } from 'store/slices/attendance';
import { PayrollActions } from 'store/slices/payroll';
import { LoadingButton } from '@mui/lab';

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

const UpdateSalary = ({ openDialog, handleCloseDialog, selectedRow, setSelectedRow, page, limit }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    // set image upload progress

    const { fetchPayrolls, updatePayroll } = PayrollActions;

    const validationSchema = Yup.object().shape({
        payroll_status: Yup.string().required('Payroll status is required'),
        payroll_frequency: Yup.string().required('Payroll frequency is required'),
        payroll_start_date: Yup.date().required('Start date is required')
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
                        payroll_status: selectedRow?.payroll_status || '',
                        payroll_frequency: selectedRow?.payroll_frequency || 'Monthly',
                        payroll_start_date: selectedRow?.payroll_start_date || selectedRow?.user?.date_of_joining || new Date()
                    }}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const data = {
                                data: values,
                                id: selectedRow?.payroll_id
                            };

                            let response = await dispatch(updatePayroll(data));
                            if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: 'Payroll updated successfully.',
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
                                dispatch(fetchPayrolls({ page: page + 1, limit: limit, search: '', status: '' }));
                                window.location.reload();
                            } else {
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
                            <DialogTitle>{'Update Salary'}</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={gridSpacing} sx={{ mt: 0.25 }}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth required InputLabelProps={{ shrink: true }} label="Salary Status">
                                            <InputLabel id="gender-label"></InputLabel>
                                            <Select
                                                id="payroll_status"
                                                name="payroll_status"
                                                value={values.payroll_status}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select payroll status"
                                            >
                                                <MenuItem value="Active">Active</MenuItem>
                                                <MenuItem value="Inactive">Inactive</MenuItem>
                                            </Select>
                                            {touched.payroll_status && errors.payroll_status && (
                                                <FormHelperText error>{errors.payroll_status}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required InputLabelProps={{ shrink: true }} label="Payroll frequency">
                                            <InputLabel id="frequency-label">Select payroll frequency</InputLabel>
                                            <Select
                                                id="payroll_frequency"
                                                name="payroll_frequency"
                                                value={values.payroll_frequency}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                label="Select payroll frequency"
                                            >
                                                <MenuItem value="Weekly">Weekly</MenuItem>
                                                <MenuItem value="Monthly">Monthly</MenuItem>
                                            </Select>
                                            {touched.payroll_frequency && errors.payroll_frequency && (
                                                <FormHelperText error>{errors.payroll_frequency}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <DatePicker
                                            disablePast
                                            label="Payroll start date"
                                            name="payroll_start_date"
                                            value={values.payroll_start_date}
                                            onBlur={handleBlur}
                                            onChange={(value) => setFieldValue('payroll_start_date', value, true)}
                                            renderInput={(params) => (
                                                <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                            )}
                                        />
                                        {touched.payroll_start_date && errors.payroll_start_date && (
                                            <FormHelperText error>{errors.payroll_start_date}</FormHelperText>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} container alignItems="center" gap={3}>
                                        <AnimateButton>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    if (selectedRow?.salary) {
                                                        navigate(`/payroll/salary/edit/${selectedRow?.payroll_id}`);
                                                    } else {
                                                        navigate(`/payroll/salary/add/${selectedRow?.payroll_id}`);
                                                    }
                                                }}
                                            >
                                                {selectedRow?.salary ? 'Edit Salary Structure' : 'Add Salary Structure'}
                                            </Button>
                                        </AnimateButton>

                                        {/* <AnimateButton>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    if (selectedRow?.bonus?.length > 0) {
                                                        navigate(`/payroll/bonus/edit/${selectedRow?.payroll_id}`);
                                                    } else {
                                                        navigate(`/payroll/bonus/add/${selectedRow?.payroll_id}`);
                                                    }
                                                }}
                                            >
                                                {selectedRow?.bonus?.length > 0 ? 'Edit Bonus' : 'Add Bonus'}
                                            </Button>
                                        </AnimateButton> */}
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <AnimateButton>
                                    <LoadingButton
                                        onClick={handleSubmit}
                                        variant="contained"
                                        sx={{ bgcolor: theme.palette.secondary.main, '&:hover': { bgcolor: theme.palette.secondary.dark } }}
                                        loading={isSubmitting}
                                    >
                                        Save
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

UpdateSalary.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default UpdateSalary;
