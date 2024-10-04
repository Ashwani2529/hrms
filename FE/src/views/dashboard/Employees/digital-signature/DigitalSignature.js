import React, { useEffect, useState } from 'react';
import Page from 'ui-component/Page';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import success from 'assets/images/icons/success.png';
import {
    Box,
    Button,
    CardActions,
    CardContent,
    Container,
    Dialog,
    DialogContent,
    Modal,
    Stack,
    TableContainer,
    Typography,
    Stepper,
    Step,
    StepButton,
    StepLabel,
    CircularProgress
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import rehypeRaw from 'rehype-raw';
import axiosServices from 'utils/axios';
import SignaturePad from 'views/signature/signature';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { LoadingButton } from '@mui/lab';
import { openConfirmationModal } from 'store/slices/confirmationModal';
import { LETTER_WIDTH } from 'store/constant';
import EmptyContent from 'ui-component/extended/EmptyContent';
import VerifyDocumentOtp from './VerifyDocumentOtp';

const steps = ['Verify OTP', 'Sign the document'];

const RESEND_OTP_DELAY = 30;

function DigitalSignature() {
    const [searchParams, _] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    const [signatureUrl, setSignatureUrl] = useState('');
    const [openOtpModal, setOpenOtpModal] = useState(false);
    const [docSent, setDocSent] = useState(false);
    const [otpSent, setOtpSend] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resendOtpTimer, setResendOtpTimer] = useState(RESEND_OTP_DELAY); // value for countdown in secs

    const docToken = searchParams.get('docToken');
    const verifyDocSignToken = async () => {
        setLoading(true);
        try {
            const res = await axiosServices.post('/auth/verifyDocSignToken', {
                token: docToken
            });
            setHtmlContent(res.data.htmlContent);
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || `Invalid token`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        } finally {
            setLoading(false);
        }
    };

    const sendVerificationOtp = async () => {
        setSendingOtp(true);
        try {
            const res = await axiosServices.post('/auth/verifyAccountByOtp', {
                token: docToken
            });
            if (res.data.status) {
                setOtpSend(true);
                setResendOtpTimer(RESEND_OTP_DELAY);
                const resendOtpCountdown = setInterval(() => {
                    setResendOtpTimer((prev) => {
                        if (prev === 0) {
                            clearInterval(resendOtpCountdown);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error.message || `Failed to send otp`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
        } finally {
            setSendingOtp(false);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleOpenOtpModal = () => {
        setOpenOtpModal(true);
        if (!otpSent) {
            sendVerificationOtp();
        }
    };

    const handleCloseOtpModal = () => {
        setOpenOtpModal(false);
    };

    // For submitting the signed document
    const handleSend = async (otp) => {
        setLoading(true);

        try {
            if (!signatureUrl) throw new Error('Please provide your signature!');
            const signature = await fetch(signatureUrl);
            const blob = await signature.blob();
            const formdata = new FormData();
            formdata.append('file', blob);
            formdata.append('token', docToken);
            formdata.append('code', otp);
            const res = await axiosServices.post('/auth/signdoc', formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.status === 201) {
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
                setDocSent(true);
            } else {
                dispatch(
                    openSnackbar({
                        open: true,
                        message: res?.data?.htmlContent?.message || `Failed to submit the document!`,
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        },
                        close: true
                    })
                );
            }
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: error?.message || `Failed to submit the document!`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            console.log(error);
        }
        setLoading(false);
        return null;
    };

    useEffect(() => {
        verifyDocSignToken();
    }, []);

    return (
        <Page title="Digital Signature">
            <MainCard
                title={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h3">Digital Signature</Typography>

                        {!docSent && (
                            <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={2}>
                                <Button variant="outlined" onClick={handleOpenModal}>
                                    Sign
                                </Button>

                                <LoadingButton
                                    variant="contained"
                                    onClick={handleOpenOtpModal}
                                    loading={loading}
                                    disabled={!signatureUrl} // Disable until the document is signed
                                >
                                    Submit
                                </LoadingButton>
                            </Stack>
                        )}
                    </Stack>
                }
            >
                {docSent ? (
                    <>
                        <EmptyContent
                            img={success}
                            title="Document Submitted Successfully!"
                            description="Please check your provided email for a copy of the signed document!"
                        />
                    </>
                ) : (
                    <>
                        <Box sx={{ overflowX: 'scroll' }}>
                            <Box sx={{ width: LETTER_WIDTH, mx: 'auto' }}>
                                {loading ? (
                                    <CircularProgress
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            border: '1px solid #efefef',
                                            borderRadius: 0.5,
                                            minHeight: LETTER_WIDTH * 1.41
                                        }}
                                    >
                                        <Box sx={{ m: '10px' }}>
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                                {signatureUrl
                                                    ? htmlContent.replaceAll(
                                                          '{{sign}}',
                                                          `<img style='max-width: 120px; width:100%; aspect-ratio: 120/52; display: inline; object-fit:contain; object-position:bottom;' src=${signatureUrl} alt='' />`
                                                      )
                                                    : htmlContent}
                                            </ReactMarkdown>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </MainCard>
            <Modal open={openModal} onClose={handleCloseModal}>
                <SignaturePad handleCloseModal={handleCloseModal} signatureUrl={signatureUrl} setSignatureUrl={setSignatureUrl} />
            </Modal>
            <Dialog open={openOtpModal} onClose={handleCloseOtpModal}>
                <VerifyDocumentOtp
                    otpSent={otpSent}
                    resendOtpTimer={resendOtpTimer}
                    handleSend={handleSend}
                    handleCloseOtpModal={handleCloseOtpModal}
                    sendVerificationOtp={sendVerificationOtp}
                    sendingOtp={sendingOtp}
                />
            </Dialog>
        </Page>
    );
}

export default DigitalSignature;
