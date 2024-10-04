/* eslint-disable */
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Skeleton, Typography, useMediaQuery, Autocomplete, TextField, Checkbox } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
// assets

import { useEffect, useState } from 'react';
import { dispatch } from 'store';
import { useSelector } from 'react-redux';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { width } from '@mui/system';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ShiftSearch({ employees, clients, shifts, handleChange }) {
    const theme = useTheme();
    const matchDownXs = useMediaQuery(theme.breakpoints.down('sm'));

    // const { getLiveReport } = AnalyticsActions

    // const { loading, liveReport } = useSelector((state) => state.analytics)

    // useEffect(() => {
    //     dispatch(getLiveReport());
    // }, [])

    const blockSX = {
        display: 'flex',
        gap: 3,
        width: '100%',
        maxWidth: '100%',
        p: 2.5,
        borderLeft: '1px solid ',
        borderBottom: '1px solid ',
        borderLeftColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[200],
        borderBottomColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[200]
    };
    const svgClass = {
        // width: '50px',
        // height: '50px',
        color: theme.palette.secondary.main,
        borderRadius: '14px',
        padding: '10px',
        backgroundColor: '#e7e7e7'
    };
    return (
        <MainCard
            content={false}
            sx={{
                width: '100%',
                display: 'flex',
                marginBottom: '20px'
                // '& svg': svgClass
            }}
        >
            <Grid container alignItems="center" spacing={0} width={'70%'}>
                <Grid item xs={12} sm={6} sx={blockSX}>
                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Autocomplete
                            multiple
                            id="checkboxes-tags-demo"
                            limitTags={2}
                            options={employees}
                            disableCloseOnSelect
                            onChange={(e, value) => handleChange(e, value, 'employee')}
                            getOptionLabel={(emp) => emp?.user_name}
                            renderOption={(props, emp, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                                    {emp?.user_name}
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => <TextField {...params} label="Select employees" placeholder="Employees" />}
                        />
                    </Grid>

                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Autocomplete
                            multiple
                            id="checkboxes-tags-demo"
                            limitTags={1}
                            options={clients}
                            disableCloseOnSelect
                            onChange={(e, value) => handleChange(e, value, 'client')}
                            getOptionLabel={(client) => client.client_name}
                            renderOption={(props, client, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                                    {client.client_name}
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => <TextField {...params} label="Select clients" placeholder="Client" />}
                        />
                    </Grid>

                    <Grid container alignItems="center" spacing={1} justifyContent={matchDownXs ? 'space-between' : 'center'}>
                        <Autocomplete
                            multiple
                            id="checkboxes-tags-demo"
                            options={shifts}
                            limitTags={2}
                            disableCloseOnSelect
                            onChange={(e, value) => handleChange(e, value, 'shift')}
                            getOptionLabel={(shift) => shift.shift_name}
                            renderOption={(props, shift, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                                    {shift.shift_name}
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => <TextField {...params} label="Select shift" placeholder="Shift" />}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default ShiftSearch;
