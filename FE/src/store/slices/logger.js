/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Logger';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const LoggerActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        logger: [],
        // salarySlips: [],
        loading: false,
        totalData: 0
        // singlePayroll: [],
    };
}

function createExtraActions() {
    return {
        fetchLogs: fetchLogs()
    };
}

// create api
function fetchLogs() {
    return createAsyncThunk(`${name}/fetchLogs`, async ({ page, limit, search, status, startDate, endDate }) => {
        let url = `/logger?page=${page}&limit=${limit}`;
        if(search !== '') url += `&search=${search}`;
        if(status !== '')  url += `&logType=${status}`;
        if(startDate !== '')  url += `&startDate=${startDate}`;
        if(endDate !== '')  url += `&endDate=${endDate}`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchLogs()
    };

    function fetchLogs() {
        const { pending, fulfilled, rejected } = extraActions.fetchLogs;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.logger = action.payload?.Logs;
                state.totalData = action.payload?.totalLogs;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
