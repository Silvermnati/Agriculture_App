import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import { communitiesAPI } from '../../../utils/api';
import useToast from '../../../hooks/useToast';
import ConfirmationModal from '../../../components/common/ConfirmationModal/ConfirmationModal';
import { ToastContainer } from '../../../components/common/Toast/Toast';

const CommunitiesManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, community: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await communitiesAPI.getCommunities({ limit: 100 });
      const communitiesData = response.data;
      
      // Handle different response structures
      let communities = [];
      if (communitiesData.success && communitiesData.data) {
        communities = communitiesData.data;
      } else if (communitiesData.communities) {
        communities = communitiesData.communities;
      } else if (Array.isArray(communitiesData)) {
        communities = communitiesData;
      }

      setCommunities(communities);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setError('Failed to load communities. Please try again.');
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCommunity = async () => {
    if (!deleteModal.community) return;
    
    setDeleting(true);
    try {
      await communitiesAPI.deleteCommunity(deleteModal.community.community_id || deleteModal.community.id);
      setCommunities(communities.filter(community => 
        (community.community_id || community.id) !== (deleteModal.community.community_id || deleteModal.community.id)
      ));
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchCommunities}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Communities Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Communities Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading communities...</p>
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {community.name || 'Unnamed Community'}
                  </h3>
                  <div className="flex space-x-1">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(community)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {community.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                  <span>
                    {community.created_at ? new Date(community.created_at).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No communities found</p>
          </div>
        )}
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

export default CommunitiesManagement;