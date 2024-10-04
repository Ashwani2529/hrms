/* eslint-disable */

import React from 'react';
import { Grid, TextField, Button, FormControl, Select, MenuItem, InputLabel, InputAdornment } from '@mui/material';
import { FieldArray } from 'formik';

const defaultVal = {
    name: '',
    type: 'NORMAL',
    amount: 0
};

const DeductionDetails = ({ values, handleChange, viewOnly }) => {
    return (
        <>
            <FieldArray
                name="deduction"
                render={(arrayHelpers) => (
                    <Grid container spacing={2}>
                        {values.deduction.map((deduction, index) => (
                            <Grid container item key={index} spacing={2} alignItems="center" flexWrap={'nowrap'}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Deduction Name"
                                        variant="outlined"
                                        name={`deduction.${index}.name`}
                                        type="text"
                                        placeholder="Deduction Name"
                                        value={values.deduction[index]?.name || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        name={`deduction.${index}.amount`}
                                        type="number"
                                        placeholder="Deduction Amount"
                                        value={values.deduction[index]?.amount || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { paddingLeft: '0px' }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Select
                                                        name={`deduction.${index}.type`}
                                                        value={values.deduction[index]?.type || 'NORMAL'}
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
                                            disabled={values.deduction.length === 1}
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
                                    disabled={values.deduction.length >= 5}
                                >
                                    Add More Deduction
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                )}
            />
        </>
    );
};

export default DeductionDetails;
