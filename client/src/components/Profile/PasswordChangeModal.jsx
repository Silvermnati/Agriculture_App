import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Key, Check, X, AlertCircle } from 'lucide-react';
import { 
  changePassword, 
  setShowPasswordModal, 
  updatePasswordForm 
} from '../../store/slices/profileSlice';
import { VALIDATION } from '../../utils/constants';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './PasswordChangeModal.css';

const PasswordChangeModal = () => {
  const dispatch = useDispatch();
  const { 
    showPasswordModal, 
    passwordForm, 
    isChangingPassword 
  } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const validatePassword = (password) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
      feedback.push({ type: 'success', text: 'At least 8 characters' });
    } else {
      feedback.push({ type: 'error', text: 'At least 8 characters required' });
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push({ type: 'success', text: 'Contains uppercase letter' });
    } else {
      feedback.push({ type: 'error', text: 'Add uppercase letter' });
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push({ type: 'success', text: 'Contains lowercase letter' });
    } else {
      feedback.push({ type: 'error', text: 'Add lowercase letter' });
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
      feedback.push({ type: 'success', text: 'Contains number' });
    } else {
      feedback.push({ type: 'error', text: 'Add number' });
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback.push({ type: 'success', text: 'Contains special character' });
    } else {
      feedback.push({ type: 'info', text: 'Add special character (optional)' });
    }

    return { score, feedback };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Update password strength for new password
    if (field === 'new_password') {
      setPasswordStrength(validatePassword(value));
    }

    // Validate confirm password
    if (field === 'confirm_password' || (field === 'new_password' && formData.confirm_password)) {
      const newPassword = field === 'new_password' ? value : formData.new_password;
      const confirmPassword = field === 'confirm_password' ? value : formData.confirm_password;
      
      if (confirmPassword && newPassword !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirm_password: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirm_password: undefined
        }));
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password required
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    // New password validation
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (!VALIDATION.PASSWORD.PATTERN.test(formData.new_password)) {
      newErrors.new_password = VALIDATION.PASSWORD.MESSAGE;
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Check if new password is different from current
    if (formData.current_password && formData.new_password && 
        formData.current_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(changePassword(formData)).unwrap();
      handleClose();
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleClose = () => {
    dispatch(setShowPasswordModal(false));
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setErrors({});
    setPasswordStrength({ score: 0, feedback: [] });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const getStrengthColor = (score) => {
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  };

  const getStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  };

  if (!showPasswordModal) return null;

  return (
    <Modal
      isOpen={showPasswordModal}
      onClose={handleClose}
      title="Change Password"
      size="medium"
      className="password-change-modal"
    >
      <div className="password-modal-content">
        {isChangingPassword ? (
          <div className="password-loading">
            <LoadingSpinner text="Changing password..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="password-form">
            {/* Current Password */}
            <div className="form-field">
              <label className="form-label">
                Current Password <span className="required">*</span>
              </label>
              <div className="password-input-group">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => handleInputChange('current_password', e.target.value)}
                  className={`form-input ${errors.current_password ? 'form-input-error' : ''}`}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.current_password && (
                <span className="form-error">{errors.current_password}</span>
              )}
            </div>

            {/* New Password */}
            <div className="form-field">
              <label className="form-label">
                New Password <span className="required">*</span>
              </label>
              <div className="password-input-group">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  className={`form-input ${errors.new_password ? 'form-input-error' : ''}`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password && (
                <span className="form-error">{errors.new_password}</span>
              )}

              {/* Password Strength Indicator */}
              {formData.new_password && (
                <div className="password-strength">
                  <div className="strength-header">
                    <span className="strength-label">Password Strength:</span>
                    <span className={`strength-text ${getStrengthColor(passwordStrength.score)}`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="strength-feedback">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className={`feedback-item ${item.type}`}>
                        {item.type === 'success' ? (
                          <Check size={12} />
                        ) : item.type === 'error' ? (
                          <X size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label className="form-label">
                Confirm New Password <span className="required">*</span>
              </label>
              <div className="password-input-group">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  className={`form-input ${errors.confirm_password ? 'form-input-error' : ''}`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && (
                <span className="form-error">{errors.confirm_password}</span>
              )}
            </div>

            {/* Security Tips */}
            <div className="security-tips">
              <h4>Password Security Tips:</h4>
              <ul>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Include a mix of letters, numbers, and symbols</li>
                <li>Avoid using personal information</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
          </form>
        )}
      </div>

      <div className="modal-actions">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isChangingPassword}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isChangingPassword || Object.keys(errors).length > 0}
          icon={<Key size={16} />}
        >
          {isChangingPassword ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </Modal>
  );
};

export default PasswordChangeModal;