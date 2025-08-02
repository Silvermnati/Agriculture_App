import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { deletePost } from '../../store/slices/postsSlice';


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
    <div className="relative">
      <button 
        className="text-gray-500 hover:text-gray-700"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Post actions"
      >
        <MoreVertical size={20} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleEdit}
              disabled={isLoading}
            >
              <Edit size={16} className="mr-3" />
              Edit Post
            </button>
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDeleteClick}
              disabled={isLoading}
            >
              <Trash2 size={16} className="mr-3" />
              Delete Post
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">Delete Post</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete "{post.title}"? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
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
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PostActions;