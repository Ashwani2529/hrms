import React from 'react';
import {
    DialogContent,
    DialogActions,
    DialogTitle,
    Typography,
    IconButton,
    Box,
    TextField,
    Button,
    Stack,
    Grid,
    MenuItem
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { gridSpacing, REMARK_TYPE } from 'store/constant';
import { dispatch } from 'store';
import { RemarkActions } from 'store/slices/remarks';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { openSnackbar } from 'store/slices/snackbar';
import { findKeyInObject } from 'utils/findKeyInObjects';

function AddEditRemark({ handleCloseAddRemark, selectedItem }) {
    const { createRemark, editRemark } = RemarkActions;
    const isEdit = !!selectedItem?.remark_id;

    const { loading } = useSelector((state) => state.remarks);

    const initialValues = {
        user_id: selectedItem?.user_id,
        remark_id: selectedItem?.remark_id,
        remark_title: selectedItem?.remark_title || 'Title',
        remark_description: selectedItem?.remark_description || '',
        remark_level: selectedItem?.remark_level || 1,
        remark_type: selectedItem?.remark_type || REMARK_TYPE.PERFORMANCE,
        remark_date: selectedItem?.remark_date || ''
    };

    const validationSchema = Yup.object({
        user_id: Yup.string(),
        remark_id: Yup.string(),
        remark_title: Yup.string().required(),
        remark_description: Yup.string().required(),
        remark_level: Yup.number().required(),
        remark_type: Yup.string().required()
    });

    const onSubmit = async (values) => {
        try {
            let res;
            if (!isEdit) {
                values.remark_date = new Date().toISOString();
                delete values.remark_id;
                res = await dispatch(createRemark(values));
            } else {
                delete values.user_id;
                res = await dispatch(editRemark(values));
            }

            if (res?.payload?.status === 201 || res?.payload?.status === 200) {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: `Remark ${isEdit ? 'edited' : 'created'} successfully!`,
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
                            findKeyInObject(res?.payload, `message`) ||
                            findKeyInObject(res?.payload, `error`) ||
                            `Failed to ${isEdit ? 'edit' : 'create'} remark!`,
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
                    message: `Failed to ${isEdit ? 'edit' : 'create'} remark!`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        }

        handleCloseAddRemark();
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        enableReinitialize: true,
        validateOnBlur: true
    });

    const { values, errors, handleChange, handleSubmit } = formik;

    // console.log({ errors });

    return (
        <DialogContent sx={{ minWidth: 500 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h3">{isEdit ? 'Edit' : 'Create'} Remark</Typography>
                <IconButton onClick={handleCloseAddRemark}>
                    <Close />
                </IconButton>
            </Stack>
            <Box py={2}>
                <FormikProvider value={formik}>
                    <form onSubmit={handleSubmit}>
                        <Stack gap={gridSpacing}>
                            {/* <TextField
                                name="remark_title"
                                value={values.remark_title}
                                onChange={handleChange}
                                error={errors.remark_title}
                                helperText={errors.remark_title}
                                fullWidth
                                label="Title"
                                size="small"
                            /> */}
                            <Grid container xs={12} md={12} spacing={1} alignItems="center" justifyContent="space-between">
                                {/* <Grid item xs={12} md={6}>
                                    <TextField
                                        value={values.remark_level}
                                        error={errors.remark_level}
                                        helperText={errors.remark_level}
                                        onChange={handleChange}
                                        fullWidth
                                        name="remark_level"
                                        label="Magnitude"
                                        size="small"
                                        select
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                            <MenuItem value={level} key={level}>
                                                {level}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid> */}
                                <Grid item xs={12} md={12}>
                                    <TextField
                                        value={values.remark_type}
                                        error={errors.remark_type}
                                        helperText={errors.remark_type}
                                        onChange={handleChange}
                                        fullWidth
                                        name="remark_type"
                                        label="Type"
                                        size="small"
                                        select
                                    >
                                        {Object.values(REMARK_TYPE).map((type, index) => (
                                            <MenuItem value={type} key={type + index}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                            <TextField
                                name="remark_description"
                                value={values.remark_description}
                                error={errors.remark_description}
                                helperText={errors.remark_description}
                                onChange={handleChange}
                                fullWidth
                                label="Description"
                                multiline
                                minRows={4}
                                size="small"
                            />
                            <DialogActions>
                                <LoadingButton variant="contained" type="submit" loading={loading}>
                                    {isEdit ? 'Edit' : 'Create'}
                                </LoadingButton>
                                <Button variant="outlined" onClick={handleCloseAddRemark}>
                                    Close
                                </Button>
                            </DialogActions>
                        </Stack>
                    </form>
                </FormikProvider>
            </Box>
        </DialogContent>
    );
}

export default AddEditRemark;
