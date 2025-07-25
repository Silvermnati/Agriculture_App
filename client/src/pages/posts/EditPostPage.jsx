import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPost, updatePost, clearCurrentPost } from '../../store/slices/postsSlice';
import PostForm from '../../components/posts/PostForm';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';

const EditPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { currentPost, isLoading, isError, message } = useSelector(state => state.posts);
  
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (postId) {
      dispatch(getPost(postId));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (currentPost) {
      // Check if user can edit this post
      const canEdit = user && (
        user.id === currentPost.author?.user_id || 
        user.id === currentPost.author_id ||
        user.role === 'admin'
      );
      
      if (!canEdit) {
        navigate('/posts');
        return;
      }

      // Transform post data for the form
      setInitialData({
        title: currentPost.title || '',
        content: currentPost.content || '',
        excerpt: currentPost.excerpt || '',
        category_id: currentPost.category?.category_id || '',
        related_crops: currentPost.related_crops || [],
        applicable_locations: currentPost.applicable_locations || [],
        season_relevance: currentPost.season_relevance || '',
        status: currentPost.status || 'published',
        // Don't include featured_image as it's already uploaded
        featured_image: null
      });
    }
  }, [currentPost, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(updatePost({ 
        postId: postId, 
        postData: formData 
      })).unwrap();
      
      // Navigate back to the post or posts list
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="edit-post-page">
        <div className="container">
          <ErrorMessage message="Please log in to edit posts." />
        </div>
      </div>
    );
  }

  if (isLoading && !currentPost) {
    return (
      <div className="edit-post-page">
        <div className="container">
          <LoadingSpinner text="Loading post..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="edit-post-page">
        <div className="container">
          <ErrorMessage message={message || "Failed to load post"} />
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="edit-post-page">
        <div className="container">
          <ErrorMessage message="Post not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="edit-post-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Post</h1>
          <button 
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        
        {initialData && (
          <PostForm 
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
};

export default EditPostPage;