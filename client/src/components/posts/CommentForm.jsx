import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../../store/slices/postsSlice';

const CommentForm = ({ postId }) => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.posts);
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Check authentication before submitting
    if (!isAuthenticated) {
      alert('Please log in to add a comment');
      return;
    }

    console.log('Submitting comment:', { postId, content, user: user?.user_id });
    console.log('Auth state:', { isAuthenticated, token: localStorage.getItem('token') ? 'Present' : 'Missing' });
    
    dispatch(addComment({ postId, commentData: { content } }))
      .unwrap()
      .then(() => {
        setContent(''); 
        console.log('Comment added successfully');
      })
      .catch((error) => {
        console.error("Failed to add comment:", error);
        if (error.includes('Authentication') || error.includes('401') || error.includes('Unauthorized')) {
          alert('Your session has expired. Please log in again.');
        } else {
          alert('Failed to add comment. Please try again.');
        }
      });
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
};

export default CommentForm;