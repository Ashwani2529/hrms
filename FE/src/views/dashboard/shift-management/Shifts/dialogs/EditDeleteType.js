/* eslint-disable */
import React from 'react';

import { Dialog, DialogActions, DialogContent, Grid, FormControl, Radio, Stack, Button, RadioGroup, FormControlLabel } from '@mui/material';

const EditDeleteType = ({
    setOpenUpdateDialog,
    openUpdateDialog,
    isSubmitting,
    handleSubmit,
    handleDelete,
    setFieldValue,
    values,
    type
}) => {
    return (
        <Dialog maxWidth="sm" fullWidth open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
            <DialogContent fullWidth>
                <Grid container fullWidth>
                    <FormControl fullWidth>
                        <RadioGroup
                            row
                            aria-label="update-type"
                            value={values.update_type}
                            onChange={(event) => setFieldValue('update_type', event.target.value)}
                            name="row-radio-buttons-group"
                        >
                            <FormControlLabel value="SINGLE_SHIFT" control={<Radio />} label="Single Shift" />
                            <FormControlLabel value="ALL_SHIFT" control={<Radio />} label="All Shifts" />
                            <FormControlLabel value="FOLLOW_UP_SHIFT" control={<Radio />} label="Follow up Shifts" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button type="button" variant="outlined" onClick={() => setOpenUpdateDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                disabled={isSubmitting}
                                onClick={() => (type == 'Delete' ? handleDelete() : handleSubmit())}
                            >
                                {type}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

export default EditDeleteType;
