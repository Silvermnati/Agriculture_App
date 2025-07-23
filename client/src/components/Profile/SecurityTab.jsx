import React from 'react';
import { useDispatch } from 'react-redux';
import { Shield, Key, Smartphone, AlertTriangle, Clock } from 'lucide-react';
import { setShowPasswordModal } from '../../store/slices/profileSlice';
import Button from '../common/Button/Button';
import './SecurityTab.css';

const SecurityTab = ({ user }) => {
  const dispatch = useDispatch();

  const handleChangePassword = () => {
    dispatch(setShowPasswordModal(true));
  };

  const getPasswordStrength = () => {
    // This would normally check the actual password strength
    // For demo purposes, we'll show a mock strength
    return 'Strong';
  };

  const getLastPasswordChange = () => {
    // This would come from the backend
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  };

  const getLoginSessions = () => {
    // Mock data for active sessions
    return [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'New York, US',
        lastActive: '2 minutes ago',
        current: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'New York, US',
        lastActive: '1 hour ago',
        current: false
      },
      {
        id: 3,
        device: 'Firefox on Mac',
        location: 'Boston, US',
        lastActive: '2 days ago',
        current: false
      }
    ];
  };

  const handleLogoutSession = (sessionId) => {
    // This would call an API to logout the specific session
    console.log('Logging out session:', sessionId);
  };

  const handleLogoutAllSessions = () => {
    const confirm = window.confirm(
      'This will log you out of all devices except this one. Continue?'
    );
    if (confirm) {
      // This would call an API to logout all other sessions
      console.log('Logging out all other sessions');
    }
  };

  const handleEnable2FA = () => {
    // This would start the 2FA setup process
    alert('2FA setup would be implemented here');
  };

  return (
    <div className="security-tab">
      <div className="security-sections">
        {/* Password Security */}
        <div className="security-section">
          <div className="security-section-header">
            <Key className="security-icon" />
            <div>
              <h3>Password Security</h3>
              <p>Manage your password and account security</p>
            </div>
          </div>

          <div className="security-content">
            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">Password Strength</div>
                <div className="security-item-description">
                  Current password strength: <span className="password-strength strong">{getPasswordStrength()}</span>
                </div>
              </div>
              <div className="password-strength-bar">
                <div className="strength-indicator strong"></div>
              </div>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">Last Password Change</div>
                <div className="security-item-description">
                  Your password was last changed on {getLastPasswordChange()}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                icon={<Key size={16} />}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="security-section">
          <div className="security-section-header">
            <Smartphone className="security-icon" />
            <div>
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
          </div>

          <div className="security-content">
            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">Authenticator App</div>
                <div className="security-item-description">
                  Use an authenticator app to generate verification codes
                </div>
                <div className="security-status">
                  <span className="status-badge disabled">Not Enabled</span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleEnable2FA}
                icon={<Smartphone size={16} />}
              >
                Enable 2FA
              </Button>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">SMS Verification</div>
                <div className="security-item-description">
                  Receive verification codes via SMS
                </div>
                <div className="security-status">
                  <span className="status-badge disabled">Not Available</span>
                </div>
              </div>
              <Button
                variant="outline"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="security-section">
          <div className="security-section-header">
            <Shield className="security-icon" />
            <div>
              <h3>Active Sessions</h3>
              <p>Manage devices that are currently logged into your account</p>
            </div>
          </div>

          <div className="security-content">
            <div className="sessions-list">
              {getLoginSessions().map(session => (
                <div key={session.id} className={`session-item ${session.current ? 'current-session' : ''}`}>
                  <div className="session-info">
                    <div className="session-device">
                      {session.device}
                      {session.current && <span className="current-badge">Current</span>}
                    </div>
                    <div className="session-details">
                      <span className="session-location">{session.location}</span>
                      <span className="session-separator">•</span>
                      <span className="session-time">
                        <Clock size={12} />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleLogoutSession(session.id)}
                    >
                      Log Out
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="sessions-actions">
              <Button
                variant="danger"
                onClick={handleLogoutAllSessions}
                icon={<AlertTriangle size={16} />}
              >
                Log Out All Other Sessions
              </Button>
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="security-section">
          <div className="security-section-header">
            <AlertTriangle className="security-icon" />
            <div>
              <h3>Security Recommendations</h3>
              <p>Improve your account security</p>
            </div>
          </div>

          <div className="security-content">
            <div className="recommendations-list">
              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <Smartphone size={16} />
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-title">Enable Two-Factor Authentication</div>
                  <div className="recommendation-description">
                    Add an extra layer of security to prevent unauthorized access
                  </div>
                </div>
                <div className="recommendation-status">
                  <span className="status-badge warning">Recommended</span>
                </div>
              </div>

              <div className="recommendation-item completed">
                <div className="recommendation-icon">
                  <Key size={16} />
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-title">Strong Password</div>
                  <div className="recommendation-description">
                    Your password meets our security requirements
                  </div>
                </div>
                <div className="recommendation-status">
                  <span className="status-badge success">Complete</span>
                </div>
              </div>

              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <Shield size={16} />
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-title">Review Account Activity</div>
                  <div className="recommendation-description">
                    Regularly check your active sessions and login history
                  </div>
                </div>
                <div className="recommendation-status">
                  <span className="status-badge info">Ongoing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Recovery */}
        <div className="security-section">
          <div className="security-section-header">
            <Key className="security-icon" />
            <div>
              <h3>Account Recovery</h3>
              <p>Options for recovering your account if you lose access</p>
            </div>
          </div>

          <div className="security-content">
            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">Recovery Email</div>
                <div className="security-item-description">
                  {user?.email ? `Recovery emails will be sent to ${user.email}` : 'No recovery email set'}
                </div>
              </div>
              <Button
                variant="outline"
                disabled={!user?.email}
              >
                {user?.email ? 'Verified' : 'Add Email'}
              </Button>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <div className="security-item-title">Recovery Codes</div>
                <div className="security-item-description">
                  Generate backup codes to access your account if you lose your 2FA device
                </div>
              </div>
              <Button
                variant="outline"
                disabled
              >
                Generate Codes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;