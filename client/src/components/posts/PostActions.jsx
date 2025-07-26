import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { deletePost } from '../../store/slices/postsSlice';
import './PostActions.css';

const PostActions = ({ post, onEdit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.posts);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current user can edit/delete this post
  const canManagePost = user && (
    user.id === post.author?.user_id || 
    user.id === post.author_id ||
    user.role === 'admin'
  );

  if (!canManagePost) {
    return null;
  }

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(post);
    } else {
      // Navigate to edit page
      navigate(`/posts/${post.id || post.post_id}/edit`);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePost(post.id || post.post_id)).unwrap();
      setShowDeleteConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="post-actions">
      <button 
        className="post-actions-trigger"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Post actions"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <div className="post-actions-menu">
          <button 
            className="post-action-item edit"
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Edit size={16} />
            Edit Post
          </button>
          <button 
            className="post-action-item delete"
            onClick={handleDeleteClick}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            Delete Post
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete "{post.title}"? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="post-actions-backdrop"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PostActions;