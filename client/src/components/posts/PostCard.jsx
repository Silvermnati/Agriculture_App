import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import PostActions from './PostActions';
import PostInteraction from './PostInteraction';
import Image from '../common/Image/Image';
import FollowButton from '../common/FollowButton/FollowButton';
import './posts.css';

const PostCard = ({ post, showActions = true }) => {
  const currentUser = useSelector(state => state.auth.user);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const postId = post.id || post.post_id;
  const isOwnPost = currentUser?.user_id === post.author?.user_id;

  return (
    <article className="post-card">
      {/* Featured Image */}
      <div className="post-card-image">
        <Link to={`/posts/${postId}`}>
          <Image 
            src={post.featured_image_url} 
            alt={post.title}
            className="post-card-image-content"
            fallbackType="post"
            optimize={true}
          />
        </Link>
      </div>

      <div className="post-card-content">
        {/* Header with title and actions */}
        <div className="post-card-header">
          <div className="post-card-category">
            {post.category?.name && (
              <span className="category-badge">
                {post.category.name}
              </span>
            )}
          </div>
          {showActions && <PostActions post={post} />}
        </div>

        {/* Title */}
        <h2 className="post-card-title">
          <Link to={`/posts/${postId}`}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="post-card-excerpt">
            {post.excerpt}
          </p>
        )}

        {/* Agricultural Context */}
        <div className="post-card-context">
          {post.related_crops && post.related_crops.length > 0 && (
            <div className="context-item">
              <strong>Crops:</strong> {post.related_crops.slice(0, 3).join(', ')}
              {post.related_crops.length > 3 && ` +${post.related_crops.length - 3} more`}
            </div>
          )}
          
          {post.applicable_locations && post.applicable_locations.length > 0 && (
            <div className="context-item">
              <strong>Locations:</strong> {post.applicable_locations.slice(0, 2).join(', ')}
              {post.applicable_locations.length > 2 && ` +${post.applicable_locations.length - 2} more`}
            </div>
          )}
          
          {post.season_relevance && (
            <div className="context-item">
              <strong>Season:</strong> {post.season_relevance}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-card-tags">
            {post.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="tag-more">+{post.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer with author, stats, and date */}
        <div className="post-card-footer">
          <div className="post-author-section">
            <div className="post-author">
              <Image 
                src={post.author?.avatar_url} 
                alt={post.author?.name || 'Anonymous'}
                className="author-avatar"
                fallbackType="avatar"
                optimize={true}
              />
              <div className="author-info">
                <span className="author-name">{post.author?.name || 'Anonymous'}</span>
                {post.author?.role && (
                  <span className="author-role">{post.author.role}</span>
                )}
              </div>
            </div>
            
            {/* Follow Button for post author */}
            {currentUser && !isOwnPost && post.author?.user_id && (
              <div className="post-author-follow">
                <FollowButton 
                  userId={post.author.user_id}
                  initialFollowState={post.author.is_following || false}
                  showStats={false}
                  size="small"
                />
              </div>
            )}
          </div>

          <div className="post-footer-right">
            <div className="post-stats">
              <PostInteraction post={post} />
              <div className="stat-item">
                <Eye size={16} />
                <span>{post.view_count || 0}</span>
              </div>
            </div>

            <div className="post-meta">
              {post.published_at && (
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              {post.read_time && (
                <div className="meta-item">
                  <span>{post.read_time} min read</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;