import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
=======
import { useSelector } from 'react-redux';
import PostCard from './PostCard';
>>>>>>> dc6beeb0b98745dd463c3cde4e146e2767f2abff
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import Image from '../common/Image/Image';

const PostList = ({ 
<<<<<<< HEAD
  posts, 
  isLoading, 
  showActions, 
  onDelete, 
  onEdit, // You can wire this up next
  emptyMessage = "No posts found.",
  emptySubMessage = "Try adjusting your filters."
}) => {
  if (isLoading && (!posts || posts.length === 0)) {
    return <LoadingSpinner text="Loading posts..." />;
  }

  if (!isLoading && (!posts || posts.length === 0)) {
=======
  isLoading = false, 
  showActions = true,
  emptyMessage = "No posts found",
  emptySubMessage = "Be the first to share your agricultural knowledge!"
}) => {
  const posts = useSelector(state => state.posts.posts);

  if (isLoading) {
>>>>>>> dc6beeb0b98745dd463c3cde4e146e2767f2abff
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg mt-8">
        <h3 className="text-xl font-semibold text-gray-700">{emptyMessage}</h3>
        <p className="text-gray-500 mt-2">{emptySubMessage}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {posts.map((post) => (
        <div key={post.id} className="post-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
          <Link to={`/posts/${post.id}`} className="block">
            <Image 
              src={post.featured_image_url} 
              alt={post.title} 
              className="w-full h-48 object-cover"
              fallbackType="post"
            />
          </Link>
          <div className="p-4 flex-grow flex flex-col">
            <p className="text-sm text-gray-500 mb-1">{post.category?.name || 'Uncategorized'}</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow">
              <Link to={`/posts/${post.id}`} className="hover:text-green-600">{post.title}</Link>
            </h3>
            <div className="text-sm text-gray-600 mb-4 flex items-center justify-between">
              <span>{formatDate(post.published_at || post.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {post.view_count || 0}</span>
            </div>
            {showActions && (
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                <Link 
                  to={`/posts/edit/${post.id}`} 
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit Post"
                  onClick={(e) => onEdit ? onEdit(post.id) : e.preventDefault()}
                >
                  <Edit size={18} />
                </Link>
                <button 
                  onClick={() => onDelete(post.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete Post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
