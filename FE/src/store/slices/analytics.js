/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';


const name = 'Analytics';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers,
});

export const AnalyticsActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        loading: false,
        liveReport: {},
        attendanceReport: {},
        liveEmployees: [],
    };
}

function createExtraActions() {
    return {
        getLiveReport: getLiveReport(),
        getAttendanceAnalytics: getAttendanceAnalytics(),
        getLiveEmployees: getLiveEmployees(),
    };
}

// create api
function getLiveReport() {
    return createAsyncThunk(`${name}/getLiveReport`, async () => {
        try {
            const response = await axios.get(`analytics/live_report`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function getLiveEmployees() {
    return createAsyncThunk(`${name}/getLiveEmployees`, async () => {
        try {
            const response = await axios.get(`analytics/live_employee_info`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function getAttendanceAnalytics() {
    return createAsyncThunk(`${name}/getAttendanceAnalytics`, async ({ startDate, endDate }) => {
        try {
            const response = await axios.get(
                `analytics/getAttendance?startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}
function createExtraReducers() {
    return {
        ...getLiveReport(),
        ...getAttendanceAnalytics(),
        ...getLiveEmployees(),
    };

    function getLiveReport() {
        const { pending, fulfilled, rejected } = extraActions.getLiveReport;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.liveReport = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }

    function getLiveEmployees() {
        const { pending, fulfilled, rejected } = extraActions.getLiveEmployees;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                const activeEmp = action?.payload;
                state.liveEmployees = activeEmp;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }

    function getAttendanceAnalytics() {
        const { pending, fulfilled, rejected } = extraActions.getAttendanceAnalytics;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.attendanceReport = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            },
        };
    }
}
