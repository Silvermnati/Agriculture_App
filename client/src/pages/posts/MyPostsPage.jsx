import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { getPosts } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import './Posts.css';

const MyPostsPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { posts, isLoading, isError, message } = useSelector(state => state.posts);
  
  const [filter, setFilter] = useState('all'); // all, published, draft, archived
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch all posts and filter client-side for now
      // In a real app, you'd want to add author filtering to the API
      dispatch(getPosts({}));
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (posts && user) {
      // Filter posts by current user
      const userPosts = posts.filter(post => 
        post.author?.user_id === user.id || 
        post.author_id === user.id
      );
      
      // Apply status filter
      let filteredPosts = userPosts;
      if (filter !== 'all') {
        filteredPosts = userPosts.filter(post => post.status === filter);
      }
      
      setMyPosts(filteredPosts);
    }
  }, [posts, user, filter]);

  if (!isAuthenticated) {
    return (
      <div className="my-posts-page">
        <div className="container">
          <ErrorMessage message="Please log in to view your posts." />
        </div>
      </div>
    );
  }

  const getFilterCounts = () => {
    if (!posts || !user) return { all: 0, published: 0, draft: 0, archived: 0 };
    
    const userPosts = posts.filter(post => 
      post.author?.user_id === user.id || 
      post.author_id === user.id
    );
    
    return {
      all: userPosts.length,
      published: userPosts.filter(p => p.status === 'published').length,
      draft: userPosts.filter(p => p.status === 'draft').length,
      archived: userPosts.filter(p => p.status === 'archived').length
    };
  };

  const filterCounts = getFilterCounts();

  return (
    <div className="my-posts-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>My Posts</h1>
            <p>Manage your agricultural knowledge sharing</p>
          </div>
          <Link to="/posts/create" className="btn-primary">
            <Plus size={20} />
            Create New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="posts-filters">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Posts ({filterCounts.all})
            </button>
            <button 
              className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
              onClick={() => setFilter('published')}
            >
              Published ({filterCounts.published})
            </button>
            <button 
              className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
              onClick={() => setFilter('draft')}
            >
              Drafts ({filterCounts.draft})
            </button>
            {filterCounts.archived > 0 && (
              <button 
                className={`filter-tab ${filter === 'archived' ? 'active' : ''}`}
                onClick={() => setFilter('archived')}
              >
                Archived ({filterCounts.archived})
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <ErrorMessage message={message || "Failed to load posts"} />
        )}

        {/* Posts List */}
        <PostList 
          posts={myPosts}
          isLoading={isLoading}
          showActions={true}
          emptyMessage={
            filter === 'all' 
              ? "You haven't created any posts yet" 
              : `No ${filter} posts found`
          }
          emptySubMessage={
            filter === 'all'
              ? "Share your agricultural knowledge with the community!"
              : `You don't have any ${filter} posts at the moment.`
          }
        />

        {/* Stats Summary */}
        {myPosts.length > 0 && (
          <div className="posts-summary">
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{filterCounts.all}</span>
                <span className="stat-label">Total Posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {myPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)}
                </span>
                <span className="stat-label">Total Views</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {myPosts.reduce((sum, post) => sum + (post.like_count || 0), 0)}
                </span>
                <span className="stat-label">Total Likes</span>
              </div>
              <div className="stat">
                <span className="stat-number">
                  {myPosts.reduce((sum, post) => sum + (post.comment_count || 0), 0)}
                </span>
                <span className="stat-label">Total Comments</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;