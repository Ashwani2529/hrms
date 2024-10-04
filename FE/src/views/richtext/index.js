import React from 'react';
import { Box } from '@mui/material';
import Editor from './Editor';

function RichText() {
    return (
        <Box p={3}>
            <div>RichText</div>
            <Editor />
        </Box>
    );
}

export default RichText;
