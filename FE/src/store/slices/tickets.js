/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Tickets';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const TicketActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        loading: false,
        tickets: [],
        totalData:0,
        error: null
    };
}

function createExtraActions() {
    return {
        fetchAllTickets: fetchAllTickets(),
        fetchTicketsDetails: fetchTicketsDetails(),
        createTickets: createTickets(),
        editTickets: editTickets(),
        deleteTickets: deleteTickets()
    };
}

function fetchAllTickets() {
    return createAsyncThunk(`${name}/fetchAllTickets`, async ({ page, limit, search, type='', startDate = '', endDate = '' }) => {
        try {
            const response = await axios.get(
                `/tickets/all?page=${page}&limit=${limit}&search=${search}&type=${type}&startDate=${startDate}&endDate=${endDate}`
            );
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchTicketsDetails() {
    return createAsyncThunk(`${name}/fetchTicketsDetails`, async (id) => {
        try {
            const response = await axios.get(`/tickets/${id}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function createTickets() {
    return createAsyncThunk(`${name}/createTickets`, async (data) => {
        try {
            const response = await axios.post(`/tickets`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function editTickets() {
    return createAsyncThunk(`${name}/editTickets`, async (data) => {
        try {
            const response = await axios.put(`/tickets/${data?.id}`, data?.values);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function deleteTickets() {
    return createAsyncThunk(`${name}/deleteTickets`, async (data) => {
        try {
            const response = await axios.post(`/tickets/delete`, data);
            return response;
        } catch (err) {
            throw err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchAllTicketsReducer(),
        ...editTicketsReducer(),
        ...deleteTicketsReducer(),
        ...fetchTicketReducer()
    };

    function fetchAllTicketsReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllTickets;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.tickets = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.tickets = action.payload?.tickets;
                state.totalData = action?.payload?.totalTickets;
            },
            [rejected]: (state, action) => {
                state.tickets = [];
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchTicketReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchTicketsDetails;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.tickets = [];
            },
            [fulfilled]: (state, action) => {
                state.tickets = action.payload;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.tickets = [];
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function editTicketsReducer() {
        const { pending, fulfilled, rejected } = extraActions.editTickets;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.tickets = state.tickets.map((ele) => (ele?.ticket_id === action.payload?.data?.ticket_id ? action?.payload?.data : ele));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function deleteTicketsReducer() {
        const { pending, fulfilled, rejected } = extraActions.deleteTickets;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.tickets = state.tickets?.filter((remark) => !action.payload?.data?.deletedRemarks?.includes(remark?.remark_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
