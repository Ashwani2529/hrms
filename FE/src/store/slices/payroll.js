/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { f } from 'html2pdf.js';
import moment from 'moment';
import axios from 'utils/axios';
import { parseUrlWithFilters } from 'utils/parseUrlWithFilters';

const name = 'Payroll';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const PayrollActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        payroll: [],
        salarySlips: [],
        totalSalarySlips: 0,
        loading: false,
        totalData: 0,
        singlePayroll: [],
        newsalarySlips: [],
        UserPayrollData: [],
        salaryStructureHistory: {
            totalSalaryStructure: 0,
            salaryStructure: []
        },
        selectedSalaryStructure: {}
    };
}

function createExtraActions() {
    return {
        fetchPayrolls: fetchPayrolls(),
        updatePayroll: updatePayroll(),
        deletePayroll: deletePayroll(),
        fetchPayrollId: fetchPayrollId(),
        getSalarySlip: generateSalarySlip(),
        fetchUserPayrollData: fetchUserPayrollData(),
        createSalary: createSalary(),
        updateSalary: updateSalary(),
        createBonus: createBonus(),
        updateBonus: updateBonus(),
        sendSalarySlip: sendSalarySlip(),
        getAllSalarySlipByPayrollId: getAllSalarySlipByPayrollId(),
        downloadSalarySlip: downloadSalarySlip(),
        generateEmployeePayroll: generateEmployeePayroll(),
        generateAllPayrollSlips: generateAllPayrollSlips(),
        fetchAllSalarySlips: fetchAllSalarySlips(),
        createBulkUpdateExcel: createBulkUpdateExcel(),
        bulkSalaryUpdate: bulkSalaryUpdate(),
        fetchSalaryStructureHistory: fetchSalaryStructureHistory(),
        fetchSalaryStructureById: fetchSalaryStructureById()
    };
}

