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
    InputLabel,
    Divider,
    Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';

// project imports
import Avatar from 'ui-component/extended/Avatar';
import { gridSpacing, roles } from 'store/constant';
import { useDispatch, useSelector } from 'store';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AnimateButton from 'ui-component/extended/AnimateButton';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from './MainCard';
import { EmployeeActions } from 'store/slices/employee';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { createClient } from '@supabase/supabase-js';
import { openSnackbar } from 'store/slices/snackbar';

// assets
import CircleIcon from '@mui/icons-material/Circle';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import ExcelUploadComponent from './ExcelUploadComponent';
import { findKeyInObject } from 'utils/findKeyInObjects';

// ==============================|| PROFILE 2 - USER PROFILE ||============================== //

const EmployeeAddEditForm = () => {
    const { company_id } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const [user, setUser] = React.useState({});
    const [sendEmail, setSendEmail] = React.useState(false);
    var url = window.location.pathname;
    var id = url.substring(url.lastIndexOf('/') + 1);

    // Excel uplaod state
    const [uploading, setUploading] = React.useState(true);

    const { createEmployee, fetchEmployeeById, updateEmployee } = EmployeeActions;

    const { singleEmployee } = useSelector((state) => state.employee);
    const { roles } = useSelector((state) => state.roles);

    React.useEffect(() => {
        dispatch(fetchEmployeeById(id));
    }, [id]);

    React.useEffect(() => {
        setUser(singleEmployee);
    }, [singleEmployee]);

    const validationSchema = Yup.object().shape({
        user_name: Yup.string().nullable(),
        firstname: Yup.string().required('Firstname is required!'),
        middlename: Yup.string().nullable(),
        lastname: Yup.string().required('Lastname is required!'),
        status: Yup.string().required('Status is required!'),
        date_of_joining: Yup.date().typeError('Invalid date!').required('Joining date is required!'),
        user_email: Yup.string().required('Email is required!'),
        employement_type: Yup.string().required('Employment type is required!'),
        user_device_id: Yup.string().nullable(),
        role_id: Yup.string().required('Role is required!'),
        company_id: Yup.string().nullable(),
        sick_leaves: Yup.number().notRequired(),
        casual_leaves: Yup.number().notRequired(),
        phone_number: Yup.string()
            .matches(
                /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
                'Phone number is not valid'
            )
            .notRequired(),
        // paid_leaves: Yup.number().notRequired(),
        // unpaid_leaves: Yup.number().notRequired(),
        //This might be removed
        user_bank: Yup.object().shape({
            account_number: Yup.string().notRequired(),
            ifsc_code: Yup.string().notRequired(),
            bank_name: Yup.string().notRequired(),
            pf_account_number: Yup.string().notRequired(),
            universal_account_number: Yup.string().notRequired()
        })
    });

    return (
        <>
            <Breadcrumbs
                heading={id != 'add' ? 'Edit Employee' : 'Add Employee'}
                links={[
                    { name: 'Employees', href: '/employees/list' },
                    { name: id != 'add' ? 'Edit' : 'Add', href: '/' }
                ]}
            />

            <MainCard title="Account settings" content={true}>
                {/* Excel uploading */}

                {id === 'add' ? (
                    <>
                        <ExcelUploadComponent uploading={uploading} setUploading={setUploading} company_id={company_id} />

                        <Divider spacing={1} sx={{ padding: '20px' }}>
                            OR
                        </Divider>
                    </>
                ) : null}

                <Formik
                    enableReinitialize
                    initialValues={{
                        user_name: user?.user_name || null,
                        firstname: user?.firstname || '',
                        middlename: user?.middlename || '',
                        lastname: user?.lastname || '',
                        user_email: user?.user_email || '',
                        company_id: user?.company_id || company_id,
                        status: user?.status || 'Inactive',
                        date_of_joining: user?.date_of_joining || null,
                        role_id: user?.role_id || '',
                        employement_type: user?.employement_type || '',
                        user_device_id: user?.user_device_id || null,
                        sick_leaves: user?.sick_leaves || 0,
                        casual_leaves: user?.casual_leaves || 0,
                        phone_number: user?.phone_number || '',
                        // paid_leaves: user?.paid_leaves || 0,
                        // unpaid_leaves: user?.unpaid_leaves || 0,
                        user_bank: {
                            account_number: user?.user_bank?.account_number || '',
                            bank_name: user?.user_bank?.bank_name || '',
                            ifsc_code: user?.user_bank?.ifsc_code || '',
                            pf_account_number: user?.user_bank?.pf_account_number || '',
                            universal_account_number: user?.user_bank?.universal_account_number || ''
                        }
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const newFields = {
                                ...values,
                                sendSignedDoc: sendEmail
                            };

                            let res;
                            if (id === 'add') {
                                res = await dispatch(createEmployee(newFields));
                            } else {
                                res = await dispatch(updateEmployee({ data: newFields, id }));
                            }
                            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: `Employee ${id === 'add' ? 'created' : 'updated'} successfully`,
                                        variant: 'alert',
                                        alert: {
                                            color: 'success'
                                        },
                                        close: true
                                    })
                                );
                                setStatus({ success: true });
                                setSubmitting(false);
                                if (sendEmail) {
                                    navigate(`/employees/send-letter/${res.payload?.data?.user_id}`);
                                } else {
                                    navigate('/employees/list');
                                }
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
                        <Grid item xs={12}>
                            <Grid container spacing={gridSpacing} xs={12} md={12}>
                                <Grid item xs={12}>
                                    <SubCard title="Personal Details" darkTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Firstname"
                                                    name="firstname"
                                                    required
                                                    value={values.firstname}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />

                                                {touched.firstname && errors.firstname && (
                                                    <FormHelperText error>{errors.firstname}</FormHelperText>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Middlename"
                                                    name="middlename"
                                                    value={values.middlename}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    required
                                                    label="Lastname"
                                                    name="lastname"
                                                    value={values.lastname}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                {touched.lastname && errors.lastname && (
                                                    <FormHelperText error>{errors.lastname}</FormHelperText>
                                                )}
                                            </Grid>
                                            {/* <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Username"
                                                    name="user_name"
                                                    value={values.user_name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </Grid> */}
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Email Address"
                                                    name="user_email"
                                                    value={values.user_email}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {touched.user_email && errors.user_email && (
                                                    <FormHelperText error>{errors.user_email}</FormHelperText>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Phone Number"
                                                    name="phone_number"
                                                    value={values.phone_number}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                />
                                                {touched?.phone_number && errors?.phone_number && (
                                                    <FormHelperText error>{errors.phone_number}</FormHelperText>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth required>
                                                    <InputLabel id="status-label">Status</InputLabel>
                                                    <Select
                                                        id="status"
                                                        name="status"
                                                        value={values.status}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        // onBlur={handleBlur}
                                                        label="Status"
                                                        sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
                                                    >
                                                        <MenuItem value="Active">
                                                            <CircleIcon
                                                                sx={{
                                                                    fontSize: '1rem',
                                                                    color: theme.palette.success.dark,
                                                                    marginRight: '10px'
                                                                }}
                                                            />
                                                            Active
                                                        </MenuItem>
                                                        <MenuItem value="Inactive">
                                                            <CircleIcon
                                                                sx={{
                                                                    fontSize: '1rem',
                                                                    color: theme.palette.warning.dark,
                                                                    marginRight: '10px'
                                                                }}
                                                            />
                                                            Inactive
                                                        </MenuItem>
                                                        <MenuItem value="Suspended">
                                                            <CircleIcon
                                                                sx={{
                                                                    fontSize: '1rem',
                                                                    color: `${theme.palette.error.dark}`,
                                                                    marginRight: '10px'
                                                                }}
                                                            />
                                                            Suspended
                                                        </MenuItem>
                                                    </Select>
                                                    {touched.status && errors.status && (
                                                        <FormHelperText error>{errors.status}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <DatePicker
                                                    label="Date of joining"
                                                    name="date_of_joining"
                                                    value={values.date_of_joining}
                                                    onBlur={handleBlur}
                                                    onChange={(value) => setFieldValue('date_of_joining', value, true)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            required
                                                            fullWidth
                                                            InputLabelProps={{ shrink: true }}
                                                            error={false}
                                                        />
                                                    )}
                                                />
                                                {touched.date_of_joining && errors.date_of_joining && (
                                                    <FormHelperText error>{errors.date_of_joining}</FormHelperText>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <SubCard title="Leave Details" darkTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Sick Leaves"
                                                    type="number"
                                                    name="sick_leaves"
                                                    value={values.sick_leaves}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Casual Leaves"
                                                    type="number"
                                                    name="casual_leaves"
                                                    value={values.casual_leaves}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    </SubCard>
                                </Grid>

                                {id !== 'add' && (
                                    <Grid item xs={12}>
                                        <SubCard title="PF Details" darkTitle>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        label="PF account no"
                                                        name="user_bank.pf_account_number"
                                                        value={values.user_bank.pf_account_number}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        label="UAN number"
                                                        type="number"
                                                        name="user_bank.universal_account_number"
                                                        value={values.user_bank.universal_account_number}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </SubCard>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <SubCard title="Other Details" darkTitle>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                {/* <Select
                                                        id="role_id"
                                                        name="role_id"
                                                        value={values.role_id}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        label="Role"
                                                    >
                                                        {roles.map((role) => (
                                                            <MenuItem key={role?.role_id} value={role?.role_id}>
                                                                {role?.role_name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> */}
                                                <TextField
                                                    select
                                                    fullWidth
                                                    label="Role"
                                                    onBlur={handleBlur}
                                                    name="role_id"
                                                    value={values.role_id}
                                                    required
                                                    onChange={handleChange}
                                                >
                                                    {roles?.map((role) => (
                                                        <MenuItem key={role?.role_id} value={role?.role_id}>
                                                            {role?.role_name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                                {touched.role_id && errors.role_id && (
                                                    <FormHelperText error>{errors.role_id}</FormHelperText>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Company"
                                                    name="company_id"
                                                    value={values.company_id}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    disabled
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    label="Device Id"
                                                    name="user_device_id"
                                                    value={values.user_device_id}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    id="employement_type"
                                                    select
                                                    fullWidth
                                                    name="employement_type"
                                                    value={values.employement_type}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    required
                                                    label={'Employment Type'}
                                                >
                                                    <MenuItem value="Full_Time">Full Time</MenuItem>
                                                    <MenuItem value="Part_Time">Part Time</MenuItem>
                                                    <MenuItem value="Contract">Contract</MenuItem>
                                                    <MenuItem value="Internship">Internship</MenuItem>
                                                </TextField>

                                                {touched.employement_type && errors.employement_type && (
                                                    <FormHelperText error>{errors.employement_type}</FormHelperText>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        {id === 'add' && (
                                            <Stack direction="row" alignItems="center">
                                                <Typography>Send Letter: </Typography>
                                                <Switch checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                                            </Stack>
                                        )}
                                        <AnimateButton>
                                            <LoadingButton loading={isSubmitting} variant="contained" y size="large" onClick={handleSubmit}>
                                                {id != 'add' ? 'Save' : 'Create'}
                                            </LoadingButton>
                                        </AnimateButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Formik>
            </MainCard>
        </>
    );
};

export default EmployeeAddEditForm;
