import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { getPosts, reset } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import PostFilters from '../../components/posts/PostFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import './Posts.css';

const PostsPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { posts, isLoading, isError, message, pagination } = useSelector(state => state.posts);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    crop: '',
    location: '',
    season: '',
    sort_by: 'date'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch posts with current filters and pagination
    const params = {
      page: currentPage,
      per_page: 12,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    
    dispatch(getPosts(params));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, filters, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!pagination || !pagination.pages || pagination.pages <= 1) return null;

    const pages = [];
    const currentPageNum = pagination.page || 1;
    const totalPages = pagination.pages;

    // Previous button
    if (currentPageNum > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPageNum - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = Math.max(1, currentPageNum - 2); i <= Math.min(totalPages, currentPageNum + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPageNum ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPageNum < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPageNum + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      );
    }

    return (
      <div className="pagination">
        {pages}
      </div>
    );
  };

  return (
    <div className="posts-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Agricultural Blog</h1>
            <p>Discover insights, tips, and knowledge from the farming community</p>
          </div>
          {isAuthenticated && (
            <Link to="/posts/create" className="btn-primary">
              <Plus size={20} />
              Create Post
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="posts-controls">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>
          
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <PostFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Results Summary */}
        {!isLoading && posts && (
          <div className="results-summary">
            <p>
              {pagination?.total || posts.length} posts found
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <ErrorMessage 
            message={message || "Failed to load posts"} 
            onRetry={() => dispatch(getPosts({ page: currentPage, per_page: 12, ...filters }))}
          />
        )}

        {/* Posts List */}
        <PostList 
          posts={posts}
          isLoading={isLoading}
          showActions={false}
          emptyMessage="No posts found"
          emptySubMessage="Try adjusting your search or filters, or be the first to share your knowledge!"
        />

        {/* Pagination */}
        {renderPagination()}

        {/* Call to Action for Non-Authenticated Users */}
        {!isAuthenticated && posts && posts.length > 0 && (
          <div className="cta-section">
            <div className="cta-content">
              <h3>Join the Community</h3>
              <p>Create an account to share your own agricultural insights and connect with fellow farmers.</p>
              <div className="cta-buttons">
                <Link to="/register" className="btn-primary">Sign Up</Link>
                <Link to="/login" className="btn-secondary">Log In</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;