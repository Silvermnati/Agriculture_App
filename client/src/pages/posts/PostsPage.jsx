// pages/Posts/PostsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Import Link
import { getPosts, reset } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import PostFilters from '../../components/posts/PostFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Image from '../../components/common/Image/Image';
import './Posts.css';
import '../../components/posts/posts.css';

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

  const featuredPost = posts && posts.length > 0 ? posts[0] : null;



  return (
    <div className="posts-page">
      <div className="header-and-featured-section">
        {/* Left side: Agricultural Insights text */}
        <div className="hero-text-content">
          <h1>Agricultural Insights</h1>
          <p>
            Expert knowledge, practical advice, and the latest research to help you succeed in modern agriculture.
          </p>
          <Link to="/create-post" className="contribute-btn">Contribute</Link>
        </div>

        {/* Right side: Featured Post Card (Simplified) - only render if featuredPost exists */}
        {featuredPost && (
          <div className="featured-post-card-wrapper">
            {/* The Link wraps the entire simplified card */}
            <Link to={`/posts/${featuredPost.id}`} className="simplified-featured-card-link">
              <div className="simplified-featured-post-card"> {/* NEW CLASS for this simplified card */}
                <Image
                  src={featuredPost.featured_image_url}
                  alt={featuredPost.title}
                  className="simplified-featured-post-image" /* NEW CLASS */
                  fallbackType="postLarge"
                />
                <div className="simplified-featured-post-title-overlay"> {/* NEW CLASS for overlay */}
                  <h3>{featuredPost.title}</h3>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {isLoading && !featuredPost && <LoadingSpinner text="Loading posts..." />}
      {isError && !featuredPost && <ErrorMessage error={message} onRetry={() => dispatch(getPosts(filters))} />}

      <div className="posts-content-layout">
        <div className="main-content-area">
          {!isLoading && !isError && (
            <PostList
              posts={featuredPost ? posts.slice(1) : posts}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <div className="sidebar-area">
          <PostFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
};

export default PostsPage;