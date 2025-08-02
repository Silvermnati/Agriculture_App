import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';
import { adminAPI, postsAPI } from '../../../utils/api';
import Image from '../../../components/common/Image/Image';
import useToast from '../../../hooks/useToast';
import ConfirmationModal from '../../../components/common/ConfirmationModal/ConfirmationModal';
import { ToastContainer } from '../../../components/common/Toast/Toast';

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, post: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postsAPI.getPosts({ limit: 100 });
      const postsData = response.data;
      
      // Handle different response structures
      let posts = [];
      if (postsData.success && postsData.data) {
        posts = postsData.data;
      } else if (postsData.posts) {
        posts = postsData.posts;
      } else if (Array.isArray(postsData)) {
        posts = postsData;
      } else if (postsData.data && Array.isArray(postsData.data)) {
        posts = postsData.data;
      }

      // Transform posts to match our expected structure
      const transformedPosts = posts.map(post => ({
        id: post.id || post.post_id,
        title: post.title,
        content: post.content || post.excerpt || '',
        author: {
          name: post.author ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || post.author.name || 'Unknown Author' : 'Unknown Author',
          email: post.author?.email || 'unknown@example.com',
          avatar: post.author?.avatar_url
        },
        category: {
          id: post.category?.id || post.category_id || 1,
          name: post.category?.name || 'General'
        },
        status: post.status || 'published',
        featured_image_url: post.featured_image_url,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        tags: post.tags || [],
        related_crops: post.related_crops || []
      }));

      setPosts(transformedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load posts. Please try again.');
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || post.category.name === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleDeletePost = async () => {
    if (!deleteModal.post) return;
    
    setDeleting(true);
    try {
      await postsAPI.deletePost(deleteModal.post.post_id || deleteModal.post.id);
      setPosts(posts.filter(post => 
        (post.post_id || post.id) !== (deleteModal.post.post_id || deleteModal.post.id)
      ));
      toast.success('Post deleted successfully!');
      setDeleteModal({ isOpen: false, post: null });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (post) => {
    setDeleteModal({ isOpen: true, post });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, post: null });
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      // In a real implementation, you'd have an admin endpoint to update post status
      // await adminAPI.updatePostStatus(postId, newStatus);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus }
          : post
      ));
    } catch (error) {
      console.error('Failed to update post status:', error);
      alert('Failed to update post status. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const PostModal = ({ post, isOpen, onClose }) => {
    if (!isOpen || !post) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Post Header */}
            <div className="border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-gray-600">
                          {post.author.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{post.author.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(post.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{post.view_count}</p>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{post.like_count}</p>
                <p className="text-sm text-gray-600">Likes</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{post.comment_count}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
            </div>

            {/* Post Content */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{post.content}</p>
              </div>
            </div>

            {/* Post Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Category</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {post.category.name}
                </span>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Related Crops</h4>
                <div className="flex flex-wrap gap-2">
                  {post.related_crops && post.related_crops.length > 0 ? (
                    post.related_crops.map((crop, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {crop}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No related crops</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No tags</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Edit Post
              </button>
              {post.status === 'pending' && (
                <button 
                  onClick={() => handleUpdateStatus(post.id, 'published')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              {post.status === 'published' && (
                <button 
                  onClick={() => handleUpdateStatus(post.id, 'draft')}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
                >
                  Unpublish
                </button>
              )}
              <button 
                onClick={() => openDeleteModal(post)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchPosts}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Posts Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Crop Management">Crop Management</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Irrigation">Irrigation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table - Compact Design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post Details
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image 
                            src={post.featured_image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                            fallbackType="post"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate" title={post.title}>
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {post.category.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'No date'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          {post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">
                              {post.author.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-900 truncate">{post.author.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(post.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{post.view_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{post.like_count}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{post.comment_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPost(post)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Post"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      <PostModal
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteModal.post?.title}"? This action cannot be undone and will remove all comments and likes associated with this post.`}
        confirmText="Delete Post"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
};

export default PostsManagement;