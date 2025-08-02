import React, { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
import useToast from '../../hooks/useToast';
import { ToastContainer } from '../common/Toast/Toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const toast = useToast();

  useEffect(() => {
    // Since there's no users endpoint in the backend, we'll show a placeholder
    setLoading(false);
    setUsers([
      {
        user_id: '1',
        first_name: 'John',
        last_name: 'Farmer',
        email: 'farmer@example.com',
        role: 'farmer',
        is_verified: true,
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-01-20T14:22:00Z'
      },
      {
        user_id: '2',
        first_name: 'Sarah',
        last_name: 'Expert',
        email: 'expert@example.com',
        role: 'expert',
        is_verified: true,
        created_at: '2024-01-10T09:15:00Z',
        last_login: '2024-01-19T16:45:00Z'
      },
      {
        user_id: '3',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        role: 'admin',
        is_verified: true,
        created_at: '2024-01-01T08:00:00Z',
        last_login: '2024-01-20T12:30:00Z'
      }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role === filterRole;
    
    return matchesSearch && matchesRole;
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'expert':
        return 'bg-blue-100 text-blue-800';
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'supplier':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="expert">Expert</option>
          <option value="farmer">Farmer</option>
          <option value="supplier">Supplier</option>
          <option value="researcher">Researcher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
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
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
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
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.is_verified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Verified</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600">Unverified</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toast.info(`View user details for ${user.email}`, { duration: 3000 })}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.info(`Toggle user status for ${user.email}`, { duration: 3000 })}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Toggle Status"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note about API */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Note: User Management API
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The backend doesn&apos;t currently have a users management endpoint. 
                This interface shows sample data. To fully implement user management, 
                you would need to add user listing, update, and status management endpoints to the backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
};

export default UserManagement;