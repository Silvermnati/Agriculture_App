import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toggleLike } from '../../store/slices/postsSlice';
import { Heart, MessageCircle } from 'lucide-react';


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
        className={`flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors duration-300 ${isLiked ? 'text-red-600' : ''}`}
        aria-label="Like post"
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 2 : 1.5} />
        <span className="font-medium">{post.like_count || 0}</span>
      </button>
      <Link
        to={`/posts/${post.id || post.post_id}#comments`}
        className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors duration-300"
      >
        <MessageCircle size={16} />
        <span className="font-medium">{post.comment_count || 0}</span>
      </Link>
    </>
  );
};

export default PostInteraction;