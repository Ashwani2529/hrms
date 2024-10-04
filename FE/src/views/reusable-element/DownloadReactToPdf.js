/* eslint-disable */

import React, { useRef, cloneElement, useState, useEffect } from 'react';
import ReactToPdf from 'react-to-pdf';
import Button from '@mui/material/Button';
import { usePDF } from 'react-to-pdf';

const DownloadReactToPdf = ({ children }) => {
  const options = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  };
  const pdfRef = useRef();
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const downloadPdf = async () => {
    if (pdfRef.current && !generatingPdf) {
      try {
        setGeneratingPdf(true);
        const pdf = await pdfRef.current.toPdf();
        const pdfBlob = await pdf.output('blob');
        setGeneratingPdf(false);

        // Trigger download using Blob
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download =  'document.pdf';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setGeneratingPdf(false);
      }
    }
  };

  // Ensure that the component is mounted before triggering PDF generation
  useEffect(() => {
    console.log(children)
    downloadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
  console.log(targetRef)

  return (
    // <ReactToPdf targetRef={pdfRef} options={options}>
    //   {({ toPdf }) => (
        <div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Button) {
              return cloneElement(child, { onClick: () => toPDF() });
            }
            if (React.isValidElement(child) && child.type === 'div') {
              return cloneElement(child, { ref: targetRef, style: { display: 'none' } });
            }
            return null;
          })} 
        </div>
    //   )}
    // </ReactToPdf>
  )
  
};

export default DownloadReactToPdf;
