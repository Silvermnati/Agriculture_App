import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Award, Star, Calendar, DollarSign, Globe, Users, TrendingUp } from 'lucide-react';
import { setShowExpertModal } from '../../store/slices/profileSlice';
import Button from '../common/Button/Button';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './ExpertProfileTab.css';

const ExpertProfileTab = ({ user }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.profile);

  const handleBecomeExpert = () => {
    dispatch(setShowExpertModal(true));
  };

  const handleEditExpertProfile = () => {
    // This would open an edit modal for expert profile
    console.log('Edit expert profile');
  };

  const getAvailabilityStatus = (status) => {
    const statusMap = {
      available: { label: 'Available', color: 'success' },
      busy: { label: 'Busy', color: 'warning' },
      unavailable: { label: 'Unavailable', color: 'danger' }
    };
    return statusMap[status] || { label: 'Unknown', color: 'neutral' };
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="star half-filled" />);
      } else {
        stars.push(<Star key={i} size={16} className="star empty" />);
      }
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="expert-profile-tab">
        <LoadingSpinner text="Loading expert profile..." />
      </div>
    );
  }

  // If user is not an expert, show application option
  if (user?.role !== 'expert' || !user?.expert_profile) {
    return (
      <div className="expert-profile-tab">
        <div className="become-expert-section">
          <div className="become-expert-content">
            <div className="become-expert-icon">
              <Award size={48} />
            </div>
            <h2>Become an Agricultural Expert</h2>
            <p>
              Share your knowledge and help farmers around the world. As an expert, you can:
            </p>
            <ul className="benefits-list">
              <li>Provide paid consultations to farmers</li>
              <li>Build your professional reputation</li>
              <li>Connect with a global agricultural community</li>
              <li>Share your expertise through posts and discussions</li>
              <li>Earn income from your agricultural knowledge</li>
            </ul>
            <Button
              variant="primary"
              size="large"
              onClick={handleBecomeExpert}
              icon={<Award size={20} />}
            >
              Apply to Become an Expert
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const expertProfile = user.expert_profile;
  const availabilityStatus = getAvailabilityStatus(expertProfile.availability_status);

  return (
    <div className="expert-profile-tab">
      <div className="expert-profile-content">
        {/* Expert Header */}
        <div className="expert-header">
          <div className="expert-header-main">
            <div className="expert-title-section">
              <h2>{expertProfile.title}</h2>
              <div className="expert-verification">
                {expertProfile.is_verified && (
                  <span className="verified-badge">
                    <Award size={16} />
                    Verified Expert
                  </span>
                )}
                <span className={`availability-badge ${availabilityStatus.color}`}>
                  {availabilityStatus.label}
                </span>
              </div>
            </div>
            
            <div className="expert-rating">
              <div className="rating-stars">
                {renderStarRating(expertProfile.rating)}
              </div>
              <span className="rating-text">
                {expertProfile.rating?.toFixed(1) || '0.0'} ({expertProfile.review_count || 0} reviews)
              </span>
            </div>
          </div>

          <div className="expert-actions">
            <Button
              variant="outline"
              onClick={handleEditExpertProfile}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Expert Stats */}
        <div className="expert-stats-grid">
          <div className="expert-stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expertProfile.consultation_count || 0}</div>
              <div className="stat-label">Consultations</div>
            </div>
          </div>

          <div className="expert-stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expertProfile.rating?.toFixed(1) || '0.0'}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>

          <div className="expert-stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expertProfile.review_count || 0}</div>
              <div className="stat-label">Reviews</div>
            </div>
          </div>

          <div className="expert-stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{expertProfile.years_experience}</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Expert Details */}
        <div className="expert-details-grid">
          {/* Professional Information */}
          <div className="expert-detail-card">
            <h3 className="detail-card-title">Professional Information</h3>
            <div className="detail-items">
              <div className="detail-item">
                <div className="detail-icon">
                  <Award size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Experience</span>
                  <span className="detail-value">{expertProfile.years_experience} years</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <DollarSign size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Hourly Rate</span>
                  <span className="detail-value">
                    {expertProfile.currency} {expertProfile.hourly_rate}
                  </span>
                </div>
              </div>

              {expertProfile.certification && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <Award size={16} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Certification</span>
                    <span className="detail-value">{expertProfile.certification}</span>
                  </div>
                </div>
              )}

              {expertProfile.education && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <Award size={16} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Education</span>
                    <span className="detail-value">{expertProfile.education}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="expert-detail-card">
            <h3 className="detail-card-title">Specializations</h3>
            <div className="specializations-list">
              {expertProfile.specializations?.map((spec, index) => (
                <span key={index} className="specialization-tag">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="expert-detail-card">
            <h3 className="detail-card-title">Languages</h3>
            <div className="languages-list">
              {expertProfile.languages_spoken?.map((language, index) => (
                <div key={index} className="language-item">
                  <Globe size={16} />
                  <span>{language}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          {expertProfile.bio && (
            <div className="expert-detail-card bio-card">
              <h3 className="detail-card-title">Professional Bio</h3>
              <p className="expert-bio">{expertProfile.bio}</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="expert-activity-section">
          <h3>Recent Consultation Activity</h3>
          <div className="activity-placeholder">
            <Calendar size={48} />
            <p>No recent consultations to display</p>
            <small>Your consultation history will appear here</small>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="expert-insights-section">
          <h3>Performance Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-header">
                <h4>This Month</h4>
                <TrendingUp size={20} />
              </div>
              <div className="insight-stats">
                <div className="insight-stat">
                  <span className="insight-value">0</span>
                  <span className="insight-label">Consultations</span>
                </div>
                <div className="insight-stat">
                  <span className="insight-value">$0</span>
                  <span className="insight-label">Earnings</span>
                </div>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <h4>Response Time</h4>
                <Calendar size={20} />
              </div>
              <div className="insight-stats">
                <div className="insight-stat">
                  <span className="insight-value">N/A</span>
                  <span className="insight-label">Avg Response</span>
                </div>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <h4>Client Satisfaction</h4>
                <Star size={20} />
              </div>
              <div className="insight-stats">
                <div className="insight-stat">
                  <span className="insight-value">{expertProfile.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="insight-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileTab;