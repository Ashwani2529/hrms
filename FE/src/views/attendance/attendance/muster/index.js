/* eslint-disable */

import PropTypes from 'prop-types';

import { Grid, Typography, Avatar, Box, Tabs, Tab, Stack, Tooltip, Card, TextField } from '@mui/material';

import { attendanceGraphColors, MusterStatuses } from 'store/constant';

import MusterTable from './MusterTable';
import moment from 'moment';

const MusterRoll = ({ handleOpenCreateDialog, currMonth, handleMonthChange, handleDeleteAttendance }) => {
    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: '12px 8px', my: 4 }}>
                {Object.entries(attendanceGraphColors).map(([name, color], index) => (
                    <Stack
                        direction="row"
                        gap={1}
                        alignItems="center"
                        key={name + color}
                        sx={{
                            padding: '4px 8px'
                        }}
                    >
                        <Box
                            width={10}
                            height={10}
                            sx={{
                                background: color,
                                borderRadius: '50%'
                            }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {name} ({MusterStatuses[name]})
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Card variant="outlined">
                <Stack direction="row" justifyContent="space-between" alignItems="center" px={3} py={2}>
                    <Typography variant="h4">Employee Attendace Muster</Typography>
                    <Box>
                        <TextField size="small" type="month" value={currMonth} onChange={handleMonthChange} />
                    </Box>
                </Stack>
                <MusterTable
                    handleDeleteAttendance={handleDeleteAttendance}
                    handleOpenCreateDialog={handleOpenCreateDialog}
                    currMonth={moment(currMonth)}
                />
            </Card>
        </Box>
    );
};

MusterRoll.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default MusterRoll;
