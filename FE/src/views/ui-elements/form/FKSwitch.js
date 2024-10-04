import { Stack, Switch, TextField, Typography } from '@mui/material';
import React from 'react';
import { useField } from 'formik';

function FKSwitch(props) {
    const [field, meta, helpers] = useField(props);

    return (
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <Switch {...props} {...field} error={meta.error} helperText={meta.error} />
            <Typography sx={{ ml: 1 }}>{props?.label}</Typography>
        </Stack>
    );
}

export default FKSwitch;
