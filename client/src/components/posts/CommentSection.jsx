// components/Posts/CommentSection.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Image from '../common/Image/Image';
import './posts.css'; // Ensure this CSS file is updated

const CommentItem = ({ comment, onReplySubmit, level = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    // Call the handler passed from the parent
    onReplySubmit(replyText, comment.comment_id);
    setReplyText('');
    setShowReply(false);
  };

  return (
    <div className="comment-item" style={{ marginLeft: `${level * 20}px` }}>
      <div className="comment-header">
        <Image 
          src={comment.user?.avatar_url} 
          alt={comment.user?.name || 'Anonymous'} 
          className="avatar" 
          fallbackType="avatar"
        />
        <div>
          <strong>{comment.user?.name || 'Anonymous'}</strong>
          <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
      </div>

      <p className="comment-content">{comment.content}</p>
      <button onClick={() => setShowReply(!showReply)}>Reply</button>

      {showReply && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
          <button type="submit">Post Reply</button>
        </form>
      )}

      <div className="replies">
        {comment.replies?.map(reply => (
          <CommentItem key={reply.comment_id} comment={reply} onReplySubmit={onReplySubmit} level={level + 1} />
        ))}
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  onReplySubmit: PropTypes.func.isRequired,
  level: PropTypes.number,
};

const CommentSection = ({ comments = [], onCommentSubmit }) => {
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // Submit a top-level comment (parent_comment_id is null)
    onCommentSubmit(newComment, null);
    setNewComment('');
  };

  return (
    <div className="comment-section">
      <h2>Comments ({comments.length})</h2>
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." />
        <button type="submit">Post Comment</button>
      </form>
      <div className="comment-list">
        {comments.map(comment => (
          <CommentItem key={comment.comment_id} comment={comment} onReplySubmit={onCommentSubmit} />
        ))}
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  comments: PropTypes.array.isRequired,
  onCommentSubmit: PropTypes.func.isRequired,
};

export default CommentSection;