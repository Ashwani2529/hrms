/* eslint-disable */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    open: false,
    handleConfirm: null,
    message: "Click submit to proceed",
    loading: false
};

// ==============================|| SLICE - SNACKBAR ||============================== //

const confirmationModal = createSlice({
    name: 'confirmationModal',
    initialState,
    reducers: {
        openConfirmationModal(state, action) {
            const { open, handleConfirm, message} = action.payload;
            state.open = open || initialState.open;
            state.handleConfirm = handleConfirm || initialState.handleConfirm;
            state.message = message || initialState.message;
        },
        showLoading(state){
            state.loading = !state.loading;
        },

        closeConfirmationModal(state) {
            state.open = false;
        }
    }
});

export default confirmationModal.reducer;

export const { openConfirmationModal, closeConfirmationModal, showLoading} = confirmationModal.actions;
