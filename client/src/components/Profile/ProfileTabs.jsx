import React from 'react';
import { User, Edit, Settings, Shield, Award, AlertCircle } from 'lucide-react';
import './ProfileTabs.css';

const ProfileTabs = ({ 
  activeTab, 
  onTabChange, 
  userRole, 
  isExpert, 
  hasUnsavedChanges = false 
}) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <User size={18} />,
      description: 'View your profile information'
    },
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: <Edit size={18} />,
      description: 'Update your personal information',
      badge: hasUnsavedChanges ? 'unsaved' : null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
      description: 'Manage your account preferences'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield size={18} />,
      description: 'Password and security settings'
    }
  ];

  // Add expert tab if user is an expert or can become one
  if (isExpert || userRole !== 'expert') {
    tabs.push({
      id: 'expert',
      label: isExpert ? 'Expert Profile' : 'Become Expert',
      icon: <Award size={18} />,
      description: isExpert ? 'Manage your expert profile' : 'Apply to become an expert',
      highlight: !isExpert
    });
  }

  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return;
    onTabChange(tabId);
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  return (
    <div className="profile-tabs">
      <div className="profile-tabs-container">
        <div className="profile-tabs-list" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              className={`profile-tab ${
                activeTab === tab.id ? 'profile-tab-active' : ''
              } ${tab.highlight ? 'profile-tab-highlight' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              title={tab.description}
            >
              <div className="profile-tab-content">
                <div className="profile-tab-icon">
                  {tab.icon}
                </div>
                <span className="profile-tab-label">{tab.label}</span>
                
                {tab.badge && (
                  <div className={`profile-tab-badge profile-tab-badge-${tab.badge}`}>
                    {tab.badge === 'unsaved' && (
                      <>
                        <AlertCircle size={12} />
                        <span className="profile-tab-badge-text">Unsaved</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mobile description */}
              <div className="profile-tab-description">
                {tab.description}
              </div>
            </button>
          ))}
        </div>
        
        {/* Tab indicator */}
        <div 
          className="profile-tabs-indicator"
          style={{
            transform: `translateX(${tabs.findIndex(tab => tab.id === activeTab) * 100}%)`
          }}
        />
      </div>
      
      {/* Mobile tab selector */}
      <div className="profile-tabs-mobile">
        <select
          value={activeTab}
          onChange={(e) => handleTabClick(e.target.value)}
          className="profile-tabs-select"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.badge === 'unsaved' ? ' (Unsaved Changes)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProfileTabs;