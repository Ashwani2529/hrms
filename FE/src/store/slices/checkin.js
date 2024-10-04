/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';


const name = 'CheckIn';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers,
});

export const CheckInActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        checkIn: [],
        loading: false,
        totalData: 0,
        singleCheckIn: [],
    };
}

function createExtraActions() {
    return {
        fetchCheckIn: fetchCheckIn(),
        createCheckIn: createCheckIn(),
        fetchCheckInById: fetchCheckInById(),
        deleteCheckIn: deleteCheckIn(),
        updateCheckIn: updateCheckIn()
    };
}

// create api
function fetchCheckIn() {
    return createAsyncThunk(`${name}/fetchCheckIn`, async ({ page, limit, search }) => {
        try {
            const response = await axios.get(`/checkin/withinfo?page=${page}&limit=${limit}&search=${search}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchCheckInById() {
    return createAsyncThunk(`${name}/fetchCheckInById`, async (id) => {
        try {
            const response = await axios.get(`/checkin/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createCheckIn() {
    return createAsyncThunk(`${name}/createCheckIn`, async (user) => {
        try {
            const response = await axios.post(`/checkin`, user);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteCheckIn() {
    return createAsyncThunk(`${name}/deleteCheckIn`, async (data) => {
        try {
            const response = await axios.post(`/checkin/delete`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateCheckIn() {
    return createAsyncThunk(`${name}/updateCheckIn`, async (data) => {
        try {
            const { values, id } = data
            const response = await axios.put(`/checkin/${id}`, values);
            return response;
        } catch (err) {
            return err;
        }
    });
}


function createExtraReducers() {
    return {
        ...fetchCheckIn(),
        ...createCheckIn(),
        ...fetchCheckInById(),
        ...deleteCheckIn(),
        ...updateCheckIn()
    };

    function fetchCheckIn() {
        const { pending, fulfilled, rejected } = extraActions.fetchCheckIn;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.checkIn = action.payload?.checkins;
                state.totalData = action.payload?.totalCheckins;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }

    function fetchCheckInById() {
        const { pending, fulfilled, rejected } = extraActions.fetchCheckInById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singleCheckIn = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singleCheckIn = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singleCheckIn = [];
            },
        };
    }

    function deleteCheckIn() {
        const { pending, fulfilled, rejected } = extraActions.deleteCheckIn;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                const deletedId = action?.payload?.data?.deletedCheckins;
                state.checkIn = state?.checkIn?.filter((checkin) => !deletedId?.includes(checkin?.checkin_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }
}
