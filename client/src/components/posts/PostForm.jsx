import React, { useState, useMemo } from "react";
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import './posts.css';
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor

const PostForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        content:'',
        excerpt:'',
        category_id: '',
        applicable_locations:[],
        related_crops: [],
        season_relevance:'',
        featured_image: null,
        tags:[],
        status:'draft'
    });
    const [showPreview, setShowPreview] = useState(false);

    const categories = [
        { id: 1, name: 'Crop Management' },
        { id: 2, name: 'Pest and Disease Control' },
        { id: 3, name: 'Soil Health' },
        { id: 4, name: 'Harvesting and Post-Harvesting' },
        { id: 5, name: 'Agricultural Technology' },
    ];

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = value => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
    };
    
    const handleFileChange = e => {
        setFormData(prev => ({
            ...prev,
            featured_image: e.target.files[0]
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const PostPreview = useMemo(() => (
        <div className="post-preview-container">
            <h2>Preview: {formData.title || "Your Title Here"}</h2>
            <p><em>{formData.excerpt || "Your excerpt will appear here."}</em></p>
            <hr />
            <div className="post-content-preview" dangerouslySetInnerHTML={{ __html: formData.content || "<p>Your full post content will be rendered here.</p>" }} />
        </div>
    ), [formData.title, formData.excerpt, formData.content]);

    return(
        <div>
            <div className="form-preview-toggle">
                <button type="button" onClick={() => setShowPreview(false)} disabled={!showPreview}>Edit Form</button>
                <button type="button" onClick={() => setShowPreview(true)} disabled={showPreview}>Show Preview</button>
            </div>

            {showPreview ? (
                PostPreview
            ) : (
                <form className="post-form" onSubmit={handleSubmit}>
                    <label htmlFor="title">Post Title</label>
                    <input id="title" type="text" name="title" placeholder="A catchy and descriptive title" value={formData.title} onChange={handleChange} required/>

                    <label htmlFor="content">Full Content</label>
                    <ReactQuill id="content" theme="snow" value={formData.content} onChange={handleContentChange} />

                    <label htmlFor="excerpt">Excerpt</label>
                    <textarea id="excerpt" name="excerpt" placeholder="A short summary to appear in post previews" value={formData.excerpt} onChange={handleChange} required/>

                    <label htmlFor="category_id">Category</label>
                    <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
                        <option value="">select category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    <label htmlFor="related_crops">Related Crops (comma-separated)</label>
                    <input id="related_crops" type="text" name="related_crops" placeholder="e.g., Corn, Wheat, Soybeans" value={Array.isArray(formData.related_crops) ? formData.related_crops.join(', ') : ''} onChange={e => setFormData({...formData, related_crops: e.target.value.split(',').map(s => s.trim())})}/>

                    {/* TODO: Replace with a proper multi-select component */}
                    <label htmlFor="applicable_locations">Applicable Locations (comma-separated)</label>
                    <input id="applicable_locations" type="text" name="applicable_locations" placeholder="e.g., Nairobi, Rift Valley" value={Array.isArray(formData.applicable_locations) ? formData.applicable_locations.join(', ') : ''} onChange={e => setFormData({...formData, applicable_locations: e.target.value.split(',').map(s => s.trim())})}/>

                    <label htmlFor="season_relevance">Season Relevance</label>
                    <input id="season_relevance" type="text" name="season_relevance" placeholder="e.g., Spring, Dry Season" value={formData.season_relevance} onChange={handleChange}/>

                    <label htmlFor="featured_image">Featured Image</label>
                    <input id="featured_image" type="file" onChange={handleFileChange}/>

                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input id="tags" type="text" name="tags" placeholder="e.g., organic, pest-control" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim())})}/>

                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="draft">Save as Draft</option>
                        <option value="published">Publish</option>
                    </select>
                    <button type="submit">Save Post</button>
                </form>
            )}
        </div>
    );
};

PostForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default PostForm;