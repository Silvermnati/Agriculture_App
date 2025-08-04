import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { getPosts } from '../../store/slices/postsSlice';
import PostList from '../../components/posts/PostList';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';


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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Posts</h1>
            <p className="text-gray-600 mt-1">Manage your agricultural knowledge sharing</p>
          </div>
          <Link to="/posts/create" className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 flex items-center space-x-2">
            <Plus size={20} />
            <span>Create New Post</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${filter === 'all' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setFilter('all')}
              >
                All Posts <span className="bg-gray-100 text-gray-600 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">{filterCounts.all}</span>
              </button>
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${filter === 'published' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setFilter('published')}
              >
                Published <span className="bg-green-100 text-green-800 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">{filterCounts.published}</span>
              </button>
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${filter === 'draft' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setFilter('draft')}
              >
                Drafts <span className="bg-yellow-100 text-yellow-800 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">{filterCounts.draft}</span>
              </button>
              {filterCounts.archived > 0 && (
                <button 
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${filter === 'archived' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => setFilter('archived')}
                >
                  Archived <span className="bg-gray-100 text-gray-600 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">{filterCounts.archived}</span>
                </button>
              )}
            </nav>
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
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{filterCounts.all}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{myPosts.reduce((sum, post) => sum + (post.view_count || 0), 0)}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{myPosts.reduce((sum, post) => sum + (post.like_count || 0), 0)}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{myPosts.reduce((sum, post) => sum + (post.comment_count || 0), 0)}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;