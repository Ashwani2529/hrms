import { TextField } from '@mui/material';
import React from 'react';
import { useField } from 'formik';

function FKSelect({ children, ...props }) {
    const [field, meta, helpers] = useField(props);

    return (
        <TextField select {...props} {...field} error={meta.error} helperText={meta.error}>
            {children}
        </TextField>
    );
}

export default FKSelect;
