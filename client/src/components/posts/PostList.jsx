import React from 'react';
import { useSelector } from 'react-redux';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './posts.css';

const PostList = ({ 
  isLoading = false, 
  showActions = true,
  emptyMessage = "No posts found",
  emptySubMessage = "Be the first to share your agricultural knowledge!"
}) => {
  const posts = useSelector(state => state.posts.posts);

  if (isLoading) {
    return (
      <div className="post-list-loading">
        <LoadingSpinner text="Loading posts..." />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="post-list-empty">
        <div className="empty-state">
          <h3>{emptyMessage}</h3>
          <p>{emptySubMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-list-grid">
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