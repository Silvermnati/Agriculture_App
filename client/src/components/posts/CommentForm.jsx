import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../../store/slices/postsSlice';

const CommentForm = ({ postId }) => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.posts);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    dispatch(addComment({ postId, commentData: { content } }))
      .unwrap()
      .then(() => {
        setContent(''); 
      })
      .catch((error) => {
        console.error("Failed to add comment:", error);
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