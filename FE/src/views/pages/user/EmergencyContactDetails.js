/* eslint-disable */

import { Grid, TextField, FormHelperText, Button, Box, Stack, Divider } from '@mui/material';
import { FieldArray } from 'formik';
import FKTextfield from 'views/ui-elements/form/FKTextfield';

const EmergencyContactDetails = ({ values, handleChange, handleBlur, touched, errors }) => {
    return (
        <FieldArray name="emergency_contacts_data">
            {({ insert, remove, push }) => (
                <div>
                    {values?.emergency_contacts_data?.map((contact, index) => (
                        <Box sx={{ mb: 2 }} key={`${contact} + ${index}`}>
                            {index !== 0 && <Divider sx={{ my: 2 }} />}
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FKTextfield fullWidth name={`emergency_contacts_data[${index}].name`} label="Name" />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FKTextfield fullWidth name={`emergency_contacts_data[${index}].phone`} label="Contact No." />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FKTextfield fullWidth name={`emergency_contacts_data[${index}].relationship`} label="Relationship" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button onClick={() => remove(index)} variant="outlined" color="error">
                                        Remove
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={() =>
                                push({
                                    name: '',
                                    phone: '',
                                    relationship: ''
                                })
                            }
                        >
                            Add Contact
                        </Button>
                    </Stack>
                </div>
            )}
        </FieldArray>
    );
};

export default EmergencyContactDetails;
