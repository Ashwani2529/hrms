/* eslint-disable */
import * as React from 'react';
// material-ui
import { Grid, IconButton, FormHelperText, Avatar } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';

// project imports
import { gridSpacing } from 'store/constant';
import { useDispatch } from 'store';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AnimateButton from 'ui-component/extended/AnimateButton';
import SubCard from 'ui-component/cards/SubCard';
import MainCard from '../../dashboard/Employees/MainCard';
import { EmployeeActions } from 'store/slices/employee';

import { openSnackbar } from 'store/slices/snackbar';

// assets
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import uploadFileToS3 from 'utils/uploadFileToS3';
import PersonalDetails from './PersonalDetails';
import AddressDetails from './AddressDetails';
import BankDetails from './BankDetails';
import DocumentsDetail from './DocumentsDetail';
import EmergencyContactDetails from './EmergencyContactDetails';
import { findKeyInObject } from 'utils/findKeyInObjects';

// ==============================|| PROFILE 2 - USER PROFILE ||============================== //

const EmployeeAddEditForm = () => {
    const { user } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    var url = window.location.pathname;
    var id = url.substring(url.lastIndexOf('/') + 1);

    // React.useEffect(() => {
    //     const handleBackButton = (e) => {
    //         e.preventDefault();
    //         window.alert("You have an unsaved change. Please save it.")
    //         navigate('/user/details');
    //         return;
    //     };
    //     window.history.pushState(null, document.title, window.location.href);
    //     window.addEventListener('popstate', handleBackButton);

    //     return () => {
    //       window.removeEventListener('popstate', handleBackButton);
    //     };
    //   }, [navigate]);

    //States
    const [uploading, setUploading] = React.useState(false);
    const [fileUploading, setFileUploading] = React.useState('');
    const [view_profile_photo, setViewProfilePhoto] = React.useState();

    const { updateEmployee } = EmployeeActions;

    //Profile picture upload and view
    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        setUploading(true);

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                setViewProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);

            // Uploadind file to S3 Object Storage
            try {
                const url = await uploadFileToS3(file);
                dispatch(
                    openSnackbar({
                        open: true,
                        message: `Image successfully uploaded`,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                setUploading(false);
                return url;
            } catch (error) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Error occured while uploading file!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
                setUploading(false);
                return '';
            }
        }
        return '';
    };

    const handleDocumentUpload = async (event, type) => {
        const file = event.target.files[0];

        if (file) {
            // Uploadind file to S3 Object Storage
            try {
                const url = await uploadFileToS3(file);
                dispatch(
                    openSnackbar({
                        open: true,
                        message: `File successfully uploaded`,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                return url;
            } catch (error) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Error occured while uploading file!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
                return '';
            }
        }
        return '';
    };

    const getOriginalKeyFromPresignedUrl = (presignedUrl) => {
        try {
            const url = new URL(presignedUrl);
            const key = decodeURIComponent(url.pathname.substring(1));
            return key;
        } catch (error) {
            return null;
        }
    };

    const validationSchema = Yup.object().shape({
        firstname: Yup.string().required('First name is required!'),
        middlename: Yup.string().notRequired(),
        lastname: Yup.string().required('Last name is required!'),
        gender: Yup.string().required('Gender is required!'),
        date_of_birth: Yup.date().typeError('Invalid date!').required('Date of birth is required!'),
        personal_email: Yup.string().required('Personal email is required!'),
        phone_number: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,'Phone number is not valid').notRequired(),
        user_bank: Yup.object().shape({
            account_number: Yup.string().required('Bank account number is required!'),
            ifsc_code: Yup.string().required('IFSC Code is required!'),
            bank_name: Yup.string().required('Bank Name is required!'),
            pf_account_number: Yup.string().notRequired(),
            universal_account_number: Yup.string().notRequired()
        }),

        user_address: Yup.object().shape({
            street: Yup.string().notRequired(),
            city: Yup.string().required('City is required!'),
            country: Yup.string().required('Country is required!'),
            zip: Yup.number().required('Zipcode is required!'),
            state: Yup.string().required('State is required')
        }),

        user_permanent_address: Yup.object().shape({
            street: Yup.string().notRequired(),
            city: Yup.string().required('City is required!'),
            country: Yup.string().required('Country is required!'),
            zip: Yup.number().required('Zipcode is required!'),
            state: Yup.string().required('State is required')
        }),
        profile_photo: Yup.string().required('Profile picture is required!'),

        // User dcoument
        user_documents: Yup.object().shape({
            aadhar: Yup.string().required('Aadhar is required'),
            pan: Yup.string().required('PAN Card is required'),
            cheque: Yup.string().required('Bank cheque is required'),
            graduation: Yup.string().notRequired(),
            masters: Yup.string().notRequired()
            // goverment_id: Yup.string().required('Goverment id is required')
        }),
        emergency_contacts_data: Yup.array().of(
            Yup.object({
                name: Yup.string().required('Name is required'),
                phone: Yup.string().required('Contact No. is required'),
                relationship: Yup.string().required('Relationship is required')
            })
        )
    });

    return (
        <>
            <MainCard title="" content={true}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        firstname: user?.firstname || '',
                        middlename: user?.middlename || '',
                        lastname: user?.lastname || '',
                        gender: user?.gender || '',
                        date_of_birth: user?.date_of_birth || '',
                        personal_email: user?.personal_email || '',
                        phone_number: user?.phone_number || '',
                        profile_photo: user?.profile_photo || '',

                        user_bank: {
                            account_number: user?.user_bank?.account_number || '',
                            bank_name: user?.user_bank?.bank_name || '',
                            ifsc_code: user?.user_bank?.ifsc_code || '',
                            pf_account_number: user?.user_bank?.pf_account_number || '',
                            universal_account_number: user?.user_bank?.universal_account_number || ''
                        },

                        user_address: {
                            street: user?.user_address?.street || '',
                            city: user?.user_address?.city || '',
                            country: user?.user_address?.country || '',
                            zip: user?.user_address?.zip || '',
                            state: user?.user_address?.state || ''
                        },
                        user_permanent_address: {
                            street: user?.user_permanent_address?.street || '',
                            city: user?.user_permanent_address?.city || '',
                            country: user?.user_permanent_address?.country || '',
                            zip: user?.user_permanent_address?.zip || '',
                            state: user?.user_permanent_address?.state || ''
                        },
                        user_documents: {
                            aadhar: getOriginalKeyFromPresignedUrl(user?.user_documents?.aadhar) || '',
                            pan: getOriginalKeyFromPresignedUrl(user?.user_documents?.pan) || '',
                            graduation: getOriginalKeyFromPresignedUrl(user?.user_documents?.graduation) || '',
                            masters: getOriginalKeyFromPresignedUrl(user?.user_documents?.masters) || '',
                            goverment_id: getOriginalKeyFromPresignedUrl(user?.user_documents?.goverment_id) || '',
                            cheque: getOriginalKeyFromPresignedUrl(user?.user_documents?.cheque) || ''
                        },
                        emergency_contacts_data:
                            Array.isArray(user?.emergency_contacts_data) && user?.emergency_contacts_data[0]
                                ? user?.emergency_contacts_data
                                : [
                                      {
                                          name: '',
                                          phone: '',
                                          relationship: ''
                                      }
                                  ]
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            const newFields = {
                                ...values
                            };
                            let res;
                            res = await dispatch(updateEmployee({ data: newFields, id: user?.user_id }));

                            if (res?.payload?.status === 200 || res?.payload?.status === 201) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: `Details saved successfully`,
                                        variant: 'alert',
                                        alert: {
                                            color: 'success'
                                        },
                                        close: true
                                    })
                                );
                                setStatus({ success: true });
                                setSubmitting(false);
                                navigate('/user/account-profile');
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
                            console.errr(err);
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
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <input
                                                accept="image/*"
                                                id="upload-avatar-pic"
                                                type="file"
                                                hidden
                                                onChange={async (event) => {
                                                    const url = await handleProfilePicChange(event);
                                                    setFieldValue('profile_photo', url, true);
                                                }}
                                            />
                                            <label htmlFor="upload-avatar-pic" style={{ display: 'flex' }}>
                                                <IconButton component="span">
                                                    <Avatar
                                                        size="xl"
                                                        sx={{ height: '70px', width: '70px' }}
                                                        src={view_profile_photo || user?.profile_photo}
                                                    >
                                                        {uploading ? <CircularProgress style={{ width: 20, height: 20 }} /> : null}
                                                    </Avatar>
                                                </IconButton>
                                            </label>
                                            {touched.profile_photo && errors.profile_photo && (
                                                <FormHelperText error>{errors.profile_photo}</FormHelperText>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <SubCard title="Personal Details" darkTitle>
                                        <PersonalDetails
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            touched={touched}
                                            errors={errors}
                                        />
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <SubCard title="Address Details" darkTitle>
                                        <AddressDetails
                                            values={values}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            touched={touched}
                                            errors={errors}
                                            setFieldValue={setFieldValue}
                                        />
                                    </SubCard>
                                </Grid>
                                <Grid item xs={12}>
                                    <SubCard title="Emergency Contact" darkTitle>
                                        <EmergencyContactDetails
                                            values={values}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            touched={touched}
                                            errors={errors}
                                        />
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <SubCard title="Bank details" darkTitle>
                                        <BankDetails
                                            values={values}
                                            handleChange={handleChange}
                                            handleBlur={handleBlur}
                                            touched={touched}
                                            errors={errors}
                                        />
                                    </SubCard>
                                </Grid>

                                <Grid item xs={12}>
                                    <SubCard title="Documents" darkTitle>
                                        <DocumentsDetail
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            touched={touched}
                                            errors={errors}
                                            handleDocumentUpload={handleDocumentUpload}
                                            user={user}
                                        />
                                    </SubCard>
                                </Grid>
                            </Grid>

                            <Grid container justifyContent="end" marginTop={4}>
                                <Grid item>
                                    <AnimateButton>
                                        <LoadingButton
                                            loading={isSubmitting || uploading || fileUploading.length > 0}
                                            variant="contained"
                                            size="large"
                                            onClick={() => {
                                                console.log(errors);
                                                handleSubmit();
                                            }}
                                        >
                                            Save
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

export default EmployeeAddEditForm;
