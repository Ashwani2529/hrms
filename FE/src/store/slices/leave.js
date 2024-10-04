/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Leave';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const LeaveActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        leaves: [],
        loading: false,
        totalData: 0,
        singleLeave: [],
        leaveStats: {}
    };
}

function createExtraActions() {
    return {
        fetchLeaves: fetchLeaves(),
        createLeave: createLeave(),
        fetchLeaveById: fetchLeaveById(),
        updateLeave: updateLeave(),
        deleteLeave: deleteLeave(),
        fetchLeaveStats: fetchLeaveStats()
    };
}

// create api
function fetchLeaves() {
    return createAsyncThunk(`${name}/fetchLeaves`, async ({ page, limit, search, startDate = '', endDate = '' }) => {
        try {
            const response = await axios.get(
                `/leave/withinfo?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchLeaveById() {
    return createAsyncThunk(`${name}/fetchLeaveById`, async (id) => {
        try {
            const response = await axios.get(`/leave/${id}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function createLeave() {
    return createAsyncThunk(`${name}/createLeave`, async (data) => {
        try {
            const response = await axios.post(`/leave`, data);
            return response;
          //  console.log(response);
        } catch (err) {
          //  console.log(err);
            return err;
        }
    });
}

function updateLeave() {
    return createAsyncThunk(`${name}/updateLeave`, async (data) => {
        try {
            const { id, values } = data;
            const response = await axios.put(`/leave/${id}`, values);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteLeave() {
    return createAsyncThunk(`${name}/deleteLeave`, async (data) => {
        try {
            const response = await axios.post(`/leave/delete`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function fetchLeaveStats() {
    return createAsyncThunk(`${name}/fetchLeaveStats`, async (uid) => {
        try {
            const response = await axios.get(`/leave/leavesStats/${uid}`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchLeaves(),
        ...fetchLeaveById(),
        ...deleteLeave(),
        ...fetchLeaveStats()
    };

    function fetchLeaves() {
        const { pending, fulfilled, rejected } = extraActions.fetchLeaves;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.leaves = action.payload?.leaves;
                state.totalData = action?.payload?.totalLeaves;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Internal server error';
            }
        };
    }

    function fetchLeaveById() {
        const { pending, fulfilled, rejected } = extraActions.fetchLeaveById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singleLeave = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singleLeave = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singleLeave = [];
            }
        };
    }

    function deleteLeave() {
        const { pending, fulfilled, rejected } = extraActions.deleteLeave;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                const deletedId = action?.payload?.data?.deletedLeaves;
                state.leaves = state?.leaves?.filter((leave) => !deletedId?.includes(leave?.leave_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchLeaveStats() {
        const { pending, fulfilled, rejected } = extraActions.fetchLeaveStats;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.leaveStats = action.payload?.data;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.leaveStats = {};
                state.error = action.error.message;
            }
        };
    }
}
