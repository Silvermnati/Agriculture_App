import React, { useState, useMemo, useRef } from "react";
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import './posts.css';
import 'react-quill/dist/quill.snow.css';

const PostForm = ({ onSubmit, isLoading = false, initialData = null, isEdit = false }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        content: '',
        excerpt: '',
        category_id: '',
        applicable_locations: [],
        related_crops: [],
        season_relevance: '',
        featured_image: null,
        status: 'draft'
    });
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState({});
    const quillRef = useRef(null);

    const [categories, setCategories] = useState([
        { id: 1, name: 'Crop Management' },
        { id: 2, name: 'Pest and Disease Control' },
        { id: 3, name: 'Soil Health' },
        { id: 4, name: 'Harvesting and Post-Harvesting' },
        { id: 5, name: 'Agricultural Technology' },
    ]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!formData.content.trim() || formData.content === '<p><br></p>') {
            newErrors.content = 'Content is required';
        }
        
        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'Excerpt is required';
        }
        
        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleContentChange = value => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
        
        if (errors.content) {
            setErrors(prev => ({
                ...prev,
                content: ''
            }));
        }
    };
    
    const handleFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    featured_image: 'File size must be less than 5MB'
                }));
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    featured_image: 'Only JPEG, PNG, and GIF files are allowed'
                }));
                return;
            }
        }
        
        setFormData(prev => ({
            ...prev,
            featured_image: file
        }));
        
        if (errors.featured_image) {
            setErrors(prev => ({
                ...prev,
                featured_image: ''
            }));
        }
    };

    const handleArrayChange = (field, value) => {
        const arrayValue = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setFormData(prev => ({
            ...prev,
            [field]: arrayValue
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Ensure arrays are properly formatted
        const submissionData = {
            ...formData,
            related_crops: Array.isArray(formData.related_crops) ? formData.related_crops : [],
            applicable_locations: Array.isArray(formData.applicable_locations) ? formData.applicable_locations : []
        };
        
        console.log('Form submission data:', submissionData);
        
        const finalSubmissionData = new FormData();

        for (const key in submissionData) {
            if (submissionData[key] !== null && submissionData[key] !== undefined) {
                if (Array.isArray(submissionData[key])) {
                    // Send arrays as JSON strings to avoid backend parsing issues
                    finalSubmissionData.append(key, JSON.stringify(submissionData[key]));
                    console.log(`Added array as JSON: ${key} = ${JSON.stringify(submissionData[key])}`);
                } else {
                    finalSubmissionData.append(key, submissionData[key]);
                    console.log(`Added field: ${key} = ${submissionData[key]}`);
                }
            }
        }
        
        // Log FormData contents for debugging
        console.log('FormData contents:');
        for (let [key, value] of finalSubmissionData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        onSubmit(finalSubmissionData);
    };
    
    const PostPreview = useMemo(() => (
        <div className="post-preview-container">
            <h2>Preview: {formData.title || "Your Title Here"}</h2>
            <p><em>{formData.excerpt || "Your excerpt will appear here."}</em></p>
            <hr />
            <div className="post-content-preview" dangerouslySetInnerHTML={{ __html: formData.content || "<p>Your full post content will be rendered here.</p>" }} />
            {formData.related_crops.length > 0 && (
                <div>
                    <strong>Related Crops:</strong> {formData.related_crops.join(', ')}
                </div>
            )}
            {formData.applicable_locations.length > 0 && (
                <div>
                    <strong>Applicable Locations:</strong> {formData.applicable_locations.join(', ')}
                </div>
            )}
        </div>
    ), [formData.title, formData.excerpt, formData.content, formData.related_crops, formData.applicable_locations]);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <button 
          type="button" 
          onClick={() => setShowPreview(false)} 
          className={`px-6 py-2 rounded-l-lg text-lg font-semibold transition-colors duration-200 ${!showPreview ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Edit Form
        </button>
        <button 
          type="button" 
          onClick={() => setShowPreview(true)} 
          className={`px-6 py-2 rounded-r-lg text-lg font-semibold transition-colors duration-200 ${showPreview ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Show Preview
        </button>
      </div>

            {showPreview ? (
                PostPreview
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Post Title <span className="text-red-500">*</span></label>
                        <input 
                            id="title" 
                            type="text" 
                            name="title" 
                            placeholder="A catchy and descriptive title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                        />
                        {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Full Content <span className="text-red-500">*</span></label>
                        <ReactQuill 
                            ref={quillRef} 
                            id="content" 
                            theme="snow" 
                            value={formData.content} 
                            onChange={handleContentChange}
                            readOnly={isLoading}
                            className={`${errors.content ? 'border border-red-500 rounded-md' : ''}`}
                        />
                        {errors.content && <span className="text-red-500 text-sm mt-1">{errors.content}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt <span className="text-red-500">*</span></label>
                        <textarea 
                            id="excerpt" 
                            name="excerpt" 
                            placeholder="A short summary to appear in post previews" 
                            value={formData.excerpt} 
                            onChange={handleChange} 
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.excerpt ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                        />
                        {errors.excerpt && <span className="text-red-500 text-sm mt-1">{errors.excerpt}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <select 
                            id="category_id" 
                            name="category_id" 
                            value={formData.category_id} 
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.category_id ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <span className="text-red-500 text-sm mt-1">{errors.category_id}</span>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="related_crops" className="block text-sm font-medium text-gray-700 mb-1">Related Crops</label>
                        <input 
                            id="related_crops" 
                            type="text" 
                            placeholder="e.g., Corn, Wheat, Soybeans" 
                            value={Array.isArray(formData.related_crops) ? formData.related_crops.join(', ') : ''} 
                            onChange={e => handleArrayChange('related_crops', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                        <small className="text-gray-500 text-sm mt-1">Separate multiple crops with commas</small>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="applicable_locations" className="block text-sm font-medium text-gray-700 mb-1">Applicable Locations</label>
                        <input 
                            id="applicable_locations" 
                            type="text" 
                            placeholder="e.g., Nairobi, Rift Valley" 
                            value={Array.isArray(formData.applicable_locations) ? formData.applicable_locations.join(', ') : ''} 
                            onChange={e => handleArrayChange('applicable_locations', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                        <small className="text-gray-500 text-sm mt-1">Separate multiple locations with commas</small>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="season_relevance" className="block text-sm font-medium text-gray-700 mb-1">Season Relevance</label>
                        <input 
                            id="season_relevance" 
                            type="text" 
                            name="season_relevance" 
                            placeholder="e.g., Spring, Dry Season" 
                            value={formData.season_relevance} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                        <input 
                            id="featured_image" 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            disabled={isLoading}
                        />
                        {errors.featured_image && <span className="text-red-500 text-sm mt-1">{errors.featured_image}</span>}
                        <small className="text-gray-500 text-sm mt-1">Max file size: 5MB. Supported formats: JPEG, PNG, GIF</small>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        >
                            <option value="draft">Save as Draft</option>
                            <option value="published">Publish</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Post'}
                    </button>
                </form>
            )}
        </div>
    );
};

PostForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    initialData: PropTypes.object,
    isEdit: PropTypes.bool,
};

export default PostForm;