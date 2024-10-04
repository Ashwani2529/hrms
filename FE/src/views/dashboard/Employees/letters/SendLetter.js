import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Box, Button, CardContent, Grid, MenuItem, Stack, Typography } from '@mui/material';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import { useFormik } from 'formik';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKTextfield from 'views/ui-elements/form/FKTextfield';
import FKSelect from 'views/ui-elements/form/FKSelect';
import { useSelector } from 'react-redux';
import { gridSpacing, TEMPLATE_SPECIAL_VARS } from 'store/constant';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import axiosServices from 'utils/axios';
import { LoadingButton } from '@mui/lab';
import { openPreviewtemplateModal } from 'store/slices/previewSelectedTemplate';

function SendLetter() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [initialValues, setIntialValues] = useState({
        usrdoc_title: '',
        usrdoc_description: '',
        usrdoc_variables_data: {}
    });
    const { templates } = useSelector((state) => state.templates);

    const validationSchema = useMemo(() => {
        const varsValidationObj = {};
        if (initialValues?.usrdoc_variables_data) {
            Object.keys(initialValues.usrdoc_variables_data).forEach((ele) => {
                varsValidationObj[ele] = Yup.string().required(`${ele} is a required field`);
            });
        }
        return Yup.object({
            usrdoc_title: Yup.string().required('Title is required'),
            usrdoc_description: Yup.string().required('Description is required'),
            usrdoc_variables_data: Yup.object(varsValidationObj)
        });
    }, [initialValues]);

    const onSubmit = async (values) => {
        const data = { ...values, user_id: employeeId };
        try {
            const res = await axiosServices.post('/user-doc', data);
            if (res.status === 201) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: 'Letter Sent Successfully!',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                navigate('/employees/list');
            }
        } catch (error) {
            console.log(error);
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Failed to send letter!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        enableReinitialize: true,
        validateOnBlur: false,
        validateOnChange: false
    });

    const { values, errors, isSubmitting } = formik;
    const templateId = values?.template_id;

    const handlePreviewTemplate = () => {
        dispatch(openPreviewtemplateModal({ open: true, template_id: templateId }));
    };

    useEffect(() => {
        const templateVars = templates?.find((ele) => ele.template_id === templateId)?.custom_variables;
        if (Array.isArray(templateVars)) {
            const data = { ...values };
            if (data?.usrdoc_variables_data) {
                data.usrdoc_variables_data = {};
                templateVars.forEach((val) => {
                    if (!TEMPLATE_SPECIAL_VARS.includes(val)) {
                        data.usrdoc_variables_data[val] = '';
                    }
                });
            }
            setIntialValues(data);
        }
    }, [templateId]);

    return (
        <Page title="Send Letter">
            <MainCard title="Send Letter">
                <CardContent>
                    <Box sx={{ maxWidth: 800, m: 'auto' }}>
                        <FKProvider value={formik}>
                            <FKTextfield name="usrdoc_title" label="Title" />
                            <FKTextfield name="usrdoc_description" label="Description" />
                            <FKSelect name="template_id" label="Template">
                                {templates
                                    ?.filter((e) => !e?.default)
                                    ?.map((template) => (
                                        <MenuItem key={template?.template_id} value={template?.template_id}>
                                            {template?.template_name}
                                        </MenuItem>
                                    ))}
                            </FKSelect>
                            {!!values.usrdoc_variables_data && (
                                <Grid container spacing={gridSpacing} xs={12} md={12}>
                                    {Object.keys(values.usrdoc_variables_data).map((val) => (
                                        <Grid item xs={12} md={6}>
                                            <FKTextfield fullWidth name={`usrdoc_variables_data.${val}`} label={val} />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                            <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
                                {templateId && (
                                    <Button onClick={handlePreviewTemplate} variant="outlined">
                                        Preview Template
                                    </Button>
                                )}
                                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                    Send
                                </LoadingButton>
                            </Stack>
                        </FKProvider>
                    </Box>
                </CardContent>
            </MainCard>
        </Page>
    );
}

export default SendLetter;
