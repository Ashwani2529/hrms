import { Box, TextField } from '@mui/material';
import { useField } from 'formik';
import React, { useEffect, useState } from 'react';
import Editor from 'views/richtext/Editor';

const EditorComp = React.forwardRef((props, ref) => <Editor {...props} ref={ref} />);

function FKEditor({ setFieldValue, loading, ...props }) {
    const [field, meta, helper] = useField(props);

    return (
        <TextField
            {...field}
            {...props}
            InputProps={{
                inputComponent: EditorComp,
                inputProps: {
                    setFieldValue,
                    loading,
                    ...field,
                    ...meta,
                    ...helper,
                    ...props
                }
            }}
        />
    );
}

export default FKEditor;
