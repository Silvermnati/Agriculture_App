import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wheat, 
  MapPin, 
  Tags, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import CropManagement from '../../components/Admin/CropManagement';
import LocationManagement from '../../components/Admin/LocationManagement';
import CategoryManagement from '../../components/Admin/CategoryManagement';
import UserManagement from '../../components/Admin/UserManagement';
import PostManagement from '../../components/Admin/PostManagement';
import CommunityManagement from '../../components/Admin/CommunityManagement';
import SystemStats from '../../components/Admin/SystemStats';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'crops', label: 'Crops', icon: Wheat },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'communities', label: 'Communities', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemStats />;
      case 'users':
        return <UserManagement />;
      case 'crops':
        return <CropManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'posts':
        return <PostManagement />;
      case 'communities':
        return <CommunityManagement />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p className="text-gray-600">System settings and configuration options will be available here.</p>
          </div>
        );
      default:
        return <SystemStats />;
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.first_name || user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;