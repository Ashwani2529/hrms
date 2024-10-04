import React, { useState } from 'react';
import { TextField } from '@mui/material';

function IncentiveField({ row, handleIncentiveSubmit }) {
    const [incentive, setIncentive] = useState(
        Array.isArray(row?.salary?.incentive) && row?.salary?.incentive[0] ? row?.salary?.incentive[0]?.amount : ''
    );
    return (
        <TextField
            variant="outlined"
            size="small"
            type="number"
            name="incentives"
            value={incentive}
            onChange={(e) => {
                setIncentive(e.target.value);
            }}
            onBlur={(e) => {
                handleIncentiveSubmit(row, incentive);
            }}
            label="Incentives"
        />
    );
}

export default IncentiveField;
