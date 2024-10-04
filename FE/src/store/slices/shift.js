/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Shift';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const ShiftActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        shifts: [],
        allShifts: [],
        availableEmployess: [],
        loading: false,
        totalData: 0,
        singleShift: {},
        allUserShifts: [],
        allClientShifts: [],
        shiftLegends: []
    };
}

function createExtraActions() {
    return {
        fetchShifts: fetchShifts(),
        createShift: createShift(),
        fetchShiftById: fetchShiftById(),
        updateShift: updateShift(),
        deleteShift: deleteShift(),
        fetchAvailableEmp: fetchAvailableEmp(),
        resolveConflict: resolveConflict(),
        fetchAllShifts: fetchAllShifts(),
        fetchAllUserShifts: fetchAllUserShifts(),
        swapShift: swapShift(),
        assignShift: assignShift(),
        fetchAllClientShifts: fetchAllClientShifts(),
        fetchShiftLegends: fetchShiftLegends()
    };
}

// create api
function fetchShifts() {
    // TODO: Include start date and end date filter as well here to fetch the shifts of the selected month in calculating Muster data
    return createAsyncThunk(`${name}/fetchShifts`, async ({ search = '', users = '', clients = '' }) => {
        try {
            const response = await axios.get(`/shift/withinfo?search=${search}&users=${users}&clients=${clients}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchAllUserShifts() {
    return createAsyncThunk(`${name}/fetchAllUserShifts`, async ({ search = '' , client= '' }) => {
        try {
            const response = await axios.get(`/user/getAllUserShifts?search=${search}&client=${client}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchAllClientShifts() {
    return createAsyncThunk(`${name}/fetchAllClientShifts`, async () => {
        try {
            const response = await axios.get(`/client/getAllClientShifts`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchAllShifts() {
    return createAsyncThunk(`${name}/fetchAllShifts`, async () => {
        try {
            const response = await axios.get(`/shift`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchShiftById() {
    return createAsyncThunk(`${name}/fetchShiftById`, async (id) => {
        try {
            const response = await axios.get(`/shift/${id}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchShiftLegends() {
    return createAsyncThunk(`${name}/fetchShiftLegends`, async () => {
        try {
            const response = await axios.get(`/shift/legends`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function createShift() {
    return createAsyncThunk(`${name}/createShift`, async (data) => {
        try {
            const response = await axios.post(`/shift`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateShift() {
    return createAsyncThunk(`${name}/updateShift`, async (data) => {
        try {
            const { eventId, update } = data;
            const response = await axios.put(`/shift/${eventId}`, update);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteShift() {
    return createAsyncThunk(`${name}/deleteShift`, async (data) => {
        try {
            const response = await axios.post(`/shift/delete`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function fetchAvailableEmp() {
    return createAsyncThunk(`${name}/fetchAvailableEmp`, async (date) => {
        try {
            const { startTime, endTime, shiftId } = date;
            const response = await axios.get(`/shift/availableEmployees?startTime=${startTime}&endTime=${endTime}&shiftId=${shiftId}`);
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function resolveConflict() {
    return createAsyncThunk(`${name}/resolveConflict`, async (data) => {
        try {
            const response = await axios.post(`/shift/resolveConflict`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function swapShift() {
    return createAsyncThunk(`${name}/swapShift`, async (data) => {
        try {
            const response = await axios.post(`/shift/swapShift`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function assignShift() {
    return createAsyncThunk(`${name}/assignShift`, async (data) => {
        try {
            const response = await axios.post(`/shift/assignShift`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchShifts(),
        // ...createShift(),
        ...fetchShiftById(),
        // ...updateShift(),
        ...deleteShift(),
        ...fetchAvailableEmp(),
        ...fetchAllShifts(),
        ...fetchAllUserShifts(),
        ...fetchAllClientShifts(),
        ...fetchShiftLegends()
    };

    function fetchShifts() {
        const { pending, fulfilled, rejected } = extraActions.fetchShifts;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.shifts = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchShiftLegends() {
        const { pending, fulfilled, rejected } = extraActions.fetchShiftLegends;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.shiftLegends = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchAllUserShifts() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllUserShifts;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.allUserShifts = action.payload?.userShifts;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchAllClientShifts() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllClientShifts;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.allClientShifts = action.payload?.clientShifts;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchShiftById() {
        const { pending, fulfilled, rejected } = extraActions.fetchShiftById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singleShift = {};
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singleShift = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singleShift = {};
            }
        };
    }

    // function createShift() {
    //     const { pending, fulfilled, rejected } = extraActions.createShift;
    //     return {
    //         [pending]: (state) => {
    //             state.loading = true;
    //         },
    //         [fulfilled]: (state, action) => {
    //             const data = action?.payload?.data;
    //             state.loading = false;
    //             state.shifts = [...state.shifts, data];
    //         },
    //         [rejected]: (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //         },
    //     };
    // }
    // function updateShift() {
    //     const { pending, fulfilled, rejected } = extraActions.updateShift;
    //     return {
    //         [pending]: (state) => {
    //             state.loading = true;
    //         },
    //         [fulfilled]: (state, action) => {
    //             const data = action?.payload?.data;
    //             state.shifts = state?.shifts?.map((item) =>
    //                 item.shift_id === data?.shift_id ? data : item
    //             );
    //             state.loading = false;
    //         },
    //         [rejected]: (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //         },
    //     };
    // }
    function deleteShift() {
        const { pending, fulfilled, rejected } = extraActions.deleteShift;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                const deletedId = action?.payload?.data?.deletedShifts;
                state.shifts = state?.shifts?.filter((shift) => !deletedId?.includes(shift?.shift_id));
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchAvailableEmp() {
        const { pending, fulfilled, rejected } = extraActions.fetchAvailableEmp;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                const activeEmp = action?.payload;
                state.availableEmployess = activeEmp;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchAllShifts() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllShifts;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.allShifts = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
