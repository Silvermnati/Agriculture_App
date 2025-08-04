import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { deleteComment } from "../../store/slices/postsSlice";

const CommentSection = ({ postId, comments }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  return (
    <section id="comments" className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments ({comments?.length || 0})</h2>
      {isAuthenticated ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="text-gray-600">Please <Link to="/login" className="text-green-600 hover:underline">log in</Link> to post a comment.</p>
      )}
      <div className="mt-6 space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment, index) => {
            // Generate a more robust key that handles temporary states
            // Use created_at timestamp or content hash as fallback instead of Date.now()
            const fallbackKey = `temp-comment-${index}-${comment.created_at || comment.content?.substring(0, 20) || 'unknown'}`;
            const key = comment.comment_id || comment.id || fallbackKey;
            
            // Debug logging to help identify the issue
            if (!comment.comment_id && !comment.id) {
              console.warn('Comment without ID found:', comment, 'Using fallback key:', fallbackKey);
            }
            
            return (
              <CommentItem 
                key={key} 
                comment={comment} 
                onDelete={(commentId) => dispatch(deleteComment({ postId, commentId }))}
              />
            );
          })
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
};

export default CommentSection;