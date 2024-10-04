import { useEffect } from 'react';
import { addNewNotification, setNotifications } from 'store/slices/notifications';
import { socket } from 'utils/socket/socket';

function useSockets() {
    const ioInstance = socket.getSocket;

    const markAsReadEmitter = (notificationId) => {
        socket.markAsReadEvent(notificationId);
    };

    // useEffect(() => {
    //     ioInstance.on('notification_history', (data) => {
    //         setNotifications(data);
    //     });
    // }, []);

    return { ioInstance, markAsReadEmitter };
}

export default useSockets;
