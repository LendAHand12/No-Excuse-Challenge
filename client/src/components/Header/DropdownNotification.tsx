import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ClickOutside from '../ClickOutside';
import Notification from '@/api/Notification';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DropdownNotification = () => {
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const notificationListRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userInfo || userInfo.role !== 'user') return;
    try {
      const response = await Notification.getUnreadCount();
      if (response?.data?.unreadCount !== undefined) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    if (!userInfo || userInfo.role !== 'user' || loading) return;
    setLoading(true);
    try {
      const isReadParam = showOnlyUnread ? 'false' : undefined;
      const response = await Notification.getNotifications(
        pageNum,
        20,
        isReadParam,
      );
      if (response?.data) {
        const newNotifications = response.data.notifications || [];
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }
        setHasMore(pageNum < response.data.pages);
        setPage(pageNum);
        // Update unread count
        if (response.data.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error(t('notification.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when dropdown opens or filter changes
  useEffect(() => {
    if (dropdownOpen && userInfo && userInfo.role === 'user') {
      fetchNotifications(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen, userInfo, showOnlyUnread]);

  // Auto-load more when scrolling to bottom
  useEffect(() => {
    if (!notificationListRef.current || !dropdownOpen) return;

    const handleScroll = () => {
      const element = notificationListRef.current;
      if (!element) return;
      const { scrollTop, scrollHeight, clientHeight } = element;
      // Load more when user scrolls to within 100px of bottom
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        hasMore &&
        !loading
      ) {
        fetchNotifications(page + 1, false);
      }
    };

    const element = notificationListRef.current;
    element.addEventListener('scroll', handleScroll);
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen, hasMore, loading, page]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'user') return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await Notification.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error(t('notification.failedToMarkAsRead'));
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await Notification.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() })),
      );
      setUnreadCount(0);
      toast.success(t('notification.allMarkedAsRead'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error(t('notification.failedToMarkAllAsRead'));
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  // Get type color for title
  const getTitleColor = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notification.justNow');
    if (minutes < 60) return `${minutes}${t('notification.minutesAgo')}`;
    if (hours < 24) return `${hours}${t('notification.hoursAgo')}`;
    if (days < 7) return `${days}${t('notification.daysAgo')}`;
    return d.toLocaleDateString();
  };

  if (!userInfo || userInfo.role !== 'user') return null;

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute lg:right-0 sm:right-0 mt-4 flex w-[calc(100vw-3rem)] sm:w-80 max-w-[calc(100vw-3rem)] sm:max-w-sm flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-h-[calc(100vh-8rem)] sm:max-h-[500px] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notification.title')}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`text-xs px-2 py-1 rounded ${
                    showOnlyUnread
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showOnlyUnread
                    ? t('notification.showAll')
                    : t('notification.showUnreadOnly')}
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {t('notification.markAllAsRead')}
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div ref={notificationListRef} className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">{t('notification.loading')}</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">
                  {t('notification.noNotifications')}
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-stroke dark:divide-strokedark">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      !notification.isRead
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <h4
                          className={`text-sm font-semibold mb-1 px-2 py-1 rounded ${getTitleColor(
                            notification.type,
                          )}`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              >
                                {t('notification.markAsRead')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Load More - Show only if not auto-loading */}
            {hasMore && (
              <div className="px-4 py-3 border-t border-stroke dark:border-strokedark">
                {loading ? (
                  <div className="text-center text-sm text-gray-500">
                    {t('notification.loading')}
                  </div>
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    {t('notification.loadMore')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownNotification;
