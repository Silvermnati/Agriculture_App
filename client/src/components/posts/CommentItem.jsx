import React from 'react';
import Image from '../common/Image/Image';

const CommentItem = ({ comment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const author = comment.author || comment.user; 

  return (
    <div className="comment-item">
      <div className="comment-header">
        <Image 
          src={author?.avatar_url}
          alt={author?.name || 'User'}
          className="avatar"
          fallbackType="avatar"
        />
        <strong>{author?.name || 'Anonymous User'}</strong>
        <span className="comment-date">{formatDate(comment.created_at)}</span>
      </div>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
};

export default CommentItem;