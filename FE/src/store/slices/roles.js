/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'roles';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const RolesActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        roles: [],
        loading: false
    };
}

function createExtraActions() {
    return {
        fetchRoles: fetchRoles()
    };
}

// create api
function fetchRoles() {
    return createAsyncThunk(`${name}/fetchRoles`, async () => {
        try {
            const response = await axios.get(`/role`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchRoles()
    };

    function fetchRoles() {
        const { pending, fulfilled, rejected } = extraActions.fetchRoles;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.roles = [];
            }
        };
    }
}
