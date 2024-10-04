/* eslint-disable */
import React, { useState } from 'react';
import { Grid, TextField, FormHelperText } from '@mui/material';
// assets
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DocumentsDetail = ({ values, setFieldValue, touched, errors, handleDocumentUpload, user }) => {
    //Loading state for files==============
    const [aadhar, setMatric] = React.useState(false);
    const [pan, setInter] = React.useState(false);
    const [graduation, setGraduation] = React.useState(false);
    const [masters, setMasters] = React.useState(false);
    const [cheque, setCheque] = useState(false);
    const [govermentId, setGovermentId] = React.useState(false);
    //=======================================

    const giveNameOfFile = (key) => {
        const finalName = key?.split('_');
        if (finalName && finalName.length > 20) {
            return finalName[0].slice(0, 20) + '...';
        } else {
            return finalName[0] || null;
        }
    };

    const getKeyFromPresignedUrl = (presignedUrl) => {
        try {
            const url = new URL(presignedUrl);
            const key = decodeURIComponent(url.pathname.substring(1));
            const name = giveNameOfFile(key);
            return name;
        } catch (error) {
            return null;
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Aadhar Card"
                    name="user_documents.aadhar"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.aadhar) ||
                        getKeyFromPresignedUrl(user?.user_documents?.aadhar) ||
                        'Select a file'
                    }
                    disabled={aadhar}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-aadhar"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setMatric(true);
                                        const url = await handleDocumentUpload(event, 'aadhar');
                                        setFieldValue('user_documents.aadhar', url);
                                        setMatric(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-aadhar"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {aadhar ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            {/* {user?.user_documents?.aadhar &&
                                                <VisibilityIcon 
                                                    sx={{cursor:'pointer', marginRight:'15px'}}
                                                    onClick = {()=>{  
                                                        window.open(user?.user_documents?.aadhar, '_blank')
                                                    }}
                                                />
                                            } */}
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
                {touched?.user_documents?.aadhar && errors?.user_documents?.aadhar && (
                    <FormHelperText error>{errors?.user_documents?.aadhar}</FormHelperText>
                )}
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="PAN Card"
                    name="user_documents.pan"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.pan) || getKeyFromPresignedUrl(user?.user_documents?.pan) || 'Select a file'
                    }
                    disabled={pan}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-pan"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setInter(true);
                                        const url = await handleDocumentUpload(event, 'pan');
                                        setFieldValue('user_documents.pan', url);
                                        setInter(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-pan"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {pan ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
                {touched?.user_documents?.pan && errors?.user_documents?.pan && (
                    <FormHelperText error>{errors?.user_documents?.pan}</FormHelperText>
                )}
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label="Graduation marsheet"
                    name="graduation"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.graduation) ||
                        getKeyFromPresignedUrl(user?.user_documents?.graduation) ||
                        'Select a file'
                    }
                    disabled={graduation}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-graduation"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setGraduation(true);
                                        const url = await handleDocumentUpload(event, 'graduation');
                                        setFieldValue('user_documents.graduation', url, true);
                                        setGraduation(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-graduation"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {graduation ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label="Maters marsheets"
                    name="masters"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.masters) ||
                        getKeyFromPresignedUrl(user?.user_documents?.masters) ||
                        'Select a file'
                    }
                    disabled={masters}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-masters"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setMasters(true);
                                        const url = await handleDocumentUpload(event, 'masters');
                                        setFieldValue('user_documents.masters', url, true);
                                        setMasters(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-masters"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {masters ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Bank Cheque"
                    name="cheque"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.cheque) || giveNameOfFile(values?.user_documents?.cheque) || 'Select a file'
                    }
                    disabled={govermentId}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-cheque"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setCheque(true);
                                        const url = await handleDocumentUpload(event, 'cheque');
                                        setFieldValue('user_documents.cheque', url, true);
                                        setCheque(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-cheque"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {cheque ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
                {touched?.user_documents?.cheque && errors?.user_documents?.cheque && (
                    <FormHelperText error>{errors?.user_documents?.cheque}</FormHelperText>
                )}
            </Grid>
            {/* <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    label="Goverment Id"
                    name="goverment_id"
                    style={{ marginTop: 16 }}
                    value={
                        giveNameOfFile(values?.user_documents?.goverment_id) ||
                        giveNameOfFile(values?.user_documents?.goverment_id) ||
                        'Select a file'
                    }
                    disabled={govermentId}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <>
                                <input
                                    type="file"
                                    id="file-input-goverment"
                                    accept=".pdf"
                                    style={{ display: 'none' }}
                                    onChange={async (event) => {
                                        setGovermentId(true);
                                        const url = await handleDocumentUpload(event, 'goverment_id');
                                        setFieldValue('user_documents.goverment_id', url, true);
                                        setGovermentId(false);
                                    }}
                                />
                                <label
                                    htmlFor="file-input-goverment"
                                    style={{
                                        marginRight: 16,
                                        position: 'absolute',
                                        top: '14px',
                                        right: '0px'
                                    }}
                                >
                                    {govermentId ? (
                                        <CircularProgress style={{ width: 20, height: 20 }} />
                                    ) : (
                                        <>
                                            <CloudUploadIcon style={{ cursor: 'pointer' }} />
                                        </>
                                    )}
                                </label>
                            </>
                        )
                    }}
                />
                {touched?.user_documents?.goverment_id && errors?.user_documents?.goverment_id && (
                    <FormHelperText error>{errors?.user_documents?.goverment_id}</FormHelperText>
                )}
            </Grid> */}
        </Grid>
    );
};

export default DocumentsDetail;
