/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// material-ui
import {
    Grid,
    Stack,
    TextField,
    Typography,
    Button,
    IconButton,
    FormHelperText,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';

// project imports
import Avatar from 'ui-component/extended/Avatar';
import { gridSpacing } from 'store/constant';
import { useDispatch, useSelector } from 'store';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import AnimateButton from 'ui-component/extended/AnimateButton';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from './MainCard';
import { PayrollActions } from 'store/slices/payroll';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { openSnackbar } from 'store/slices/snackbar';

// assets
import CircleIcon from '@mui/icons-material/Circle';
import { useNavigate } from 'react-router-dom';
import EarningDetails from './EarningDetails';
import IncentiveDetails from './IncentiveDetails';
import DeductionDetails from './DeductionDetails';
import { findKeyInObject } from 'utils/findKeyInObjects';

// ==============================|| PROFILE 2 - USER PROFILE ||============================== //
const defaultVal = {
    name: '',
    type: 'NORMAL',
    amount: 0
};

const SalaryStructureDefaultValues = {
    // base_salary_type: 'Monthly',
    base_salary_amount: 5000,
    currency_type: 'USD',
    earnings: [
        {
            name: 'Allowance',
            type: 'NORMAL',
            amount: 200
        },
        {
            name: 'Performance',
            type: 'PERCENTAGE',
            amount: 10
        }
    ],
    incentive: [
        {
            name: 'Performance Bonus',
            type: 'PERCENTAGE',
            amount: 10
        }
    ],
    deduction: [
        {
            name: 'Health Insurance',
            type: 'NORMAL',
            amount: 50
        },
        {
            name: 'Income Tax',
            type: 'PERCENTAGE',
            amount: 15
        }
    ]
};

const SalaryAddEditForm = ({ comingFromSalaryHistory = false, viewOnly = false }) => {
    const url = window.location.pathname;
    var isEditing = url.includes('edit');
    const getBreadcrumbTitle = (isEditing, viewOnly) => {
        if (isEditing)
            return {
                heading: 'Edit Salary',
                links: [
                    { name: 'Payroll', href: '/payroll/list' },
                    { name: 'Edit', href: '/' }
                ]
            };
        if (viewOnly)
            return {
                heading: 'View Salary',
                links: [
                    { name: 'Payroll', href: '/payroll/list' },
                    { name: 'History', href: '/' }
                ]
            };
        return {
            heading: 'Create Salary',
            links: [
                { name: 'Payroll', href: '/payroll/list' },
                { name: 'Create', href: '/' }
            ]
        };
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const [salaryStructureData, setSalaryStructureData] = useState({});

    const { fetchPayrollId, createSalary, updateSalary, fetchSalaryStructureById } = PayrollActions;

    const { singlePayroll, selectedSalaryStructure } = useSelector((state) => state.payroll);

    useEffect(() => {
        if (comingFromSalaryHistory) {
            dispatch(fetchSalaryStructureById(id));
        } else {
            dispatch(fetchPayrollId(id));
        }
    }, [id]);

    useEffect(() => {
        if (comingFromSalaryHistory) {
            setSalaryStructureData(selectedSalaryStructure);
        } else {
            setSalaryStructureData(singlePayroll?.salary);
        }
    }, [singlePayroll, selectedSalaryStructure]);

    const validationSchema = Yup.object().shape({
        base_salary_amount: Yup.number().required('Base salary is required!'),
        currency_type: Yup.string().required('Currency type is required!'),
        ot_hours_amount: Yup.string().required('Salary OT-Hours is required!'),
        from_date: Yup.date().typeError('Invalid date!').required('Salary start date is required!'),
        paid_leave_encashment: Yup.number().required('Leave encashment is required!'),

        earnings: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().notRequired(),
                type: Yup.string().notRequired(),
                amount: Yup.number().notRequired()
            })
        ),
        incentive: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().notRequired(),
                type: Yup.string().notRequired(),
                amount: Yup.number().notRequired()
            })
        ),
        deduction: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().notRequired(),
                type: Yup.string().notRequired(),
                amount: Yup.number().notRequired()
            })
        )
    });

    return (
        <>
            <Breadcrumbs {...getBreadcrumbTitle(isEditing, viewOnly)} />
            <MainCard title="Salary structure" content={true}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        base_salary_amount: salaryStructureData?.base_salary_amount || SalaryStructureDefaultValues?.base_salary_amount,
                        currency_type: salaryStructureData?.currency_type || 'USD',

                        from_date: salaryStructureData?.from_date || singlePayroll?.payroll_start_date || new Date(),
                        paid_leave_encashment: salaryStructureData?.paid_leave_encashment || '',
                        // base_salary_type: salaryStructureData?.base_salary_type || 'Monthly',
                        ot_hours_amount: salaryStructureData?.ot_hours_amount || '',

                        earnings: salaryStructureData?.earnings || SalaryStructureDefaultValues?.earnings,
                        incentive: salaryStructureData?.incentive || SalaryStructureDefaultValues?.incentive,
                        deduction: salaryStructureData?.deduction || SalaryStructureDefaultValues?.deduction
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            let res;
                            const salary_id = salaryStructureData?.salary_id;
                            if (comingFromSalaryHistory) {
                                if (!comingFromSalaryHistory) delete values?.end_date;
                                res = await dispatch(updateSalary({ data: values, salary_id }));
                            } else {
                                res = await dispatch(createSalary({ data: values, id }));
                            }
                            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: isEditing ? `Salary updated successfully` : `Salary created successfully`,
                                        variant: 'alert',
                                        alert: {
                                            color: 'success'
                                        },
                                        close: true
                                    })
                                );
                                setStatus({ success: true });
                                setSubmitting(false);
                                navigate('/payroll/list');
                            } else {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message:
                                            findKeyInObject(res?.payload, `message`) ||
                                            findKeyInObject(res?.payload, `error`) ||
                                            `Internal server error.`,
                                        variant: 'alert',
                                        alert: {
                                            color: 'error'
                                        },
                                        close: true
                                    })
                                );
                            }
                        } catch (err) {
                            //  console.log(err);
                            setStatus({ success: false });
                            setErrors({ submit: 'Invalid credentials' });
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, handleSubmit, handleChange, handleBlur, isSubmitting, values, touched, setFieldValue }) => (
                        <Grid item xs={12} sx={{ pointerEvents: viewOnly ? 'none' : '' }}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <SubCard title="Salary Details" darkTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Base salary"
                                                    name="base_salary_amount"
                                                    value={values.base_salary_amount}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    type="number"
                                                    required
                                                />
                                                {touched.base_salary_amount && errors.base_salary_amount && (
                                                    <FormHelperText error>{errors.base_salary_amount}</FormHelperText>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="OT Hour Amount"
                                                    name="ot_hours_amount"
                                                    value={values.ot_hours_amount}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    type="number"
                                                    required
                                                />
                                                {touched.ot_hours_amount && errors.ot_hours_amount && (
                                                    <FormHelperText error>{errors.ot_hours_amount}</FormHelperText>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth required>
                                                    <InputLabel id="Currency-label">Currency type</InputLabel>
                                                    <Select
                                                        id="currency_type"
                                                        name="currency_type"
                                                        value={values.currency_type}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Currency type"
                                                    >
                                                        <MenuItem value="INR">INR</MenuItem>
                                                        <MenuItem value="USD">USD</MenuItem>
                                                        <MenuItem value="JPY">JPY</MenuItem>
                                                        <MenuItem value="AUD">AUD</MenuItem>
                                                    </Select>
                                                    {touched.currency_type && errors.currency_type && (
                                                        <FormHelperText error>{errors.currency_type}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <DatePicker
                                                    disabled={comingFromSalaryHistory}
                                                    label="Effective from"
                                                    name="from_date"
                                                    value={values.from_date}
                                                    minDate={
                                                        salaryStructureData?.from_date || singlePayroll?.payroll_start_date || new Date()
                                                    }
                                                    onBlur={handleBlur}
                                                    onChange={(value) => setFieldValue('from_date', value, true)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            fullWidth
                                                            InputLabelProps={{ shrink: true }}
                                                            error={false}
                                                            required
                                                        />
                                                    )}
                                                />
                                                {touched.from_date && errors.from_date && (
                                                    <FormHelperText error>{errors.from_date}</FormHelperText>
                                                )}
                                            </Grid>

                                            {/* <Grid item xs={12} sm={6}>
                                                <DatePicker
                                                    label="To date"
                                                    name="end_date"
                                                    value={values.end_date}
                                                    onBlur={handleBlur}
                                                    onChange={(value) => setFieldValue('end_date', value, true)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            fullWidth
                                                            InputLabelProps={{ shrink: true }}
                                                            error={false}
                                                            required
                                                        />
                                                    )}
                                                />
                                                {touched.end_date && errors.end_date && (
                                                    <FormHelperText error>{errors.end_date}</FormHelperText>
                                                )}
                                            </Grid> */}

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Paid leave encashment"
                                                    name="paid_leave_encashment"
                                                    value={values.paid_leave_encashment}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    type="number"
                                                    required
                                                />
                                                {touched.paid_leave_encashment && errors.paid_leave_encashment && (
                                                    <FormHelperText error>{errors.paid_leave_encashment}</FormHelperText>
                                                )}
                                            </Grid>

                                            {/* <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth required>
                                                    <InputLabel id="Currency-label">Base salary type</InputLabel>
                                                    <Select
                                                        id="base_salary_type"
                                                        name="base_salary_type"
                                                        value={values.base_salary_type}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Base salary type"
                                                    >
                                                        <MenuItem value="Hourly">Hourly</MenuItem>
                                                        <MenuItem value="Daily">Daily</MenuItem>
                                                        <MenuItem value="Monthly">Monthly</MenuItem>
                                                    </Select>
                                                    {touched.base_salary_type && errors.base_salary_type && (
                                                        <FormHelperText error>{errors.base_salary_type}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid> */}
                                        </Grid>
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <SubCard title="Earnings details" darkTitle>
                                        <EarningDetails values={values} handleChange={handleChange} viewOnly={viewOnly} />
                                    </SubCard>
                                </Grid>

                                {/* <Grid item xs={12}>
                                    <SubCard title="Incentive details" darkTitle>
                                        <IncentiveDetails values={values} handleChange={handleChange}/>
                                    </SubCard>
                                </Grid> */}

                                <Grid item xs={12}>
                                    <SubCard title="Deduction details" darkTitle>
                                        <DeductionDetails values={values} handleChange={handleChange} viewOnly={viewOnly} />
                                    </SubCard>
                                </Grid>
                            </Grid>

                            <Grid container justifyContent="end" marginTop={4}>
                                <Grid item>
                                    {!viewOnly && (
                                        <AnimateButton>
                                            <LoadingButton
                                                loading={isSubmitting}
                                                variant="contained"
                                                y
                                                size="large"
                                                onClick={() => {
                                                    console.log(errors);
                                                    handleSubmit();
                                                }}
                                            >
                                                {isEditing ? 'Save' : 'Create'}
                                            </LoadingButton>
                                        </AnimateButton>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Formik>
            </MainCard>
        </>
    );
};

export default SalaryAddEditForm;
