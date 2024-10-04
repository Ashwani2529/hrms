import React, { useEffect, useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Container,
    List,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Tabs,
    Tab,
    Grid,
    Divider
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

import CompanyDetailsHistory from './CompanyDetailsHistory';
import CompanyDetailsForm from './CompanyDetailsForm';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            sx={{ width: '100%' }}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3, width: '100%' }}>{children}</Box>}
        </Box>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function CompanyDetails() {
    const [tab, setTab] = useState(0);

    const handleTabChange = (_, newVal) => {
        setTab(newVal);
    };

    return (
        <Card>
            <CardContent>
                <Tabs value={tab} onChange={handleTabChange} aria-label="tabs">
                    <Tab label="Company Details" {...a11yProps(0)} />
                    <Tab label="Company Details History" {...a11yProps(1)} />
                </Tabs>
                <CustomTabPanel value={tab} index={0}>
                    <Container>
                        <CompanyDetailsForm />
                    </Container>
                </CustomTabPanel>
                <CustomTabPanel sx={{ width: '100%' }} value={tab} index={1}>
                    <CompanyDetailsHistory />
                </CustomTabPanel>
            </CardContent>
        </Card>
    );
}

export default CompanyDetails;
