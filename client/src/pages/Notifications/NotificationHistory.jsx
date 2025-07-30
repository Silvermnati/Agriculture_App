import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../utils/api';
import './NotificationHistory.css';

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, [filters, pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        include_read: true,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await notificationsAPI.getHistory(params);
      const { notifications: notificationData, total, page, limit } = response.data;

      setNotifications(notificationData || []);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / limit),
        page
      }));
      setError('');
    } catch (err) {
      console.error('Error fetching notification history:', err);
      setError('Failed to load notification history');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await notificationsAPI.markAsRead(notificationIds);
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.notification_id)
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (selectedIds.length === 0) return;

    try {
      switch (action) {
        case 'mark_read':
          await handleMarkAsRead(selectedIds);
          break;
        case 'delete':
          // Implement delete functionality if needed
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      payment_confirmation: '💳',
      new_comment: '💬',
      new_follower: '👤',
      consultation_booked: '📅',
      expert_response: '👨‍🌾',
      community_post: '🏘️',
      payment_reminder: '⏰',
      consultation_reminder: '🔔'
    };
    return iconMap[type] || '📢';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      payment_confirmation: 'Payment',
      new_comment: 'Comment',
      new_follower: 'Follower',
      consultation_booked: 'Consultation',
      expert_response: 'Expert Response',
      community_post: 'Community',
      payment_reminder: 'Payment Reminder',
      consultation_reminder: 'Consultation Reminder'
    };
    return typeLabels[type] || type;
  };

  const NotificationItem = ({ notification, onMarkAsRead }) => {
    const [selected, setSelected] = useState(false);

    return (
      <div className={`notification-history-item ${!notification.read_at ? 'unread' : ''}`}>
        <div className="notification-checkbox">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
          />
        </div>

        <div className="notification-icon">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="notification-content">
          <div className="notification-header">
            <h4 className="notification-title">{notification.title}</h4>
            <div className="notification-meta">
              <span className="notification-type">{getTypeLabel(notification.type)}</span>
              <span className="notification-date">{formatDate(notification.created_at)}</span>
            </div>
          </div>
          
          <p className="notification-message">{notification.message}</p>
          
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="notification-data">
              {notification.data.amount && (
                <span className="data-item">Amount: KES {notification.data.amount}</span>
              )}
              {notification.data.expert_name && (
                <span className="data-item">Expert: {notification.data.expert_name}</span>
              )}
              {notification.data.community_name && (
                <span className="data-item">Community: {notification.data.community_name}</span>
              )}
            </div>
          )}
        </div>

        <div className="notification-actions">
          {!notification.read_at && (
            <button
              className="action-btn mark-read"
              onClick={() => onMarkAsRead([notification.notification_id])}
            >
              Mark as Read
            </button>
          )}
          
          <button
            className="action-btn view"
            onClick={() => {
              // Handle navigation based on notification type
              const { type, data } = notification;
              switch (type) {
                case 'new_comment':
                  if (data.post_id) window.location.href = `/posts/${data.post_id}`;
                  break;
                case 'consultation_booked':
                  window.location.href = '/consultations';
                  break;
                case 'payment_confirmation':
                  window.location.href = '/payments/history';
                  break;
                case 'new_follower':
                  if (data.follower_id) window.location.href = `/profile/${data.follower_id}`;
                  break;
                case 'community_post':
                  if (data.community_id) window.location.href = `/communities/${data.community_id}`;
                  break;
                default:
                  break;
              }
            }}
          >
            View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="notification-history">
      <div className="history-header">
        <h1>Notification History</h1>
        <p>View and manage all your notifications</p>
      </div>

      <div className="history-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="payment_confirmation">Payment</option>
              <option value="new_comment">Comments</option>
              <option value="new_follower">Followers</option>
              <option value="consultation_booked">Consultations</option>
              <option value="expert_response">Expert Responses</option>
              <option value="community_post">Community Posts</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button
              className="clear-filters-btn"
              onClick={() => {
                setFilters({
                  type: 'all',
                  status: 'all',
                  dateFrom: '',
                  dateTo: '',
                  search: ''
                });
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notification history...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Notifications</h3>
            <p>{error}</p>
            <button onClick={fetchNotifications} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">📭</div>
            <h3>No Notifications Found</h3>
            <p>No notifications match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                </div>
                
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, pagination.page - 2);
                    if (page > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        className={`pagination-btn ${page === pagination.page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;