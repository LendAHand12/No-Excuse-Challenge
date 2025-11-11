import API from './API';
import { URL_API_NOTIFICATION } from './URL';

const Notification = {
  getNotifications: (pageNumber = 1, limit = 20, isRead) => {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      limit: limit.toString(),
    });
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }
    return API.get(`${URL_API_NOTIFICATION}?${params.toString()}`);
  },
  getUnreadCount: () => {
    return API.get(`${URL_API_NOTIFICATION}/unread-count`);
  },
  markAsRead: (id) => {
    return API.put(`${URL_API_NOTIFICATION}/${id}/read`);
  },
  markAllAsRead: () => {
    return API.put(`${URL_API_NOTIFICATION}/read-all`);
  },
  deleteNotification: (id) => {
    return API.delete(`${URL_API_NOTIFICATION}/${id}`);
  },
};

export default Notification;

