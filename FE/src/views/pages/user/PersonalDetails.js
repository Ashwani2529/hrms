/* eslint-disable */

import { Grid, TextField, FormHelperText, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const PersonalDetails = ({ values, handleChange, handleBlur, touched, errors, setFieldValue }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="First Name"
                    name="firstname"
                    value={values.firstname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                {touched.firstname && errors.firstname && <FormHelperText error>{errors.firstname}</FormHelperText>}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label="Middle name"
                    name="middlename"
                    value={values.middlename}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Last Name"
                    name="lastname"
                    value={values.lastname}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
                {touched.lastname && errors.lastname && <FormHelperText error>{errors.lastname}</FormHelperText>}
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth required InputLabelProps={{ shrink: true }} label="Gender">
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select id="gender" name="gender" value={values.gender} onBlur={handleBlur} onChange={handleChange} label="Gender">
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {touched.gender && errors.gender && <FormHelperText error>{errors.gender}</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
                <DatePicker
                    disableFuture
                    label="Birthday"
                    name="date_of_birth"
                    value={values.date_of_birth}
                    onBlur={handleBlur}
                    onChange={(value) => setFieldValue('date_of_birth', value, true)}
                    renderInput={(params) => <TextField {...params} fullWidth required InputLabelProps={{ shrink: true }} error={false} />}
                />
                {touched.date_of_birth && errors.date_of_birth && <FormHelperText error>{errors.date_of_birth}</FormHelperText>}
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Personal Email Address"
                    name="personal_email"
                    value={values.personal_email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
                {touched.personal_email && errors.personal_email && <FormHelperText error>{errors.personal_email}</FormHelperText>}
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
                {touched.phone_number && errors.phone_number && (
                    <FormHelperText error>{errors.phone_number}</FormHelperText>
                )}
            </Grid>
        </Grid>
    );
};

export default PersonalDetails;
