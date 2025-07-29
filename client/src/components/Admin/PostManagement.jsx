import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { postsAPI } from '../../utils/api';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts();
      setPosts(response.data?.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Show sample data if API fails
      setPosts([
        {
          post_id: '1',
          title: 'Best Practices for Organic Farming',
          author: { name: 'John Farmer', email: 'farmer@example.com' },
          status: 'published',
          category: { name: 'Tips & Advice' },
          created_at: '2024-01-15T10:30:00Z',
          view_count: 245,
          like_count: 18,
          comment_count: 5
        },
        {
          post_id: '2',
          title: 'Soil Health Management Techniques',
          author: { name: 'Sarah Expert', email: 'expert@example.com' },
          status: 'published',
          category: { name: 'Soil Health' },
          created_at: '2024-01-14T14:22:00Z',
          view_count: 189,
          like_count: 23,
          comment_count: 8
        },
        {
          post_id: '3',
          title: 'Pest Control in Tomato Farming',
          author: { name: 'Mike Researcher', email: 'researcher@example.com' },
          status: 'draft',
          category: { name: 'Pest Control' },
          created_at: '2024-01-13T09:15:00Z',
          view_count: 0,
          like_count: 0,
          comment_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId);
        await fetchPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert(error.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || post.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Post Management</h2>
        <div className="text-sm text-gray-600">
          Total Posts: {posts.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No posts found
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.post_id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.author?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{post.author?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>Views: {post.view_count || 0}</div>
                      <div>Likes: {post.like_count || 0}</div>
                      <div>Comments: {post.comment_count || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alert(`View post: ${post.title}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Edit post: ${post.title}`)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.post_id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Total Posts</div>
          <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">
            {posts.filter(p => p.status === 'draft').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Total Views</div>
          <div className="text-2xl font-bold text-blue-600">
            {posts.reduce((sum, post) => sum + (post.view_count || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostManagement;