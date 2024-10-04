import { Checkbox, TextField, Autocomplete } from '@mui/material';
import { useField } from 'formik';
import React from 'react';
import { CheckBox, CheckBoxOutlineBlankOutlined, CheckBoxOutlined } from '@mui/icons-material';

const AutocompleteComp = React.forwardRef((props, ref) => <Autocomplete sx={{ transform: 'translateY(-100%)' }} {...props} ref={ref} />);

function FKMultiSelect({ ...props }) {
    const [field, meta, helpers] = useField(props);

    return (
        <TextField
            sx={{ mb: -2, mt: 2 }}
            variant="standard"
            {...field}
            {...props}
            InputProps={{
                // inputComponent: <Autocomplete {...field} {...meta} {...helpers} {...props} multiple disableCloseOnSelect />
                inputComponent: AutocompleteComp,
                inputProps: {
                    ...field,
                    ...meta,
                    ...helpers,
                    ...props,
                    multiple: true,
                    disableCloseOnSelect: true
                }
            }}
            error={!!meta.error}
            helperText={meta.error}
        />
    );
}

export default FKMultiSelect;
