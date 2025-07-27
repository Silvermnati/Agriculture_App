import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const CommentSection = ({ postId, comments }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <section id="comments" className="comment-section">
      <h2>Comments ({comments?.length || 0})</h2>
      {isAuthenticated ? (
        <CommentForm postId={postId} />
      ) : (
        <p>Please <Link to="/login">log in</Link> to post a comment.</p>
      )}
      <div className="comment-list">
        {comments && comments.length > 0 ? (
          comments.map(comment => <CommentItem key={comment.comment_id || comment.id} comment={comment} />)
        ) : (
          <p>No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;