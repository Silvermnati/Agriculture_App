import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  MessageSquare,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign
} from 'lucide-react';
import { adminAPI } from '../../../utils/api';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCommunities: 0,
    totalExperts: 0,
    totalPayments: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch data from admin endpoints
      const [statsResponse, activityResponse] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getRecentActivity({ limit: 10 })
      ]);

      // Process stats response
      if (statsResponse.status === 'fulfilled') {
        const statsData = statsResponse.value.data;
        const data = statsData.success ? statsData.data : statsData;
        
        setStats({
          totalUsers: data.total_users || 0,
          totalPosts: data.total_posts || 0,
          totalCommunities: data.total_communities || 0,
          totalExperts: data.total_experts || 0,
          totalPayments: 0, // Will be added when payment stats are available
          monthlyRevenue: 0, // Will be added when payment stats are available
          activeUsers: data.active_users || 0,
          newUsersThisMonth: data.new_users_this_month || 0
        });
      }

      // Process activity response
      if (activityResponse.status === 'fulfilled') {
        const activityData = activityResponse.value.data;
        const activities = activityData.success ? activityData.data.activity : activityData.activity || [];
        
        const formattedActivity = activities.map(activity => ({
          id: activity.id,
          action: activity.description,
          user: activity.user,
          time: getTimeAgo(activity.timestamp),
          type: activity.type
        }));
        
        setRecentActivity(formattedActivity);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                value.toLocaleString()
              )}
            </p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {trendValue}% from last month
              </div>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const RecentActivity = () => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'user': return <Users className="w-4 h-4 text-blue-500" />;
        case 'post': return <FileText className="w-4 h-4 text-green-500" />;
        case 'community': return <MessageSquare className="w-4 h-4 text-purple-500" />;
        case 'expert': return <UserCheck className="w-4 h-4 text-orange-500" />;
        case 'payment': return <DollarSign className="w-4 h-4 text-red-500" />;
        default: return <Activity className="w-4 h-4 text-gray-500" />;
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="animate-pulse bg-gray-200 w-4 h-4 rounded"></div>
                <div className="flex-1">
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded mb-1"></div>
                  <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue={12}
          color="blue"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          trend="up"
          trendValue={8}
          color="green"
        />
        <StatCard
          title="Communities"
          value={stats.totalCommunities}
          icon={MessageSquare}
          trend="up"
          trendValue={15}
          color="purple"
        />
        <StatCard
          title="Experts"
          value={stats.totalExperts}
          icon={UserCheck}
          trend="up"
          trendValue={5}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={DollarSign}
          trend="up"
          trendValue={23}
          color="red"
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          icon={TrendingUp}
          trend="up"
          trendValue={18}
          color="indigo"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          trend="up"
          trendValue={7}
          color="green"
        />
        <StatCard
          title="New Users (Month)"
          value={stats.newUsersThisMonth}
          icon={Users}
          trend="up"
          trendValue={25}
          color="blue"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Review Posts</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Communities</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UserCheck className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Verify Experts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;