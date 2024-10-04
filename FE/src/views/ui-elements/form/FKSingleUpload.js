import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, styled } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { useField } from 'formik';

const DropzoneBox = styled(Box)(({ theme }) => ({
    border: '2px dashed #aaa',
    padding: theme.spacing(2),
    minHeight: theme.spacing(20),
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}));

const FKSingleUpload = ({ onDrop, accept = 'image/*', ...props }) => {
    const [field, meta, helper] = useField(props);

    const handleDrop = async (acceptedFiles) => {
        const res = await onDrop(acceptedFiles);
        helper.setValue(res);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept
    });

    const Placeholder = () =>
        field.value ? (
            <Box>
                <img src={field.value} alt="" width={400} />
                <Typography>{field.value?.name}</Typography>
            </Box>
        ) : (
            <>
                <Box>
                    <ImageIcon style={{ fontSize: 50, color: '#aaa' }} />
                    <Typography variant="body1">Drag & drop some files here, or double click to select files</Typography>
                </Box>
            </>
        );

    return (
        <Box>
            <DropzoneBox {...getRootProps()}>
                <input {...getInputProps()} />
                {isDragActive ? <Typography variant="body1">Drop the files here...</Typography> : <Placeholder />}
            </DropzoneBox>
            {meta.error && (
                <Typography variant="subtitle2" color="error">
                    {meta.error}
                </Typography>
            )}
        </Box>
    );
};

export default FKSingleUpload;
