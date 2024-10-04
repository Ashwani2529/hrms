import * as Yup from 'yup';
import {
    Autocomplete,
    Box,
    Button,
    DialogContent,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Checkbox
} from '@mui/material';
import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKSelect from 'views/ui-elements/form/FKSelect';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import FKMultiSelect from 'views/ui-elements/form/FKMultiSelect';
import { CheckBoxOutlineBlankOutlined, CheckBoxOutlined, Close } from '@mui/icons-material';
import FKSingleUpload from 'views/ui-elements/form/FKSingleUpload';
import UploadExcelForBulk from './UploadExcelForBulkEmail';
import axiosServices from 'utils/axios';
import { downloadBlobFile } from 'utils/downloadBlobFile';
import { openSnackbar } from 'store/slices/snackbar';
import { TemplateActions } from 'store/slices/templates';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { openPreviewtemplateModal } from 'store/slices/previewSelectedTemplate';
import { useNavigate } from 'react-router-dom';

const icon = <CheckBoxOutlineBlankOutlined fontSize="small" />;
const checkedIcon = <CheckBoxOutlined fontSize="small" />;

function SendBulkEmail({ handleCloseSendBulkEmailModal }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { fetchTemplates } = TemplateActions;
    const { templates, loading } = useSelector((state) => state.templates);
    const { employee } = useSelector((state) => state.employee);
    const initialValues = {
        template_id: '',
        userIds: []
    };

    const validationSchema = Yup.object({
        template_id: Yup.string().required('Please select a template'),
        userIds: Yup.array().min(1, 'Please select some employees')
    });

    const onSubmit = async (values) => {
        try {
            const selectedTemplate = templates?.find((template) => template?.template_id === values.template_id);
            const data = { ...values, userIds: values?.userIds?.map((user) => user?.user_id) };

            if (Array.isArray(selectedTemplate?.custom_variables) && selectedTemplate?.custom_variables.length > 0) {
                // Call the /user-doc/generateDocSampleExcel API to download the excel sheet
                const res = await axiosServices.post(`/user-doc/generateDocSampleExcel`, data, { responseType: 'blob' });
                downloadBlobFile(
                    res,
                    `bulk_email-[${values.template_id}].xlsx`,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                if (res.status === 201) {
                    dispatch(
                        openSnackbar({
                            open: true,
                            message: 'Request processed successfully!',
                            variant: 'alert',
                            alert: {
                                color: 'success'
                            },
                            close: false
                        })
                    );
                    navigate('/letter-templates/create');
                    handleCloseSendBulkEmailModal();
                    window.location.reload();
                } else {
                    throw new Error('Failed to process request!');
                }
            } else {
                // call the /user-doc/create-multiple-without-file API
                dispatch(
                    openConfirmationModal({
                        open: true,
                        message:
                            'The selected template does not require custom variables. You can proceed further without downloading the excel template.',
                        handleConfirm: async () => {
                            const res = await axiosServices.post(`/user-doc/create-multiple-without-file`, data);
                            if (res.status === 201) {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: 'Request processed successfully!',
                                        variant: 'alert',
                                        alert: {
                                            color: 'success'
                                        },
                                        close: false
                                    })
                                );
                                navigate('/letter-templates/create');
                            } else {
                                dispatch(
                                    openSnackbar({
                                        open: true,
                                        message: 'Failed to process the request!',
                                        variant: 'alert',
                                        alert: {
                                            color: 'error'
                                        },
                                        close: false
                                    })
                                );
                            }
                        }
                    })
                );
            }

            handleCloseSendBulkEmailModal();
        } catch (error) {
            console.log(error);
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || 'Failed to download sample template!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: false
                })
            );
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        validateOnBlur: true,
        validateOnChange: true,
        enableReinitialize: true
    });

    const { errors, setFieldValue, isSubmitting, values } = formik;

    const handleOpenPreviewTemplate = () => {
        dispatch(openPreviewtemplateModal({ open: true, template_id: values?.template_id }));
    };

    useEffect(() => {
        dispatch(fetchTemplates());
    }, []);

    return (
        <DialogContent sx={{ minWidth: 600 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h3">Send Bulk Email</Typography>
                <IconButton onClick={handleCloseSendBulkEmailModal}>
                    <Close />
                </IconButton>
            </Stack>
            <Divider />
            <Box mt={2}>
                <FKProvider value={formik}>
                    <FKSelect name="template_id" label="Template">
                        {templates?.map((template, index) => (
                            <MenuItem key={template?.template_id} value={template?.template_id}>
                                {template.template_name}
                            </MenuItem>
                        ))}
                    </FKSelect>
                    <FKMultiSelect
                        name="userIds"
                        options={employee}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option?.user_name}
                        onChange={(e, value) => {
                            setFieldValue('userIds', value, true);
                        }}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                                {option?.user_name}
                            </li>
                        )}
                        renderInput={(params) => <TextField {...params} label="Select Employees" placeholder="Employees" />}
                    />
                    <Box mt={2}>
                        <Typography
                            component="a"
                            href="/letter-templates/create"
                            sx={{
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'primary.dark'
                                },
                                '&:focus': {
                                    textDecoration: 'underline',
                                    color: 'primary.dark'
                                }
                            }}
                        >
                            Or create a New Letter Template
                        </Typography>
                    </Box>
                    <Typography>
                        NOTE: Please do not change the id ( enclosed within [ ] ) provided in the filename of the downloaded sample sheet
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
                        {values?.template_id && (
                            <Button variant="outlined" onClick={handleOpenPreviewTemplate}>
                                Preview Template
                            </Button>
                        )}
                        <LoadingButton type="submit" loading={isSubmitting} variant="contained">
                            Proceed
                        </LoadingButton>
                    </Stack>
                </FKProvider>
                <Divider sx={{ my: 2 }}>OR</Divider>
                <UploadExcelForBulk handleCloseSendBulkEmailModal={handleCloseSendBulkEmailModal} />
            </Box>
        </DialogContent>
    );
}

export default SendBulkEmail;
