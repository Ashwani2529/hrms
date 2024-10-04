/* eslint-disable */

import React, { useState } from 'react';
import {Box, ButtonBase, IconButton, Menu, MenuItem} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function DuplicateShift({handleEventDuplicate}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        console.log("here")
        setAnchorEl(event?.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{mr:2}}>
            <ButtonBase sx={{ borderRadius: '12px' }} onClick={handleClick} aria-controls="menu-comment" aria-haspopup="true">
                <IconButton component="span" size="small" disableRipple aria-label="more options">
                    <MoreHorizIcon 
                        sx={{backgroundColor:'white', borderRadius:'20px', fontSize:'30px'}}
                    />
                </IconButton>
            </ButtonBase>
            <Menu
                id="menu-comment"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                variant="selectedMenu"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
            
                <MenuItem
                    onClick={() => {
                        handleEventDuplicate()
                        // setOpen(true);
                    }}
                >
                    Duplicate
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default DuplicateShift;
