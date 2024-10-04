/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'Employees';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const EmployeeActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        employee: [],
        allUsers: [],
        loading: false,
        totalData: 0,
        singleEmployee: {},
        selectedEmployeeAttendance: []
    };
}

function createExtraActions() {
    return {
        fetchEmployees: fetchEmployees(),
        createEmployee: createEmployee(),
        fetchEmployeeById: fetchEmployeeById(),
        deleteEmployee: deleteEmployee(),
        updateEmployee: updateEmployee(),
        verifyEmployeeData: verifyEmployeeData(),
        createMultipleEmployee: createMultipleEmployee(),
        getSelectedEmployeeAttendence: getSelectedEmployeeAttendence()
    };
}

// create api
function fetchEmployees() {
    return createAsyncThunk(`${name}/fetchEmployees`, async ({ page, limit, search, status, emp_type }) => {
        try {
            const response = await axios.get(`/user?page=${page}&limit=${limit}&search=${search}&status=${status}&emp_type=${emp_type}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchEmployeeById() {
    return createAsyncThunk(`${name}/fetchEmployeeById`, async (id) => {
        try {
            const response = await axios.get(`/user/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createEmployee() {
    return createAsyncThunk(`${name}/createEmployee`, async (user) => {
        try {
            const response = await axios.post(`/user`, user);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createMultipleEmployee() {
    return createAsyncThunk(`${name}/createMultipleEmployee`, async (formData) => {
        try {
            const response = await axios.post(`/user/create-multiple`, formData, {
                headers: {
                    'Content-Type': 'multipart/formdata'
                }
            });
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateEmployee() {
    return createAsyncThunk(`${name}/updateEmployee`, async ({ data, id }) => {
        console.log(id);
        try {
            const response = await axios.put(`/user/${id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deleteEmployee() {
    return createAsyncThunk(`${name}/deleteEmployee`, async (user) => {
        try {
            const response = await axios.post(`/user/delete`, user);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function verifyEmployeeData() {
    return createAsyncThunk(`${name}/verifyEmployeeData`, async ({ data }) => {
        try {
            const response = await axios.post(`/user/verify`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function getSelectedEmployeeAttendence() {
    return createAsyncThunk(`${name}/getSelectedEmployeeAttendance`, async ({ employeeId, filters }) => {
        const reqUrl = Object.entries(filters).reduce(
            (prev, curr) => (curr[1] ? `${prev}${curr[0]}=${curr[1]}&` : prev),
            `/attendance/user/${employeeId}?`
        );
        try {
            const response = await axios.get(reqUrl);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchEmployees(),
        ...createEmployee(),
        ...fetchEmployeeById(),
        ...deleteEmployee(),
        ...getSelectedEmployeeAttendance()
    };

    function fetchEmployees() {
        const { pending, fulfilled, rejected } = extraActions.fetchEmployees;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.employee = action.payload.users;
                state.allUsers = action.payload.allUsers;
                state.totalData = action.payload?.totalUsers;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchEmployeeById() {
        const { pending, fulfilled, rejected } = extraActions.fetchEmployeeById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singleEmployee = {};
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singleEmployee = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singleEmployee = {};
            }
        };
    }

    // function createEmployee() {
    //     const { pending, fulfilled, rejected } = extraActions.createEmployee;
    //     return {
    //         [pending]: (state) => {
    //             state.loading = true;
    //         },
    //         [fulfilled]: (state, action) => {
    //             state.loading = false;
    //         },
    //         [rejected]: (state, action) => {
    //             state.loading = false;
    //             state.error = action.error.message;
    //         },
    //     };
    // }
    function deleteEmployee() {
        const { pending, fulfilled, rejected } = extraActions.deleteEmployee;
        return {
            [pending]: (state) => {},
            [fulfilled]: (state, action) => {
                const ids = action?.payload?.data?.deletedUsers;
                state.employee = state?.employee?.filter((emp) => !ids?.includes(emp?.user_id));
                state.totalData = state.totalData - ids?.length;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error;
            }
        };
    }

    function getSelectedEmployeeAttendance() {
        const { pending, fulfilled, rejected } = extraActions.getSelectedEmployeeAttendence;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.selectedEmployeeAttendance = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.selectedEmployeeAttendance = action.payload.data;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.selectedEmployeeAttendance = [];
            }
        };
    }
}
