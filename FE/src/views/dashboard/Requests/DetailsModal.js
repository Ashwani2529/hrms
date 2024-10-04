/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { Button, CardContent, CardActions, Divider, Grid, IconButton, Modal, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// assets
import CloseIcon from '@mui/icons-material/Close';

// generate random
function rand() {
    return Math.round(Math.random() * 20) - 10;
}

// modal position
function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`
    };
}

const Body = React.forwardRef(({ modalStyle, handleClose, selectedRow }, ref) => (
    <div ref={ref} tabIndex={-1}>
        <MainCard
            style={modalStyle}
            sx={{
                position: 'absolute',
                width: { xs: 280, lg: 450 },
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}
            title="Request Details"
            content={false}
            secondary={
                <IconButton onClick={handleClose} size="large">
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        >
            <CardContent>
                <Typography variant="h4">{selectedRow?.request_title || 'No Data Available'}</Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    {selectedRow?.request_description || ''}
                </Typography>
                <Typography variant="body2" sx={{ mt: 4 }}>
                    Checkin - {new Date(selectedRow?.checkin_time).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Checkout - {new Date(selectedRow?.checkout_time).toLocaleString()}
                </Typography>
            </CardContent>
            <CardActions>
                <DetailsModal />
            </CardActions>
        </MainCard>
    </div>
));

Body.propTypes = {
    modalStyle: PropTypes.object,
    handleClose: PropTypes.func
};

// ==============================|| SIMPLE MODAL ||============================== //

export default function DetailsModal({ open, setOpen, selectedRow }) {
    // getModalStyle is not a pure function, we roll the style only on the first render
    const [modalStyle] = React.useState(getModalStyle);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Grid container justifyContent="flex-end">
            <Modal open={open} onClose={handleClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
                <Body modalStyle={modalStyle} handleClose={handleClose} selectedRow={selectedRow} />
            </Modal>
        </Grid>
    );
}
