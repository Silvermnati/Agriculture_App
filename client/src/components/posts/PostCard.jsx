import React from 'react';
import { useNavigate } from 'react-router';
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
        published_at

    } = post;

    const readTime = Math.ceil(excerpt.split(' ').length/200);

    const handleCardClick = () => {
        navigate(`posts/${id}`);
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
                        <img src={author.avatar_url} alt={author.name} className='avatar'/>

                        <div>
                            <span>{author.name}</span>
                            <small>{author.role}</small>
                        </div>
                    </div>
                <div className='badges'>
                    {related_crops.map(crop => (
                        <span className='badge crop' key={crop}></span>
                    ))}
                    {season_relevance && <span className='badge season'>{season_relevance}</span>}
                    {post.applicable_locations?.map(loc => (
                        <span className='badge location' key={loc}></span>
                    ))}
                </div>
                <div className='post-stats'>
                    <span>{view_count}</span>
                    <span>{like_count}</span>
                    <span>{comment_count}</span>
                    <span>{readTime} min read</span>       
                </div>
                <div className='post-footer'>
                    <span className='category'>{category.name}</span>
                    <span className='date'>{new Date(published_at).toLocaleDateString()}</span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;