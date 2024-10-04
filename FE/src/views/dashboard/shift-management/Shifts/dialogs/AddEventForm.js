/* eslint-disable */
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Autocomplete,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Radio,
    RadioGroup,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    MenuItem,
    InputLabel,
    Select,
    Avatar,
    Box
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import '@mui/lab';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import ColorPalette from '../../ColorPalette';
import { gridSpacing } from 'store/constant';
import Chip from 'ui-component/extended/Chip';
import EditDeleteType from './EditDeleteType';
import { ShiftColors } from 'constants/shiftcolor';

// assets
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import { dispatch } from 'store';
import { useEffect, useState } from 'react';
import { ShiftActions } from 'store/slices/shift';
import { useSelector } from 'store';
import DuplicateShift from '../DuplicateShift';
import { openSnackbar } from 'store/slices/snackbar';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { shadeColor } from 'utils/colorShade';

const getChipColor = (selectedEmployee) => {
    if (selectedEmployee?.on_leave) {
        return 'warning';
    } else if (selectedEmployee?.busy) {
        return 'error';
    } else if (selectedEmployee?.on_holiday) {
        return 'orange';
    }
    return 'secondary';
};

const getEmployeeOptionStyle = (selectedEmployee, theme) => {
    if (selectedEmployee?.on_leave) {
        return {
            background: shadeColor(theme.palette.warning.main),
            color: theme.palette.warning.main
        };
    } else if (selectedEmployee?.busy) {
        return {
            background: shadeColor(theme.palette.error.main),
            color: theme.palette.error.main
        };
    } else if (selectedEmployee?.on_holiday) {
        return {
            background: shadeColor(theme.palette.info.main),
            color: theme.palette.info.main
        };
    }
    return {};
};

// constant
const getInitialValues = (event, range) => {
    const newEvent = {
        shift_name: '',
        shift_color: ShiftColors[Math.floor(Math.random() * ShiftColors.length)]?.color,
        start_time: range ? new Date(range.start) : new Date(),
        end_time: range ? new Date(range.end) : new Date(),
        user_shift: [],
        client_id: '',
        update_type: 'SINGLE_SHIFT',
        repeat: 'None',
        custom_repeat: []
    };

    if (event || range) {
        const newUserShift = event?.user_shift?.map((elm) => elm?.user);
        let updatedEvent = { ...event, user_shift: newUserShift };
        return _.merge({}, newEvent, updatedEvent);
    }

    return newEvent;
};

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const AddEventFrom = ({
    event,
    clients,
    range,
    handleDelete,
    handleCreate,
    handleUpdate,
    onCancel,
    handleMarkAutoAttendance,
    handleResolveConflict
}) => {
    const theme = useTheme();
    const isCreating = !event;
    const { fetchAvailableEmp, fetchShiftById } = ShiftActions;
    const { availableEmployess } = useSelector((state) => state.shift);

    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // const containerRef = useRef(null);
    // useEffect(() => {
    //     const container = containerRef.current;
    //     // Checking if content height exceeds 200px
    //     if (container?.scrollHeight > 200) {
    //         container.style.overflowY = 'scroll';
    //     } else {
    //         container.style.overflowY = 'hidden';
    //     }
    // }, [containerRef?.current?.innerText]);

    const GetAvailbleEmployees = async (startDate, endDate) => {
        const date = {
            startTime: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
            endTime: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
            shiftId: event?.shift_id || ''
        };
        dispatch(fetchAvailableEmp(date));
    };

    useEffect(() => {
        if (event) {
            const id = event?.shift_id;
            dispatch(fetchShiftById(id));
        }
        if (!range) {
            GetAvailbleEmployees(event?.start_time, event?.end_time);
        } else {
            GetAvailbleEmployees(range?.start, range?.end);
        }
    }, []);

    const EventSchema = Yup.object().shape({
        shift_name: Yup.string().max(255).required('Shift name is required'),
        user_shift: Yup.array().notRequired(),
        end_time: Yup.date().when(
            'start_time',
            (start_time, schema) => start_time && schema.min(start_time, 'End date must be later than start date')
        ),
        start_time: Yup.date().required('Start time is required'),
        // lunch_break_end: Yup.date().notRequired(''),
        // lunch_break_start: Yup.date().notRequired(''),

        auto_attendance: Yup.boolean().notRequired(),
        begin_checkin: Yup.number().notRequired(),
        begin_checkout: Yup.number().notRequired(),
        repeat: Yup.string().notRequired(),
        update_type: Yup.string().notRequired(),
        users: Yup.array().notRequired() // for conflict resolve
    });

    const formik = useFormik({
        // enableReinitialize: true,
        initialValues: getInitialValues(event, range),
        validationSchema: EventSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const assigned_usersId = values?.user_shift.map((user) => {
                    return user?.user_id;
                });
                const data = {
                    shift_name: values?.shift_name || '',
                    user_shift: assigned_usersId || [],
                    end_time: values?.end_time || '',
                    start_time: values?.start_time || '',
                    lunch_break_start: values?.lunch_break_start || null,
                    lunch_break_end: values?.lunch_break_end || null,

                    shift_color: values?.shift_color || '',
                    begin_checkin: values?.begin_checkin || 60,
                    begin_checkout: values?.begin_checkout || 60,
                    auto_attendance: values?.auto_attendance || false,
                    repeat: values?.repeat || 'None',
                    custom_repeat: values?.custom_repeat || [],
                    client_id: values?.client_id || null
                };
                if (event) {
                    const newData = { ...data, update_type: values?.update_type };
                    await handleUpdate(event.shift_id, newData);
                } else {
                    await handleCreate(data);
                }
                setSubmitting(false);
            } catch (error) {
                console.error(error);
            }
        }
    });

    const handleResolve = async () => {
        const assigned_usersId = values?.users?.map((user) => {
            return user?.user_id;
        });
        const data = {
            users: assigned_usersId || [],
            shift_id: event?.shift_id
        };
        await handleResolveConflict(data);
    };

    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

    useEffect(() => {
        console.log(errors);
    }, [errors]);

    const markAutoAttendance = (shift_id) => {
        handleMarkAutoAttendance(shift_id);
    };

    const handleShiftDelete = () => {
        handleDelete(event?.shift_id, values?.update_type);
    };
    const handleEventDuplicate = () => {};

    const handleClick = () => {
        const conflict = values?.user_shift?.filter((employee) => employee?.busy);
        if (conflict?.length > 0) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: 'Please fix any possible conflict!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            return;
        }

        const includedLeaveEmployees = values?.user_shift?.filter((emp) => emp?.on_leave);
        if (includedLeaveEmployees?.length > 0) {
            dispatch(
                openConfirmationModal({
                    open: true,
                    message: 'Some of the selected employees are on leave.\n Are you sure you want to proceed?',
                    handleConfirm: handleSubmit
                })
            );
            return;
        }
        event ? setOpenUpdateDialog(true) : handleSubmit();
    };

    useEffect(() => {
        if (availableEmployess?.length > 0) {
            let oldEmployees = values?.user_shift?.map((employee) => employee?.user_id);
            const newEmployees = availableEmployess?.filter((employee) => oldEmployees?.includes(employee?.user_id));
            setFieldValue('user_shift', newEmployees);
        }
    }, [availableEmployess]);

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <EditDeleteType
                    setOpenUpdateDialog={setOpenUpdateDialog}
                    openUpdateDialog={openUpdateDialog}
                    isSubmitting={isSubmitting}
                    values={values}
                    setFieldValue={setFieldValue}
                    handleSubmit={handleSubmit}
                    handleDelete={handleShiftDelete}
                    type="Edit"
                />
                <EditDeleteType
                    setOpenUpdateDialog={setOpenDeleteDialog}
                    openUpdateDialog={openDeleteDialog}
                    isSubmitting={isSubmitting}
                    values={values}
                    setFieldValue={setFieldValue}
                    handleSubmit={handleSubmit}
                    handleDelete={handleShiftDelete}
                    type="Delete"
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <DialogTitle>{event ? (event?.status === 'Conflicted' ? 'Resolve conflict' : 'Edit event') : 'Add Event'}</DialogTitle>
                    <DuplicateShift handleEventDuplicate={handleEventDuplicate} />
                </Box>

                <Divider />
                <DialogContent sx={{ p: 3, display: 'flex', gap: 2 }}>
                    <Grid container spacing={gridSpacing} sx={{ width: '70%' }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                label="Shift name"
                                {...getFieldProps('shift_name')}
                                error={Boolean(touched.shift_name && errors.shift_name)}
                                helperText={touched.shift_name && errors.shift_name}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <MobileDateTimePicker
                                label="Start date"
                                value={values.start_time}
                                minDateTime={new Date()}
                                // inputFormat="dd/MM/yyyy hh:mm a"
                                onChange={(date) => {
                                    setFieldValue('start_time', date.toJSON());
                                    GetAvailbleEmployees(date.toJSON(), values?.end_time);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(touched.start_time && errors.start_time)}
                                        helperText={touched.start_time && errors.start_time}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <DateRangeIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MobileDateTimePicker
                                label="End date"
                                value={values.end_time}
                                // inputFormat="dd/MM/yyyy hh:mm a"
                                onChange={(date) => {
                                    setFieldValue('end_time', date.toJSON());
                                    GetAvailbleEmployees(values?.start_time, date.toJSON());
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(touched.end_time && errors.end_time)}
                                        helperText={touched.end_time && errors.end_time}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <DateRangeIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid container spacing={2} sx={{ display: 'felx', flexWrap: 'nowrap', margin: '8px 0px 0px 8px' }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    label="Begin checkin"
                                    {...getFieldProps('begin_checkin')}
                                    type="number"
                                    defaultValue={60}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    label="Begin checkout"
                                    {...getFieldProps('begin_checkout')}
                                    type="number"
                                    defaultValue={60}
                                />
                            </Grid>
                        </Grid>
                        {/* lunch time here */}

                        {/* <Grid item xs={12} md={6}>
                            <MobileDateTimePicker
                                label="Lunch Break Start"
                                value={values.lunch_break_start}
                                // inputFormat="dd/MM/yyyy hh:mm a"
                                onChange={(date) => {
                                    setFieldValue('lunch_break_start', date.toJSON());
                                    // GetAvailbleEmployees(date.toJSON(), values?.end_time);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(touched.lunch_break_start && errors.lunch_break_start)}
                                        helperText={touched.lunch_break_start && errors.lunch_break_start}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <DateRangeIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MobileDateTimePicker
                                label="Lunch Break End"
                                value={values.lunch_break_end}
                                // inputFormat="dd/MM/yyyy hh:mm a"
                                onChange={(date) => {
                                    setFieldValue('lunch_break_end', date.toJSON());
                                    // GetAvailbleEmployees(values?.start_time, date.toJSON());
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(touched.lunch_break_end && errors.lunch_break_end)}
                                        helperText={touched.lunch_break_end && errors.lunch_break_end}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <DateRangeIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid> */}

                        <Grid item xs={12}>
                            <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Assign Client">
                                <InputLabel id="salutation-label" shrink>
                                    Assign Client
                                </InputLabel>
                                <Select
                                    notched
                                    size="small"
                                    id="client_id"
                                    name="client_id"
                                    value={values.client_id}
                                    onChange={(event) => setFieldValue('client_id', event.target.value)}
                                    label="Assign Client"
                                >
                                    {clients?.map((client) => {
                                        return (
                                            <MenuItem key={client?.client_id} value={client?.client_id}>
                                                {client?.client_name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Salutation">
                                <RadioGroup
                                    row
                                    aria-label="repeat-type"
                                    value={values.repeat}
                                    onChange={(event) => setFieldValue('repeat', event.target.value)}
                                    name="row-radio-buttons-group"
                                >
                                    <FormControlLabel value="Daily" disabled={event ? true : false} control={<Radio />} label="Daily" />
                                    <FormControlLabel value="Weekly" disabled={event ? true : false} control={<Radio />} label="Weekly" />
                                    <FormControlLabel value="Monthly" disabled={event ? true : false} control={<Radio />} label="Monthly" />
                                    <FormControlLabel value="Custom" disabled={event ? true : false} control={<Radio />} label="Custom" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        {values?.repeat === 'Custom' && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    disabled={event ? true : false}
                                    size="small"
                                    multiple
                                    disableCloseOnSelect
                                    value={values?.custom_repeat || []}
                                    onChange={(e, newValue) => setFieldValue('custom_repeat', newValue)}
                                    renderInput={(params) => (
                                        <TextField size="small" InputLabelProps={{ shrink: true }} label="Select Repeat Days" {...params} />
                                    )}
                                    options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.auto_attendance}
                                        onChange={() => setFieldValue('auto_attendance', !values.auto_attendance)}
                                    />
                                }
                                label="Enable auto attendance"
                            />
                        </Grid>
                        {event ? (
                            <Grid item>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}
                                    onClick={() => markAutoAttendance(event?.shift_id)}
                                >
                                    Mark auto attendance
                                </Button>
                            </Grid>
                        ) : null}
                    </Grid>
                    <Divider orientation="vertical" flexItem />

                    <Grid sx={{ width: '40%' }} direction="column" display={'flex'} gap={6}>
                        <Grid item xs={12} direction="column" spacing={3} fullWidth minHeight={'40%'}>
                            <Grid item>
                                <Autocomplete
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    notched
                                    shrink
                                    multiple
                                    disableCloseOnSelect
                                    renderTags={() => null}
                                    // getOptionLabel={(option) => option?.user_name}
                                    value={values?.user_shift || []}
                                    onChange={(e, newValue) => setFieldValue('user_shift', newValue)}
                                    renderOption={(props, option) => (
                                        <MenuItem sx={getEmployeeOptionStyle(option, theme)} {...props}>
                                            {option?.user_name}
                                        </MenuItem>
                                    )}
                                    renderInput={(params) => (
                                        <TextField size="small" InputLabelProps={{ shrink: true }} label="Select Employees" {...params} />
                                    )}
                                    filterSelectedOptions
                                    options={availableEmployess
                                        ?.filter((option) => !option?.busy)
                                        ?.filter(
                                            (option) =>
                                                !values?.user_shift?.some((selectedOption) => selectedOption.user_id === option.user_id)
                                        )}
                                />
                            </Grid>
                            <Grid mt={1} container spacing={1}>
                                {values?.user_shift?.map((selectedEmployee) => (
                                    <Grid item>
                                        <Chip
                                            variant="outlined"
                                            chipcolor={getChipColor(selectedEmployee)}
                                            avatar={
                                                <Avatar src={selectedEmployee?.profile_photo}>
                                                    {selectedEmployee?.user_name?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                            }
                                            label={selectedEmployee?.user_name}
                                            // onClick={handleClick}
                                            onDelete={() =>
                                                setFieldValue(
                                                    'user_shift',
                                                    values?.user_shift?.filter((user) => user?.user_id !== selectedEmployee?.user_id)
                                                )
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        {/* for conflict resolve */}
                        {/* {event?.status === "Conflicted" &&
                            <Grid item xs={12} direction="column" spacing={3} fullWidth>
                                <Grid item>
                                    <Autocomplete
                                        multiple
                                        disableCloseOnSelect
                                        renderTags={() => null}
                                        getOptionLabel={(option) => option?.user_name}
                                        value={
                                            values?.users || []
                                        }
                                        onChange={(e, newValue) => {
                                            setFieldValue('users', newValue)
                                        }}
                                        renderInput={(params) => <TextField label="Add New Employees to resolve" {...params} />}
                                        filterSelectedOptions
                                        options={
                                            availableEmployess?.filter((option) => !option?.busy && !option?.on_leave)?.filter(
                                                (option) => !values?.users?.some((selectedOption) => selectedOption.user_id === option.user_id)
                                            )}
                                    />
                                </Grid>
                                <Grid mt={1} container spacing={1}>
                                    {values?.users?.map((selectedEmployee) => (
                                        <Grid item>
                                            <Chip
                                                variant="outlined"
                                                chipcolor={selectedEmployee?.on_leave ? "warning" : "secondary"}
                                                avatar={
                                                    <Avatar src={selectedEmployee?.profile_photo}>
                                                        {selectedEmployee?.user_name?.charAt(0)?.toUpperCase()}
                                                    </Avatar>
                                                }
                                                label={selectedEmployee?.user_name}
                                                // onClick={handleClick}
                                                onDelete={() => setFieldValue('users', values?.users?.filter((user) => user?.user_id !== selectedEmployee?.user_id))}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid item justifyContent={'flex-end'} display={'flex'} fullWidth mt={3}>
                                    <Button variant='contained' color="error" onClick={handleResolve}>
                                        Resolve
                                    </Button>
                                </Grid>
                            </Grid>
                        } */}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            {!isCreating && (
                                <Tooltip title="Delete Event">
                                    <IconButton onClick={() => setOpenDeleteDialog(true)} size="large">
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                        <Grid item>
                            <Stack direction="column" spacing={2} alignItems={'flex-end'}>
                                {event?.status === 'Conflicted' && (
                                    <Button variant="contained" color="error" sx={{ width: 'fit-content' }} onClick={handleResolve}>
                                        Resolve
                                    </Button>
                                )}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button type="button" variant="outlined" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" disabled={isSubmitting} onClick={handleClick}>
                                        {event ? 'Edit' : 'Add'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Form>
        </FormikProvider>
    );
};

AddEventFrom.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default AddEventFrom;
