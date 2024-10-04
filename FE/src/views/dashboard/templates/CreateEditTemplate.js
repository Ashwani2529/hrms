/* eslint-disable camelcase */
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import { Autocomplete, Box, Button, CardContent, Checkbox, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FKTextfield from 'views/ui-elements/form/FKTextfield';
import FKProvider from 'views/ui-elements/form/FKProvider';
import FKEditor from 'views/ui-elements/form/FKEditor';
import { dispatch } from 'store';
import { TemplateActions } from 'store/slices/templates';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { openSnackbar } from 'store/slices/snackbar';
import { LETTER_WIDTH } from 'store/constant';
import FKSelect from 'views/ui-elements/form/FKSelect';
import { CheckBox, CheckBoxOutlineBlankOutlined, CheckBoxOutlined } from '@mui/icons-material';
import { findKeyInObject } from 'utils/findKeyInObjects';

const icon = <CheckBoxOutlineBlankOutlined fontSize="small" />;
const checkedIcon = <CheckBoxOutlined fontSize="small" />;

function CreateEditTemplate({ isEdit = false }) {
    const navigate = useNavigate();
    const { createTemplate, fetchTemplateById, updateTemplate } = TemplateActions;
    const { template_id } = useParams();
    const { templates, loading, selectedTemplate, templateVariables: TEMPLATE_SCOPES } = useSelector((state) => state.templates);

    const initialValues = {
        template_name: isEdit ? selectedTemplate?.template_name || '' : '',
        template_description: isEdit ? selectedTemplate?.template_description || '' : '',
        variable_scopes: isEdit ? selectedTemplate?.variable_scopes || [] : [],
        template_content: isEdit
            ? selectedTemplate?.template_content ||
              '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
            : '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
        template_content_html: isEdit
            ? selectedTemplate?.template_content_html || '<div style="padding:10px;"></div>'
            : '<div style="padding:10px;"></div>'
    };

    const validationSchema = Yup.object({
        template_name: Yup.string().required('Template Name is required'),
        template_description: Yup.string(),
        variable_scopes: Yup.array(),
        template_content: Yup.string().required('Content is required'),
        template_content_html: Yup.string().required('Content is requied')
    });

    const onSubmit = async (values) => {
        try {
            let res;
            if (!isEdit) {
                res = await dispatch(createTemplate(values));
                console.log(res);
            } else {
                const templateId = selectedTemplate?.template_id;
                res = await dispatch(updateTemplate({ templateId, data: values }));
                console.log(res);
            }
            if (res.payload?.template_id) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: res?.payload?.message || `Template ${isEdit ? 'edited' : 'created'} successfully!`,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        },
                        close: true
                    })
                );
                navigate('/letter-templates/list');
            } else if (res.payload?.errors) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message:
                            findKeyInObject(res?.payload, `message`) || findKeyInObject(res?.payload, `error`) || 'Something went wrong',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (error) {
            console.log(error);
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.errors || 'Something went wrong',
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
        validateOnChange: false,
        validateOnMount: false
    });

    const { values, handleSubmit, handleChange, errors, handleReset, setFieldValue } = formik;

    useEffect(() => {
        if (isEdit && template_id) {
            dispatch(fetchTemplateById(template_id));
        }
    }, [template_id]);

    console.log({ values });

    return (
        <Page title={isEdit ? 'Edit Template' : 'Create Templates'}>
            <Breadcrumbs
                heading="Templates List"
                links={[
                    { name: 'Letter Templates', href: '/letter-templates/list' },
                    { name: 'Edit', href: '/letter-templates/create' }
                ]}
            />
            <MainCard
                title={
                    <Box>
                        <Typography variant="h3">{`${isEdit ? 'Edit' : 'Create'} Template`}</Typography>
                        <Typography sx={{ mt: 1 }} variant="subtitle2">
                            To use custom variables use the syntax {`{{variable_name}}`}
                        </Typography>
                    </Box>
                }
            >
                <CardContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Box sx={{ width: LETTER_WIDTH, m: 'auto' }}>
                            <Box sx={{ mx: '10px' }}>
                                {/* Example Form */}
                                <FKProvider value={formik}>
                                    <FKTextfield name="template_name" label="Template Name" type="text" />
                                    <FKTextfield name="template_description" label="Description" type="text" />
                                    <Autocomplete
                                        multiple
                                        id="checkboxes-tags-demo"
                                        value={values?.variable_scopes}
                                        options={Object.keys(TEMPLATE_SCOPES)}
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => option}
                                        onChange={(e, value) => {
                                            setFieldValue('variable_scopes', value, true);
                                        }}
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props}>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                />
                                                {option}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Template Scopes" placeholder="Scopes" />
                                        )}
                                    />
                                    {Array.isArray(values.variable_scopes) && values.variable_scopes.length > 0 && (
                                        <Box sx={{ maxHeight: 300, overflowY: 'scroll' }}>
                                            <Typography variant="h4">Avaialble Scope Variables: </Typography>
                                            {values.variable_scopes?.map((scope, index) => (
                                                <Box key={scope + index} py={2}>
                                                    <Typography variant="h5">
                                                        {index + 1}. {scope}
                                                    </Typography>
                                                    {Object.entries(TEMPLATE_SCOPES[scope]).map((entry, index) => (
                                                        <Typography key={entry[0]}>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                variant="subtitle1"
                                                            >{`{{${entry[0]}}}`}</Typography>

                                                            <Typography sx={{ display: 'inline', ml: 1 }} variant="captions">
                                                                : {entry[1]}
                                                            </Typography>
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    <FKEditor name="template_content" setFieldValue={setFieldValue} parseHtml />
                                    <Stack direction="row" justifyContent="flex-end">
                                        <LoadingButton variant="outlined" type="submit" loading={loading}>
                                            {isEdit ? 'Edit' : 'Create'}
                                        </LoadingButton>
                                    </Stack>
                                </FKProvider>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </MainCard>
        </Page>
    );
}

export default CreateEditTemplate;
