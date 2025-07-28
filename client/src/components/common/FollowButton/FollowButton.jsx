import React, { useState, useEffect } from 'react';
import { followAPI } from '../../../utils/api';
import { useSelector } from 'react-redux';
import './FollowButton.css';

const FollowButton = ({ 
  userId, 
  initialFollowState = false, 
  showStats = true,
  size = 'medium' 
}) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const currentUser = useSelector(state => state.auth.user);
  const isOwnProfile = currentUser?.user_id === userId;

  useEffect(() => {
    if (showStats) {
      fetchFollowStats();
    }
  }, [userId, showStats]);

  const fetchFollowStats = async () => {
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        followAPI.getFollowers(userId, { count_only: true }),
        followAPI.getFollowing(userId, { count_only: true })
      ]);
      
      setFollowersCount(followersResponse.data.count || 0);
      setFollowingCount(followingResponse.data.count || 0);
    } catch (err) {
      console.error('Error fetching follow stats:', err);
    }
  };

  const fetchFollowersList = async () => {
    try {
      setLoading(true);
      const response = await followAPI.getFollowers(userId);
      setFollowers(response.data.followers || []);
    } catch (err) {
      console.error('Error fetching followers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingList = async () => {
    try {
      setLoading(true);
      const response = await followAPI.getFollowing(userId);
      setFollowing(response.data.following || []);
    } catch (err) {
      console.error('Error fetching following:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (loading || isOwnProfile) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(userId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await followAPI.followUser(userId);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert optimistic update on error
      setIsFollowing(!isFollowing);
    } finally {
      setLoading(false);
    }
  };

  const handleShowFollowers = () => {
    setShowFollowersList(true);
    fetchFollowersList();
  };

  const handleShowFollowing = () => {
    setShowFollowingList(true);
    fetchFollowingList();
  };

  const getButtonClass = () => {
    let className = `follow-button ${size}`;
    if (loading) {
      className += ' pending';
    } else if (isFollowing) {
      className += ' unfollow';
    } else {
      className += ' follow';
    }
    return className;
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <div className="loading-spinner"></div>
          <span className="follow-button-text">
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </span>
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          <svg className="follow-button-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="follow-button-text">Following</span>
        </>
      );
    }

    return (
      <>
        <svg className="follow-button-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        <span className="follow-button-text">Follow</span>
      </>
    );
  };

  const FollowListModal = ({ isOpen, onClose, title, users, loading }) => {
    if (!isOpen) return null;

    return (
      <div className="follow-list-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="follow-list-content">
          <div className="follow-list-header">
            <h3 className="follow-list-title">{title}</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="follow-list">
            {loading ? (
              <div className="loading-follow-list">
                <div className="loading-spinner"></div>
                <div>Loading {title.toLowerCase()}...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-follow-list">
                <svg className="empty-follow-list-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="empty-follow-list-title">No {title.toLowerCase()} yet</div>
                <div className="empty-follow-list-message">
                  {title === 'Followers' 
                    ? 'No one is following this user yet.' 
                    : 'This user is not following anyone yet.'
                  }
                </div>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.user_id} className="follow-list-item">
                  <div className="follow-list-avatar">
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt={user.full_name} />
                    ) : (
                      <svg className="follow-list-avatar-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="follow-list-info">
                    <div className="follow-list-name">{user.full_name}</div>
                    <div className="follow-list-username">@{user.username}</div>
                    {user.bio && (
                      <div className="follow-list-bio">{user.bio}</div>
                    )}
                  </div>
                  
                  <div className="follow-list-actions">
                    <a 
                      href={`/profile/${user.user_id}`} 
                      className="follow-list-btn secondary"
                    >
                      View Profile
                    </a>
                    {user.user_id !== currentUser?.user_id && (
                      <FollowButton 
                        userId={user.user_id} 
                        initialFollowState={user.is_following}
                        showStats={false}
                        size="small"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isOwnProfile) {
    return showStats ? (
      <div className="follow-stats">
        <div className="follow-stat" onClick={handleShowFollowers}>
          <div className="follow-stat-number">{followersCount}</div>
          <div className="follow-stat-label">Followers</div>
        </div>
        <div className="follow-stat" onClick={handleShowFollowing}>
          <div className="follow-stat-number">{followingCount}</div>
          <div className="follow-stat-label">Following</div>
        </div>
        
        <FollowListModal
          isOpen={showFollowersList}
          onClose={() => setShowFollowersList(false)}
          title="Followers"
          users={followers}
          loading={loading}
        />
        
        <FollowListModal
          isOpen={showFollowingList}
          onClose={() => setShowFollowingList(false)}
          title="Following"
          users={following}
          loading={loading}
        />
      </div>
    ) : null;
  }

  return (
    <div>
      <button
        className={getButtonClass()}
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {getButtonContent()}
      </button>

      {isFollowing && (
        <div className="follow-notification-toggle">
          <label className="notification-toggle">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            <span className="notification-slider"></span>
          </label>
          <span>Get notifications</span>
        </div>
      )}

      {showStats && (
        <div className="follow-stats">
          <div className="follow-stat" onClick={handleShowFollowers}>
            <div className="follow-stat-number">{followersCount}</div>
            <div className="follow-stat-label">Followers</div>
          </div>
          <div className="follow-stat" onClick={handleShowFollowing}>
            <div className="follow-stat-number">{followingCount}</div>
            <div className="follow-stat-label">Following</div>
          </div>
        </div>
      )}

      <FollowListModal
        isOpen={showFollowersList}
        onClose={() => setShowFollowersList(false)}
        title="Followers"
        users={followers}
        loading={loading}
      />
      
      <FollowListModal
        isOpen={showFollowingList}
        onClose={() => setShowFollowingList(false)}
        title="Following"
        users={following}
        loading={loading}
      />
    </div>
  );
};

export default FollowButton;