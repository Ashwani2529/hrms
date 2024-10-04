import React, { useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import jsPDF from 'jspdf';
import ReportTemplate from './ReportTemplate';
import { Button } from '@mui/material';

function HTMLToPdf({ signatureUrl }) {
    const reportTemplateRef = useRef(null);
    // eslint-disable-next-line new-cap

    const handleGeneratePdf = () => {
        // eslint-disable-next-line new-cap
        const doc = new jsPDF({
            format: 'a4',
            unit: 'px',
            orientation: 'portrait'
        });

        // Adding the fonts.
        doc.setFont('Inter-Regular', 'normal');

        doc.html(reportTemplateRef.current, {
            async callback(doc) {
                // const blob= doc.output('blob');
                doc.save('document');
            }
        });
    };

    return (
        <div>
            <Button onClick={handleGeneratePdf}>Convert</Button>
            <div ref={reportTemplateRef}>
                <ReportTemplate signatureUrl={signatureUrl} />
            </div>
        </div>
    );
}

export default HTMLToPdf;
