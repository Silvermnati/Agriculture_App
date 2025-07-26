import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toggleLike } from '../../store/slices/postsSlice';
import { Heart, MessageCircle } from 'lucide-react';
import './PostInteraction.css';

const PostInteraction = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  // Use the general post loading state for now
  const { isLoading } = useSelector(state => state.posts);

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Prevents navigating to post details if the card is a link
    if (!isAuthenticated) {
      navigate('/login'); // Prompt non-logged-in users to sign in
      return;
    }
    // Use post.id or post.post_id, whichever is available
    const postId = post.id || post.post_id;
    dispatch(toggleLike(postId));
  };

  // The property from your Redux state is `userHasLiked`
  const isLiked = post.userHasLiked;

  return (
    <>
      <button
        onClick={handleLikeClick}
        disabled={isLoading}
        className={`interaction-button like-button ${isLiked ? 'liked' : ''}`}
        aria-label="Like post"
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 2 : 1.5} />
        <span className="count">{post.like_count || 0}</span>
      </button>
      <Link
        to={`/posts/${post.id || post.post_id}#comments`}
        className="interaction-button comment-info"
      >
        <MessageCircle size={16} />
        <span className="count">{post.comment_count || 0}</span>
      </Link>
    </>
  );
};

export default PostInteraction;