import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PostForm from 'components/posts/PostForm';

const CreatePostPage = () => {
  const navigate = useNavigate();

  const handleFormSubmit = (formData) => {
    // Simulate API call with mock data
    console.log('Mock post data submitted:', formData);
    toast.success('Post created successfully! (Mock)');
    // Simulate a new post ID for redirection
    const newPostId = Math.floor(Math.random() * 1000) + 1;
    navigate(`/posts/${newPostId}`);
  };

  return (
    <div className="create-post-page">
      <h1>Create a New Post</h1>
      <PostForm onSubmit={handleFormSubmit} />
    </div>
  );
};

export default CreatePostPage;