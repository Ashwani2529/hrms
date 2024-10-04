/* eslint-disable */
import React, { useState } from "react";

import { Dialog, DialogActions, DialogContent, Grid, FormControl, Radio, Stack, Button, RadioGroup, FormControlLabel } from "@mui/material";

const TransferShift = ({ setDialog, openDialog, handleSubmit, options }) => {
    const [swapType, setSwapType] = useState(options[0]?.value);
    return (
        <Dialog maxWidth="sm" fullWidth open={openDialog} onClose={() => setDialog(false)}>
            <DialogContent fullWidth>
                <Grid container fullWidth>
                    <FormControl fullWidth>
                        <RadioGroup
                            row
                            aria-label="update-type"
                            value={swapType}
                            onChange={(event) => setSwapType(event.target.value)}
                            name="row-radio-buttons-group"
                        >
                            {options?.map((option, index) => {
                                return (
                                    <FormControlLabel value={option.value} control={<Radio />} label={option.label} />
                                )
                            })}
                        </RadioGroup>
                    </FormControl>

                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button type="button" variant="outlined" onClick={() => setDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={() => handleSubmit(swapType)}>
                                Confirm
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    )
}

export default TransferShift;