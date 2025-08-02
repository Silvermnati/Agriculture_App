import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { tagsAPI, categoriesAPI } from '../../utils/api';
import { getPosts, reset } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import PostFilters from '../../components/posts/PostFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';


const PostsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [popularTags, setPopularTags] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tagsResponse, categoriesResponse] = await Promise.all([
          tagsAPI.getTags({ limit: 10 }),
          categoriesAPI.getCategories()
        ]);
        setPopularTags(tagsResponse.data.tags || []);
        setAvailableCategories(categoriesResponse.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { posts, isLoading, isError, message, pagination } = useSelector(state => state.posts);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    crop: '',
    location: '',
    season: '',
    sort_by: 'date',
    tags: ''
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

  const handleTagClick = (tagName) => {
    // If the same tag is clicked, clear the filter (toggle off)
    // Use case-insensitive comparison to handle capitalization differences
    const currentTag = filters.tags || '';
    const newTagFilter = currentTag.toLowerCase() === tagName.toLowerCase() ? '' : tagName;
    setFilters(prev => ({ ...prev, tags: newTagFilter }));
    setCurrentPage(1); // Reset to first page when tag filter changes
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
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h1 className="text-4xl font-bold mb-4">Agricultural Insights</h1>
              <p className="text-xl mb-6">
                Expert knowledge, practical advice, and the latest research to help you succeed in modern agriculture.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-green-800 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300">
                  Subscribe
                </button>
                <button 
                  className="border-2 border-white text-white font-bold py-2 px-6 rounded-full hover:bg-white hover:text-green-800 transition duration-300"
                  onClick={() => navigate('/posts/create')}
                >
                  Contribute
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Featured Post Placeholder */}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.sort_by}
                onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
              >
                <option value="date">Sort by: Latest</option>
                <option value="popularity">Sort by: Popular</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Articles Grid */}
            <div className="lg:w-3/4 lg:pr-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Latest Articles</h2>
                {filters.tags && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtered by tag:</span>
                    <span className="bg-green-100 text-green-800 text-sm py-1 px-3 rounded-full font-medium">
                      #{filters.tags}
                    </span>
                    <button
                      onClick={() => handleTagClick(filters.tags)}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                      title="Clear tag filter"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {isLoading ? (
                <LoadingSpinner text="Loading posts..." />
              ) : isError ? (
                <ErrorMessage 
                  message={message || "Failed to load posts"} 
                  onRetry={() => dispatch(getPosts({ page: currentPage, per_page: 12, ...filters }))}
                />
              ) : (
                <PostList 
                  posts={posts}
                  isLoading={isLoading}
                  showActions={false}
                  emptyMessage="No posts found"
                  emptySubMessage="Try adjusting your search or filters, or be the first to share your knowledge!"
                />
              )}
              
              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                {renderPagination()}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.name)}
                      className={`text-xs py-2 px-3 rounded-full transition-colors duration-300 font-medium ${
                        (filters.tags || '').toLowerCase() === tag.name.toLowerCase()
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Newsletter</h3>
                <p className="text-gray-600 mb-4">Stay updated with the latest agricultural insights and tips.</p>
                <form>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostsPage;