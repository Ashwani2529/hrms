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
import { format } from 'date-fns';

function createData(name, colon, data) {
  return { name, colon, data };
}

function BonusDetails({payroll}) {

    const bonus = payroll?.bonus[0];
    const rows = [
        createData('Bonus Amount', ':', bonus?.bonus_amount),
        createData('Payment Currency', ':', bonus?.currency_type),
        createData('Bonus type', ':', bonus?.bonus_type),
        createData('Bonus date', ':', bonus?.bonus_date && format(new Date(bonus?.bonus_date), 'd MMM yyyy')),
      ];
    
    return (
        <Grid item xs={12} >
            <SubCard
                title="Bonus Details"
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

            </SubCard>
        </Grid>

    )
}

export default BonusDetails