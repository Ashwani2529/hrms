/* eslint-disable */
import { useEffect, useMemo, useState } from 'react';

import {
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Radio,
    RadioGroup,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    MenuItem,
    InputLabel,
    Select,
    Avatar,
    Box,
    FormHelperText,
    Input,
    Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';

import MainCard from '../MainCard';
import { gridSpacing } from 'store/constant';
import SubCard from 'ui-component/cards/SubCard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RejectionReasonModal from './RejectionReasonPopUp';
import { EmployeeActions } from 'store/slices/employee';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector } from 'store';
import EmployeeAttendanceGraph from '../EmployeeAttendanceGraph';
import { areObjectsEqual } from 'utils/areObjectsEqual';
import { findKeyInObject } from 'utils/findKeyInObjects';

const EmployeeDetails = ({ setSelectedEmployee, selectedEmployee, handleModalClose }) => {
    const theme = useTheme();

    const { verifyEmployeeData, fetchEmployees, fetchEmployeeById } = EmployeeActions;
    //State for Rejection Modal
    const [empDetails, setEmpDetails] = useState();
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);

    const { loading, singleEmployee } = useSelector((state) => state.employee);

    useEffect(() => {
        const id = selectedEmployee?.user_id;
        dispatch(fetchEmployeeById(id));
    }, [selectedEmployee]);

    useEffect(() => {
        setEmpDetails(singleEmployee);
    }, [singleEmployee]);

    const giveNameOfFile = (key) => {
        const finalName = key?.split('_');
        if (finalName && finalName.length > 20) {
            return finalName[0].slice(0, 20) + '...';
        } else {
            return finalName && (finalName[0] || null);
        }
    };

    const handleRejectRequest = () => {
        setOpenRejectDialog(true);
    };

    const handleAcceptRequest = async () => {
        //Send email
        const data = {
            user_id: selectedEmployee?.user_id,
            status: 'APPROVE',
            reject_reason: ''
        };
        setSubmitting(true);
        const res = await dispatch(verifyEmployeeData({ data }));

        if (res?.payload?.status === 200 || res?.payload?.status === 201) {
            dispatch(
                openSnackbar({
                    open: true,
                    message: `Status updated successfully`,
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    },
                    close: true
                })
            );
            setSubmitting(false);
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    message:  findKeyInObject(res?.payload, `message`) ||
                    findKeyInObject(res?.payload, `error`) || `Internal server error.`,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    },
                    close: true
                })
            );
            setSubmitting(false);
        }
        handleModalClose();
        dispatch(fetchEmployees({ page: 1, limit: 25, search: '', status: '', emp_type: '' }));
    };

    const handleViewFile = (url) => {
        try {
            new URL(url);
            window.open(url, '_blank');
          } catch (_) {
            window.open(`https://hrms-employee-images.s3.ap-south-1.amazonaws.com/${url}`, '_blank');
          }
    };

    const currentAddressSameAsPermanent = useMemo(
        () => areObjectsEqual(selectedEmployee?.user_address, selectedEmployee?.user_permanent_address),
        [selectedEmployee?.user_address, selectedEmployee?.user_permanent_address]
    );

    return (
        <DialogContent sx={{ overflowY: 'unset', padding: '13px 0px' }}>
            <DialogTitle>Employee Details</DialogTitle>
            <Divider />

            <RejectionReasonModal
                openRejectDialog={openRejectDialog}
                setOpenRejectDialog={setOpenRejectDialog}
                handleModalClose={handleModalClose}
                selectedEmployee={selectedEmployee}
            />

            <MainCard title="" content={true}>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12} sx={{ paddingTop: '10px' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <label htmlFor="upload-avatar-pic" style={{ display: 'flex' }}>
                                        <IconButton component="span">
                                            <Avatar size="xl" sx={{ height: '70px', width: '70px' }} src={selectedEmployee?.profile_photo}>
                                                {selectedEmployee?.firstname?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </label>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item md={12}>
                            <Box py={1}>
                                <EmployeeAttendanceGraph selectedEmployee={selectedEmployee} />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <SubCard title="Personal Details" darkTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="First Name"
                                            name="firstname"
                                            value={selectedEmployee?.firstname || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Middle name"
                                            name="middlename"
                                            value={selectedEmployee?.middlename || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Last Name"
                                            name="lastname"
                                            value={selectedEmployee?.lastname || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth InputLabelProps={{ shrink: true }} label="Gender">
                                            <InputLabel id="gender-label">Gender</InputLabel>
                                            <Select
                                                id="gender"
                                                name="gender"
                                                value={selectedEmployee?.gender || ''}
                                                InputProps={{
                                                    readOnly: true
                                                }}
                                                label="Gender"
                                            >
                                                <MenuItem value="Male">Male</MenuItem>
                                                <MenuItem value="Female">Female</MenuItem>
                                                <MenuItem value="Other">Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <DatePicker
                                            disableFuture
                                            label="Birthday"
                                            name="date_of_birth"
                                            value={selectedEmployee?.date_of_birth || new Date()}
                                            disabled
                                            renderInput={(params) => (
                                                <TextField {...params} fullWidth InputLabelProps={{ shrink: true }} error={false} />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Personal Email Address"
                                            name="personal_email"
                                            value={selectedEmployee?.personal_email || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Phone Number"
                                            name="phone_number"
                                            value={selectedEmployee?.phone_number}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            type="number"
                                        />
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </Grid>

                        <Grid item xs={12}>
                            <SubCard title="Address details" darkTitle>
                                <Typography variant="h4" mb={2}>
                                    Permanent Address:
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Street"
                                            name="user_permanent_address.street"
                                            value={selectedEmployee?.user_permanent_address?.street || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="City"
                                            name="user_permanent_address.city"
                                            value={selectedEmployee?.user_permanent_address?.city || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="State"
                                            name="user_permanent_address.state"
                                            value={selectedEmployee?.user_permanent_address?.state || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Zip"
                                            name="user_permanent_address.zip"
                                            type="number"
                                            value={selectedEmployee?.user_permanent_address?.zip || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Country"
                                            name="user_permanent_address.country"
                                            value={selectedEmployee?.user_permanent_address?.country || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container xs={12} sx={{ mt: 3 }} alignItems="center" justifyContent="space-between">
                                    <Grid item>
                                        <Typography variant="h4" mb={1}>
                                            Current Address:
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Stack direction="row" alignItems="center">
                                            <Checkbox checked={currentAddressSameAsPermanent} />
                                            <Typography>Same as Permanent</Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Street"
                                            name="user_address.street"
                                            value={selectedEmployee?.user_address?.street || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            disabled={currentAddressSameAsPermanent}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="City"
                                            name="user_address.city"
                                            value={selectedEmployee?.user_address?.city || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            disabled={currentAddressSameAsPermanent}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="State"
                                            name="user_address.state"
                                            value={selectedEmployee?.user_address?.state || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            disabled={currentAddressSameAsPermanent}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Zip"
                                            name="user_address.zip"
                                            type="number"
                                            value={selectedEmployee?.user_address?.zip || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            disabled={currentAddressSameAsPermanent}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Country"
                                            name="user_address.country"
                                            value={selectedEmployee?.user_address?.country || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                            disabled={currentAddressSameAsPermanent}
                                        />
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </Grid>

                        <Grid item xs={12}>
                            <SubCard title="Emergency Contact" darkTitle>
                                {Array.isArray(selectedEmployee?.emergency_contacts_data) &&
                                    selectedEmployee?.emergency_contacts_data?.map((contact, index) => (
                                        <>
                                            {index !== 0 && <Divider sx={{ my: 3 }}>#{index + 1}</Divider>}
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        label="Name"
                                                        name={`selectedEmployee?.emergency_contacts_data[${index}].name`}
                                                        value={contact?.name || ''}
                                                        // InputProps={{
                                                        //     readOnly: true
                                                        // }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        label="Contact No."
                                                        name={`selectedEmployee?.emergency_contacts_data[${index}].phone`}
                                                        value={contact?.phone || ''}
                                                        // InputProps={{
                                                        //     readOnly: true
                                                        // }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        label="Relationship"
                                                        name={`selectedEmployee?.emergency_contacts_data[${index}].relationship`}
                                                        value={contact?.relationship || ''}
                                                        // InputProps={{
                                                        //     readOnly: true
                                                        // }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    ))}
                            </SubCard>
                        </Grid>

                        <Grid item xs={12}>
                            <SubCard title="Bank details" darkTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Bank account no"
                                            name="user_bank.account_number"
                                            value={selectedEmployee?.user_bank?.account_number || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Ifsc code"
                                            name="user_bank.ifsc_code"
                                            value={selectedEmployee?.user_bank?.ifsc_code || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Bank name"
                                            name="user_bank.bank_name"
                                            value={selectedEmployee?.user_bank?.bank_name || ''}
                                            // InputProps={{
                                            //     readOnly: true
                                            // }}
                                        />
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </Grid>

                        <Grid item xs={12}>
                            <SubCard title="Documents" darkTitle>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Aadhar"
                                            name="user_documents.aadhar"
                                            style={{ marginTop: 16 }}
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.aadhar) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-aadhar"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.aadhar && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.aadhar)}
                                                                />
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
                                            label="PAN"
                                            name="user_documents.pan"
                                            style={{ marginTop: 16 }}
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.pan) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-pan"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.pan && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.pan)}
                                                                />
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
                                            label="Graduation marsheet"
                                            name="graduation"
                                            style={{ marginTop: 16 }}
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.graduation) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-graduation"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.graduation && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.graduation)}
                                                                />
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
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.masters) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-masters"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.masters && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.masters)}
                                                                />
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
                                            label="Cheque"
                                            name="cheque"
                                            style={{ marginTop: 16 }}
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.cheque) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-cheque"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.cheque && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.cheque)}
                                                                />
                                                            )}
                                                        </label>
                                                    </>
                                                )
                                            }}
                                        />
                                    </Grid>
                                    {/* <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            label="Goverment Id"
                                            name="goverment_id"
                                            style={{ marginTop: 16 }}
                                            value={giveNameOfFile(selectedEmployee?.user_documents?.goverment_id) || 'No file selected'}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <>
                                                        <label
                                                            htmlFor="file-input-goverment"
                                                            style={{
                                                                marginRight: 16,
                                                                position: 'absolute',
                                                                top: '14px',
                                                                right: '0px'
                                                            }}
                                                        >
                                                            {selectedEmployee?.user_documents?.goverment_id && (
                                                                <VisibilityIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewFile(empDetails?.user_documents?.goverment_id)}
                                                                />
                                                            )}
                                                        </label>
                                                    </>
                                                )
                                            }}
                                        />
                                    </Grid> */}
                                </Grid>
                            </SubCard>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent="end" marginTop={4}>
                        <Grid item>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <LoadingButton type="button" variant="outlined" onClick={handleModalClose}>
                                    Cancel
                                </LoadingButton>
                                {/* {selectedEmployee?.status !== 'Active' && ( */}
                                    <>
                                        <LoadingButton
                                            variant="contained"
                                            sx={{ backgroundColor: '#16a34a' }}
                                            onClick={handleAcceptRequest}
                                            loading={isSubmitting}
                                        >
                                            Accept
                                        </LoadingButton>
                                        <LoadingButton
                                            variant="contained"
                                            sx={{ backgroundColor: '#dc2626' }}
                                            onClick={handleRejectRequest}
                                        >
                                            Reject
                                        </LoadingButton>
                                    </>
                                {/* )} */}
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
            </MainCard>
        </DialogContent>
    );
};

export default EmployeeDetails;
