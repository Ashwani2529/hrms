import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, DialogActions, DialogContent, Divider, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import ReactSignatureCanvas from 'react-signature-canvas';
import PredefinedSignatures from './PredefinedSignatures';
import { toPng } from 'html-to-image';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { Icon } from '@iconify/react';
import { SIGNATURE_MODES } from 'store/constants/signature.constants';
import UploadSingnature from './UploadSingnature';
// import HTMLToPdf from './htmlToPdf';
// import ReactPDFComponent from './reactPDF';

function SignatureProvider({
    mode,
    canvasRef,
    setSignatureUrl,
    selectedStyleRef,
    handleSelectedStyleRefChange,
    setSignature,
    signature,
    uploadedSignatureUrl,
    setUploadedSignatureUrl,
    canvasWidth
}) {
    switch (mode) {
        case SIGNATURE_MODES.FREESTYLE:
            return (
                <Box sx={{ border: '1px solid #efefef', minWidth: 300, maxWidth: 480 }}>
                    <ReactSignatureCanvas ref={canvasRef} canvasProps={{ height: 0.4375 * canvasWidth, width: canvasWidth }} />
                </Box>
            );

        case SIGNATURE_MODES.PREDEFINED:
            return (
                <PredefinedSignatures
                    setSignatureUrl={setSignatureUrl}
                    selectedStyleRef={selectedStyleRef}
                    handleSelectedStyleRefChange={handleSelectedStyleRefChange}
                    setSignature={setSignature}
                    signature={signature}
                />
            );

        case SIGNATURE_MODES.UPLOAD:
            return <UploadSingnature uploadedSignatureUrl={uploadedSignatureUrl} setUploadedSignatureUrl={setUploadedSignatureUrl} />;
        default:
            return (
                <PredefinedSignatures
                    setSignatureUrl={setSignatureUrl}
                    selectedStyleRef={selectedStyleRef}
                    handleSelectedStyleRefChange={handleSelectedStyleRefChange}
                    setSignature={setSignature}
                    signature={signature}
                />
            );
    }
}

function SignaturePad({ setSignatureUrl, handleCloseModal }) {
    const theme = useTheme();
    const canvasRef = useRef();

    const [signature, setSignature] = useState('');
    const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState('');
    const [selectedStyleRef, setSelectedStyleRef] = useState(null);
    const [mode, setMode] = useState(SIGNATURE_MODES.PREDEFINED);
    const [canvasWidth, setCanvasWidth] = useState(480);

    const handleClearCanvas = () => {
        if (mode === SIGNATURE_MODES.FREESTYLE) {
            canvasRef.current.clear();
        } else if (mode === SIGNATURE_MODES.PREDEFINED) {
            setSignature('');
        } else {
            setUploadedSignatureUrl('');
        }
        setSignatureUrl('');
    };

    const handleSelectedStyleRefChange = (newRef) => {
        if (!newRef) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: `Document sent successfully!`,
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
        } else {
            setSelectedStyleRef(newRef);
        }
    };

    const handleExport = async () => {
        if (mode === SIGNATURE_MODES.PREDEFINED && !selectedStyleRef)
            return dispatch(
                openSnackbar({
                    open: true,
                    message: `Please select a signature style!`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        if (mode === SIGNATURE_MODES.FREESTYLE) {
            const signatureUrl = canvasRef.current.toDataURL('image/png');
            setSignatureUrl(signatureUrl);
        } else if (mode === SIGNATURE_MODES.PREDEFINED) {
            const url = await toPng(selectedStyleRef.current);
            setSignatureUrl(url);
        } else {
            if (!uploadedSignatureUrl)
                return dispatch(
                    openSnackbar({
                        open: true,
                        message: `No file was recieved as input!`,
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            setSignatureUrl(uploadedSignatureUrl);
        }
        handleCloseModal();
        return null;
    };

    const toggleSignatureMode = (mode) => {
        setMode(mode);
        handleClearCanvas();
    };

    useEffect(() => {
        if (window.innerWidth < 500) {
            setCanvasWidth(window.innerWidth - 40);
        }
        window.addEventListener('resize', () => {
            if (window.innerWidth < 500) {
                setCanvasWidth(window.innerWidth - 40);
            }
        });
        return () => window.removeEventListener('resize', () => {});
    }, []);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: theme.palette.background.paper,
                maxWidth: 800,
                minWidth: 300,
                p: 3,
                borderRadius: 2
            }}
        >
            <Box>
                <Typography variant="h2">Please provide your signature</Typography>
            </Box>
            <Divider sx={{ mt: 1, mb: 3 }} />
            <Box sx={{ width: '100%', mb: 2 }}>
                {/* Aspect ratio 16:7 */}
                <SignatureProvider
                    mode={mode}
                    canvasRef={canvasRef}
                    setSignature={setSignature}
                    setSignatureUrl={setSignatureUrl}
                    setUploadedSignatureUrl={setUploadedSignatureUrl}
                    handleSelectedStyleRefChange={handleSelectedStyleRefChange}
                    selectedStyleRef={selectedStyleRef}
                    signature={signature}
                    uploadedSignatureUrl={uploadedSignatureUrl}
                    canvasWidth={canvasWidth}
                />
            </Box>
            <Divider />
            <Stack
                direction="row"
                gap={2}
                mt={2}
                justifyContent={{ md: 'space-between', xs: 'center' }}
                alignItems="center"
                flexWrap="wrap"
            >
                <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
                    <Tooltip title="Predefiend Styles">
                        <IconButton
                            onClick={() => {
                                toggleSignatureMode(SIGNATURE_MODES.PREDEFINED);
                            }}
                        >
                            <Icon icon="ph:signature-fill" width={32} height={32} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Signature Pad">
                        <IconButton>
                            <Icon
                                onClick={() => {
                                    toggleSignatureMode(SIGNATURE_MODES.FREESTYLE);
                                }}
                                icon="ant-design:signature-outlined"
                                width={32}
                                height={32}
                            />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Signature">
                        <IconButton
                            onClick={() => {
                                toggleSignatureMode(SIGNATURE_MODES.UPLOAD);
                            }}
                        >
                            <Icon icon="material-symbols:upload-sharp" width={32} height={32} />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack direction="row" gap={2} flexWrap="wrap">
                    <Button variant="contained" onClick={handleExport}>
                        Save
                    </Button>
                    <Button variant="outlined" onClick={handleClearCanvas}>
                        Clear
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

export default SignaturePad;
