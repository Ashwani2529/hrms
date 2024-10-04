/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';


const name = 'Client';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers,
});

export const ClientActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        clients: [],
        loading: false,
        totalData: 0,
        singleClient: [],
    };
}

function createExtraActions() {
    return {
        fetchClients: fetchClients(),
        addClient: addClient(),
        deleteClient: deleteClient(),
        updateClient: updateClient(),
    };
}

// create api
function fetchClients() {
    return createAsyncThunk(`${name}/fetchClients`, async ({ page, limit, search }) => {
        try {
            const response = await axios.get(`/client?page=${page}&limit=${limit}&search=${search}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function addClient() {
    return createAsyncThunk(`${name}/addClient`, async (client) => {
        try {
            const response = await axios.post(`/client`, client);
            return response;
        } catch (err) {
            // console.log(err.errors);
            return err;
        }
    });
}

function updateClient() {
    return createAsyncThunk(`${name}/updateClient`, async ({ data, id }) => {
        try {
            const response = await axios.put(`/client/${id}`, data);
            return response;
        } catch (err) {
            // console.log(err.errors);
            return err;
        }
    });
}

function deleteClient() {
    return createAsyncThunk(`${name}/deleteClient`, async (user) => {
        try {
            const response = await axios.post(`/client/delete`, user);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchClients(),
        // ...fetchEmployeeById(),
        ...deleteClient()
    };

    function fetchClients() {
        const { pending, fulfilled, rejected } = extraActions.fetchClients;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.clients = action.payload;
                state.totalData = action.payload?.totalUsers;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }

    // function fetchEmployeeById() {
    //     const { pending, fulfilled, rejected } = extraActions.fetchEmployeeById;
    //     return {
    //         [pending]: (state) => {
    //             state.loading = true;
    //             state.singleEmployee = [];
    //         },
    //         [fulfilled]: (state, action) => {
    //             state.loading = false;
    //             state.singleEmployee = action.payload;
    //         },
    //         [rejected]: (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //             state.singleEmployee = [];
    //         },
    //     };
    // }

    function deleteClient() {
        const { pending, fulfilled, rejected } = extraActions.deleteClient;
        return {
            [pending]: (state) => {
            },
            [fulfilled]: (state, action) => {
                const ids = action?.payload?.data?.deletedClients?.clients;
                state.clients = state?.clients?.filter((client) => !ids?.includes(client?.client_id));
                state.totalData = state.totalData - ids?.length;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error;
            },
        };
    }
}
