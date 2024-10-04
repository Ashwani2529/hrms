/* eslint-disable */

import { Grid, TextField, FormHelperText, Box, Typography, Stack, Checkbox } from '@mui/material';
import { useMemo } from 'react';
import { areObjectsEqual } from 'utils/areObjectsEqual';

const AddressDetails = ({ values, handleChange, handleBlur, touched, errors, setFieldValue }) => {
    const currentAddressSameAsPermanent = useMemo(
        () => areObjectsEqual(values?.user_address, values?.user_permanent_address),
        [values?.user_address, values?.user_permanent_address]
    );

    const handleToggleEqualAddresses = (checked) => {
        if (checked) {
            setFieldValue('user_address', {
                street: values?.user_permanent_address?.street,
                city: values?.user_permanent_address?.city,
                state: values?.user_permanent_address?.state,
                zip: values?.user_permanent_address?.zip,
                country: values?.user_permanent_address?.country
            });
        } else {
            setFieldValue('user_address', {
                street: '',
                city: '',
                state: '',
                zip: '',
                country: ''
            });
        }
    };

    console.log(currentAddressSameAsPermanent);

    return (
        <Box>
            <Typography variant="h4" mb={2}>
                Permanent Address:
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Street"
                        name="user_permanent_address.street"
                        value={values?.user_permanent_address?.street}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    {touched?.user_permanent_address?.street && errors?.user_permanent_address?.street && (
                        <FormHelperText error>{errors?.user_permanent_address?.street}</FormHelperText>
                    )}
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="City"
                        name="user_permanent_address.city"
                        value={values?.user_permanent_address?.city}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    {touched?.user_permanent_address?.city && errors?.user_permanent_address?.city && (
                        <FormHelperText error>{errors?.user_permanent_address?.city}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="State"
                        name="user_permanent_address.state"
                        value={values?.user_permanent_address?.state}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    {touched?.user_permanent_address?.state && errors?.user_permanent_address?.state && (
                        <FormHelperText error>{errors?.user_permanent_address?.state}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Zip"
                        name="user_permanent_address.zip"
                        value={values?.user_permanent_address?.zip}
                        type="number"
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    {touched?.user_permanent_address?.zip && errors?.user_permanent_address?.zip && (
                        <FormHelperText error>{errors?.user_permanent_address?.zip}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Country"
                        name="user_permanent_address.country"
                        value={values?.user_permanent_address?.country}
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                    {touched?.user_permanent_address?.country && errors?.user_permanent_address?.country && (
                        <FormHelperText error>{errors?.user_permanent_address?.country}</FormHelperText>
                    )}
                </Grid>
            </Grid>
            <Grid container xs={12} sx={{ mt: 3 }} alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h4" mb={1}>
                        Current Address:
                    </Typography>
                </Grid>
                <Grid item>
                    <Stack direction="row" alignItems="center">
                        <Checkbox checked={currentAddressSameAsPermanent} onChange={(_, checked) => handleToggleEqualAddresses(checked)} />
                        <Typography>Same as Permanent</Typography>
                    </Stack>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Street"
                        name="user_address.street"
                        value={values?.user_address?.street}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        disabled={currentAddressSameAsPermanent}
                    />
                    {touched?.user_address?.street && errors?.user_address?.street && (
                        <FormHelperText error>{errors?.user_address?.street}</FormHelperText>
                    )}
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="City"
                        name="user_address.city"
                        value={values?.user_address?.city}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        disabled={currentAddressSameAsPermanent}
                    />
                    {touched?.user_address?.city && errors?.user_address?.city && (
                        <FormHelperText error>{errors?.user_address?.city}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="State"
                        name="user_address.state"
                        value={values?.user_address?.state}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        disabled={currentAddressSameAsPermanent}
                    />
                    {touched?.user_address?.state && errors?.user_address?.state && (
                        <FormHelperText error>{errors?.user_address?.state}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Zip"
                        name="user_address.zip"
                        value={values?.user_address?.zip}
                        type="number"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        disabled={currentAddressSameAsPermanent}
                    />
                    {touched?.user_address?.zip && errors?.user_address?.zip && (
                        <FormHelperText error>{errors?.user_address?.zip}</FormHelperText>
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        label="Country"
                        name="user_address.country"
                        value={values?.user_address?.country}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        disabled={currentAddressSameAsPermanent}
                    />
                    {touched?.user_address?.country && errors?.user_address?.country && (
                        <FormHelperText error>{errors?.user_address?.country}</FormHelperText>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddressDetails;
