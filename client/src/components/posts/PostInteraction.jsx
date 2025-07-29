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
  const { isLoading } = useSelector(state => state.posts);

  const handleLikeClick = async (e) => {
    e.stopPropagation(); 
    if (!isAuthenticated) {
      navigate('/login'); 
      return;
    }
    const postId = post.id || post.post_id;
    try {
      await dispatch(toggleLike(postId)).unwrap();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const isLiked = post.userHasLiked || false;

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