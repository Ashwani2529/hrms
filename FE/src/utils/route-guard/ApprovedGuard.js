/* eslint-disable */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
const ApprovedGuard = ({ children }) => {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/', { replace: true });
        }
        else if (user?.status !== 'Active') {

            if (!user?.user_documents || !user?.user_address) {
                navigate('/user/details', { replace: true });
            }
            else {
                navigate('/user/account-profile', { replace: true });
            }
        }
    }, [isLoggedIn, navigate]);

    return children;
};

ApprovedGuard.propTypes = {
    children: PropTypes.node
};

export default ApprovedGuard;
