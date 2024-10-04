// eslint-disable-next-line import/no-extraneous-dependencies
import { io } from 'socket.io-client';
import { addNewNotification, setNotifications } from 'store/slices/notifications';

class SocketBase {
    ioInstance = undefined;

    get getSocket() {
        if (!this.ioInstance) {
            this.intializeSocket();
        }
        return this.ioInstance;
    }

    intializeSocket() {
        this.ioInstance = io(process.env.REACT_APP_API_URL, {
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem('serviceToken')}`
            }
        });
        this.ioInstance.on('connect', () => {
            console.log('Socket Intialized with id', this.ioInstance.id);
        });
        this.ioInstance.on('notification_history', (data) => {
            setNotifications(data);
        });
        this.ioInstance.on('notification_live', (notification) => {
            console.log({ notification });
            addNewNotification(notification);
        });
    }

    markAsReadEvent(notificationId) {
        this.ioInstance.emit('notification_seen', { notifications: notificationId });
    }
}

const socket = new SocketBase();
export { socket };
