import React from 'react';
import { TableRow, TableCell, Typography, Chip, Button, Stack, IconButton, Tooltip } from '@mui/material';
import { DOCUMENT_STATUS, roles } from 'store/constant';
import { Approval, Cancel } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useAuth from 'hooks/useAuth';

function ParseChip({ status }) {
    switch (status) {
        case DOCUMENT_STATUS.APPROVED:
            return <Chip label={status} variant="outlined" color="success" />;
        case DOCUMENT_STATUS.REJECTED:
            return <Chip label={status} variant="outlined" color="error" />;
        case DOCUMENT_STATUS.PENDING:
            return <Chip label={status} variant="outlined" color="warning" />;
        case DOCUMENT_STATUS.SIGNED:
            return <Chip label={status} variant="outlined" color="info" />;
        default:
            return <></>;
    }
}

function DocumentTableRow({ row, index, handleUpdateDocumentStatus }) {
    const { role } = useAuth();

    return (
        <TableRow>
            <TableCell>
                <Typography>{index + 1}.</Typography>
            </TableCell>
            <TableCell>
                <Typography>{row?.usrdoc_title}</Typography>
            </TableCell>
            <TableCell>
                <Typography>{row?.usrdoc_description}</Typography>
            </TableCell>
            <TableCell>
                <Typography>{row?.user?.user_name}</Typography>
            </TableCell>
            <TableCell>
                <ParseChip status={row?.usrdoc_status} />
            </TableCell>
            <TableCell>
                {row?.usrdoc_status === DOCUMENT_STATUS.PENDING ? (
                    '-'
                ) : (
                    <Button
                        href={`https://hrms-employee-docs.s3.ap-south-1.amazonaws.com/${row?.usrdoc_pdf_url}`}
                        target="_blank"
                        referrerPolicy="noreferrer"
                        variant="outlined"
                    >
                        View
                    </Button>
                )}
            </TableCell>
            {role !== roles.EMPLOYEE && (
                <TableCell>
                    {row?.usrdoc_status === DOCUMENT_STATUS.APPROVED || row?.usrdoc_status === DOCUMENT_STATUS.REJECTED ? (
                        '-'
                    ) : (
                        <Stack direction="row" gap={1}>
                            <Tooltip title="Approve">
                                <IconButton
                                    onClick={() => {
                                        handleUpdateDocumentStatus(row?.usrdoc_id, DOCUMENT_STATUS.APPROVED);
                                    }}
                                >
                                    <CheckCircleOutlineIcon color="success" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <IconButton
                                    onClick={() => {
                                        handleUpdateDocumentStatus(row?.usrdoc_id, DOCUMENT_STATUS.REJECTED);
                                    }}
                                >
                                    <Cancel color="error" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                </TableCell>
            )}
        </TableRow>
    );
}

export default DocumentTableRow;
