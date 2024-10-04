/* eslint-disable */
import React, { useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography,
    TextField,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicatorNumFunc } from 'utils/password-strength';
import { useDispatch, useSelector } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLocalizationContext } from '@mui/x-date-pickers/internals/hooks/useUtils';

// ========================|| FIREBASE - RESET PASSWORD ||======================== //

const AuthCreatePassword = ({ ...others }) => {
    const theme = useTheme();
    const scriptedRef = useScriptRef();
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const [level, setLevel] = React.useState();
    const { createPassword } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { search } = useLocation()
    const queryParams = new URLSearchParams(search);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const changePassword = (value) => {
        const temp = strengthIndicatorNumFunc(value);
        setStrength(temp);
        setLevel(strengthColor(temp));
    };

    return (
        <Formik
            initialValues={{
                confirmPassword: '',
                otp: '',
                submit: null
            }}
            validationSchema={Yup.object().shape({
                password: Yup.string().max(255).required('Password is required'),
                confirmPassword: Yup.string().when('password', {
                    is: (val) => !!(val && val.length > 0),
                    then: Yup.string().oneOf([Yup.ref('password')], 'Both Password must be match!')
                }),
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                    const queryParamsObject = {};
                    for (const [key, value] of queryParams.entries()) {
                        queryParamsObject[key] = value;
                    }
                    const newValues = {
                        ...queryParamsObject,
                        password: values.password
                    }

                    const res = await createPassword(newValues);

                    if (scriptedRef.current) {
                        setStatus({ success: true });
                        setSubmitting(false);
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: "Password successfully created!",
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: false
                            })
                        );

                        //Checking whether has already filled its detail or not
                        if (!res?.user?.isApproved && !res?.user?.user_documents) {
                            navigate('/user/details', { replace: true });
                        }
                        else {
                            setTimeout(() => {
                                navigate('/dashboard/default', { replace: true });
                            }, 1000);
                        }
                    }
                } catch (err) {
                    // console.log(err.message);
                    // alert(err.message);
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: err.message || `Something Went Wrong`,
                            variant: 'alert',
                            alert: {
                                color: 'error'
                            },
                            close: true
                        })
                    );
                    if (scriptedRef.current) {
                        setStatus({ success: false });
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }
            }}
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit} {...others}>

                    <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 2 }}>
                        <TextField
                            label='Password'
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            onChange={(e) => {
                                handleChange(e);
                                changePassword(e.target.value);
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                        size="large"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                        {touched.password && errors.password && (
                            <FormHelperText error id="standard-weight-helper-text-reset">
                                {errors.password}
                            </FormHelperText>
                        )}
                    </FormControl>
                    {strength !== 0 && (
                        <FormControl fullWidth>
                            <Box sx={{ mb: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                        <Box
                                            style={{ backgroundColor: level?.color }}
                                            sx={{
                                                width: 85,
                                                height: 8,
                                                borderRadius: '7px'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="subtitle1" fontSize="0.75rem">
                                            {level?.label}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </FormControl>
                    )}

                    <FormControl
                        fullWidth
                        error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                        sx={{ mb: 2 }}
                    >
                        <TextField
                            type="password"
                            value={values.confirmPassword}
                            name="confirmPassword"
                            label="Confirm Password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <FormHelperText error id="standard-weight-helper-text-confirm-password">
                                {' '}
                                {errors.confirmPassword}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                    {errors.submit && (
                        <Box
                            sx={{
                                mt: 3
                            }}
                        >
                            <FormHelperText error>{errors.submit}</FormHelperText>
                        </Box>
                    )}
                    <Box
                        sx={{
                            mt: 1
                        }}
                    >
                        <AnimateButton>
                            <Button
                                disableElevation
                                disabled={isSubmitting}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                color="secondary"
                            >
                                Create Password
                            </Button>
                        </AnimateButton>
                    </Box>
                </form>
            )}
        </Formik>
    );
};

export default AuthCreatePassword;
