/* eslint-disable */
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios';
import { ro } from 'date-fns/locale';

const chance = new Chance();

// constant
const initialState = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};

const verifyToken = (serviceToken) => {
    if (!serviceToken) {
        return false;
    }
    const decoded = jwtDecode(serviceToken);
    /**
     * Property 'exp' does not exist on type '<T = unknown>(token, options?: JwtDecodeOptions | undefined) => T'.
     */
    return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
    if (serviceToken) {
        localStorage.setItem('serviceToken', serviceToken);
        axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
    } else {
        localStorage.removeItem('serviceToken');
        delete axios.defaults.headers.common.Authorization;
    }
};

// Settign role of the user
const setRole = (p_flags) => {
    const roles = new Set(p_flags);
    if (roles.has('ADMIN')) {
        return 'ADMIN';
    } else if (roles.has('HR') && !roles.has('ADMIN')) {
        return 'HR';
    } else {
        return 'EMP';
    }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //
const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
    const [state, dispatch] = useReducer(accountReducer, initialState);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                const serviceToken = window.localStorage.getItem('serviceToken');
                if (serviceToken && verifyToken(serviceToken)) {
                    setSession(serviceToken);

                    const decoded = jwtDecode(serviceToken);

                    //=========Setting role of the user=================
                    const role = setRole(decoded?.p_flags);
                    //==================================================

                    //=========Getting single user from the id==========
                    const response = await axios.get(`/user/${decoded?.userId}`);
                    //=================================================

                    dispatch({
                        type: LOGIN,
                        payload: {
                            isLoggedIn: true,
                            user: response?.data,
                            p_flags: decoded?.p_flags,
                            role,
                            company_id: decoded?.company_id
                        }
                    });
                } else {
                    dispatch({
                        type: LOGOUT
                    });
                }
            } catch (err) {
                console.error(err);
                dispatch({
                    type: LOGOUT
                });
            }
        };

        init();
    }, []);

    const login = async (email, password) => {
        const response = await axios.post('/auth/login', { email, password });
        const { access_token, user } = response.data;

        const decoded = jwtDecode(access_token);
        //==============setting role==============
        const role = setRole(user?.p_flags);
        //========================================

        setSession(access_token);
        dispatch({
            type: LOGIN,
            payload: {
                isLoggedIn: true,
                user,
                p_flags: user?.p_flags || [],
                role,
                company_id: decoded?.company_id
            }
        });
    };

    const register = async (email, password, firstName, lastName) => {
        // todo: this flow need to be recode as it not verified
        const id = chance.bb_pin();
        const response = await axios.post('/api/account/register', {
            id,
            email,
            password,
            firstName,
            lastName
        });
        let users = response.data;

        if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
            const localUsers = window.localStorage.getItem('users');
            users = [
                ...JSON.parse(localUsers),
                {
                    id,
                    email,
                    password,
                    name: `${firstName} ${lastName}`
                }
            ];
        }

        window.localStorage.setItem('users', JSON.stringify(users));
    };

    const logout = () => {
        setSession(null);
        dispatch({ type: LOGOUT });
        navigate('/');
    };

    const sentOtp = async (email) => {
        const response = await axios.post('/auth/send-password-email', { email });
        return response.data;
    };

    const resetPassword = async (email, password, otp) => {
        const response = await axios.post('/auth/forget-password', { email, password, otp });
        return response.data;
    };

    const createPassword = async (data) => {
        const response = await axios.post('/auth/change-password', data);
        const { access_token, user } = response.data;

        const decoded = jwtDecode(access_token);
        //==============setting role==============
        const role = setRole(user?.p_flags);
        //========================================

        setSession(access_token);
        dispatch({
            type: LOGIN,
            payload: {
                isLoggedIn: true,
                user,
                p_flags: user?.p_flags || [],
                role,
                company_id: decoded?.company_id
            }
        });

        return response.data;
    };

    const updateProfile = () => {};

    if (state.isInitialized !== undefined && !state.isInitialized) {
        return <Loader />;
    }

    return (
        <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile, sentOtp, createPassword }}>
            {children}
        </JWTContext.Provider>
    );
};

JWTProvider.propTypes = {
    children: PropTypes.node
};

export default JWTContext;
