import React, { useState } from "react";
import './posts.css';

const PostForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        content:'',
        excerpt:'',
        category_id: [],
        applicable_locations:[],
        season_relevance:'',
        featured_image: null,
        tags:[],
        status:'draft'
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
    
    return(
        <form className="post-form" onSubmit={handleSubmit}>

            <input type="text" name="title" placeholder="Post Title" value={formData.title} onChange={handleChange} required/>

            <textarea name="excerpt" placeholder="Excerpt" value={formData.content} onChange={handleChange} required/>

            <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">select category</option>
                {/* add categories dynamically */}
            </select>

            <input type="text" name="related_crops" placeholder="Related Crops(comma-separated)" onChange={e => setFormData({...formData, related_crops: e.target.value.split(',')})}/>

            <input type="text" name="applicable_locations" placeholder="locations(comma-separated)" onChange={e => setFormData({...formData, applicable: e.target.value.split(',')})}/>

            <input type="text" name="season_relevance" placeholder="season(e.g Dry, Wet)" value={formData.season_relevance} onChange={handleChange}/>

            <input type="file" onChange={handleFileChange}/>

            <input type="text" name="tags" placeholder="Tags (comma-separated)" onChange={e => setFormData({...formData, tags: e.target.value.split(',')})}/>

            <select name="status" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Publish</option>
            </select>
            <button type="submit">Save Post</button>

        </form>
    );
};

export default PostForm;