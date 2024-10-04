/* eslint-disable */

import React from 'react'
import {
    Grid,
    TextField,
    Button, FormControl, Select, MenuItem, InputLabel, InputAdornment
} from '@mui/material';
import { FieldArray } from 'formik';

const defaultVal = {
    name: "",
    type: "NORMAL",
    amount: 0
}

const IncentiveDetails = ({ values, handleChange }) => {
    return (
        <>
            <FieldArray
                name="incentive"
                render={(arrayHelpers) => (
                    <Grid container spacing={2}>
                        {values.incentive.map((incentive, index) => (
                            <Grid container item key={index} spacing={2} alignItems='center' flexWrap={'nowrap'}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Incentive Name"
                                        variant="outlined"
                                        name={`incentive.${index}.name`}
                                        type="text"
                                        placeholder="Incentive Name"
                                        value={values.incentive[index]?.name || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        name={`incentive.${index}.amount`}
                                        type="number"
                                        placeholder="Incentive Amount"
                                        value={values.incentive[index]?.amount || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root':{ paddingLeft:'0px'}
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Select
                                                        name={`incentive.${index}.type`}
                                                        value={values.incentive[index]?.type || 'NORMAL'}
                                                        onChange={handleChange}
                                                        sx={{
                                                            
                                                            backgroundColor: '#f0f0f0', // Change background color to gray
                                                        }}
                                                    >
                                                        <MenuItem value="NORMAL">Number</MenuItem>
                                                        <MenuItem value="PERCENTAGE">Percent</MenuItem>
                                                    </Select>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={() => arrayHelpers.remove(index)}
                                        disabled={values.incentive.length === 1}
                                    >
                                        Remove
                                    </Button>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => arrayHelpers.push(defaultVal)}
                                disabled={values.incentive.length >= 5}
                            >
                                Add More Incentive
                            </Button>
                        </Grid>
                    </Grid>
                )}
            />
        </>
    )
}

export default IncentiveDetails