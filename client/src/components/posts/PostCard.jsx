import React from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import './posts.css';

const PostCard = ({ post }) => {
    const navigate = useNavigate();

    const {
        id,
        title,
        excerpt,
        featured_image_url,
        author,
        category,
        related_crops,
        season_relevance,
        view_count,
        like_count,
        comment_count,
        published_at,
        read_time
    } = post;

    
    const handleCardClick = () => {
        navigate(`/posts/${id}`);
    };

    return (
        <div className='post-card' onClick={handleCardClick}>
            <img
            src={featured_image_url || '/fallback.jpg'}
            alt={title}
            className='post-image'
            />
            <div className='post-content'>
                <h3>{title}</h3>
                <p>{excerpt}</p>
                <div className='post-meta'>
                    <div className='author-info'>
                        <img src={author?.avatar_url || '/default-avatar.png'} alt={author?.name} className='avatar'/>

                        <div>
                            <span>{author?.name || 'Anonymous'}</span>
                            <small>{author?.role}</small>
                        </div>
                    </div>
                </div>
                <div className='badges'>
                    {related_crops && Array.isArray(related_crops) && related_crops.map(crop => (
                        <span className='badge crop' key={crop}>{crop}</span>
                    ))}
                    {season_relevance && <span className='badge season'>{season_relevance}</span>}
                    {post.applicable_locations && Array.isArray(post.applicable_locations) && post.applicable_locations.map(loc => (
                        <span className='badge location' key={loc}>{loc}</span>
                    ))}
                </div>
                <div className='post-stats'>
                    <span title="Views">👁️ {view_count}</span>
                    <span title="Likes">❤️ {like_count}</span>
                    <span title="Comments">💬 {comment_count}</span>
                    <span title="Read time">🕒 {read_time} min read</span>
                </div>
                <div className='post-footer'>
                    <span className='category'>{category?.name}</span>
                    <span className='date'>{new Date(published_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

PostCard.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        excerpt: PropTypes.string.isRequired,
        featured_image_url: PropTypes.string,
        author: PropTypes.shape({
            name: PropTypes.string,
            avatar_url: PropTypes.string,
            role: PropTypes.string,
        }),
        category: PropTypes.shape({
            name: PropTypes.string,
        }),
        related_crops: PropTypes.arrayOf(PropTypes.string),
        season_relevance: PropTypes.string,
        applicable_locations: PropTypes.arrayOf(PropTypes.string),
        view_count: PropTypes.number,
        like_count: PropTypes.number,
        comment_count: PropTypes.number,
        published_at: PropTypes.string.isRequired,
        read_time: PropTypes.number,
    }).isRequired,
};

export default PostCard;