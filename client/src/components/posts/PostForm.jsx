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

    const categories = [
        { id: 1, name: 'Crop Management' },
        { id: 2, name: 'Pest and Disease Control' },
        { id: 3, name: 'Soil Health' },
        { id: 4, name: 'Harvesting and Post-Harvesting' },
        { id: 5, name: 'Agricultural Technology' },
    ];

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
        
        onSubmit(submissionData);
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
        <div className="post-form-container">
            <div className="form-preview-toggle">
                <button 
                    type="button" 
                    onClick={() => setShowPreview(false)} 
                    disabled={!showPreview}
                    className={!showPreview ? 'active' : ''}
                >
                    Edit Form
                </button>
                <button 
                    type="button" 
                    onClick={() => setShowPreview(true)} 
                    disabled={showPreview}
                    className={showPreview ? 'active' : ''}
                >
                    Show Preview
                </button>
            </div>

            {showPreview ? (
                PostPreview
            ) : (
                <form className="post-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Post Title *</label>
                        <input 
                            id="title" 
                            type="text" 
                            name="title" 
                            placeholder="A catchy and descriptive title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className={errors.title ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Full Content *</label>
                        <ReactQuill 
                            ref={quillRef} 
                            id="content" 
                            theme="snow" 
                            value={formData.content} 
                            onChange={handleContentChange}
                            readOnly={isLoading}
                        />
                        {errors.content && <span className="error-message">{errors.content}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="excerpt">Excerpt *</label>
                        <textarea 
                            id="excerpt" 
                            name="excerpt" 
                            placeholder="A short summary to appear in post previews" 
                            value={formData.excerpt} 
                            onChange={handleChange} 
                            className={errors.excerpt ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.excerpt && <span className="error-message">{errors.excerpt}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category_id">Category *</label>
                        <select 
                            id="category_id" 
                            name="category_id" 
                            value={formData.category_id} 
                            onChange={handleChange}
                            className={errors.category_id ? 'error' : ''}
                            disabled={isLoading}
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <span className="error-message">{errors.category_id}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="related_crops">Related Crops</label>
                        <input 
                            id="related_crops" 
                            type="text" 
                            placeholder="e.g., Corn, Wheat, Soybeans" 
                            value={Array.isArray(formData.related_crops) ? formData.related_crops.join(', ') : ''} 
                            onChange={e => handleArrayChange('related_crops', e.target.value)}
                            disabled={isLoading}
                        />
                        <small>Separate multiple crops with commas</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="applicable_locations">Applicable Locations</label>
                        <input 
                            id="applicable_locations" 
                            type="text" 
                            placeholder="e.g., Nairobi, Rift Valley" 
                            value={Array.isArray(formData.applicable_locations) ? formData.applicable_locations.join(', ') : ''} 
                            onChange={e => handleArrayChange('applicable_locations', e.target.value)}
                            disabled={isLoading}
                        />
                        <small>Separate multiple locations with commas</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="season_relevance">Season Relevance</label>
                        <input 
                            id="season_relevance" 
                            type="text" 
                            name="season_relevance" 
                            placeholder="e.g., Spring, Dry Season" 
                            value={formData.season_relevance} 
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="featured_image">Featured Image</label>
                        <input 
                            id="featured_image" 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        {errors.featured_image && <span className="error-message">{errors.featured_image}</span>}
                        <small>Max file size: 5MB. Supported formats: JPEG, PNG, GIF</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value="draft">Save as Draft</option>
                            <option value="published">Publish</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
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