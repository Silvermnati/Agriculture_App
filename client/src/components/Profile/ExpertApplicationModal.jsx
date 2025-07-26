import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Award, DollarSign, Globe, FileText, User } from 'lucide-react';
import { 
  createExpertProfile, 
  setShowExpertModal, 
  updateExpertForm 
} from '../../store/slices/profileSlice';
import { EXPERT_SPECIALIZATIONS, LANGUAGES, CURRENCIES } from '../../utils/constants';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import FileUpload from '../common/FileUpload/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './ExpertApplicationModal.css';

const ExpertApplicationModal = () => {
  const dispatch = useDispatch();
  const { 
    showExpertModal, 
    expertForm, 
    isCreatingExpert 
  } = useSelector((state) => state.profile);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    specializations: [],
    certification: '',
    certification_file: null,
    education: '',
    years_experience: '',
    hourly_rate: '',
    currency: 'USD',
    languages_spoken: ['English'],
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const totalSteps = 4;

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title.trim()) {
          newErrors.title = 'Professional title is required';
        }
        if (selectedSpecializations.length === 0) {
          newErrors.specializations = 'At least one specialization is required';
        }
        if (!formData.years_experience || formData.years_experience < 1) {
          newErrors.years_experience = 'Years of experience must be at least 1';
        }
        break;

      case 2: // Qualifications
        if (!formData.education.trim()) {
          newErrors.education = 'Education background is required';
        }
        break;

      case 3: // Rates & Languages
        if (!formData.hourly_rate || formData.hourly_rate < 1) {
          newErrors.hourly_rate = 'Hourly rate must be greater than 0';
        }
        if (formData.languages_spoken.length === 0) {
          newErrors.languages_spoken = 'At least one language is required';
        }
        break;

      case 4: // Bio
        if (!formData.bio.trim()) {
          newErrors.bio = 'Professional bio is required';
        } else if (formData.bio.length < 50) {
          newErrors.bio = 'Bio must be at least 50 characters';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  };

  const handleSpecializationToggle = (specialization) => {
    setSelectedSpecializations(prev => {
      if (prev.includes(specialization)) {
        return prev.filter(s => s !== specialization);
      } else {
        return [...prev, specialization];
      }
    });

    // Clear specializations error
    if (errors.specializations) {
      setErrors(prev => ({
        ...prev,
        specializations: undefined
      }));
    }
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages_spoken: prev.languages_spoken.includes(language)
        ? prev.languages_spoken.filter(l => l !== language)
        : [...prev.languages_spoken, language]
    }));

    // Clear languages error
    if (errors.languages_spoken) {
      setErrors(prev => ({
        ...prev,
        languages_spoken: undefined
      }));
    }
  };

  const handleCertificationUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      certification_file: file
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Update specializations in form data
        setFormData(prev => ({
          ...prev,
          specializations: selectedSpecializations
        }));
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const submitData = {
      ...formData,
      specializations: selectedSpecializations,
      years_experience: parseInt(formData.years_experience),
      hourly_rate: parseFloat(formData.hourly_rate)
    };

    try {
      await dispatch(createExpertProfile(submitData)).unwrap();
      dispatch(setShowExpertModal(false));
    } catch (error) {
      console.error('Failed to create expert profile:', error);
    }
  };

  const handleClose = () => {
    dispatch(setShowExpertModal(false));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="expert-form-step">
            <div className="step-header">
              <User className="step-icon" />
              <div>
                <h3>Basic Information</h3>
                <p>Tell us about your professional background</p>
              </div>
            </div>

            <div className="form-fields">
              <Input
                id="title"
                name="title"
                label="Professional Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                placeholder="e.g., Senior Agricultural Consultant"
                required
              />

              <Input
                id="years_experience"
                name="years_experience"
                label="Years of Experience"
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleInputChange('years_experience', e.target.value)}
                error={errors.years_experience}
                min="1"
                max="50"
                required
              />

              <div className="form-field">
                <label className="form-label">
                  Specializations <span className="required">*</span>
                </label>
                <div className="specializations-grid">
                  {EXPERT_SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      className={`specialization-tag ${
                        selectedSpecializations.includes(spec) ? 'selected' : ''
                      }`}
                      onClick={() => handleSpecializationToggle(spec)}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
                {errors.specializations && (
                  <span className="form-error">{errors.specializations}</span>
                )}
                <div className="form-help">
                  Select all areas where you have expertise
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="expert-form-step">
            <div className="step-header">
              <Award className="step-icon" />
              <div>
                <h3>Qualifications</h3>
                <p>Share your educational background and certifications</p>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">
                  Education Background <span className="required">*</span>
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className={`form-textarea ${errors.education ? 'form-textarea-error' : ''}`}
                  rows={4}
                  placeholder="Describe your educational background, degrees, and relevant coursework..."
                  required
                />
                {errors.education && <span className="form-error">{errors.education}</span>}
              </div>

              <Input
                id="certification"
                name="certification"
                label="Certification/License"
                value={formData.certification}
                onChange={(e) => handleInputChange('certification', e.target.value)}
                placeholder="e.g., Certified Crop Advisor (CCA)"
              />

              <div className="form-field">
                <label className="form-label">Certification Document</label>
                <FileUpload
                  onUploadSuccess={(url, file) => handleCertificationUpload(file.originalFile)}
                  acceptedTypes="image/*,.pdf"
                  maxSize={5 * 1024 * 1024}
                  className="certification-upload"
                >
                  <div className="upload-area">
                    <Upload size={24} />
                    <span>Upload certification document</span>
                    <small>PDF or image files, max 5MB</small>
                  </div>
                </FileUpload>
                {formData.certification_file && (
                  <div className="uploaded-file">
                    <FileText size={16} />
                    <span>{formData.certification_file.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="expert-form-step">
            <div className="step-header">
              <DollarSign className="step-icon" />
              <div>
                <h3>Rates & Languages</h3>
                <p>Set your consultation rates and language preferences</p>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">
                  Hourly Rate <span className="required">*</span>
                </label>
                <div className="input-group">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="form-select"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                    className={`form-input ${errors.hourly_rate ? 'form-input-error' : ''}`}
                    placeholder="0"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                {errors.hourly_rate && <span className="form-error">{errors.hourly_rate}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">
                  Languages Spoken <span className="required">*</span>
                </label>
                <div className="languages-grid">
                  {LANGUAGES.map(language => (
                    <button
                      key={language}
                      type="button"
                      className={`language-tag ${
                        formData.languages_spoken.includes(language) ? 'selected' : ''
                      }`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                {errors.languages_spoken && (
                  <span className="form-error">{errors.languages_spoken}</span>
                )}
                <div className="form-help">
                  Select all languages you can provide consultations in
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="expert-form-step">
            <div className="step-header">
              <FileText className="step-icon" />
              <div>
                <h3>Professional Bio</h3>
                <p>Write a compelling bio to attract clients</p>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-field">
                <label className="form-label">
                  Professional Bio <span className="required">*</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`form-textarea ${errors.bio ? 'form-textarea-error' : ''}`}
                  rows={6}
                  placeholder="Write a detailed bio highlighting your expertise, experience, and what makes you unique as an agricultural expert..."
                  required
                />
                {errors.bio && <span className="form-error">{errors.bio}</span>}
                <div className="form-help">
                  {formData.bio.length}/500 characters (minimum 50 required)
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!showExpertModal) return null;

  return (
    <Modal
      isOpen={showExpertModal}
      onClose={handleClose}
      title="Become an Expert"
      size="large"
      className="expert-application-modal"
    >
      <div className="expert-modal-content">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-steps">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i + 1}
                className={`progress-step ${
                  i + 1 <= currentStep ? 'active' : ''
                } ${i + 1 < currentStep ? 'completed' : ''}`}
              >
                <span className="step-number">{i + 1}</span>
              </div>
            ))}
          </div>
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="modal-body">
          {isCreatingExpert ? (
            <div className="creating-expert">
              <LoadingSpinner text="Creating your expert profile..." />
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            disabled={isCreatingExpert}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isCreatingExpert}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isCreatingExpert}
            >
              {isCreatingExpert ? 'Creating...' : 'Create Expert Profile'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExpertApplicationModal;