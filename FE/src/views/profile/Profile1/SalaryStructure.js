/* eslint-disable */

import React from 'react'
import {
    Divider,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
  } from '@mui/material';

import SubCard from 'ui-component/cards/SubCard';

function createData(name, colon, data) {
  return { name, colon, data };
}

function SalaryStructure({payroll}) {
    const rows = [
        createData('Base Salary Amount', ':', payroll?.salary?.base_salary_amount),
        createData('Pay Interval', ':', payroll?.salary?.base_salary_type),
    
        createData('Payment Currency', ':', payroll?.salary?.currency_type),
        createData('Paid Leave Encashment', ':', payroll?.salary?.paid_leave_encashment)
      ];
    
    const earningRows = payroll?.salary?.earnings?.map((row)=>{
        const obj = {
          name: row?.name,
          colon: ':',
          type: row?.type,
          data: row?.amount
        }
        return obj
    });

    const incentiveRows = payroll?.salary?.incentive?.map((row)=>{
        const obj = {
          name: row?.name,
          colon: ':',
          type: row?.type,
          data: row?.amount
        }
        return obj
    });

    const deductionRows = payroll?.salary?.deduction?.map((row)=>{
        const obj = {
          name: row?.name,
          colon: ':',
          type: row?.type,
          data: row?.amount
        }
        return obj
    });

    return (
        <Grid item xs={12} >
            <SubCard
                title="Salary Structure"
                sx={{
                    '& .MuiTypography-root':{
                        fontWeight: 700
                    }
                }}
            >
                <Grid container spacing={2}>
                    <Divider sx={{ pt: 1 }} />
                    <Grid item xs={12}>
                        <TableContainer>
                            <Table
                                sx={{
                                    '& td': {
                                        borderBottom: 'none'
                                    }
                                }}
                                size="small"
                            >
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row?.name}>
                                            <TableCell variant="head">{row?.name}</TableCell>
                                            <TableCell>{row?.colon}</TableCell>
                                            <TableCell>{row?.data}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ mt: 2, mb: 2 }} />
                </Grid>

                <Grid container spacing={2}>
                    <Grid item>
                        <Typography variant="subtitle1">Earnings</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table
                                sx={{
                                    '& td': {
                                        borderBottom: 'none'
                                    }
                                }}
                                size="small"
                            >
                                <TableBody>
                                    {earningRows?.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell variant="head" sx={{width:'61%'}}>{row?.name}</TableCell>
                                            <TableCell> : </TableCell>
                                            <TableCell>
                                                {
                                                    row?.type === 'NORMAL' ?
                                                        `${payroll?.salary?.currency_type} ${row?.data}`
                                                        :
                                                        `${row?.data} %`
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ mt: 2, mb: 2 }} />
                </Grid>

                <Grid container spacing={2}>
                    <Grid item>
                        <Typography variant="subtitle1">Incentive</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table
                                sx={{
                                    '& td': {
                                        borderBottom: 'none'
                                    }
                                }}
                                size="small"
                            >
                                <TableBody>
                                    {incentiveRows?.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell variant="head" sx={{width:'61%'}}>{row?.name}</TableCell>
                                            <TableCell> : </TableCell>
                                            <TableCell>
                                                {
                                                    row?.type === 'NORMAL' ?
                                                        `${payroll?.salary?.currency_type} ${row?.data}`
                                                        :
                                                        `${row?.data} %`
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ mt: 2, mb: 2 }} />
                </Grid>

                <Grid container spacing={2}>
                    <Grid item>
                        <Typography variant="subtitle1">Deduction</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table
                                sx={{
                                    '& td': {
                                        borderBottom: 'none'
                                    }
                                }}
                                size="small"
                            >
                                <TableBody>
                                    {deductionRows?.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell variant="head" sx={{width:'61%'}}>{row?.name}</TableCell>
                                            <TableCell> : </TableCell>
                                            <TableCell>
                                                {
                                                    row?.type === 'NORMAL' ?
                                                        `${payroll?.salary?.currency_type} ${row?.data}`
                                                        :
                                                        `${row?.data} %`
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

            </SubCard>
        </Grid>

    )
}

export default SalaryStructure