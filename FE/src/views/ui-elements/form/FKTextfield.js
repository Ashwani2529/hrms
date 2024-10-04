import { TextField } from '@mui/material';
import React from 'react';
import { useField } from 'formik';

function FKTextfield({ ...props }) {
    const [field, meta, helpers] = useField(props);

    return <TextField {...props} {...field} error={meta.error} helperText={meta.error} />;
}

export default FKTextfield;
