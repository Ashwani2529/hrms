// third-party
import { createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'utils/axios';
import { dispatch } from '../index';

// ----------------------------------------------------------------------

const initialState = {
    error: null,
    notificationsRead: [],
    notificationsUnread: [],
    unreadCount: undefined
};

const slice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications(state, action) {
            state.notificationsRead = action.payload.notifications.filter((notification) => notification.notification_status === 'Read');
            state.notificationsUnread = action.payload.notifications.filter(
                (notification) => notification.notification_status === 'Pending'
            );
        },
        markNotificationAsRead(state, action) {
            state.notificationsUnread = state.notificationsUnread.filter(
                (notification) => action.payload.notification_id !== notification.notification_id
            );
            state.notificationsRead = [...state.notificationsRead, { ...action.payload, notification_status: 'Read' }];
        },
        addNewNotification(state, action) {
            console.log(action.payload);
            switch (action.payload.notification_status) {
                case 'Pending':
                    state.notificationsUnread = [action.payload, ...state.notificationsUnread];
                    break;
                case 'Read':
                    state.notificationsRead = [action.payload, ...state.notificationsRead];
                    break;
                default:
                    break;
            }
        }
    }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function setNotifications(notifications) {
    dispatch(slice.actions.setNotifications({ notifications }));
}

// Accepts whole notification object as argument
export function markNotificationAsRead(notification) {
    dispatch(slice.actions.markNotificationAsRead(notification));
}

export function addNewNotification(notification) {
    dispatch(slice.actions.addNewNotification(notification));
}
