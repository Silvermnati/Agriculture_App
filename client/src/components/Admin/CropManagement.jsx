import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { cropsAPI } from '../../utils/api';
import useToast from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal/ConfirmationModal';
import { ToastContainer } from '../common/Toast/Toast';

const CropManagement = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, crop: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    category: '',
    growing_season: '',
    climate_requirements: '',
    water_requirements: '',
    soil_type: '',
    maturity_days: ''
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropsAPI.getCrops();
      setCrops(response.data?.crops || []);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await cropsAPI.updateCrop(editingCrop.crop_id, formData);
        toast.success('Crop updated successfully!');
      } else {
        await cropsAPI.createCrop(formData);
        toast.success('Crop created successfully!');
      }
      await fetchCrops();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save crop:', error);
      toast.error(error.response?.data?.message || 'Failed to save crop');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.crop) return;
    
    setDeleting(true);
    try {
      await cropsAPI.deleteCrop(deleteModal.crop.crop_id);
      await fetchCrops();
      toast.success('Crop deleted successfully!');
      setDeleteModal({ isOpen: false, crop: null });
    } catch (error) {
      console.error('Failed to delete crop:', error);
      toast.error(error.response?.data?.message || 'Failed to delete crop');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (crop) => {
    setDeleteModal({ isOpen: true, crop });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, crop: null });
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name || '',
      scientific_name: crop.scientific_name || '',
      category: crop.category || '',
      growing_season: crop.growing_season || '',
      climate_requirements: crop.climate_requirements || '',
      water_requirements: crop.water_requirements || '',
      soil_type: crop.soil_type || '',
      maturity_days: crop.maturity_days || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCrop(null);
    setFormData({
      name: '',
      scientific_name: '',
      category: '',
      growing_season: '',
      climate_requirements: '',
      water_requirements: '',
      soil_type: '',
      maturity_days: ''
    });
  };

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crop.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Crop Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crop</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Crops Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scientific Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Season
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maturity Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : filteredCrops.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No crops found
                </td>
              </tr>
            ) : (
              filteredCrops.map((crop) => (
                <tr key={crop.crop_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {crop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.scientific_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.growing_season || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.maturity_days || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(crop)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(crop)}
                        className="text-red-600 hover:text-red-900"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scientific Name</label>
                <input
                  type="text"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select category</option>
                  <option value="cereal">Cereal</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                  <option value="legume">Legume</option>
                  <option value="root">Root</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Growing Season</label>
                <select
                  value={formData.growing_season}
                  onChange={(e) => setFormData({ ...formData, growing_season: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select season</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                  <option value="year-round">Year-round</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Water Requirements</label>
                <select
                  value={formData.water_requirements}
                  onChange={(e) => setFormData({ ...formData, water_requirements: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select water requirement</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maturity Days</label>
                <input
                  type="number"
                  value={formData.maturity_days}
                  onChange={(e) => setFormData({ ...formData, maturity_days: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingCrop ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Crop"
        message={`Are you sure you want to delete "${deleteModal.crop?.name}"? This action cannot be undone and may affect users who have this crop in their profiles.`}
        confirmText="Delete Crop"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
};

export default CropManagement;