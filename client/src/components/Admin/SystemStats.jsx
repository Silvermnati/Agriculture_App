import React, { useState, useEffect } from 'react';
import { Users, Wheat, MapPin, FileText, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useAdmin } from '../../contexts/AdminContext';
import { formatTimeAgo } from '../../utils/timeHelpers';

const SystemStats = () => {
  const { refreshTrigger, setActiveTab } = useAdmin();
  const [stats, setStats] = useState({
    users: 0,
    crops: 0,
    locations: 0,
    posts: 0,
    communities: 0,
    loading: true
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // Fetch all required data in parallel
        const [statsResponse, cropsResponse, locationsResponse] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getCrops(),
          adminAPI.getLocations()
        ]);

        const statsData = statsResponse.data.data;
        const cropsData = cropsResponse.data.data || cropsResponse.data;
        const locationsData = locationsResponse.data.data || locationsResponse.data;

        setStats({
          users: statsData.total_users || 0,
          crops: Array.isArray(cropsData) ? cropsData.length : (cropsData?.crops?.length || 0),
          locations: Array.isArray(locationsData) ? locationsData.length : (locationsData?.locations?.length || 0),
          posts: statsData.total_posts || 0,
          communities: statsData.total_communities || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    const fetchRecentActivity = async () => {
      try {
        setActivityLoading(true);
        const response = await adminAPI.getRecentActivity({ limit: 5 });
        const activityData = response.data.data?.activity || [];
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchStats();
    fetchRecentActivity();
  }, [refreshTrigger]); // Refresh when refreshTrigger changes

  // Helper function to get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registered': return 'bg-green-500';
      case 'post_created': return 'bg-blue-500';
      case 'community_created': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    if (setActiveTab) {
      switch (action) {
        case 'crop':
          setActiveTab('crops');
          break;
        case 'location':
          setActiveTab('locations');
          break;
        case 'category':
          setActiveTab('categories');
          break;
        default:
          break;
      }
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Crops',
      value: stats.crops,
      icon: Wheat,
      color: 'bg-green-500'
    },
    {
      title: 'Locations',
      value: stats.locations,
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      title: 'Posts',
      value: stats.posts,
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Communities',
      value: stats.communities,
      icon: MessageSquare,
      color: 'bg-red-500'
    }
  ];

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {activityLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                  <span className="text-sm text-gray-600 flex-1">{activity.description}</span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-sm text-gray-500">No recent activity</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => handleQuickAction('crop')}
              className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-green-700" />
              <span className="text-sm font-medium text-green-700">Add New Crop</span>
            </button>
            <button 
              onClick={() => handleQuickAction('location')}
              className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">Create Location</span>
            </button>
            <button 
              onClick={() => handleQuickAction('category')}
              className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-medium text-purple-700">Add Category</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;