/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from 'react';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector, dispatch } from 'store';
import { CompanyActions } from 'store/slices/company';
import useAuth from 'hooks/useAuth';
import { Form, useFormik } from 'formik';
import * as Yup from 'yup';
import { BASE_SALARY_TYPES, COMPENSATION_TYPE, CURRENCY_TYPE, gridSpacing } from 'store/constant';
import { LoadingButton } from '@mui/lab';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Container,
    List,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Tabs,
    Tab,
    Grid,
    Divider
} from '@mui/material';
import moment from 'moment';
import SkeletonCompanyDetails from 'ui-component/skeleton/SkeletonCompanyDetails';
import { keyBy } from 'lodash';
import { findKeyInObject } from 'utils/findKeyInObjects';

function CompanyDetailsForm({ selectedRow, isView = false }) {
    const { user } = useAuth();
    const { companyDetails, loading, error } = useSelector((state) => state.company);
    const { fetchCompanyData, updateCompanyData } = CompanyActions;

    const initialValues = useMemo(
        () => ({
            company_name: companyDetails?.company_name || '',
            company_address: companyDetails?.company_address || '',
            company_details: companyDetails?.company_details || '',
            company_logo: companyDetails?.company_logo || '',

            country: companyDetails?.country || '',
            currency: companyDetails?.currency || '',

            ot_pay_type: selectedRow?.ot_pay_type || companyDetails?.company_data?.ot_pay_type || '',
            standarized_shift_hours: selectedRow?.standarized_shift_hours || companyDetails?.company_data?.standarized_shift_hours || 1,
            min_half_day_hours: selectedRow?.min_half_day_hours || companyDetails?.company_data?.min_half_day_hours || 4,
            standard_monthly_days: selectedRow?.standard_monthly_days || companyDetails?.company_data?.standard_monthly_days || 30,
            payment_day_of_month: selectedRow?.payment_day_of_month || companyDetails?.company_data?.payment_day_of_month || 30,
            smtp_username: companyDetails?.smtp_username || '',
            smtp_password: companyDetails?.smtp_password || '',

            // TODO: This field is currently not being included in UPDATE and CREATE Apis
            salary_freq: selectedRow?.salary_freq || companyDetails?.company_data?.salary_freq || BASE_SALARY_TYPES.MONTHLY
        }),
        [companyDetails]
    );

    const validationSchema = Yup.object({
        company_name: Yup.string().required('This is a required field'),
        company_address: Yup.string().required('This is a required field'),
        company_details: Yup.string().required('This is a required field'),
        company_logo: Yup.string().required('This is a required field'),
        country: Yup.string().required('This is a required field'),
        currency: Yup.string().required('This is a required field'),
        ot_pay_type: Yup.string().required('This is a required field'),
        min_half_day_hours: Yup.number()
            .min(1, 'should be greater than 1')
            .max(23, 'should be less than 24')
            .required('This is a required field'),
        smtp_username: Yup.string().required('This is a required field'),
        smtp_password: Yup.string().required('This is a required field'),
        standarized_shift_hours: Yup.number().min(1).max(23).required('This is a required field'),
        salary_freq: Yup.string().required('This is a required field'),
        standard_monthly_days: Yup.string().required('This is a required field'),
        payment_day_of_month: Yup.string().required('This is a required field')
    });

    const onSubmit = async (values) => {
        try {
            if (!user?.company_id) throw new Error('No associated company found with logged in user');
            const response = await dispatch(updateCompanyData({ id: user?.company_id, values }));
            if (response?.payload?.status === 201 || response?.payload?.status === 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Company Details updated successfully!',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
            } else {
                dispatch(
                    openSnackbar({
                        open: true,
                        message:
                            findKeyInObject(response?.payload, `message`) ||
                            findKeyInObject(response?.payload, `error`) ||
                            'Failed to update Company Details!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error?.message || 'Failed to update Company Details!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        }
    };

    const { values, errors, handleSubmit, isSubmitting, handleChange, handleReset } = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        enableReinitialize: true,
        validateOnBlur: false,
        validateOnChange: false
    });

    useEffect(() => {
        // fetchCompanyDetailsgere
        if (user?.company_id) {
            dispatch(fetchCompanyData(user?.company_id));
        }
    }, [user]);

    return loading ? (
        <SkeletonCompanyDetails />
    ) : (
        <form onSubmit={handleSubmit}>
            <Card sx={{ p: 3, m: 'auto', maxWidth: 600 }} variant="outlined">
                <Stack gap={gridSpacing}>
                    <TextField
                        disabled={isView}
                        name="company_name"
                        value={values.company_name}
                        onChange={handleChange}
                        label="Company Name "
                    />
                    <TextField
                        disabled={isView}
                        name="company_address"
                        error={errors.company_address}
                        helperText={errors.company_address}
                        value={values.company_address}
                        onChange={handleChange}
                        label="Company Address "
                    />
                    <TextField
                        disabled={isView}
                        name="country"
                        error={errors.country}
                        helperText={errors.country}
                        value={values.country}
                        onChange={handleChange}
                        label="Country "
                    />
                    <Divider my={2} />

                    <Grid container xs={12} spacing={1} justifyContent="space-between" alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="start_date"
                                type="date"
                                onChange={handleChange}
                                label="Effective From"
                                disabled
                                fullWidth
                                value={
                                    selectedRow?.from_date
                                        ? moment(selectedRow?.from_date).format('YYYY-MM-DD')
                                        : companyDetails?.company_data?.from_date
                                        ? moment(companyDetails?.company_data?.from_date).format('YYYY-MM-DD')
                                        : Date.now()
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="end_date"
                                type="date"
                                onChange={handleChange}
                                label="Effective Till"
                                disabled
                                fullWidth
                                value={
                                    selectedRow?.end_date
                                        ? moment(selectedRow?.end_date).format('YYYY-MM-DD')
                                        : companyDetails?.company_data?.end_date
                                        ? moment(companyDetails?.company_data?.end_date).format('YYYY-MM-DD')
                                        : '-'
                                }
                            />
                        </Grid>
                    </Grid>
                    <TextField
                        disabled={isView}
                        select
                        name="Currency"
                        value={values.currency}
                        onChange={handleChange}
                        label="Currency"
                        error={errors.currency}
                        helperText={errors.currency}
                    >
                        {Object.values(CURRENCY_TYPE).map((val, index) => (
                            <MenuItem key={val + index} value={val}>
                                {val}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        disabled={isView}
                        select
                        name="ot_pay_type"
                        value={values.ot_pay_type}
                        onChange={handleChange}
                        label="Overtime Compensation"
                        error={errors.ot_pay_type}
                        helperText={errors.ot_pay_type}
                    >
                        {Object.keys(COMPENSATION_TYPE).map((key, index) => (
                            <MenuItem key={key + index} value={COMPENSATION_TYPE[key]}>
                                {key}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        disabled={isView}
                        name="standarized_shift_hours"
                        value={values.standarized_shift_hours}
                        error={errors.standarized_shift_hours}
                        helperText={errors.standarized_shift_hours}
                        type="number"
                        onChange={handleChange}
                        label="Shift Hours"
                    />
                    <TextField
                        disabled={isView}
                        name="standard_monthly_days"
                        value={values.standard_monthly_days}
                        error={errors.standard_monthly_days}
                        helperText={errors.standard_monthly_days}
                        type="number"
                        onChange={handleChange}
                        label="Standard Monthly Days"
                    />
                    <TextField
                        disabled={isView}
                        name="payment_day_of_month"
                        value={values.payment_day_of_month}
                        error={errors.payment_day_of_month}
                        helperText={errors.payment_day_of_month}
                        type="number"
                        onChange={handleChange}
                        label="Day of monthly payment"
                    />
                    <TextField
                        disabled={isView}
                        name="min_half_day_hours"
                        value={values.min_half_day_hours}
                        error={errors.min_half_day_hours}
                        helperText={errors.min_half_day_hours}
                        type="number"
                        onChange={handleChange}
                        label="Min working hours for Halfday"
                    />
                    <TextField
                        disabled={isView}
                        name="smtp_username"
                        value={values.smtp_username}
                        error={errors.smtp_username}
                        helperText={errors.smtp_username}
                        type="string"
                        onChange={handleChange}
                        label="SMTP Username"
                    />

                    <TextField
                        disabled={isView}
                        name="smtp_password"
                        value={values.smtp_password}
                        error={errors.smtp_password}
                        helperText={errors.smtp_password}
                        type="string"
                        onChange={handleChange}
                        label="SMTP Password"
                    />
                    <TextField
                        disabled={isView}
                        name="payment_day_of_month"
                        value={values.payment_day_of_month}
                        error={errors.payment_day_of_month}
                        helperText={errors.payment_day_of_month}
                        type="number"
                        onChange={handleChange}
                        label="Payment Day Of Month"
                    />
                    <TextField
                        disabled={isView}
                        select
                        name="salary_freq"
                        value={values.salary_freq}
                        onChange={handleChange}
                        label="Base Salary"
                        error={errors.salary_freq}
                        helperText={errors.salary_freq}
                    >
                        {Object.entries(BASE_SALARY_TYPES).map((val, index) => (
                            <MenuItem key={val[0] + index} value={val[1]}>
                                {val[0]}
                            </MenuItem>
                        ))}
                    </TextField>
                    {!isView && (
                        <Stack direction="row" justifyContent="flex-end">
                            <LoadingButton variant="contained" type="submit" loading={isSubmitting || loading}>
                                Save
                            </LoadingButton>
                        </Stack>
                    )}
                </Stack>
            </Card>
        </form>
    );
}

export default CompanyDetailsForm;
