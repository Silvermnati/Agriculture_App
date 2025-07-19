import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../store/authSlice';
import './Auth.css';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    farm_size: '',
    farming_experience: '',
    farming_type: '',
    specializations: [],
    years_experience: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        farm_size: user.farm_size || '',
        farming_experience: user.farming_experience || '',
        farming_type: user.farming_type || '',
        specializations: user.specializations || [],
        years_experience: user.years_experience || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'specializations') {
      const currentSpecializations = formData.specializations;
      if (checked) {
        setFormData(prev => ({
          ...prev,
          specializations: [...currentSpecializations, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          specializations: currentSpecializations.filter(spec => spec !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field error and success message when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(clearError());
    setSuccessMessage('');
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Error is handled by Redux
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Profile Settings</h2>
          <p>Update your agricultural profile information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
                    {error && (
                      <div className="error-message">
                        {error}
                      </div>
                    )}
          
                    {/* Add your form fields here */}
          
                  </form>
                </div>
              </div>
            );
          };
          
          export default ProfileForm;
          
          