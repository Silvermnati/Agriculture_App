import React, { useState, useEffect } from 'react';
import { Users, Wheat, MapPin, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { authAPI, cropsAPI, locationsAPI, postsAPI, communitiesAPI } from '../../utils/api';

const SystemStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    crops: 0,
    locations: 0,
    posts: 0,
    communities: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cropsRes, locationsRes, postsRes, communitiesRes] = await Promise.allSettled([
          cropsAPI.getCrops(),
          locationsAPI.getLocations(),
          postsAPI.getPosts(),
          communitiesAPI.getCommunities()
        ]);

        setStats({
          users: 'N/A', // Would need a users endpoint
          crops: cropsRes.status === 'fulfilled' ? (cropsRes.value.data?.crops?.length || 0) : 0,
          locations: locationsRes.status === 'fulfilled' ? (locationsRes.value.data?.locations?.length || 0) : 0,
          posts: postsRes.status === 'fulfilled' ? (postsRes.value.data?.posts?.length || 0) : 0,
          communities: communitiesRes.status === 'fulfilled' ? (communitiesRes.value.data?.communities?.length || 0) : 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Crops',
      value: stats.crops,
      icon: Wheat,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Locations',
      value: stats.locations,
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Posts',
      value: stats.posts,
      icon: FileText,
      color: 'bg-yellow-500',
      change: '+15%'
    },
    {
      title: 'Communities',
      value: stats.communities,
      icon: MessageSquare,
      color: 'bg-red-500',
      change: '+3%'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-600"> from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New user registered</span>
              <span className="text-xs text-gray-400">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New post created</span>
              <span className="text-xs text-gray-400">5 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Community joined</span>
              <span className="text-xs text-gray-400">10 minutes ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
              <span className="text-sm font-medium text-green-700">Add New Crop</span>
            </button>
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
              <span className="text-sm font-medium text-blue-700">Create Location</span>
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
              <span className="text-sm font-medium text-purple-700">Add Category</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;