// pages/Posts/PostsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Import Link
import { getPosts, reset } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import PostFilters from '../../components/posts/PostFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import './Posts.css';

const PostsPage = () => {
  const dispatch = useDispatch();
  const { posts, pagination, isLoading, isError, message } = useSelector((state) => state.posts);

  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    category: '',
    crop: [],
    location: [],
    season: '',
    search: '',
  });

  useEffect(() => {
    dispatch(getPosts(filters));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>Agricultural Posts & Blogs</h1>
        <Link to="/create-post" className="create-post-btn">Create Post</Link>
      </div>
      <PostFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && <LoadingSpinner text="Loading posts..." />}
      {isError && <ErrorMessage error={message} onRetry={() => dispatch(getPosts(filters))} />}
      
      {!isLoading && !isError && (
        <PostList posts={posts} pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default PostsPage;
