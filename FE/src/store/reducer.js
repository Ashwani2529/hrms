/* eslint-disable */
// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// project imports
import snackbarReducer from './slices/snackbar';
import customerReducer from './slices/customer';
import contactReducer from './slices/contact';
import productReducer from './slices/product';
import chatReducer from './slices/chat';
import mailReducer from './slices/mail';
import userReducer from './slices/user';
import cartReducer from './slices/cart';
import kanbanReducer from './slices/kanban';
import menuReducer from './slices/menu';

import shift from './slices/shift';
import employee from './slices/employee';
import client from './slices/client';
import checkIn from './slices/checkin';
import leave from './slices/leave';
import attendance from './slices/attendance';
import analytics from './slices/analytics';
import holiday from './slices/holiday';
import confirmationModal from './slices/confirmationModal';
import payroll from './slices/payroll';
import logger from './slices/logger';
import notifications from './slices/notifications';
import roles from './slices/roles';
import company from './slices/company';
import remarks from './slices/remarks';
import templates from './slices/templates';
import documents from './slices/documents';
import previewTemplateModal from './slices/previewSelectedTemplate';
import requests from './slices/requests';
import tickets from './slices/tickets';
// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
    snackbar: snackbarReducer,
    cart: persistReducer(
        {
            key: 'cart',
            storage,
            keyPrefix: 'berry-'
        },
        cartReducer
    ),
    kanban: kanbanReducer,
    customer: customerReducer,
    contact: contactReducer,
    product: productReducer,
    chat: chatReducer,
    mail: mailReducer,
    user: userReducer,
    menu: menuReducer,
    employee,
    shift,
    checkIn,
    leave,
    attendance,
    client,
    analytics,
    holiday,
    confirmationModal,
    payroll,
    logger,
    notifications,
    roles,
    company,
    remarks,
    templates,
    documents,
    previewTemplateModal,
    requests,
    tickets
});

export default reducer;
