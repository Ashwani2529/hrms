/* eslint-disable */

import React from 'react'
import {
  Grid,
} from '@mui/material';


import { gridSpacing } from 'store/constant';
import SalaryStructure from './SalaryStructure';
import BonusDetails from './BonusDetails';

function createData(name, colon, data) {
  return { name, colon, data };
}

function SalaryDetails({ payroll }) {

  return (
    <Grid item lg={8} xs={12} container spacing={gridSpacing}>

        <SalaryStructure payroll={payroll}/>
        <BonusDetails payroll={payroll}/>

    </Grid>

  )
}

export default SalaryDetails