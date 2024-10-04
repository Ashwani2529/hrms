import React from 'react';
import { Box, Grid, Card, TextField, MenuItem, MenuList, Button } from '@mui/material';
import { gridSpacing, LeaveTypes } from 'store/constant';
import moment from 'moment';

function LeavesToolbar() {
    return (
        <Box>
            <Grid container justifyContent="space-between" xs={12} md={12}>
                <Grid item xs={12} md={5}>
                    <Grid container xs={12} md={12} spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <TextField size="small" fullWidth label="Leave Name" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField size="small" select fullWidth label="Leave Type">
                                {Object.entries(LeaveTypes).map((leave, index) => (
                                    <MenuItem value={leave[1]} key={leave[0] + index}>
                                        {leave[0]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Grid container xs={12} md={12} justifyContent="flex-end" spacing={gridSpacing}>
                        <Grid item xs={12} md={4}>
                            <TextField size="small" fullWidth type="date" label="Start Date" defaultValue={moment().format('YYYY-MM-DD')} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField size="small" fullWidth type="date" label="End Date" defaultValue={moment().format('YYYY-MM-DD')} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button variant="contained">Clear Filters</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default LeavesToolbar;
