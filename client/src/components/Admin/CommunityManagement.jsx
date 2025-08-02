import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Users, MessageSquare } from 'lucide-react';
import { communitiesAPI } from '../../utils/api';
import useToast from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal/ConfirmationModal';
import { ToastContainer } from '../common/Toast/Toast';

const CommunityManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, community: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await communitiesAPI.getCommunities({ limit: 100 });
      
      // Handle different response structures
      let communities = [];
      if (response.data?.success && response.data?.data) {
        communities = response.data.data;
      } else if (response.data?.communities) {
        communities = response.data.communities;
      } else if (Array.isArray(response.data)) {
        communities = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        communities = response.data.data;
      }
      
      setCommunities(communities);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]); // Set empty array instead of sample data
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = 
      community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || community.community_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Regional':
        return 'bg-blue-100 text-blue-800';
      case 'Crop-Specific':
        return 'bg-green-100 text-green-800';
      case 'Urban':
        return 'bg-purple-100 text-purple-800';
      case 'Professional':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteCommunity = async () => {
    if (!deleteModal.community) return;
    
    setDeleting(true);
    try {
      await communitiesAPI.deleteCommunity(deleteModal.community.community_id || deleteModal.community.id);
      // Refresh the communities list
      await fetchCommunities();
      toast.success('Community deleted successfully!');
      setDeleteModal({ isOpen: false, community: null });
    } catch (error) {
      console.error('Failed to delete community:', error);
      toast.error('Failed to delete community. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (community) => {
    setDeleteModal({ isOpen: true, community });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, community: null });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Community Management</h2>
        <div className="text-sm text-gray-600">
          Total Communities: {communities.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Types</option>
          <option value="Regional">Regional</option>
          <option value="Crop-Specific">Crop-Specific</option>
          <option value="Urban">Urban</option>
          <option value="Professional">Professional</option>
        </select>
      </div>

      {/* Communities Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading communities...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Community
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Privacy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Focus Crops
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
                  {filteredCommunities.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No communities found
                      </td>
                    </tr>
                  ) : (
                    filteredCommunities.map((community) => (
                      <tr key={community.community_id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs">
                              {community.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {community.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(community.community_type)}`}>
                            {community.community_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            community.is_private 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {community.is_private ? 'Private' : 'Public'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="w-4 h-4 mr-1" />
                            {community.member_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {community.posts_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {community.focus_crops?.slice(0, 2).map((crop, index) => (
                              <span 
                                key={index}
                                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                              >
                                {crop}
                              </span>
                            ))}
                            {community.focus_crops?.length > 2 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                +{community.focus_crops.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(community.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toast.info(`View community: ${community.name}`, { duration: 3000 })}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Community"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toast.info(`Edit community: ${community.name}`, { duration: 3000 })}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Edit Community"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(community)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Community"
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

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {filteredCommunities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No communities found
                </div>
              ) : (
                filteredCommunities.map((community) => (
                  <div key={community.community_id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {community.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {community.description}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(community.community_type)}`}>
                            {community.community_type}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            community.is_private 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {community.is_private ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {community.member_count || 0}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {community.posts_count || 0}
                          </div>
                          <div className="text-xs">
                            {formatDate(community.created_at)}
                          </div>
                        </div>
                        {community.focus_crops && community.focus_crops.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {community.focus_crops.slice(0, 3).map((crop, index) => (
                              <span 
                                key={index}
                                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                              >
                                {crop}
                              </span>
                            ))}
                            {community.focus_crops.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                +{community.focus_crops.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => toast.info(`View community: ${community.name}`, { duration: 3000 })}
                          className="text-blue-600 hover:text-blue-900 p-2"
                          title="View Community"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast.info(`Edit community: ${community.name}`, { duration: 3000 })}
                          className="text-green-600 hover:text-green-900 p-2"
                          title="Edit Community"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(community)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Delete Community"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Total Communities</div>
          <div className="text-2xl font-bold text-gray-900">{communities.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Public Communities</div>
          <div className="text-2xl font-bold text-green-600">
            {communities.filter(c => !c.is_private).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Private Communities</div>
          <div className="text-2xl font-bold text-red-600">
            {communities.filter(c => c.is_private).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm font-medium text-gray-500">Total Members</div>
          <div className="text-2xl font-bold text-blue-600">
            {communities.reduce((sum, community) => sum + (community.member_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteCommunity}
        title="Delete Community"
        message={`Are you sure you want to delete "${deleteModal.community?.name}"? This action cannot be undone and will remove all posts, members, and data associated with this community.`}
        confirmText="Delete Community"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
};

export default CommunityManagement;