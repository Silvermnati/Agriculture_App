import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { locationsAPI } from '../../utils/api';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('location'); // 'location', 'country', 'state'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('locations');
  const [selectedCountryForStates, setSelectedCountryForStates] = useState('');
  
  const [locationForm, setLocationForm] = useState({
    country_id: '',
    state_id: '',
    city: '',
    latitude: '',
    longitude: '',
    climate_zone: '',
    elevation: ''
  });

  const [countryForm, setCountryForm] = useState({
    name: '',
    code: ''
  });

  const [stateForm, setStateForm] = useState({
    country_id: '',
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locationsRes, countriesRes] = await Promise.all([
        locationsAPI.getLocations(),
        locationsAPI.getCountries()
      ]);
      
      setLocations(locationsRes.data?.locations || []);
      setCountries(countriesRes.data?.countries || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const response = await locationsAPI.getStates(countryId);
      setStates(response.data?.states || []);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  const handleSubmitLocation = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!locationForm.country_id || locationForm.country_id.trim() === '') {
      alert('Please select a country');
      return;
    }
    
    if (!locationForm.city || locationForm.city.trim() === '') {
      alert('Please enter a city name');
      return;
    }
    
    try {
      console.log('Submitting location form data:', locationForm);
      if (editingItem) {
        await locationsAPI.updateLocation(editingItem.location_id, locationForm);
        alert('Location updated successfully!');
      } else {
        await locationsAPI.createLocation(locationForm);
        alert('Location created successfully!');
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save location:', error);
      console.error('Error details:', error.response?.data);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle different error response formats
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.response?.data?.error?.details ||
                          error.response?.data?.error ||
                          'Failed to save location';
      alert(errorMessage);
    }
  };

  const handleSubmitCountry = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await locationsAPI.updateCountry(editingItem.country_id, countryForm);
        alert('Country updated successfully!');
      } else {
        await locationsAPI.createCountry(countryForm);
        alert('Country created successfully!');
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save country:', error);
      alert(error.response?.data?.message || 'Failed to save country');
    }
  };

  const handleSubmitState = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await locationsAPI.updateState(editingItem.state_id, stateForm);
        alert('State updated successfully!');
      } else {
        await locationsAPI.createState(stateForm);
        alert(`State "${stateForm.name}" created successfully!`);
      }
      // Refresh states for the selected country
      if (stateForm.country_id) {
        await fetchStates(stateForm.country_id);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save state:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save state';
      alert(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setLocationForm({
      country_id: '',
      state_id: '',
      city: '',
      latitude: '',
      longitude: '',
      climate_zone: '',
      elevation: ''
    });
    setCountryForm({ name: '', code: '' });
    setStateForm({ country_id: '', name: '', code: '' });
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    
    if (item) {
      if (type === 'location') {
        setLocationForm({
          country_id: item.country_id || '',
          state_id: item.state_id || '',
          city: item.city || '',
          latitude: item.latitude || '',
          longitude: item.longitude || '',
          climate_zone: item.climate_zone || '',
          elevation: item.elevation || ''
        });
        
        // Fetch states for the existing country when editing
        if (item.country_id) {
          fetchStates(item.country_id);
        }
      } else if (type === 'country') {
        setCountryForm({
          name: item.name || '',
          code: item.code || ''
        });
      } else if (type === 'state') {
        setStateForm({
          country_id: item.country_id || '',
          name: item.name || '',
          code: item.code || ''
        });
      }
    }
  };

  const handleDelete = async (type, item) => {
    const confirmMessage = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      if (type === 'location') {
        await locationsAPI.deleteLocation(item.location_id);
        alert('Location deleted successfully!');
      } else if (type === 'country') {
        await locationsAPI.deleteCountry(item.country_id);
        alert('Country deleted successfully!');
      } else if (type === 'state') {
        await locationsAPI.deleteState(item.state_id);
        alert('State deleted successfully!');
        // Refresh states if we're viewing states for this country
        if (selectedCountryForStates === item.country_id.toString()) {
          await fetchStates(selectedCountryForStates);
        }
      }
      await fetchData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCountries = countries.filter(country =>
    country.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLocationsTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              City
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              State
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Climate Zone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
            </tr>
          ) : filteredLocations.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                No locations found
              </td>
            </tr>
          ) : (
            filteredLocations.map((location) => (
              <tr key={location.location_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {location.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.country?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.state?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {location.climate_zone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('location', location)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit location"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('location', location)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete location"
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

  const renderCountriesTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCountries.map((country) => (
            <tr key={country.country_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {country.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {country.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal('country', country)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit country"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete('country', country)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete country"
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
  );

  const renderStatesTab = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <p className="text-sm text-gray-600">
          Select a country from the dropdown to view its states, or add a new state.
        </p>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">View states for:</label>
          <select
            value={selectedCountryForStates}
            onChange={(e) => {
              setSelectedCountryForStates(e.target.value);
              if (e.target.value) {
                fetchStates(e.target.value);
              } else {
                setStates([]);
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select a country</option>
            {countries.map(country => (
              <option key={country.country_id} value={country.country_id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
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
          ) : filteredStates.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                No states found. Select a country or add a new state.
              </td>
            </tr>
          ) : (
            filteredStates.map((state) => (
              <tr key={state.state_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {state.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {state.code || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {state.country?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('state', state)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit state"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('state', state)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete state"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal('country')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Country</span>
          </button>
          <button
            onClick={() => openModal('state')}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add State</span>
          </button>
          <button
            onClick={() => openModal('location')}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['locations', 'countries', 'states'].map((tab) => (
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
      {activeTab === 'locations' && renderLocationsTab()}
      {activeTab === 'countries' && renderCountriesTab()}
      {activeTab === 'states' && renderStatesTab()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
            </h3>
            
            {modalType === 'location' && (
              <form onSubmit={handleSubmitLocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <select
                    required
                    value={locationForm.country_id}
                    onChange={(e) => {
                      setLocationForm({ 
                        ...locationForm, 
                        country_id: e.target.value,
                        state_id: '' // Clear state when country changes
                      });
                      if (e.target.value) {
                        fetchStates(e.target.value);
                      } else {
                        setStates([]); // Clear states if no country selected
                      }
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    value={locationForm.state_id}
                    onChange={(e) => setLocationForm({ ...locationForm, state_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state.state_id} value={state.state_id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={locationForm.city}
                    onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={locationForm.latitude}
                      onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={locationForm.longitude}
                      onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Climate Zone</label>
                  <input
                    type="text"
                    value={locationForm.climate_zone}
                    onChange={(e) => setLocationForm({ ...locationForm, climate_zone: e.target.value })}
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
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'country' && (
              <form onSubmit={handleSubmitCountry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={countryForm.name}
                    onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code *</label>
                  <input
                    type="text"
                    required
                    maxLength="2"
                    value={countryForm.code}
                    onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="US, KE, etc."
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'state' && (
              <form onSubmit={handleSubmitState} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <select
                    required
                    value={stateForm.country_id}
                    onChange={(e) => setStateForm({ ...stateForm, country_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={stateForm.name}
                    onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    maxLength="3"
                    value={stateForm.code}
                    onChange={(e) => setStateForm({ ...stateForm, code: e.target.value.toUpperCase() })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="CA, NY, etc."
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;