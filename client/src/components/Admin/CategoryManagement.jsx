import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { categoriesAPI, tagsAPI } from '../../utils/api';
import useToast from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal/ConfirmationModal';
import { ToastContainer } from '../common/Toast/Toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'tag'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('categories');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: null });
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#10B981'
  });

  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, tagsRes] = await Promise.allSettled([
        categoriesAPI.getCategories(),
        tagsAPI.getTags()
      ]);
      
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.data?.categories || []);
      }
      if (tagsRes.status === 'fulfilled') {
        setTags(tagsRes.value.data?.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await categoriesAPI.updateCategory(editingItem.category_id, categoryForm);
        toast.success('Category updated successfully!');
      } else {
        await categoriesAPI.createCategory(categoryForm);
        toast.success('Category created successfully!');
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleSubmitTag = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await tagsAPI.updateTag(editingItem.tag_id, tagForm);
        toast.success('Tag updated successfully!');
      } else {
        await tagsAPI.createTag(tagForm);
        toast.success('Tag created successfully!');
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save tag:', error);
      toast.error(error.response?.data?.message || 'Failed to save tag');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteModal.item) return;
    
    setDeleting(true);
    try {
      await categoriesAPI.deleteCategory(deleteModal.item.category_id);
      await fetchData();
      toast.success('Category deleted successfully!');
      setDeleteModal({ isOpen: false, item: null, type: null });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteModal.item) return;
    
    setDeleting(true);
    try {
      await tagsAPI.deleteTag(deleteModal.item.tag_id);
      await fetchData();
      toast.success('Tag deleted successfully!');
      setDeleteModal({ isOpen: false, item: null, type: null });
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error(error.response?.data?.message || 'Failed to delete tag');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (item, type) => {
    setDeleteModal({ isOpen: true, item, type });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'category') {
      handleDeleteCategory();
    } else if (deleteModal.type === 'tag') {
      handleDeleteTag();
    }
  };

  const handleEditCategory = (category) => {
    setEditingItem(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      color: category.color || '#10B981'
    });
    setModalType('category');
    setShowModal(true);
  };

  const handleEditTag = (tag) => {
    setEditingItem(tag);
    setTagForm({
      name: tag.name || '',
      description: tag.description || '',
      color: tag.color || '#3B82F6'
    });
    setModalType('tag');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setCategoryForm({ name: '', description: '', color: '#10B981' });
    setTagForm({ name: '', description: '', color: '#3B82F6' });
  };

  const openModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags.filter(tag =>
    tag.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCategoriesTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center">Loading...</td>
            </tr>
          ) : filteredCategories.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                No categories found
              </td>
            </tr>
          ) : (
            filteredCategories.map((category) => (
              <tr key={category.category_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {category.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#10B981' }}
                    ></div>
                    <span>{category.color || '#10B981'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category, 'category')}
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
  );

  const renderTagsTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center">Loading...</td>
            </tr>
          ) : filteredTags.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                No tags found
              </td>
            </tr>
          ) : (
            filteredTags.map((tag) => (
              <tr key={tag.tag_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tag.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {tag.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color || '#3B82F6' }}
                    ></div>
                    <span>{tag.color || '#3B82F6'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tag, 'tag')}
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
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Category & Tag Management</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => openModal('category')}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => openModal('tag')}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto"
          >
            <Tag className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['categories', 'tags'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Content */}
      {activeTab === 'categories' && renderCategoriesTab()}
      {activeTab === 'tags' && renderTagsTab()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
            </h3>
            
            {modalType === 'category' && (
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
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
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'tag' && (
              <form onSubmit={handleSubmitTag} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={tagForm.description}
                    onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="color"
                      value={tagForm.color}
                      onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tagForm.color}
                      onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Tag'}`}
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone and may affect posts and articles that use this ${deleteModal.type}.`}
        confirmText={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Tag'}`}
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
};

export default CategoryManagement;