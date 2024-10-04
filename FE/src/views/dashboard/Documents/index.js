import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CardContent,
    Grid,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TablePagination,
    TextField,
    Typography
} from '@mui/material';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import { DOCUMENT_STATUS, gridSpacing } from 'store/constant';
import DocumentsTableHead from './DocumentsTableHead';
import DocumentTableRow from './DocumentTableRow';
import { DocumentActions } from 'store/slices/documents';
import { useSelector } from 'react-redux';
import { dispatch } from 'store';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { openSnackbar } from 'store/slices/snackbar';
import EmptyContent from 'ui-component/extended/EmptyContent';
import SkeletonDocument from 'ui-component/skeleton/SkeletonDocuments';
import useDebounce from 'hooks/useDebounce';

function DocumentsList() {
    const { fetchDocuments, updateDocumentStatus } = DocumentActions;
    const { loading, documents, totalDocs } = useSelector((state) => state.documents);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const debouncedSearch = useDebounce(search, 500);

    const handleUpdateDocumentStatus = (documentId, status) => {
        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    const response = await dispatch(updateDocumentStatus({ documentId, status }));
                    console.log({ response });
                    if (response?.meta?.requestStatus !== 'fulfilled') {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: response?.payload?.message || 'Failed to update status!',
                                variant: 'alert',
                                alert: {
                                    color: 'error'
                                },
                                close: true
                            })
                        );
                    } else {
                        dispatch(
                            openSnackbar({
                                open: true,
                                message: 'Status updated successfully!',
                                variant: 'alert',
                                alert: {
                                    color: 'success'
                                },
                                close: true
                            })
                        );
                    }
                }
            })
        );
    };

    const handleChangePage = (_, page) => {
        setPage(page);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(e.target.value);
        setPage(0);
    };

    const handleSearchChange = (e) => {
        setPage(0);
        setSearch(e.target.value);
    };

    const handleStatusChange = (e) => {
        setPage(0);
        setStatus(e.target.value === 'All' ? '' : e.target.value);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setPage(0);
    };

    useEffect(() => {
        dispatch(
            fetchDocuments({
                page,
                limit: rowsPerPage,
                debouncedSearch,
                status
            })
        );
    }, [page, rowsPerPage, search, status]);

    return (
        <Page title="Documents: List">
            <Breadcrumbs heading="Documents" links={[{ name: 'Documents', href: '/documents/list' }]} />
            <MainCard title="Documents: List">
                <Box p={0}>
                    <Grid container xs={12} spacing={gridSpacing} justifyContent="space-between" alignItems="center">
                        <Grid item xs={12} md={4} flexWrap="wrap">
                            <Stack direction="row" gap={2} alignItems="center">
                                <TextField
                                    fullWidth
                                    name="usrdoc_title"
                                    value={search}
                                    onChange={handleSearchChange}
                                    label="Document Title"
                                />
                                <TextField select value={status} onChange={handleStatusChange} fullWidth name="status" label="Status">
                                    <MenuItem value="">All</MenuItem>
                                    {Object.entries(DOCUMENT_STATUS).map((ele, index) => (
                                        <MenuItem key={ele[0] + index} value={ele[0]}>
                                            {ele[1]}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Stack alignItems="flex-end">
                                <Button variant="outlined" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                    <TableContainer sx={{ mt: 3 }}>
                        <Table>
                            <DocumentsTableHead />
                            <TableBody>
                                {loading
                                    ? [1, 2, 3, 4, 5].map((ele, index) => <SkeletonDocument key={ele + index} />)
                                    : documents.map((row, index) => (
                                          <DocumentTableRow
                                              key={row?.usrdoc_id}
                                              row={row}
                                              index={page * rowsPerPage + index}
                                              handleUpdateDocumentStatus={handleUpdateDocumentStatus}
                                          />
                                      ))}
                            </TableBody>
                        </Table>
                        {!loading && documents.length === 0 && <EmptyContent title="No documents found!" />}
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={totalDocs}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                </Box>
            </MainCard>
        </Page>
    );
}

export default DocumentsList;
