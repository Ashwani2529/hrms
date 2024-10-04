/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Remarks';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const RemarkActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        loading: false,
        remarks: [],
        error: null
    };
}

function createExtraActions() {
    return {
        fetchUserRemarks: fetchUserRemarks(),
        createRemark: createRemark(),
        editRemark: editRemark(),
        deleteRemark: deleteRemark()
    };
}

function fetchUserRemarks() {
    return createAsyncThunk(`${name}/fetchUserRemarks`, async (user_id) => {
        try {
            const response = await axios.get(`/remark/${user_id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createRemark() {
    return createAsyncThunk(`${name}/createRemark`, async (data) => {
        try {
            const response = await axios.post(`/remark`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function editRemark() {
    return createAsyncThunk(`${name}/editRemark`, async (data) => {
        try {
            const response = await axios.put(`/remark/${data.remark_id}`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function deleteRemark() {
    return createAsyncThunk(`${name}/deleteRemark`, async (data) => {
        try {
            const response = await axios.post(`/remark/delete`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchUserRemarksReducer(),
        ...editRemarkReducer(),
        ...deleteRemarkReducer()
    };

    function fetchUserRemarksReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchUserRemarks;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.remarks = [];
            },
            [fulfilled]: (state, action) => {
                state.remarks = action.payload;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.remarks = [];
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function editRemarkReducer() {
        const { pending, fulfilled, rejected } = extraActions.editRemark;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.remarks = state.remarks.map((ele) => (ele?.remark_id === action.payload?.data?.remark_id ? action?.payload?.data : ele));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function deleteRemarkReducer() {
        const { pending, fulfilled, rejected } = extraActions.deleteRemark;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.remarks = state.remarks?.filter((remark) => !action.payload?.data?.deletedRemarks?.includes(remark?.remark_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
