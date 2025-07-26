// /client/src/components/Notifications/NotificationIcon.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import './NotificationsIcon.css';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null); // Reset error state on new fetch
      try {
        const response = await axios.get('/api/notifications'); 
        setNotifications(response.data);
      } catch (error) {
        setError(error);
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}`);
      // Update the state to reflect that the notification is read
      setNotifications(notifications.map(notification =>
        notification.notification_id === notificationId ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="notification-icon-container">
      <div className="notification-icon" onClick={toggleDropdown}>
        <FaBell />
        {!error && unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          {isLoading ? (
            <div className="notification-item">Loading...</div>
          ) : error ? (
            <div className="notification-item notification-error">Could not load notifications.</div>
          ) : notifications.length === 0 ? (
            <div className="notification-item">No new notifications.</div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.notification_id}
                className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              >
                {notification.type === 'like' && <div>Someone liked your post!</div>}
                {notification.type === 'comment' && <div>Someone commented on your post!</div>}
                <button className="mark-as-read-btn" onClick={() => markAsRead(notification.notification_id)}>
                  Mark as Read
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