// create api
function fetchPayrolls() {
    return createAsyncThunk(`${name}/fetchPayrolls`, async ({ page, limit, search, status }) => {
        try {
            const response = await axios.get(`/payroll/withInfo?page=${page}&limit=${limit}&search=${search}&status=${status}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchAllSalarySlips() {
    return createAsyncThunk(`${name}/fetchAllSalarySlips`, async ({ page, limit, search, startDate, endDate, status, approval }) => {
        try {
            const response = await axios.get(
                `/payroll/salaryAllSlips/?page=${page}&limit=${limit}&search=${search}&status=${status}&approval=${approval}&endDate=${endDate}&startDate=${startDate}`
            );
            return response.data;
        } catch (err) {
            console.log(err);
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchPayrollId() {
    return createAsyncThunk(`${name}/fetchPayrollId`, async (id) => {
        try {
            const response = await axios.get(`/payroll/${id}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}
function generateSalarySlip() {
    return createAsyncThunk(`${name}/generateSalarySlip`, async (id) => {
        try {
            const response = await axios.get(`/payroll/generateSalarySlip/${id.id}?incentive=${id.incentive}`);
            return response.data;
        } catch (err) {
            throw new Error(err?.errors?.message);
        }
    });
}

function fetchUserPayrollData() {
    return createAsyncThunk(`${name}/fetchUserPayrollData`, async (id) => {
        try {
            const response = await axios.get(`/payroll/userPayroll/${id}`);
            return response.data;
        } catch (err) {
            console.log(err);
            throw new Error(err?.errors?.message);
        }
    });
}
function updatePayroll() {
    return createAsyncThunk(`${name}/updatePayroll`, async ({ data, id }) => {
        try {
            const response = await axios.put(`/payroll/${id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createSalary() {
    return createAsyncThunk(`${name}/createSalary`, async ({ data, id }) => {
        try {
            const response = await axios.post(`/payroll/createSalary/${id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateSalary() {
    return createAsyncThunk(`${name}/updateSalary`, async ({ data, salary_id }) => {
        try {
            const response = await axios.put(`/payroll/updateSalary/${salary_id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createBonus() {
    return createAsyncThunk(`${name}/createBonus`, async ({ data, id }) => {
        try {
            const response = await axios.post(`/payroll/createBonus/${id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function updateBonus() {
    return createAsyncThunk(`${name}/updateBonus`, async ({ data, bonus_id }) => {
        try {
            const response = await axios.put(`/payroll/updateBonus/${bonus_id}`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function deletePayroll() {
    return createAsyncThunk(`${name}/deletePayroll`, async (data) => {
        try {
            const response = await axios.post(`/payroll/delete`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function sendSalarySlip() {
    return createAsyncThunk(`${name}/sendSalarySlip`, async (id) => {
        try {
            const response = await axios.put(`/payroll/approveSalarySlip/${id}`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function getAllSalarySlipByPayrollId() {
    return createAsyncThunk(`${name}/getAllSalarySlipByPayrollId`, async ({ id, status, approval, page, limit, startDate, endDate }) => {
        try {
            const response = await axios.get(
                `/payroll/salaryAllSlip/${id}?status=${status}&approval=${approval}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function downloadSalarySlip() {
    return createAsyncThunk(`${name}/downloadSalarySlip`, async (id) => {
        try {
            const response = await axios.get(`/payroll/downloadSalarySlip/${id}`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function generateEmployeePayroll() {
    return createAsyncThunk(`${name}/generateEmployeePayroll`, async (ids) => {
        try {
            const response = await axios.post(`/payroll/generateMultipleSalarySlip`, { payrollIds: ids });
            return response;
        } catch (err) {
            return err;
        }
    });
}

function generateAllPayrollSlips() {
    return createAsyncThunk(`${name}/generateALlPayrollSlips`, async () => {
        try {
            const response = await axios.get(`/payroll/generateAllSalarySlips`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createBulkUpdateExcel() {
    return createAsyncThunk(`${name}/createBulkUpdateExcel`, async (data) => {
        try {
            const response = await axios.post(`/payroll/generateSampleExcel`, data);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function bulkSalaryUpdate() {
    return createAsyncThunk(`${name}/bulkSalaryUpdate`, async (formData) => {
        try {
            const response = await axios.post(`/payroll/bulk-salary-update`, formData);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function fetchSalaryStructureHistory() {
    return createAsyncThunk(`${name}/fetchSalaryStrutureHistory`, async ({ payrollId, filters }) => {
        try {
            const url = parseUrlWithFilters({ filters, url: `/payroll/getAllSalaryStructure/${payrollId}` });
            const response = await axios.get(url);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function fetchSalaryStructureById() {
    return createAsyncThunk(`${name}/fetchSalaryStructureById`, async (id) => {
        try {
            const response = await axios.get(`/payroll/getSalaryStructure/${id}`);
            return response;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...fetchPayrolls(),
        ...fetchPayrollId(),
        ...fetchUserPayrollData(),
        ...getSalarySlip(),
        ...getAllSalarySlipByPayrollId(),
        ...deletePayroll(),
        ...fetchAllSalarySlips(),
        ...fetchSalaryStructureHistory(),
        ...fetchSalaryStructureById()
    };

    function fetchSalaryStructureById() {
        const { pending, fulfilled, rejected } = extraActions.fetchSalaryStructureById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.selectedSalaryStructure = {};
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.selectedSalaryStructure = action.payload?.data;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.selectedSalaryStructure = {};
                state.error = action.error.message;
            }
        };
    }
    function getSalarySlip() {
        const { pending, fulfilled, rejected } = extraActions.getSalarySlip;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.newsalarySlips = action.payload?.salarySlip;
                state.totalData = action.payload?.totalSalarySlips;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
    function fetchPayrolls() {
        const { pending, fulfilled, rejected } = extraActions.fetchPayrolls;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.payroll = action.payload?.payroll;
                state.totalData = action.payload?.totalPayrolls;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchPayrollId() {
        const { pending, fulfilled, rejected } = extraActions.fetchPayrollId;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.singlePayroll = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.singlePayroll = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.singlePayroll = [];
            }
        };
    }

    function fetchUserPayrollData() {
        const { pending, fulfilled, rejected } = extraActions.fetchUserPayrollData;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.UserPayrollData = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.UserPayrollData = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.UserPayrollData = [];
            }
        };
    }

    function getAllSalarySlipByPayrollId() {
        const { pending, fulfilled, rejected } = extraActions.getAllSalarySlipByPayrollId;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.salarySlips = [];
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.salarySlips = action.payload?.salarySlip;
                state.totalData = action.payload?.totalSalarySlips;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.salarySlips = [];
            }
        };
    }

    function deletePayroll() {
        const { pending, fulfilled, rejected } = extraActions.deletePayroll;
        return {
            [pending]: (state) => {},
            [fulfilled]: (state, action) => {
                const ids = action?.payload?.data?.deletedPayrolls;
                state.payroll = state?.payroll?.filter((elm) => !ids?.includes(elm?.payroll_id));
                state.totalData = state.totalData - ids?.length;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error;
            }
        };
    }

    function fetchAllSalarySlips() {
        const { pending, fulfilled, rejected } = extraActions.fetchAllSalarySlips;
        return {
            [pending]: (state) => {
                state.loading = false;
                state.totalSalarySlips = 0;
                state.salarySlips = [];
            },
            [fulfilled]: (state, action) => {
                state.totalSalarySlips = action.payload?.totalSalaryStructures;
                state.salarySlips = action?.payload?.salaryStructureDetails;
                state.loading = false;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error;
                state.totalSalarySlips = 0;
                state.salarySlips = [];
            }
        };
    }

    function fetchSalaryStructureHistory() {
        const { pending, fulfilled, rejected } = extraActions.fetchSalaryStructureHistory;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.salaryStructureHistory = {
                    totalSalaryStructure: 0,
                    salaryStructure: []
                };
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.salaryStructureHistory = action?.payload?.data || {
                    totalSalaryStructure: 0,
                    salaryStructure: []
                };
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.payload.error;
                state.salaryStructureHistory = {
                    totalSalaryStructure: 0,
                    salaryStructure: []
                };
            }
        };
    }
}
