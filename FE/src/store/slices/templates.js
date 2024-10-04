/* eslint-disable */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'utils/axios';

const name = 'templates';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({
    name,
    initialState,
    extraReducers
});

export const TemplateActions = { ...slice.actions, ...extraActions };

export default slice.reducer;

function createInitialState() {
    return {
        error: null,
        templates: [],
        selectedTemplate: {},
        templateVariables: {},
        loading: false
    };
}

function createExtraActions() {
    return {
        createTemplate: createTemplate(),
        fetchTemplates: fetchTemplates(),
        fetchTemplateById: fetchTemplateById(),
        updateTemplate: updateTemplate(),
        deleteTemplate: deleteTemplate(),
        fetchTemplateVariables: fetchTemplateVariables()
    };
}

function fetchTemplates() {
    return createAsyncThunk(`${name}/fetchTemplates`, async () => {
        try {
            const response = await axios.get(`/template`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchTemplateVariables() {
    return createAsyncThunk(`${name}/fetchTemplateVariables`, async () => {
        try {
            const response = await axios.get(`/template/templateVariableScope`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function fetchTemplateById() {
    return createAsyncThunk(`${name}/fetchTemplateById`, async (templateId) => {
        try {
            const response = await axios.get(`/template/${templateId}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    });
}

function createTemplate() {
    return createAsyncThunk(`${name}/createTemplate`, async (data) => {
        try {
            const response = await axios.post(`/template`, data);
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function updateTemplate() {
    return createAsyncThunk(`${name}/updateTemplate`, async ({ templateId, data }) => {
        try {
            const response = await axios.put(`/template/${templateId}`, data);
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function deleteTemplate() {
    return createAsyncThunk(`${name}/deleteTemplate`, async ({ templateIds }) => {
        try {
            const response = await axios.post(`/template/delete`, { templates: templateIds });
            return response.data;
        } catch (err) {
            return err;
        }
    });
}

function createExtraReducers() {
    return {
        ...createTemplateReducer(),
        ...fetchTemplatesReducer(),
        ...fetchTemplateByIdReducer(),
        ...updateTemplateReducer(),
        ...deleteTemplates(),
        ...fetchTemplateVariables()
    };

    function createTemplateReducer() {
        const { pending, fulfilled, rejected } = extraActions.createTemplate;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.templates = [...state.templates, action.payload];
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function updateTemplateReducer() {
        const { pending, fulfilled, rejected } = extraActions.updateTemplate;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.templates = state.templates.map((ele) => (ele?.template_id === action.payload?.template_id ? action.payload : ele));
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchTemplatesReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchTemplates;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchTemplateByIdReducer() {
        const { pending, fulfilled, rejected } = extraActions.fetchTemplateById;
        return {
            [pending]: (state) => {
                state.loading = true;
                state.selectedTemplate = {};
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.selectedTemplate = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function deleteTemplates() {
        const { pending, fulfilled, rejected } = extraActions.deleteTemplate;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.templates = state.templates?.filter((template) => {
                    if (
                        Array.isArray(action?.payload?.deletedTemplates) &&
                        action.payload?.deletedTemplates?.includes(template.template_id)
                    )
                        return false;
                    return true;
                });
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }

    function fetchTemplateVariables() {
        const { pending, fulfilled, rejected } = extraActions.fetchTemplateVariables;
        return {
            [pending]: (state) => {
                state.loading = true;
            },
            [fulfilled]: (state, action) => {
                state.loading = false;
                state.templateVariables = action.payload;
            },
            [rejected]: (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            }
        };
    }
}
