import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Shield, Globe, Palette, Download, Trash2 } from 'lucide-react';
import { 
  updateProfileSettings, 
  getProfileSettings 
} from '../../store/slices/profileSlice';
import Button from '../common/Button/Button';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './SettingsTab.css';

const SettingsTab = ({ user, settings }) => {
  const dispatch = useDispatch();
  const { isUpdating, isLoadingSettings } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    notifications: {
      email_notifications: true,
      push_notifications: true,
      community_updates: true,
      consultation_reminders: true,
      marketing_emails: false
    },
    privacy: {
      profile_visibility: 'public',
      show_email: false,
      show_location: true,
      show_farming_details: true,
      show_phone: false
    },
    preferences: {
      language: 'English',
      timezone: 'UTC',
      currency: 'USD',
      theme: 'light'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    } else {
      dispatch(getProfileSettings());
    }
  }, [settings, dispatch]);

  const handleSettingChange = (category, setting, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfileSettings(formData)).unwrap();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
    }
  };

  const handleExportData = () => {
    // Create a data export
    const exportData = {
      profile: user,
      settings: formData,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      const finalConfirm = window.prompt(
        'Type "DELETE" to confirm account deletion:'
      );
      
      if (finalConfirm === 'DELETE') {
        // This would trigger account deletion
        alert('Account deletion would be processed here');
      }
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="settings-tab">
        <LoadingSpinner text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="settings-tab">
      <div className="settings-sections">
        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Bell className="settings-icon" />
            <div>
              <h3>Notifications</h3>
              <p>Manage how you receive notifications</p>
            </div>
          </div>

          <div className="settings-options">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Email Notifications</label>
                <span className="setting-description">
                  Receive notifications via email
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.notifications.email_notifications}
                  onChange={(e) => handleSettingChange('notifications', 'email_notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Push Notifications</label>
                <span className="setting-description">
                  Receive push notifications in your browser
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.notifications.push_notifications}
                  onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Community Updates</label>
                <span className="setting-description">
                  Get notified about community activity
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.notifications.community_updates}
                  onChange={(e) => handleSettingChange('notifications', 'community_updates', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Consultation Reminders</label>
                <span className="setting-description">
                  Reminders for upcoming consultations
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.notifications.consultation_reminders}
                  onChange={(e) => handleSettingChange('notifications', 'consultation_reminders', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Marketing Emails</label>
                <span className="setting-description">
                  Receive promotional emails and updates
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.notifications.marketing_emails}
                  onChange={(e) => handleSettingChange('notifications', 'marketing_emails', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Shield className="settings-icon" />
            <div>
              <h3>Privacy</h3>
              <p>Control what information is visible to others</p>
            </div>
          </div>

          <div className="settings-options">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Profile Visibility</label>
                <span className="setting-description">
                  Who can see your profile
                </span>
              </div>
              <select
                value={formData.privacy.profile_visibility}
                onChange={(e) => handleSettingChange('privacy', 'profile_visibility', e.target.value)}
                className="setting-select"
              >
                <option value="public">Public</option>
                <option value="community_only">Community Members Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Show Email</label>
                <span className="setting-description">
                  Display your email address on your profile
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.privacy.show_email}
                  onChange={(e) => handleSettingChange('privacy', 'show_email', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Show Location</label>
                <span className="setting-description">
                  Display your location on your profile
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.privacy.show_location}
                  onChange={(e) => handleSettingChange('privacy', 'show_location', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Show Phone</label>
                <span className="setting-description">
                  Display your phone number on your profile
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.privacy.show_phone}
                  onChange={(e) => handleSettingChange('privacy', 'show_phone', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {user?.role === 'farmer' && (
              <div className="setting-item">
                <div className="setting-info">
                  <label className="setting-label">Show Farming Details</label>
                  <span className="setting-description">
                    Display your farming information
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.privacy.show_farming_details}
                    onChange={(e) => handleSettingChange('privacy', 'show_farming_details', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Globe className="settings-icon" />
            <div>
              <h3>Preferences</h3>
              <p>Customize your experience</p>
            </div>
          </div>

          <div className="settings-options">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Language</label>
                <span className="setting-description">
                  Choose your preferred language
                </span>
              </div>
              <select
                value={formData.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                className="setting-select"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Portuguese">Portuguese</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Timezone</label>
                <span className="setting-description">
                  Your local timezone
                </span>
              </div>
              <select
                value={formData.preferences.timezone}
                onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                className="setting-select"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Africa/Nairobi">Nairobi</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Currency</label>
                <span className="setting-description">
                  Preferred currency for pricing
                </span>
              </div>
              <select
                value={formData.preferences.currency}
                onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                className="setting-select"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="KES">KES (KSh)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Theme</label>
                <span className="setting-description">
                  Choose your preferred theme
                </span>
              </div>
              <select
                value={formData.preferences.theme}
                onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <div className="settings-section-header">
            <Download className="settings-icon" />
            <div>
              <h3>Data Management</h3>
              <p>Manage your account data</p>
            </div>
          </div>

          <div className="settings-options">
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Export Data</label>
                <span className="setting-description">
                  Download a copy of your profile data
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                icon={<Download size={16} />}
              >
                Export
              </Button>
            </div>

            <div className="setting-item danger-zone">
              <div className="setting-info">
                <label className="setting-label">Delete Account</label>
                <span className="setting-description">
                  Permanently delete your account and all data
                </span>
              </div>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                icon={<Trash2 size={16} />}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Actions */}
      {hasChanges && (
        <div className="settings-actions">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isUpdating}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;