import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPost, getComments, clearCurrentPost } from '../../store/slices/postsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import CommentSection from '../../components/posts/CommentSection';
import Image from '../../components/common/Image/Image';
import FollowButton from '../../components/common/FollowButton/FollowButton';
import { Calendar } from 'lucide-react';


const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentPost, postComments, isLoading, isError, message } = useSelector(state => state.posts);
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    // Basic validation for postId to prevent API calls with 'create'
    const isValidPostId = postId && postId !== 'create' && postId.length > 5; // A simple check, assuming UUIDs are longer than 'create'

    if (isValidPostId) {
      dispatch(getPost(postId));
      dispatch(getComments(postId));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (location.hash === '#comments' && !isLoading) {
      const element = document.getElementById('comments');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash, isLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (isLoading && !currentPost) {
    return <div className="container"><LoadingSpinner text="Loading post..." /></div>;
  }

  const handleRetry = () => {
    if (postId) {
      dispatch(getPost(postId));
      dispatch(getComments(postId));
    }
  };

  if (isError) {
    return <div className="container"><ErrorMessage message={message || 'Failed to load post.'} onRetry={handleRetry} /></div>;
  }

  if (!currentPost) {
    return <div className="container"><p>Post not found.</p></div>;
  }

  const comments = postComments[postId] || [];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <article className="bg-white p-6 rounded-lg shadow-md">
          {currentPost.featured_image_url && (
            <Image src={currentPost.featured_image_url} alt={currentPost.title || 'Post image'} className="w-full h-96 object-cover rounded-lg mb-6" fallbackType="post" />
          )}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{currentPost.title || 'Untitled Post'}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 mr-3 flex-shrink-0">
              <Image 
                src={currentPost.author?.avatar_url} 
                alt={currentPost.author?.name || 'Author'} 
                className="w-full h-full object-cover" 
                fallbackType="avatar" 
              />
            </div>
            <div>
              <p className="font-medium text-gray-800">{currentPost.author?.name || 'Unknown Author'}</p>
              <p><Calendar size={14} className="inline-block mr-1" /> Published on {formatDate(currentPost.published_at || currentPost.created_at)}</p>
            </div>
            <div className="ml-auto">
              {currentPost.category && <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{currentPost.category.name}</span>}
            </div>
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentPost.content || '<p>No content available</p>' }} />
        </article>
        
        <CommentSection postId={postId} comments={comments} />
      </div>
    </div>
  );
};

export default PostDetailPage;
