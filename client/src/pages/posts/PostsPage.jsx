// pages/Posts/PostsPage.jsx
import React, { useEffect, useState } from 'react';
import { mockCommunityPosts } from '../../utils/mockData';
import PostList from 'components/posts/PostList';
import PostFilters from 'components/posts/PostFilters';
import './Posts.css';

const PostsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    category: '',
    crop: '',
    location: '',
    season: '',
    search: '',
  });

  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    // Simulate filtering and pagination with mock data
    let tempPosts = [...mockCommunityPosts];

    // Apply filters
    if (filters.category) {
      tempPosts = tempPosts.filter(post => post.category?.name === filters.category);
    }
    if (filters.crop) {
      tempPosts = tempPosts.filter(post => post.crops?.includes(filters.crop));
    }
    if (filters.location) {
      tempPosts = tempPosts.filter(post => post.location?.includes(filters.location));
    }
    if (filters.season) {
      tempPosts = tempPosts.filter(post => post.season === filters.season);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tempPosts = tempPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = (filters.page - 1) * filters.per_page;
    const endIndex = startIndex + filters.per_page;
    const paginatedPosts = tempPosts.slice(startIndex, endIndex);

    setFilteredPosts(paginatedPosts);
  }, [filters]);

  const pagination = {
    page: filters.page,
    per_page: filters.per_page,
    total_items: mockCommunityPosts.length,
    total_pages: Math.ceil(mockCommunityPosts.length / filters.per_page),
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  return (
    <div className="posts-page">
      <h1>Agricultural Posts & Blogs</h1>
      <PostFilters filters={filters} onFilterChange={handleFilterChange} />

      
      
      <PostList posts={filteredPosts} pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
};

export default PostsPage;
