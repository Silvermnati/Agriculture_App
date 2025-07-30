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
      throw error; // Re-throw to let PostForm handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSuccess = () => {
    // This callback is called when the form is successfully submitted and reset
    console.log('Post form reset successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Create a New Post</h1>
        <p className="text-lg text-gray-600">Share your agricultural knowledge with the community</p>
      </div>
      <PostForm 
        onSubmit={handleFormSubmit} 
        isLoading={isSubmitting || isLoading}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default CreatePostPage;
