/* eslint-disable */
import PropTypes, { array } from 'prop-types';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'store';

import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
    Button,
    FormHelperText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputLabel,
    Slide,
    TextField,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Autocomplete,
    Checkbox,
    Box,
    FormControlLabel,
    Stack,
    RadioGroup,
    Radio,
    CircularProgress
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// project imports
import { gridSpacing, HOLIDAY_TYPES } from 'store/constant';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { EmployeeActions } from 'store/slices/employee';
import { DatePicker } from '@mui/x-date-pickers';
import { openSnackbar } from 'store/slices/snackbar';
import { LeaveActions } from 'store/slices/leave';
import { LoadingButton } from '@mui/lab';
import holiday, { HolidayActions } from 'store/slices/holiday';
import { height } from '@mui/system';
import useAuth from 'hooks/useAuth';
import { findKeyInObject } from 'utils/findKeyInObjects';

// import { openSnackbar } from 'store/slices/snackbar';

// animation
const Transition = forwardRef((props, ref) => <Slide direction="left" ref={ref} {...props} />);

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// ==============================|| PRODUCT ADD DIALOG ||============================== //

const CreateHoliday = ({
    openDialog,
    handleCloseDialog,
    selectedRowId,
    setSelectedRowId,
    page,
    limit,
    openConfirmationModal,
    fetchHolidayWrapper
}) => {
    const dispatch = useDispatch();
    const theme = useTheme();

    // set image upload progress

    const { fetchEmployees } = EmployeeActions;
    const { createHoliday, fetchHoliday, updateHoliday, fetchHolidayById, deleteHoliday } = HolidayActions;

    const { employee } = useSelector((state) => state.employee);
    const { loading, selectedHoliday } = useSelector((state) => state.holiday);
    const initialValues = useMemo(
        () =>
            selectedRowId
                ? {
                      user_holiday: selectedHoliday?.user_holiday?.map((user) => user?.user?.user_id) || [],
                      holiday_name: selectedHoliday?.holiday_name || '',
                      holiday_type: selectedHoliday?.holiday_type || '',
                      holiday_date: selectedHoliday?.holiday_date || new Date(),
                      custom_repeat: selectedHoliday?.custom_repeat || [],
                      update_type: selectedHoliday?.update_type || 'SINGLE_HOLIDAY'
                  }
                : {
                      user_holiday: [],
                      holiday_name: '',
                      holiday_type: '',
                      holiday_date: new Date(),
                      custom_repeat: [],
                      update_type: ''
                  },
        [selectedRowId, selectedHoliday]
    );
    useEffect(() => {
        dispatch(fetchEmployees({ page: '', limit: '', search: '', status: '', emp_type: '' }));
    }, []);

    useEffect(() => {
        if (selectedRowId) {
            dispatch(fetchHolidayById(selectedRowId));
        }
    }, [selectedRowId]);

    const validationSchema = Yup.object().shape({
        user_holiday: Yup.array().of(Yup.string()).default([]),
        holiday_name: Yup.string().required('Holiday name is required.'),
        holiday_type: Yup.string().required('Holiday type is required'),
        holiday_date: Yup.date().when('holiday_type', {
            is: 'HOLIDAY',
            then: Yup.date().required('Holiday date is required')
        }),
        custom_repeat: Yup.array().when('holiday_type', {
            is: 'WEEKOFF',
            then: Yup.array().min(1, 'Please select at least one weekday')
        }),
        update_type: selectedRowId ? Yup.string().required() : Yup.string()
    });

    const handleCloseClick = () => {
        setSelectedRowId();
        handleCloseDialog();
    };

    const handleDelete = async (holiday, values) => {
        const object = {
            id: holiday?.holiday_id,
            holiday_date: values.holiday_date,
            delete_type: values?.update_type
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'All the associated child instances will also get deleted.',
                handleConfirm: async () => {
                    const res = await dispatch(deleteHoliday(object));

                    if (res?.payload?.status != 201) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message:
                                    findKeyInObject(res?.payload, `message`) ||
                                    findKeyInObject(res?.payload, `error`) ||
                                    'Internal server error',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Holiday deleted successfully',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                        fetchHolidayWrapper();
                    }
                }
            })
        );

        // dispatch(fetchHolidays())
    };

    return (
        <Dialog
            open={openDialog}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleCloseDialog}
            sx={{
                '&>div:nth-of-type(3)': {
                    justifyContent: 'flex-end',
                    '&>div': {
                        m: 0,
                        borderRadius: '0px',
                        maxWidth: 450,
                        maxHeight: '100%',
                        height: '100%'
                    }
                }
            }}
        >
            {openDialog &&
                (loading ? (
                    <Stack width={450} height={'100vh'} justifyContent={'center'} alignItems={'center'}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <Formik
                        initialValues={initialValues}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                let response;
                                if (!selectedRowId) {
                                    response = await dispatch(createHoliday(values));
                                } else {
                                    const data = {
                                        values,
                                        id: selectedRowId
                                    };
                                    response = await dispatch(updateHoliday(data));
                                }

                                if (response?.payload?.status == 201 || response?.payload?.status == 200) {
                                    dispatch(
                                        openSnackbar({
                                            open: true,
                                            message: !selectedRowId ? 'Holiday added successfully.' : 'Holiday updated successfully.',
                                            variant: 'alert',
                                            alert: {
                                                color: 'success'
                                            },
                                            close: true
                                        })
                                    );
                                    handleCloseClick();
                                    setStatus({ success: true });
                                    setSubmitting(false);
                                    fetchHolidayWrapper();
                                    // window.location.reload();
                                } else {
                                    dispatch(
                                        openSnackbar({
                                            open: true,
                                            message: response?.payload?.errors || response?.payload?.message || 'Internal server error',
                                            variant: 'alert',
                                            alert: {
                                                color: 'error'
                                            },
                                            close: true
                                        })
                                    );
                                }
                            } catch (err) {
                                console.error(err);
                                setStatus({ success: false });
                                setErrors({ submit: 'Invalid credentials' });
                                setSubmitting(false);
                            }
                        }}
                        validationSchema={validationSchema}
                    >
                        {({ errors, handleSubmit, handleChange, handleBlur, values, touched, setFieldValue }) => (
                            <>
                                <DialogTitle>{selectedRowId ? 'Edit' : 'Create'} Holiday</DialogTitle>

                                <DialogContent>
                                    <Grid container spacing={gridSpacing} sx={{ mt: 0.25 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                id="outlined-basic2"
                                                fullWidth
                                                name="holiday_name"
                                                placeholder="Holiday Name"
                                                label="Holiday Name"
                                                value={values.holiday_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {touched.holiday_name && errors.holiday_name && (
                                                <FormHelperText error>{errors.holiday_name}</FormHelperText>
                                            )}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Log Type">
                                                <InputLabel id="gender-label">Select Holiday Type</InputLabel>
                                                <Select
                                                    id="holiday_type"
                                                    name="holiday_type"
                                                    value={values.holiday_type}
                                                    onBlur={handleBlur}
                                                    onChange={handleChange}
                                                    label="Select Holiday Type"
                                                    disabled={selectedRowId}
                                                >
                                                    <MenuItem value="WEEKOFF">WEEKOFF</MenuItem>
                                                    <MenuItem value="HOLIDAY">HOLIDAY</MenuItem>
                                                </Select>
                                                {touched.holiday_type && errors.holiday_type && (
                                                    <FormHelperText error>{errors.holiday_type}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        {values.holiday_type === 'HOLIDAY' && (
                                            <Grid item xs={12}>
                                                <DatePicker
                                                    disablePast
                                                    label="Holiday date"
                                                    name="holiday_date"
                                                    value={values.holiday_date}
                                                    onBlur={handleBlur}
                                                    disabled={selectedRowId}
                                                    onChange={(value) => setFieldValue('holiday_date', value, true)}
                                                    renderInput={(params) => (
                                                        <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                                    )}
                                                />
                                                {touched.holiday_date && errors.holiday_date && (
                                                    <FormHelperText error>{errors.holiday_date}</FormHelperText>
                                                )}
                                            </Grid>
                                        )}

                                        {values?.holiday_type === 'WEEKOFF' && (
                                            <Grid item xs={12}>
                                                <Autocomplete
                                                    multiple
                                                    disableCloseOnSelect
                                                    disabled={
                                                        selectedRowId &&
                                                        !selectedHoliday?.parent_holiday &&
                                                        values.holiday_type === 'WEEKOFF'
                                                    }
                                                    value={values?.custom_repeat || []}
                                                    onChange={(e, newValue) => setFieldValue('custom_repeat', newValue)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            size="small"
                                                            InputLabelProps={{ shrink: true }}
                                                            label="Select Repeat Weekdays"
                                                            {...params}
                                                        />
                                                    )}
                                                    options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                                                />
                                            </Grid>
                                        )}

                                        <Grid item xs={12}>
                                            <Autocomplete
                                                multiple
                                                id="checkboxes-tags-demo"
                                                value={values?.user_holiday}
                                                options={employee?.map((user) => user?.user_id)}
                                                disableCloseOnSelect
                                                getOptionLabel={(option) =>
                                                    employee.find((user) => user?.user_id === option)?.user_name || ''
                                                }
                                                onChange={(e, value) => {
                                                    setFieldValue('user_holiday', value, true);
                                                }}
                                                renderOption={(props, option, { selected }) => (
                                                    <li {...props}>
                                                        <Checkbox
                                                            icon={icon}
                                                            checkedIcon={checkedIcon}
                                                            style={{ marginRight: 8 }}
                                                            checked={selected}
                                                        />
                                                        {employee.find((user) => user?.user_id === option)?.user_name}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Select employees" placeholder="Employees" />
                                                )}
                                                // value={values?.user_holida?.map((entry) => entry?.user?.user_id) || []}
                                            />
                                            <Box>
                                                <Stack direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>
                                                    <Checkbox
                                                        checked={values?.user_holiday?.length === employee.length}
                                                        onChange={(e, checked) => {
                                                            if (checked) {
                                                                setFieldValue(
                                                                    'user_holiday',
                                                                    employee?.map((user) => user?.user_id)
                                                                );
                                                            } else {
                                                                setFieldValue('user_holiday', []);
                                                            }
                                                        }}
                                                    />
                                                    <Typography>Select All Employees</Typography>
                                                </Stack>
                                            </Box>
                                            {selectedRowId && selectedHoliday?.parent_holiday && values.holiday_type === 'WEEKOFF' && (
                                                <Box>
                                                    <Typography>Update for:</Typography>
                                                    <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Salutation">
                                                        <RadioGroup
                                                            row
                                                            aria-label="repeat-type"
                                                            value={values.update_type || ''}
                                                            onChange={(event) => setFieldValue('update_type', event.target.value)}
                                                            name="update_type"
                                                        >
                                                            <FormControlLabel
                                                                value="SINGLE_HOLIDAY"
                                                                control={<Radio />}
                                                                label="Single instance"
                                                            />
                                                            <FormControlLabel
                                                                value="FOLLOW_UP_HOLIDAY"
                                                                control={<Radio />}
                                                                label="Follow-Ups"
                                                            />
                                                        </RadioGroup>
                                                    </FormControl>
                                                </Box>
                                            )}
                                            {/* <Typography>{values.update_type}</Typography> */}
                                            {selectedRowId && values.holiday_type === 'WEEKOFF' && (
                                                <Grid item xs={12}>
                                                    <DatePicker
                                                        disablePast
                                                        label="Holiday date"
                                                        name="holiday_date"
                                                        value={values.holiday_date}
                                                        onBlur={handleBlur}
                                                        onChange={(value) => setFieldValue('holiday_date', value, true)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                fullWidth
                                                                InputLabelProps={{ shrink: true }}
                                                                error={false}
                                                            />
                                                        )}
                                                    />
                                                    {touched.holiday_date && errors.holiday_date && (
                                                        <FormHelperText error>{errors.holiday_date}</FormHelperText>
                                                    )}
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions>
                                    <Stack sx={{ width: '100%' }} px={3} direction="row" justifyContent="space-between" alignItems="center">
                                        {selectedRowId && (
                                            <LoadingButton
                                                variant="contained"
                                                color="error"
                                                onClick={() => {
                                                    handleDelete(selectedHoliday, values);
                                                    handleCloseDialog();
                                                }}
                                            >
                                                Delete
                                            </LoadingButton>
                                        )}
                                        <Stack direction="row" gap={2}>
                                            <AnimateButton>
                                                <LoadingButton
                                                    onClick={() => {
                                                        console.log(errors);
                                                        handleSubmit();
                                                    }}
                                                    variant="contained"
                                                    sx={{
                                                        bgcolor: theme.palette.secondary.main,
                                                        '&:hover': { bgcolor: theme.palette.secondary.dark }
                                                    }}
                                                    loading={loading}
                                                >
                                                    {selectedRowId ? 'Edit' : 'Add'}
                                                </LoadingButton>
                                            </AnimateButton>
                                            <Button variant="text" color="error" onClick={handleCloseClick}>
                                                Close
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </DialogActions>
                            </>
                        )}
                    </Formik>
                ))}
        </Dialog>
    );
};

CreateHoliday.propTypes = {
    openDialog: PropTypes.bool,
    handleCloseDialog: PropTypes.func
};

export default CreateHoliday;
