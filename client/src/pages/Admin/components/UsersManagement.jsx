import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../../utils/api';
import { useAdmin } from '../../../contexts/AdminContext';

const UsersManagement = () => {
  const { triggerRefresh } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real users from the admin API
      const response = await adminAPI.getAllUsers({
        limit: 100,
        search: searchTerm,
        role: filterRole === 'all' ? '' : filterRole,
        status: filterStatus === 'all' ? '' : filterStatus
      });
      
      const usersData = response.data;
      const data = usersData.success ? usersData.data : usersData;
      
      // Transform backend user data to frontend format
      const transformedUsers = (data.users || data || []).map(user => ({
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone_number || 'N/A',
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        location: `${user.city || 'Unknown'}, ${user.country || 'Unknown'}`,
        joinDate: user.join_date || user.created_at,
        lastActive: user.last_login || user.updated_at,
        avatar: user.avatar_url,
        verified: user.is_verified || false,
        postsCount: user.posts_count || 0,
        commentsCount: user.comments_count || 0
      }));
      
      setUsers(transformedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users from database. Please try again.');
      setLoading(false);
    }
  };

  // Since filtering is now handled by the backend API, we don't need frontend filtering
  const filteredUsers = users;

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        triggerRefresh(); // Trigger refresh for system stats
        alert('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await adminAPI.updateUserStatus(userId);
      const updatedUserData = response.data;
      const updatedUser = updatedUserData.success ? updatedUserData.data.user : updatedUserData.user;
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: updatedUser.is_active ? 'active' : 'inactive'
            }
          : user
      ));
      
      alert(`User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const UserModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-600">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 capitalize">{user.role}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                  {user.verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{user.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Edit User
              </button>
              <button 
                onClick={() => handleToggleStatus(user.id)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  user.status === 'active'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
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
          onClick={fetchUsers}
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
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="expert">Experts</option>
              <option value="admin">Admins</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-600">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* User Details Modal */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
    </div>
  );
};

export default UsersManagement;