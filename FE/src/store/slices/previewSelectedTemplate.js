/* eslint-disable */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    open: false,
    template_id: null
};

// ==============================|| SLICE - SNACKBAR ||============================== //

const previewSelectedTemplate = createSlice({
    name: 'previewSelectedTemplate',
    initialState,
    reducers: {
        openPreviewtemplateModal(state, action) {
            const { open, template_id } = action.payload;
            state.open = open || initialState.open;
            state.template_id = template_id || initialState.template_id;
        },
        toggleLoading(state) {
            state.loading = !state.loading;
        },
        closePreviewtemplateModal(state) {
            state.open = false;
        }
    }
});

export default previewSelectedTemplate.reducer;

export const { openPreviewtemplateModal, closePreviewtemplateModal, toggleLoading } = previewSelectedTemplate.actions;
