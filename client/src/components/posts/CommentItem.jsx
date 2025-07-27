import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { commentsAPI } from '../../utils/api';
import Image from '../common/Image/Image';

const CommentItem = ({ comment, onCommentUpdate, onCommentDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [showActions, setShowActions] = useState(false);
  
  const currentUser = useSelector(state => state.auth.user);
  const isAuthor = currentUser?.user_id === comment.user_id;
  const canEdit = isAuthor && !comment.is_deleted;
  const canDelete = isAuthor && !comment.is_deleted;

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

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const response = await commentsAPI.editComment(comment.comment_id, {
        content: editContent.trim()
      });
      
      const updatedComment = {
        ...comment,
        content: editContent.trim(),
        is_edited: true,
        edit_count: (comment.edit_count || 0) + 1,
        last_edited_at: new Date().toISOString()
      };
      
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error editing comment:', err);
      alert('Failed to edit comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setLoading(true);
    try {
      await commentsAPI.deleteComment(comment.comment_id);
      
      if (onCommentDelete) {
        onCommentDelete(comment.comment_id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowEditHistory = async () => {
    try {
      const response = await commentsAPI.getEditHistory(comment.comment_id);
      setEditHistory(response.data.edit_history || []);
      setShowEditHistory(true);
    } catch (err) {
      console.error('Error fetching edit history:', err);
      alert('Failed to load edit history.');
    }
  };

  const cancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const author = comment.author || comment.user;

  if (comment.is_deleted) {
    return (
      <div className="comment-item deleted">
        <div className="comment-content deleted-message">
          <em>This comment has been deleted</em>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <Image 
          src={author?.avatar_url}
          alt={author?.name || 'User'}
          className="avatar"
          fallbackType="avatar"
        />
        <div className="comment-author-info">
          <strong>{author?.name || 'Anonymous User'}</strong>
          <span className="comment-date">
            {formatDate(comment.created_at)}
            {comment.is_edited && (
              <span className="edited-indicator">
                {' • edited'}
                {comment.edit_count > 1 && (
                  <button 
                    className="edit-history-btn"
                    onClick={handleShowEditHistory}
                    title="View edit history"
                  >
                    ({comment.edit_count})
                  </button>
                )}
              </span>
            )}
          </span>
        </div>
        
        {(canEdit || canDelete) && (
          <div className="comment-actions">
            <button 
              className="comment-actions-toggle"
              onClick={() => setShowActions(!showActions)}
              disabled={loading}
            >
              ⋯
            </button>
            
            {showActions && (
              <div className="comment-actions-menu">
                {canEdit && (
                  <button 
                    className="comment-action-btn edit"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button 
                    className="comment-action-btn delete"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="comment-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="comment-edit-textarea"
            rows="3"
            disabled={loading}
          />
          <div className="comment-edit-actions">
            <button 
              className="btn btn-secondary"
              onClick={cancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      {showEditHistory && (
        <EditHistoryModal
          editHistory={editHistory}
          onClose={() => setShowEditHistory(false)}
        />
      )}
    </div>
  );
};

const EditHistoryModal = ({ editHistory, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="edit-history-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="edit-history-content">
        <div className="edit-history-header">
          <h3>Edit History</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="edit-history-list">
          {editHistory.length === 0 ? (
            <div className="no-edit-history">
              <p>No edit history available</p>
            </div>
          ) : (
            editHistory.map((edit, index) => (
              <div key={edit.edit_id} className="edit-history-item">
                <div className="edit-history-meta">
                  <span className="edit-number">Edit #{editHistory.length - index}</span>
                  <span className="edit-date">{formatDate(edit.edited_at)}</span>
                </div>
                
                <div className="edit-changes">
                  {edit.original_content && (
                    <div className="edit-before">
                      <label>Before:</label>
                      <div className="edit-content removed">{edit.original_content}</div>
                    </div>
                  )}
                  
                  <div className="edit-after">
                    <label>After:</label>
                    <div className="edit-content added">{edit.new_content}</div>
                  </div>
                </div>
                
                {edit.edit_reason && (
                  <div className="edit-reason">
                    <label>Reason:</label>
                    <span>{edit.edit_reason}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;