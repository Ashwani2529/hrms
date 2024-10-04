/* eslint-disable */

import React, { useEffect } from 'react';
import { Grid, TextField, Button, FormControl, Select, MenuItem, InputLabel, InputAdornment } from '@mui/material';
import { FieldArray } from 'formik';

const defaultVal = {
    name: '',
    type: 'NORMAL',
    amount: 0
};

const EarningDetails = ({ values, handleChange, viewOnly }) => {
    return (
        <>
            <FieldArray
                name="earnings"
                render={(arrayHelpers) => (
                    <Grid container spacing={2}>
                        {values.earnings.map((earning, index) => (
                            <Grid container item key={index} spacing={2} alignItems="center" flexWrap={'nowrap'}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Earning Name"
                                        variant="outlined"
                                        name={`earnings.${index}.name`}
                                        type="text"
                                        placeholder="Earning Name"
                                        value={values.earnings[index]?.name || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        name={`earnings.${index}.amount`}
                                        type="number"
                                        placeholder="Earnings Amount"
                                        value={values.earnings[index]?.amount || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { paddingLeft: '0px' }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Select
                                                        name={`earnings.${index}.type`}
                                                        value={values.earnings[index]?.type || 'NORMAL'}
                                                        onChange={handleChange}
                                                        sx={{
                                                            backgroundColor: '#f0f0f0' // Change background color to gray
                                                        }}
                                                    >
                                                        <MenuItem value="NORMAL">Number</MenuItem>
                                                        <MenuItem value="PERCENTAGE">Percent</MenuItem>
                                                    </Select>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                {!viewOnly && (
                                    <Grid item xs={2}>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={() => arrayHelpers.remove(index)}
                                            disabled={values.earnings.length === 1}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        {!viewOnly && (
                            <Grid item xs={12}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => arrayHelpers.push(defaultVal)}
                                    disabled={values.earnings.length >= 5}
                                >
                                    Add More Earning
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                )}
            />
        </>
    );
};

export default EarningDetails;
