/* eslint-disable */
import * as React from 'react';
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
    InputLabel, Box
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
import { findKeyInObject } from 'utils/findKeyInObjects';

// ==============================|| PROFILE 2 - USER PROFILE ||============================== //

const BonusAddEditForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    var url = window.location.pathname;

    var id = url.substring(url.lastIndexOf('/') + 1);
    var isEditing = url.includes('edit')

    const {  fetchPayrollId, createBonus, updateBonus} = PayrollActions;

    const { singlePayroll } = useSelector((state) => state.payroll);

    React.useEffect(() => {
        dispatch(fetchPayrollId(id));
    }, [id]);

    console.log(singlePayroll)

    const validationSchema = Yup.object().shape({
        bonus_status: Yup.string().required('Bonus status os mandatory'),
        bonus_amount: Yup.number().required('Bonus amount is required!'),
        currency_type: Yup.string().required('Currency type is required!'),
        bonus_date: Yup.date().typeError('Invalid date!').required('Bonus date is required!'),
        bonus_type: Yup.string().required("Bonus type is required"),

    });

    return (
        <>
            <Breadcrumbs
                heading={isEditing ? 'Edit Bonus' : 'Create Bonus'}
                links={[
                    { name: 'Payroll', href: '/payroll/list' },
                    { name: isEditing ? 'Edit' : 'Add', href: '/' }
                ]}
            />
            <MainCard title="Bonus Details" content={true}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        bonus_status: singlePayroll?.bonus?.length > 0 ? singlePayroll?.bonus[0]?.bonus_status : '',
                        bonus_amount: singlePayroll?.bonus?.length > 0 ? singlePayroll?.bonus[0]?.bonus_amount : '',
                        currency_type: singlePayroll?.bonus?.length > 0 ? singlePayroll?.bonus[0]?.currency_type : '',
                        bonus_date: singlePayroll?.bonus?.length > 0 ? singlePayroll?.bonus[0]?.bonus_date : new Date(),
                        bonus_type: singlePayroll?.bonus?.length > 0 ? singlePayroll?.bonus[0]?.bonus_type : '',

                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {

                            let res;
                            if (isEditing) {
                                const bonus_id = singlePayroll?.bonus[0]?.bonus_id
                                res = await dispatch(updateBonus({data: values, bonus_id}));
                            }
                            else {
                                res = await dispatch(createBonus({ data: values, id }));
                            }
                            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: isEditing ? `Bonus updated successfully` : `Bonus created successfully`,
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
                                        message:  findKeyInObject(res?.payload, `message`) ||
                                        findKeyInObject(res?.payload, `error`) || `Internal server error.`,
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
                        <Grid item xs={12}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <SubCard darkTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth required>
                                                    <InputLabel id="status-label">Bonus status</InputLabel>
                                                    <Select
                                                        id="bonus_status"
                                                        name="bonus_status"
                                                        value={values.bonus_status}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Bonus status"
                                                    >
                                                        <MenuItem value="Pending">Pending</MenuItem>
                                                        <MenuItem value="Paid">Paid</MenuItem>
                                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                                    </Select>
                                                    {touched.bonus_status && errors.bonus_status && (
                                                        <FormHelperText error>{errors.bonus_status}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Bonus amount"
                                                    name="bonus_amount"
                                                    value={values.bonus_amount}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    required
                                                    type='number'
                                                />
                                                {touched.bonus_amount && errors.bonus_amount && (
                                                    <FormHelperText error>{errors.bonus_amount}</FormHelperText>
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
                                                    label="Bonus date"
                                                    name="bonus_date"
                                                    value={values.bonus_date}
                                                    onBlur={handleBlur}
                                                    onChange={(value) => setFieldValue('bonus_date', value, true)}
                                                    renderInput={(params) => (
                                                        <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} required/>
                                                    )}
                                                />
                                                {touched.bonus_date && errors.bonus_date && (
                                                    <FormHelperText error>{errors.bonus_date}</FormHelperText>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Bonus type"
                                                    name="bonus_type"
                                                    value={values.bonus_type}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {touched.bonus_type && errors.bonus_type && (
                                                    <FormHelperText error>{errors.bonus_type}</FormHelperText>
                                                )}
                                            </Grid>

                                        </Grid>
                                    </SubCard>
                                </Grid>

                            </Grid>

                            <Grid container justifyContent="end" marginTop={4}>
                                <Grid item>
                                    <AnimateButton>
                                        <LoadingButton
                                            loading={isSubmitting}
                                            variant="contained"
                                            y
                                            size="large"
                                            onClick={handleSubmit}
                                        >
                                            {isEditing? "Save" : "Create"}
                                        </LoadingButton>
                                    </AnimateButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Formik>

            </MainCard>
        </>
    );
};

export default BonusAddEditForm;
