import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getProfileCompletionPercentage, needsProfileCompletion } from '../../utils/userDataAdapter';
import './ProfileCompletionIndicator.css';

const ProfileCompletionIndicator = ({ user, onEditClick }) => {
  if (!user) return null;

  const completionPercentage = getProfileCompletionPercentage(user);
  const needsCompletion = needsProfileCompletion(user);

  if (completionPercentage >= 90) {
    return (
      <div className="profile-completion-indicator complete">
        <CheckCircle size={16} />
        <span>Profile Complete</span>
      </div>
    );
  }

  return (
    <div className="profile-completion-indicator incomplete">
      <div className="completion-header">
        <AlertCircle size={16} />
        <span>Complete your profile ({completionPercentage}%)</span>
      </div>
      
      <div className="completion-bar">
        <div 
          className="completion-fill"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      <div className="completion-actions">
        <button 
          onClick={onEditClick}
          className="completion-button"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionIndicator;