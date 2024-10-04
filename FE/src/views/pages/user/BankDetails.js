/* eslint-disable */

import { Grid, TextField, FormHelperText } from '@mui/material';

const BankDetails = ({ values, handleChange, handleBlur, touched, errors }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Bank account no"
                    name="user_bank.account_number"
                    value={values?.user_bank?.account_number}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
                {touched?.user_bank?.account_number && errors?.user_bank?.account_number && (
                    <FormHelperText error>{errors?.user_bank?.account_number}</FormHelperText>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Ifsc code"
                    name="user_bank.ifsc_code"
                    value={values?.user_bank?.ifsc_code}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
                {touched?.user_bank?.ifsc_code && errors?.user_bank?.ifsc_code && (
                    <FormHelperText error>{errors?.user_bank?.ifsc_code}</FormHelperText>
                )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Bank name"
                    name="user_bank.bank_name"
                    value={values?.user_bank?.bank_name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
                {touched?.user_bank?.bank_name && errors?.user_bank?.bank_name && (
                    <FormHelperText error>{errors?.user_bank?.bank_name}</FormHelperText>
                )}
            </Grid>
        </Grid>
    );
};

export default BankDetails;
