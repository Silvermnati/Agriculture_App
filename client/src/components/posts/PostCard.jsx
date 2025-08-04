import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import PostActions from './PostActions';
import PostInteraction from './PostInteraction';
import ProfilePicture from '../Profile/ProfilePicture';
import FollowButton from '../common/FollowButton/FollowButton';
import Image from '../common/Image/Image';


const PostCard = ({ post, showActions = true }) => {
  const currentUser = useSelector(state => state.auth.user);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const postId = post.id || post.post_id;
  const isOwnPost = currentUser?.user_id === post.author?.user_id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <Link to={`/posts/${postId}`}>
          <Image 
            src={post.featured_image_url} 
            alt={post.title}
            className="w-full h-52 object-cover"
            fallbackType="post"
            optimize={true}
          />
        </Link>
        <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {post.category?.name}
        </span>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{formatDate(post.published_at)}</span>
          {post.read_time && 
            <>
              <span className="mx-2">•</span>
              <span>{post.read_time} min read</span>
            </>
          }
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-700 transition-colors duration-300">
          <Link to={`/posts/${postId}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-700 mb-4 flex-grow">{post.excerpt}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors duration-300">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center mt-auto">
          <div className="flex-shrink-0">
            <ProfilePicture 
              imageUrl={post.author?.avatar_url} 
              userName={post.author?.name || 'Anonymous'}
              size="small"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{post.author?.name || 'Anonymous'}</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <PostInteraction post={post} />
        <Link to={`/posts/${postId}`} className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-300 flex items-center">
          Read Full Article
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default PostCard;