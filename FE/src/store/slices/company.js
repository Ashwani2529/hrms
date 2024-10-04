/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';
import axios from 'utils/axios';
import { parseUrlWithFilters } from 'utils/parseUrlWithFilters';

const name = 'Company';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const CompanyActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        companyDetails: {},
        loading: false,
        error: null,
        companyHistory: []
    };
}

function createExtraActions() {
    return {
        fetchCompanyData: fetchCompanyData(),
        updateCompanyData: updateCompanyData(),
        fetchCompanyHistory: fetchCompanyHistory()
    };
}

function fetchCompanyData() {
    return createAsyncThunk(`${name}/detchCompanyData`, async (id) => {
        try {
            const response = await axios.get(`/company/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchCompanyHistory() {
    return createAsyncThunk(`${name}/fetchCompanyHistory`, async (id) => {
        try {
            const response = await axios.get(`/company/history/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function updateCompanyData() {
    return createAsyncThunk(`${name}/updateCompanyData`, async ({ id, values }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/company/${id}`, values);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchCompnayDataReducer(),
        ...fetchCompanyHistoryData(),
        ...updateCompanyDataReducer()
    };

    function fetchCompnayDataReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchCompanyData;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.companyDetails = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.companyDetails = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.companyDetails = [];
            }
        };
    }

    function updateCompanyDataReducer() {
        const { pending, fulfilled, rejected } = extraActions.updateCompanyData;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchCompanyHistoryData() {
        const { pending, fulfilled, rejected } = extraActions.fetchCompanyHistory;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.companyHistory = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
