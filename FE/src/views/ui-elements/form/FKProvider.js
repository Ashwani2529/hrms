import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormikProvider } from 'formik';
import { Stack } from '@mui/material';
import { gridSpacing } from 'store/constant';

function FKProvider({ value, children }) {
    return (
        <FormikProvider value={value}>
            <Form>
                <Stack direction="column" gap={gridSpacing}>
                    {children}
                </Stack>
            </Form>
        </FormikProvider>
    );
}

FKProvider.propTypes = {
    value: PropTypes.object,
    children: PropTypes.node
};

export default FKProvider;
