/* eslint-disable */
import React from "react";

// mui
import { Tabs, Tab, Typography, Divider, Box } from "@mui/material";
import SubCard from "ui-component/cards/SubCard";

const ClientMenu = ({ clients, client, setClient }) => {
    const handleChange = (event, newValue) => {
        setClient(newValue);
    };
    return (
        <SubCard sx={{ height: '100%' }}>
            <Typography variant="h4" textAlign={'center'} mb={3}>Select Client</Typography>
            <Divider />
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={client}
                onChange={handleChange}
                aria-label="Vertical tabs example"
            >
                {clients?.map((client) => {
                    return (
                        <Tab label={client?.client_name} value={client?.client_id} />
                    )
                })}
            </Tabs>
        </SubCard >

    )
}

export default ClientMenu;