import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Stack,
    PaginationItem,
    CardContent,
    Typography,
    Button,
    TableContainer,
    Table,
    TableBody,
    TablePagination
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { TemplateActions } from 'store/slices/templates';
import { dispatch } from 'store';
import TemplateTableHeader from './TemplateTableHeader';
import { useSelector } from 'react-redux';
import TemplateTableRow from './TemplateTableRow';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { openSnackbar } from 'store/slices/snackbar';
import { findKeyInObject } from 'utils/findKeyInObjects';

function LetterTemplates() {
    const navigate = useNavigate();
    const { deleteTemplate } = TemplateActions;

    const { loading, templates } = useSelector((state) => state.templates);

    const handleCreateNavigate = () => {
        navigate('/letter-templates/create');
    };

    const handleEditNavigate = (id) => {
        navigate(`/letter-templates/edit/${id}`);
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            dispatch(
                openConfirmationModal({
                    open: true,
                    message: 'This action is not reversible.',
                    handleConfirm: async () => {
                        // Perform delete action on confirmation
                        const res = await dispatch(deleteTemplate({ templateIds: [templateId] }));
                        if (!res?.payload?.deletedTemplates) {
                            dispatch(
                                openSnackbar({
                                    open: true,
                                    message:
                                        findKeyInObject(res?.payload, `message`) ||
                                        findKeyInObject(res?.payload, `error`) ||
                                        'Internal Server error',
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
                                    message: `Template successfully deleted.`,
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
        } catch (error) {
            console.log({ error });
        }
    };

    const onChangePage = () => {};
    const onChangeRowsPerPage = () => {};

    return (
        <Page title="Letter Templates">
            <Breadcrumbs heading="Templates List" links={[{ name: 'Letter Templates', href: '/letter-templates/list' }]} />
            <MainCard
                title={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h3">Letter Template List</Typography>

                        <Button variant="outlined" onClick={handleCreateNavigate}>
                            Create Template
                        </Button>
                    </Stack>
                }
                content={false}
            >
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TemplateTableHeader />
                            <TableBody>
                                {templates?.map((row, index) => (
                                    <TemplateTableRow
                                        key={row.template_id}
                                        row={row}
                                        index={index}
                                        handleEditNavigate={handleEditNavigate}
                                        handleDeleteTemplate={handleDeleteTemplate}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={0}
                    rowsPerPage={25}
                    page={1}
                    onPageChange={onChangePage}
                    onRowsPerPageChange={onChangeRowsPerPage}
                />
            </MainCard>
        </Page>
    );
}

export default LetterTemplates;
