import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import MyDocument from './template';

function ReactPDFComponent({ signatureUrl }) {
    return (
        <PDFViewer style={{ width: 800, height: 1500 }}>
            <MyDocument signatureUrl={signatureUrl} />
        </PDFViewer>
    );
}

export default ReactPDFComponent;
