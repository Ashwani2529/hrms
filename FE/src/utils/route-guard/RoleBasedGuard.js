/* eslint-disable */
import PropTypes from 'prop-types';
import { useEffect } from 'react';

// project imports
import useAuth from 'hooks/useAuth';
import { Typography } from '@mui/material';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
const RoleBasedGuard = ({ children, message, restrictedRoles = [] }) => {
    const { role } = useAuth();

    //MORE ROLES WILL BE ADDED
    return !restrictedRoles.includes(role)
        ? children
        : message && (
              <>
                  <Typography>{typeof message === 'string' ? message : '401 - Not Authorized'}</Typography>
              </>
          );
};

RoleBasedGuard.propTypes = {
    children: PropTypes.node
};

export default RoleBasedGuard;
