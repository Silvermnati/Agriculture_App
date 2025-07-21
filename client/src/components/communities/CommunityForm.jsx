import React, { useState } from "react";

const CommunityForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    community_type: initialData?.community_type || "Regional",
    focus_crops: initialData?.focus_crops || [""],
    location_city: initialData?.location?.city || "",
    location_country: initialData?.location?.country || "Kenya",
    is_private: initialData?.is_private || false,
  });

  const handleSubmit = () => {
    // Format the data to match the backend API structure
    const formattedData = {
      name: formData.name,
      description: formData.description,
      community_type: formData.community_type,
      focus_crops: formData.focus_crops.filter(crop => crop.trim() !== ""),
      location: {
        city: formData.location_city,
        country: formData.location_country
      },
      is_private: formData.is_private
    };
    
    onSubmit(formattedData);
  };

  const addCrop = () => {
    setFormData((prev) => ({
      ...prev,
      focus_crops: [...prev.focus_crops, ""],
    }));
  };

  const updateCrop = (index, value) => {
    const newCrops = [...formData.focus_crops];
    newCrops[index] = value;
    setFormData((prev) => ({ ...prev, focus_crops: newCrops }));
  };

  const removeCrop = (index) => {
    setFormData((prev) => ({
      ...prev,
      focus_crops: prev.focus_crops.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? "Edit Community" : "Create New Community"}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Community Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Community Type
          </label>
          <select
            value={formData.community_type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                community_type: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Regional">Regional</option>
            <option value="Crop-Specific">Crop-Specific</option>
            <option value="Urban">Urban</option>
            <option value="Professional">Professional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Crops/Areas
          </label>
          {formData.focus_crops.map((crop, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={crop}
                onChange={(e) => updateCrop(index, e.target.value)}
                placeholder="e.g., Coffee, Maize, Vegetables"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formData.focus_crops.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCrop(index)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCrop}
            className="text-green-600 hover:text-green-700 text-sm"
          >
            + Add Another Crop
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City (Optional)
            </label>
            <input
              type="text"
              value={formData.location_city}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location_city: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={formData.location_country}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location_country: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_private"
            checked={formData.is_private}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_private: e.target.checked }))
            }
            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <label htmlFor="is_private" className="ml-2 text-sm text-gray-700">
            Make this community private (requires approval to join)
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {initialData ? "Update" : "Create"} Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityForm;
