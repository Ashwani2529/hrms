/* eslint-disable */
// action - state management
import { LOGIN, LOGOUT, REGISTER } from './actions';

// ==============================|| ACCOUNT REDUCER ||============================== //

const initialState = {
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    p_flags: [],
    role: null,
    company_id: null
};

// eslint-disable-next-line
const accountReducer = (state = initialState, action) => {
    switch (action.type) {
        case REGISTER: {
            const { user, p_flags, role, company_id } = action.payload;
            return {
                ...state,
                user,
                p_flags,
                role, 
                company_id
            };
        }
        case LOGIN: {
            const { user, p_flags, role, company_id } = action.payload;
            return {
                ...state,
                isLoggedIn: true,
                isInitialized: true,
                user,
                p_flags,
                role,
                company_id
            };
        }
        case LOGOUT: {
            return {
                ...state,
                isInitialized: true,
                isLoggedIn: false,
                user: null,
                p_flags: [],
                role: null,
                company_id: null
            };
        }
        default: {
            return { ...state };
        }
    }
};

export default accountReducer;
