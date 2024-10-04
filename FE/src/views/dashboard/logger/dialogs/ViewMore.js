/* eslint-disable */

import React from 'react';
import './pdf.css';
import { DialogContent, DialogTitle, Divider, Typography, Grid, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import JSONPretty from 'react-json-pretty';
import JSONPrettyMon from 'react-json-pretty/themes/monikai.css';
// import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import { Info } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function ViewMoreModal({ selectedRow, handleModalClose }) {
    const { user } = useAuth();

    console.log({ selectedRow });

    return (
        <DialogContent sx={{ overflowY: 'unset', padding: '13px 0px' }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <Box variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Info /> Details
                </Box>
                <CloseIcon sx={{ position: 'absolute', right: '20px', cursor: 'pointer' }} onClick={handleModalClose} />
            </DialogTitle>
            <Divider />

            <Box px={3} pt={2} pb={1}>
                <Typography>{selectedRow?.text_info || 'No textual details found!'}</Typography>
            </Box>
            <Box px={1}>
                <Accordion>
                    <AccordionSummary id="panel-header" aria-controls="panel-content" expandIcon={<ExpandMoreIcon />}>
                        More Info
                    </AccordionSummary>
                    <AccordionDetails>
                        <JSONPretty
                            id="json-pretty"
                            data={selectedRow?.additional_details}
                            theme={{
                                main: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                                error: 'line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;',
                                key: 'color:#fff;',
                                string: 'color:#fd971f;',
                                value: 'color:#a6e22e;',
                                boolean: 'color:#ac81fe;'
                            }}
                        ></JSONPretty>
                    </AccordionDetails>
                </Accordion>
            </Box>
            {/* <JsonView data={selectedRow?.additional_details} shouldExpandNode={allExpanded} style={defaultStyles} /> */}
            {/* {selectedRow?.additional_details} */}
        </DialogContent>
    );
}

export default ViewMoreModal;
