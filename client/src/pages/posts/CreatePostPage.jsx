import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createPost } from '../../store/slices/postsSlice';
import PostForm from '../../components/posts/PostForm';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useSelector((state) => state.posts);

  const handleFormSubmit = async (formData) => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to create a post');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await dispatch(createPost(formData)).unwrap();
      toast.success('Post created successfully!');
      navigate(`/posts/${result.post?.id || result.id}`);
    } catch (error) {
      let errorMessage = error.message || error || 'Failed to create post';
      
      // Handle specific error cases
      if (errorMessage.includes('Category with id') && errorMessage.includes('not found')) {
        errorMessage = 'The selected category is not available. Please contact support to initialize the database categories.';
      } else if (errorMessage.includes('Token has expired') || errorMessage.includes('Unauthorized')) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="page-header">
        <h1>Create a New Post</h1>
        <p>Share your agricultural knowledge with the community</p>
      </div>
      <PostForm 
        onSubmit={handleFormSubmit} 
        isLoading={isSubmitting || isLoading}
      />
    </div>
  );
};

export default CreatePostPage;
