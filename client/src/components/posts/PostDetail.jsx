// components/Posts/PostDetail.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Image from '../common/Image/Image';
import './posts.css';

const PostDetail = ({ post }) => {
  if (!post) return <p>Loading post...</p>;

  return (
    <div className="post-detail">
      <Image 
        src={post.featured_image_url} 
        alt={post.title} 
        className="detail-image" 
        fallbackType="postLarge"
      />
      <h1>{post.title}</h1>
      <p className="excerpt">{post.excerpt}</p>

      <div className="author-bar">
        <Image 
          src={post.author?.avatar_url} 
          alt={post.author?.name || 'Anonymous'} 
          className="avatar" 
          fallbackType="avatar"
        />
        <span>{post.author?.name || 'Anonymous'} • {new Date(post.published_at).toLocaleDateString()}</span>
        {post.category && <span className="category">{post.category.name}</span>}
      </div>
      

      <div className="context-badges">
        {post.related_crops && Array.isArray(post.related_crops) && post.related_crops.map(crop => (
          <span className="badge crop" key={crop}>{crop}</span>
        ))}
        {post.season_relevance && <span className="badge season">{post.season_relevance}</span>}
        {post.applicable_locations && Array.isArray(post.applicable_locations) && post.applicable_locations.map(loc => (
          <span className="badge location" key={loc}>{loc}</span>
        ))}
      </div>


      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="post-stats">
        <span>👁️ {post.view_count}</span>
        <span>❤️ {post.like_count}</span>
        <span>💬 {post.comment_count}</span>
      </div>
    </div>
  );
};

PostDetail.propTypes = {
    post: PropTypes.shape({
        title: PropTypes.string.isRequired,
        excerpt: PropTypes.string.isRequired,
        featured_image_url: PropTypes.string,
        author: PropTypes.shape({
            name: PropTypes.string,
            avatar_url: PropTypes.string,
        }),
        published_at: PropTypes.string.isRequired,
        category: PropTypes.shape({
            name: PropTypes.string,
        }),
        related_crops: PropTypes.arrayOf(PropTypes.string),
        season_relevance: PropTypes.string,
        applicable_locations: PropTypes.arrayOf(PropTypes.string),
        content: PropTypes.string.isRequired,
        view_count: PropTypes.number,
        like_count: PropTypes.number,
        comment_count: PropTypes.number,
    }),
};

export default PostDetail;
