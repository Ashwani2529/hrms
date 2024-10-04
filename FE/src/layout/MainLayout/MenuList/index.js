/* eslint-disable */

import { memo, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Typography, useMediaQuery } from '@mui/material';

// project imports
import menuItem from 'menu-items';
import NavGroup from './NavGroup';
import useConfig from 'hooks/useConfig';
import { Menu } from 'menu-items/widget';

import LAYOUT_CONST from 'constant';
import { HORIZONTAL_MAX_ITEM } from 'config';
import useAuth from 'hooks/useAuth';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
    const { role, user } = useAuth();

    const [menuItems, setMenuItems] = useState()
    const theme = useTheme();
    const { layout } = useConfig();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

    // const getMenu = Menu();
    const filteredMenuItems = menuItem.items.map((item) => {
        
        if (user?.status !== 'Active') {
            // If user status is not 'Active', disabled: true for each child
            return {
                ...item,
                children: item.children.map((child) => ({
                    ...child,
                    disabled: true,
                })),
            };
        }
        else if (role === 'ADMIN' || role === 'HR') {
            // If the role is 'ADMIN' or 'HR', include the 'clients' item
            return item;
        } else {
            // If the role is not 'ADMIN' or 'HR', remove the 'clients' item
            return {
                ...item,
                children: item.children.filter((child) => child.id !== 'clients'),
            };
        }
        return item;
    });

    useEffect(() => {

        const object = {
            items: filteredMenuItems
        }

        setMenuItems(object)
    }, []);

    // last menu-item to show in horizontal menu bar
    const lastItem = layout === LAYOUT_CONST.HORIZONTAL_LAYOUT && !matchDownMd ? HORIZONTAL_MAX_ITEM : null;

    let lastItemIndex = menuItems?.items?.length - 1;
    let remItems = [];
    let lastItemId;

    if (lastItem && lastItem < menuItems?.items.length) {
        lastItemId = menuItems?.items[lastItem - 1].id;
        lastItemIndex = lastItem - 1;
        remItems = menuItems?.items.slice(lastItem - 1, menuItems?.items.length).map((item) => ({
            title: item.title,
            elements: item.children
        }));
    }

    const navItems = menuItems?.items.slice(0, lastItemIndex + 1).map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} lastItem={lastItem} remItems={remItems} lastItemId={lastItemId} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });


    console.log(navItems)

    return <>{navItems}</>;
};

export default memo(MenuList);
