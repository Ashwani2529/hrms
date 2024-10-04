import React, { useRef } from 'react';
import Styles from './signature.module.scss';
import { Box } from '@mui/material';

function SignatureStyle({ handleSelectedStyleRefChange, selectedStyleRef, signature, signatureClassname }) {
    const ref = useRef();

    return (
        <div
            style={{
                border: `${selectedStyleRef?.current && ref.current === selectedStyleRef?.current ? 2 : 1}px solid ${
                    selectedStyleRef?.current && ref.current === selectedStyleRef?.current ? 'gray' : '#efefef'
                }`
            }}
            className={Styles.signature_container}
        >
            <Box sx={{ minHeight: '125px' }} onClick={() => handleSelectedStyleRefChange(ref)} ref={ref}>
                <p className={`${signatureClassname} ${Styles.signature}`}>{signature || 'Your Signature'}</p>
            </Box>
        </div>
    );
}

export default SignatureStyle;
