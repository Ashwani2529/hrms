import React, { useState } from 'react';
import Styles from './signature.module.scss';
import { Box, Grid, Stack, TextField } from '@mui/material';
import SignatureStyle from './SignatureStyle';

const signatureStyles = [
    Styles.dancing_script,
    Styles.caveat,
    Styles.sevillana,
    Styles.salsa,
    Styles.mrsSaint,
    Styles.rockSalt,
    Styles.tangerine,
    Styles.macondo,
    Styles.sacramento,
    Styles.birthstone_bounce
];

function PredefinedSignatures({ handleSelectedStyleRefChange, selectedStyleRef, signature, setSignature }) {
    return (
        <Box>
            <Box sx={{ py: 2 }}>
                <TextField fullWidth autoFocus value={signature} onChange={(e) => setSignature(e.target.value)} label="Signature" />
            </Box>
            <Box sx={{ maxHeight: 400, overflowY: 'scroll' }}>
                <Grid container xs={12} md={12} spacing={1}>
                    {signatureStyles.map((style) => (
                        <Grid key={style} item xs={12} md={12} lg={6}>
                            <SignatureStyle
                                signature={signature}
                                selectedStyleRef={selectedStyleRef}
                                handleSelectedStyleRefChange={handleSelectedStyleRefChange}
                                signatureClassname={style}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default PredefinedSignatures;
