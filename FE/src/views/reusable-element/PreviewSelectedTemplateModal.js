/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    IconButton,
    Modal,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { useSelector } from 'react-redux';
import { openPreviewtemplateModal, closePreviewtemplateModal } from 'store/slices/previewSelectedTemplate';
import { dispatch } from 'store';

import { LETTER_WIDTH } from 'store/constant';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import rehypeRaw from 'rehype-raw';
import MainCard from 'ui-component/cards/MainCard';
import axiosServices from 'utils/axios';
import { Close } from '@mui/icons-material';

function PreviewSelectedTemplateModal() {
    const theme = useTheme();
    const { open, template_id } = useSelector((state) => state?.previewTemplateModal);
    const [loading, setLoading] = useState(true);
    const [htmlContent, setHtmlContent] = useState('');

    const handleClose = () => {
        dispatch(closePreviewtemplateModal());
    };

    const fetchTemplateContent = async () => {
        setLoading(true);
        try {
            const res = await axiosServices.get(`/template/${template_id}`);
            setHtmlContent(res.data.template_content_html);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplateContent();
    }, [template_id]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    background: theme.palette.background.paper,
                    width: LETTER_WIDTH + 80,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    p: 4,
                    borderRadius: 2
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h3">Template Preview</Typography>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ height: '75vh', position: 'relative', overflowY: 'scroll' }}>
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
                                width: LETTER_WIDTH,
                                minHeight: LETTER_WIDTH * 1.41
                            }}
                        >
                            <Box sx={{ m: '10px' }}>
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{htmlContent}</ReactMarkdown>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}

export default PreviewSelectedTemplateModal;
