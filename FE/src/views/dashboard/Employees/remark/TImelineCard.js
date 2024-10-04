/* eslint-disable camelcase */
import React from 'react';
import { Box, Card, Divider, Typography, Stack, Grid, Button, IconButton, Tooltip } from '@mui/material';
import { gridSpacing, REMARK_TYPE } from 'store/constant';
import { Delete, Edit } from '@mui/icons-material';
import Chip from 'ui-component/extended/Chip';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { dispatch } from 'store';
import { RemarkActions } from 'store/slices/remarks';
import { openSnackbar } from 'store/slices/snackbar';
import moment from 'moment';
import { findKeyInObject } from 'utils/findKeyInObjects';

function GetRemarkChip({ data }) {
    switch (data) {
        case REMARK_TYPE.PERFORMANCE:
            return <Chip label={REMARK_TYPE.PERFORMANCE} chipcolor="success" />;
        case REMARK_TYPE.CONFLICT:
            return <Chip label={REMARK_TYPE.CONFLICT} chipcolor="error" />;

        default:
            return <></>;
    }
}

function TImelineCard({ handleOpenAddRemark, remark }) {
    const { deleteRemark } = RemarkActions;

    const handleDelete = async (remark_id) => {
        const object = {
            remarks: [remark_id]
        };

        dispatch(
            openConfirmationModal({
                open: true,
                message: 'This action is not reversible.',
                handleConfirm: async () => {
                    // Perform delete action on confirmation
                    const res = await dispatch(deleteRemark(object));
                    if (res?.payload?.status !== 201 && res?.payload?.status !== 200) {
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
                                message: 'Operation successful!',
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

    return (
        <Box sx={{ width: '100%', minHeight: 100 }}>
            <Card variant="outlined" p={1}>
                <Box p={2}>
                    <Typography variant="h4">{moment(remark?.remark_date).format('MMM DD, YYYY')}</Typography>
                </Box>
                <Divider />
                <Stack p={2} spacing={gridSpacing}>
                    <Typography variant="subtitle1" sx={{ opacity: 0.5 }}>
                        {remark?.remark_description}
                    </Typography>
                    <Grid container xs={12} md={12} spacing={gridSpacing} justifyContent="space-between" alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Grid container xs={12} md={12} justifyContent="flex-start" alignItems="center">
                                {/* This container is for chips */}
                                {/* <Grid item xs={6} md={3}>
                                    <Tooltip title="Magnitude">
                                        <Chip label={remark?.remark_level} chipcolor="warning" />
                                    </Tooltip>
                                </Grid> */}
                                <Grid item xs={6} md={6}>
                                    <GetRemarkChip data={remark?.remark_type} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container xs={12} md={12} justifyContent="flex-end">
                                {/* This container is for ctas */}
                                <Grid item xs={3} md={3}>
                                    <IconButton
                                        onClick={() => {
                                            handleOpenAddRemark(remark);
                                        }}
                                    >
                                        <Edit color="primary" />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={3} md={3}>
                                    <IconButton
                                        onClick={() => {
                                            handleDelete(remark?.remark_id);
                                        }}
                                    >
                                        <Delete color="error" />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Stack>
            </Card>
        </Box>
    );
}

export default TImelineCard;
