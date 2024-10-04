/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Attendance';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const AttendanceActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        attendances: [],
        loading: false,
        totalData: 0,
        singleAttendance: []
    };
}

function createExtraActions() {
    return {
        fetchAttendances: fetchAttendances(),
        createAttendance: createAttendance(),
        fetchAttendanceById: fetchAttendanceById(),
        updateAttendance: updateAttendance(),
        deleteAttendance: deleteAttendance(),
        markAutoAttendance: markAutoAttendance()
    };
}

// create api
function fetchAttendances() {
    return createAsyncThunk(`${name}/fetchAttendances`, async ({ page = '', limit = '', search = '', startDate, endDate }) => {
        try {
            const response = await axios.get(
                `/attendance/withinfo?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function fetchAttendanceById() {
    return createAsyncThunk(`${name}/fetchAttendanceById`, async (id) => {
        try {
            const response = await axios.get(`/attendance/${id}`);
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function createAttendance() {
    return createAsyncThunk(`${name}/createAttendance`, async (data) => {
        try {
            const response = await axios.post(`/attendance`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateAttendance() {
    return createAsyncThunk(`${name}/updateAttendance`, async (data) => {
        try {
            const { id, values } = data;
            const response = await axios.put(`/attendance/${id}`, values);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteAttendance() {
    return createAsyncThunk(`${name}/deleteAttendance`, async (data) => {
        try {
            const response = await axios.post(`/attendance/delete`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function markAutoAttendance() {
    return createAsyncThunk(`${name}/markAutoAttendance`, async (id) => {
        try {
            const response = await axios.post(`/attendance/autoAttendance/${id}`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchAttendances(),
        ...fetchAttendanceById(),
        ...deleteAttendance()
    };

    function fetchAttendances() {
        const { pending, fulfilled, rejected } = extraActions.fetchAttendances;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.attendances = action.payload?.attendance;
                state.totalData = action?.payload?.totalAttendance;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchAttendanceById() {
        const { pending, fulfilled, rejected } = extraActions.fetchAttendanceById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singleAttendance = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singleAttendance = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singleAttendance = [];
            }
        };
    }

    function deleteAttendance() {
        const { pending, fulfilled, rejected } = extraActions.deleteAttendance;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                const deletedId = action?.payload?.data?.deletedAttendances;
                (state.attendances = state?.attendances?.filter((Attendance) => !deletedId?.includes(Attendance?.attendance_id))),
                    (state.loading = false);
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
