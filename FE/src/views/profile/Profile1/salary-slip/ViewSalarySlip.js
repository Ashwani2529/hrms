/* eslint-disable */

import React from 'react'
import './assets/pdf.css'
import {
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import useAuth from 'hooks/useAuth';
import SalarySlipHTML from 'views/reusable-element/SalarySlipHTML';

function ViewSalarySlip({ selectedRow, handleModalClose }) {

    const {user} = useAuth()

    return (
        <DialogContent sx={{ overflowY: 'unset', padding: '13px 0px' }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <Typography variant='h3'>Salary Slip</Typography>
                <CloseIcon sx={{ position: 'absolute', right: '20px', cursor: 'pointer' }} onClick={handleModalClose} />
            </DialogTitle>
            <Divider />
            
            <SalarySlipHTML 
                user={user} 
                selectedRow={selectedRow}
            />

        </DialogContent>
    )
}

export default ViewSalarySlip