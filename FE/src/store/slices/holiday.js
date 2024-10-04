/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Holiday';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const HolidayActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        holidays: {
            WEEKOFF: {
                Edited: [],
                Normal: []
            },
            HOLIDAY: []
        },
        loading: false,
        totalData: 0,
        selectedHoliday: {}
    };
}

function createExtraActions() {
    return {
        fetchHoliday: fetchHoliday(),
        createHoliday: createHoliday(),
        deleteHoliday: deleteHoliday(),
        updateHoliday: updateHoliday(),
        fetchHolidayById: fetchHolidayById()
    };
}

// create api
function fetchHoliday() {
    return createAsyncThunk(`${name}/fetchHoliday`, async ({ search = '', page = '', limit = '', startDate = '', endDate = '' }) => {
        try {
            const response = await axios.get(
                `/holiday?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchHolidayById() {
    return createAsyncThunk(`${name}/fetchHolidayById`, async (id) => {
        try {
            const response = await axios.get(`/holiday/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createHoliday() {
    return createAsyncThunk(`${name}/createHoliday`, async (data) => {
        try {
            const response = await axios.post(`/holiday`, data);
            return response;
        } catch (err) {
          //  console.log(err);
            return err;
        }
    });
}

function updateHoliday() {
    return createAsyncThunk(`${name}/updateHoliday`, async (data) => {
        try {
            const { id, values } = data;
            const response = await axios.put(`/holiday/${id}`, values);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteHoliday() {
    return createAsyncThunk(`${name}/deleteHoliday`, async (holidays) => {
        try {
            const response = await axios.post(`/holiday/delete`, holidays);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchHoliday(),
        ...deleteHoliday(),
        ...fetchHolidayById()
    };

    function fetchHoliday() {
        const { pending, fulfilled, rejected } = extraActions.fetchHoliday;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.holidays.WEEKOFF.Normal = action.payload.Holidays?.WEEKOFF?.Normal || [];
                state.holidays.WEEKOFF.Edited = action.payload.Holidays?.WEEKOFF?.Edited || [];
                state.holidays.HOLIDAY = action.payload.Holidays?.HOLIDAY || [];
                state.totalData = action.payload.totalHolidays;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchHolidayById() {
        const { pending, fulfilled, rejected } = extraActions.fetchHolidayById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.selectedHoliday = {};
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.selectedHoliday = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.selectedHoliday = {};
            }
        };
    }

    function deleteHoliday() {
        const { pending, fulfilled, rejected } = extraActions.deleteHoliday;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                const deletedId = action?.payload?.data?.deletedHolidays;
                state.holidays.WEEKOFF.Normal = state?.holidays?.WEEKOFF?.Normal?.filter(
                    (holiday) => !deletedId?.includes(holiday?.holiday_id)
                );
                state.holidays.WEEKOFF.Edited = state?.holidays?.WEEKOFF?.Edited?.filter(
                    (holiday) => !deletedId?.includes(holiday?.holiday_id)
                );
                state.holidays.HOLIDAY = state?.holidays?.HOLIDAY?.filter((holiday) => !deletedId?.includes(holiday?.holiday_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
