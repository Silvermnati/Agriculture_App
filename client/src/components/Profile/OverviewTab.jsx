import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Twitter, 
  Facebook,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Eye,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import { formatTimeAgo } from '../../utils/timeHelpers';
import './OverviewTab.css';

const OverviewTab = ({ user, stats, recentActivity, isLoadingStats, isLoadingActivity }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLocationString = (location) => {
    if (!location) return null;
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return <MessageSquare size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      case 'community_join': return <Users size={16} />;
      case 'consultation': return <Calendar size={16} />;
      case 'like': return <Heart size={16} />;
      default: return <Clock size={16} />;
    }
  };





  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Personal Information */}
        <div className="overview-card">
          <h3 className="overview-card-title">Personal Information</h3>
          <div className="overview-card-content">
            <div className="info-grid">
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || 'Not provided'}</span>
                </div>
              </div>
              
              {user?.phone && (
                <div className="info-item">
                  <Phone size={16} />
                  <div>
                    <span className="info-label">Phone</span>
                    <span className="info-value">{user.phone}</span>
                  </div>
                </div>
              )}
              
              {user?.location && (
                <div className="info-item">
                  <MapPin size={16} />
                  <div>
                    <span className="info-label">Location</span>
                    <span className="info-value">{getLocationString(user.location)}</span>
                  </div>
                </div>
              )}
              
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{formatDate(user?.created_at)}</span>
                </div>
              </div>
              
              {user?.date_of_birth && (
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{formatDate(user.date_of_birth)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {user?.role === 'farmer' && (
          <div className="overview-card">
            <h3 className="overview-card-title">Farming Information</h3>
            <div className="overview-card-content">
              <div className="info-grid">
                {user.farm_size && (
                  <div className="info-item">
                    <TrendingUp size={16} />
                    <div>
                      <span className="info-label">Farm Size</span>
                      <span className="info-value">
                        {user.farm_size} {user.farm_size_unit || 'hectares'}
                      </span>
                    </div>
                  </div>
                )}
                
                {user.farming_experience && (
                  <div className="info-item">
                    <Clock size={16} />
                    <div>
                      <span className="info-label">Experience</span>
                      <span className="info-value">{user.farming_experience} years</span>
                    </div>
                  </div>
                )}
                
                {user.farming_type && (
                  <div className="info-item">
                    <div className="farming-type-icon">🌱</div>
                    <div>
                      <span className="info-label">Farming Type</span>
                      <span className="info-value">{user.farming_type}</span>
                    </div>
                  </div>
                )}
                
                {user.crops_grown && user.crops_grown.length > 0 && (
                  <div className="info-item crops-item">
                    <div className="crops-icon">🌾</div>
                    <div>
                      <span className="info-label">Crops Grown</span>
                      <div className="crops-list">
                        {user.crops_grown.map((crop, index) => (
                          <span key={index} className="crop-tag">{crop}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expert Information */}
        {user?.role === 'expert' && user?.expert_profile && (
          <div className="overview-card">
            <h3 className="overview-card-title">Expert Information</h3>
            <div className="overview-card-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="expert-icon">👨‍🌾</div>
                  <div>
                    <span className="info-label">Title</span>
                    <span className="info-value">{user.expert_profile.title}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Clock size={16} />
                  <div>
                    <span className="info-label">Experience</span>
                    <span className="info-value">{user.expert_profile.years_experience} years</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="rate-icon">💰</div>
                  <div>
                    <span className="info-label">Hourly Rate</span>
                    <span className="info-value">
                      {user.expert_profile.currency} {user.expert_profile.hourly_rate}
                    </span>
                  </div>
                </div>
                
                {user.expert_profile.specializations && (
                  <div className="info-item specializations-item">
                    <div className="specializations-icon">🎯</div>
                    <div>
                      <span className="info-label">Specializations</span>
                      <div className="specializations-list">
                        {user.expert_profile.specializations.map((spec, index) => (
                          <span key={index} className="specialization-tag">{spec}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {user.expert_profile.languages_spoken && (
                  <div className="info-item">
                    <Globe size={16} />
                    <div>
                      <span className="info-label">Languages</span>
                      <span className="info-value">
                        {user.expert_profile.languages_spoken.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {user?.social_links && Object.values(user.social_links).some(link => link) && (
          <div className="overview-card">
            <h3 className="overview-card-title">Social Links</h3>
            <div className="overview-card-content">
              <div className="social-links">
                {user.social_links.website && (
                  <a 
                    href={user.social_links.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <Globe size={16} />
                    <span>Website</span>
                  </a>
                )}
                
                {user.social_links.linkedin && (
                  <a 
                    href={user.social_links.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn</span>
                  </a>
                )}
                
                {user.social_links.twitter && (
                  <a 
                    href={user.social_links.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <Twitter size={16} />
                    <span>Twitter</span>
                  </a>
                )}
                
                {user.social_links.facebook && (
                  <a 
                    href={user.social_links.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <Facebook size={16} />
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Statistics */}
        <div className="overview-card">
          <h3 className="overview-card-title">Activity Statistics</h3>
          <div className="overview-card-content">
            {isLoadingStats ? (
              <div className="stats-loading">
                <LoadingSpinner text="Loading activity statistics..." />
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <MessageSquare size={20} />
                  <div>
                    <span className="stat-value">{stats?.posts_created || 0}</span>
                    <span className="stat-label">Posts Created</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Users size={20} />
                  <div>
                    <span className="stat-value">{stats?.communities_joined || 0}</span>
                    <span className="stat-label">Communities</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <MessageSquare size={20} />
                  <div>
                    <span className="stat-value">{stats?.comments_made || 0}</span>
                    <span className="stat-label">Comments</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <Heart size={20} />
                  <div>
                    <span className="stat-value">{stats?.likes_received || 0}</span>
                    <span className="stat-label">Likes Received</span>
                  </div>
                </div>
                
                {user?.role === 'expert' && (
                  <div className="stat-item">
                    <Calendar size={20} />
                    <div>
                      <span className="stat-value">{stats?.consultations_given || 0}</span>
                      <span className="stat-label">Consultations</span>
                    </div>
                  </div>
                )}
                
                <div className="stat-item">
                  <Eye size={20} />
                  <div>
                    <span className="stat-value">{stats?.profile_views || 0}</span>
                    <span className="stat-label">Profile Views</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overview-card recent-activity-card">
          <h3 className="overview-card-title">Recent Activity</h3>
          <div className="overview-card-content">
            {isLoadingActivity ? (
              <div className="activity-loading">
                <LoadingSpinner text="Loading recent activity..." />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                    </div>
                    {activity.link && (
                      <a href={activity.link} className="activity-link">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-activity">
                <p>No recent activity to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;