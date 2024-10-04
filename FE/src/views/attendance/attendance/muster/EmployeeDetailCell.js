import { Stack, Avatar, Typography, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import Info from '@mui/icons-material/Info';
import EmployeeLeaveDetailStatus from './EmployeeLeaveDetailStatus';

export default function EmployeeDetailCell({ empdata = {} }) {
    return (
        <Stack direction="row" gap={1} alignItems="center">
            <Avatar
                src={empdata?.profile_photo}
                alt={empdata?.user_name}
                variant="rounded"
                sx={{
                    height: 30,
                    width: 30
                }}
            />
            <Typography>{empdata?.user_name}</Typography>
            <Tooltip placement="right" title={<EmployeeLeaveDetailStatus employeeId={empdata?.user_id} />}>
                <Info />
            </Tooltip>
        </Stack>
    );
}

EmployeeDetailCell.propTypes = {
    empdata: PropTypes.object
};
