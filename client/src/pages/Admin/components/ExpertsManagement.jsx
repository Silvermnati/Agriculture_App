import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, Star } from 'lucide-react';
import { expertsAPI } from '../../../utils/api';

const ExpertsManagement = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await expertsAPI.getExperts();
      const expertsData = response.data;
      setExperts(expertsData.data || expertsData.experts || expertsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      setError('Failed to load experts. Please try again.');
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert =>
    expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Experts Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Expert</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search experts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading experts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchExperts} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Retry
            </button>
          </div>
        ) : filteredExperts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 text-orange-500 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{expert.name || 'Unknown Expert'}</h3>
                      <p className="text-sm text-gray-500">{expert.specialization || 'General Agriculture'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">{expert.rating || '4.5'} rating</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>{expert.consultations_count || 0} consultations</p>
                  <p>Joined {expert.created_at ? new Date(expert.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No experts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertsManagement;