import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../utils/api';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    in_app_notifications: true,
    notification_types: {
      new_comment: true,
      consultation_booked: true,
      payment_confirmation: true,
      new_follower: true,
      community_post: true,
      expert_response: true,
      payment_reminder: true,
      consultation_reminder: true
    },
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getPreferences();
      setPreferences(prev => ({
        ...prev,
        ...response.data
      }));
      setError('');
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel, enabled) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: enabled
    }));
  };

  const handleTypeChange = (type, enabled) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: enabled
      }
    }));
  };

  const handleQuietHoursChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await notificationsAPI.updatePreferences(preferences);
      setSuccess('Notification preferences saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('Failed to save notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const notificationChannels = [
    {
      key: 'push_notifications',
      title: 'Push Notifications',
      description: 'Receive notifications directly to your device',
      icon: '🔔'
    },
    {
      key: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: '📧'
    },
    {
      key: 'sms_notifications',
      title: 'SMS Notifications',
      description: 'Receive important notifications via SMS',
      icon: '📱'
    },
    {
      key: 'in_app_notifications',
      title: 'In-App Notifications',
      description: 'Show notifications within the application',
      icon: '🔕'
    }
  ];

  const notificationTypes = [
    {
      key: 'new_comment',
      title: 'New Comments',
      description: 'When someone comments on your posts',
      category: 'Social'
    },
    {
      key: 'new_follower',
      title: 'New Followers',
      description: 'When someone follows you',
      category: 'Social'
    },
    {
      key: 'community_post',
      title: 'Community Posts',
      description: 'When users you follow post in communities',
      category: 'Social'
    },
    {
      key: 'consultation_booked',
      title: 'Consultation Bookings',
      description: 'When consultations are booked or cancelled',
      category: 'Business'
    },
    {
      key: 'expert_response',
      title: 'Expert Responses',
      description: 'When experts respond to your consultations',
      category: 'Business'
    },
    {
      key: 'consultation_reminder',
      title: 'Consultation Reminders',
      description: 'Reminders about upcoming consultations',
      category: 'Business'
    },
    {
      key: 'payment_confirmation',
      title: 'Payment Confirmations',
      description: 'When payments are processed successfully',
      category: 'Financial'
    },
    {
      key: 'payment_reminder',
      title: 'Payment Reminders',
      description: 'Reminders about pending payments',
      category: 'Financial'
    }
  ];

  const groupedTypes = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="notification-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h1>Notification Settings</h1>
        <p>Manage how and when you receive notifications</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="settings-content">
        {/* Notification Channels */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Notification Channels</h2>
            <p>Choose how you want to receive notifications</p>
          </div>

          <div className="channel-list">
            {notificationChannels.map((channel) => (
              <div key={channel.key} className="channel-item">
                <div className="channel-info">
                  <div className="channel-icon">{channel.icon}</div>
                  <div className="channel-details">
                    <h3>{channel.title}</h3>
                    <p>{channel.description}</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences[channel.key]}
                    onChange={(e) => handleChannelChange(channel.key, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Notification Types</h2>
            <p>Choose which types of notifications you want to receive</p>
          </div>

          {Object.entries(groupedTypes).map(([category, types]) => (
            <div key={category} className="type-category">
              <h3 className="category-title">{category}</h3>
              <div className="type-list">
                {types.map((type) => (
                  <div key={type.key} className="type-item">
                    <div className="type-info">
                      <h4>{type.title}</h4>
                      <p>{type.description}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.notification_types[type.key]}
                        onChange={(e) => handleTypeChange(type.key, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quiet Hours */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Quiet Hours</h2>
            <p>Set times when you don't want to receive notifications</p>
          </div>

          <div className="quiet-hours">
            <div className="time-input-group">
              <div className="time-input">
                <label>Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) => handleQuietHoursChange('quiet_hours_start', e.target.value)}
                />
              </div>
              <div className="time-separator">to</div>
              <div className="time-input">
                <label>End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) => handleQuietHoursChange('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
            <p className="quiet-hours-note">
              During quiet hours, only critical notifications will be delivered
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Quickly manage all notification settings</p>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => {
                const allEnabled = {
                  email_notifications: true,
                  push_notifications: true,
                  sms_notifications: true,
                  in_app_notifications: true,
                  notification_types: Object.keys(preferences.notification_types).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                  }, {})
                };
                setPreferences(prev => ({ ...prev, ...allEnabled }));
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Enable All
            </button>

            <button
              className="quick-action-btn secondary"
              onClick={() => {
                const allDisabled = {
                  email_notifications: false,
                  push_notifications: false,
                  sms_notifications: false,
                  in_app_notifications: true, // Keep in-app enabled for important messages
                  notification_types: Object.keys(preferences.notification_types).reduce((acc, key) => {
                    acc[key] = false;
                    return acc;
                  }, {})
                };
                setPreferences(prev => ({ ...prev, ...allDisabled }));
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
              Disable All
            </button>

            <button
              className="quick-action-btn secondary"
              onClick={() => {
                const essentialOnly = {
                  email_notifications: true,
                  push_notifications: true,
                  sms_notifications: false,
                  in_app_notifications: true,
                  notification_types: {
                    new_comment: false,
                    consultation_booked: true,
                    payment_confirmation: true,
                    new_follower: false,
                    community_post: false,
                    expert_response: true,
                    payment_reminder: true,
                    consultation_reminder: true
                  }
                };
                setPreferences(prev => ({ ...prev, ...essentialOnly }));
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Essential Only
            </button>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="loading-spinner small"></div>
              Saving...
            </>
          ) : (
            <>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;