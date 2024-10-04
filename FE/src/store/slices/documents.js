/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { parseUrlWithFilters } from 'utils/parseUrlWithFilters';

const name = 'Documents';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const DocumentActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        loading: false,
        documents: [],
        totalDocs: 0,
        error: null
    };
}

function createExtraActions() {
    return {
        fetchDocuments: fetchDocuments(),
        updateDocumentStatus: updateDocumentStatus()
    };
}

function fetchDocuments() {
    return createAsyncThunk(`${name}/fetchDocuments`, async (filters) => {
        try {
            const url = parseUrlWithFilters({ url: '/user-doc', filters: { ...filters, page: filters.page + 1 } });
            const response = await axios.get(url);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function updateDocumentStatus() {
    return createAsyncThunk(`${name}/updateDocumentStatus`, async (data) => {
        try {
            const response = await axios.put(`/user-doc/${data?.documentId}`, { update_type: data?.status });
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchDocumentsReducer(),
        ...updateDocumentStatusReducer()
    };

    function fetchDocumentsReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchDocuments;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.documents = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.documents = action.payload?.docs;
                state.totalDocs = action.payload?.totalDocs;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.documents = [];
                state.error = action.error.message;
            }
        };
    }

    function updateDocumentStatusReducer() {
        const { pending, fulfilled, rejected } = extraActions.updateDocumentStatus;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.documents = state.documents.map((doc) => (doc.usrdoc_id === action.payload?.usrdoc_id ? action.payload : doc));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
