import React from 'react';
import { useSelector } from 'react-redux';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';


const PostList = ({ 
  isLoading = false, 
  showActions = true,
  emptyMessage = "No posts found",
  emptySubMessage = "Be the first to share your agricultural knowledge!"
}) => {
  const posts = useSelector(state => state.posts.posts);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner text="Loading posts..." />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <PostCard 
          key={post.id || post.post_id} 
          post={post} 
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default PostList;