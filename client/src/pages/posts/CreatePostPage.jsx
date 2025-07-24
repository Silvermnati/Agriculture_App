import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createPost } from '../../store/slices/postsSlice';
import PostForm from '../../components/posts/PostForm';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleFormSubmit = async (formData) => {
    try {
      const result = await dispatch(createPost(formData)).unwrap();
      toast.success('Post created successfully!');
      navigate(`/posts/${result.id}`);
    } catch (error) {
      toast.error(`Failed to create post: ${error.message}`);
    }
  };

  return (
    <div className="create-post-page">
      <h1>Create a New Post</h1>
      <PostForm onSubmit={handleFormSubmit} />
    </div>
  );
};

export default CreatePostPage;
