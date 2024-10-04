import React from 'react';
import { TableRow, TableCell, Stack, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

function TemplateTableRow({ row, index, handleEditNavigate, handleDeleteTemplate }) {
    return (
        <TableRow>
            <TableCell>{index + 1}.</TableCell>
            <TableCell>{row?.template_name}</TableCell>
            <TableCell>{row?.template_description || 'Some description'}</TableCell>
            <TableCell>{row?.predefined_variables?.length + row?.custom_variables?.length || 0}</TableCell>
            <TableCell>
                <Stack direction="row" gap={1}>
                    <IconButton onClick={() => handleEditNavigate(row?.template_id)}>
                        <Edit />
                    </IconButton>
                    {!row?.default && (
                        <IconButton
                            onClick={() => {
                                handleDeleteTemplate(row?.template_id);
                            }}
                        >
                            <Delete color="error" />
                        </IconButton>
                    )}
                </Stack>
            </TableCell>
        </TableRow>
    );
}

export default TemplateTableRow;
