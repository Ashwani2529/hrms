/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Requests';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const RequestActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        loading: false,
        requests: [],
        totalData:0,
        error: null
    };
}

function createExtraActions() {
    return {
        fetchAllRequests: fetchAllRequests(),
        fetchRequestsDetails: fetchRequestsDetails(),
        createRequests: createRequests(),
        editRequests: editRequests(),
        deleteRequests: deleteRequests()
    };
}

function fetchAllRequests() {
    return createAsyncThunk(`${name}/fetchAllRequests`, async ({ page, limit, search, type='', startDate = '', endDate = '' }) => {
        try {
            const response = await axios.get(
                `/requests/all?page=${page}&limit=${limit}&search=${search}&type=${type}&startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchRequestsDetails() {
    return createAsyncThunk(`${name}/fetchRequestsDetails`, async (id) => {
        try {
            const response = await axios.get(`/requests/${id}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function createRequests() {
    return createAsyncThunk(`${name}/createRequests`, async (data) => {
        try {
            const response = await axios.post(`/requests`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function editRequests() {
    return createAsyncThunk(`${name}/editRequests`, async (data) => {
        try {
            const response = await axios.put(`/requests/${data?.id}`, data?.values);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function deleteRequests() {
    return createAsyncThunk(`${name}/deleteRequests`, async (data) => {
        try {
            const response = await axios.post(`/requests/delete`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchAllRequestsReducer(),
        ...editRequestsReducer(),
        ...deleteRequestsReducer(),
        ...fetchRequestReducer()
    };

    function fetchAllRequestsReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllRequests;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.requests = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.requests = action.payload?.requests;
                state.totalData = action?.payload?.totalRequests;
            },
            [rejected]: (state, action) => {
                state.requests = [];
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchRequestReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchRequestsDetails;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.requests = [];
            },
            [fulfilled]: (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.requests = [];
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function editRequestsReducer() {
        const { pending, fulfilled, rejected } = extraActions.editRequests;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.requests = state.requests.map((ele) => (ele?.request_id === action.payload?.data?.request_id ? action?.payload?.data : ele));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function deleteRequestsReducer() {
        const { pending, fulfilled, rejected } = extraActions.deleteRequests;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.requests = state.requests?.filter((remark) => !action.payload?.data?.deletedRemarks?.includes(remark?.remark_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
