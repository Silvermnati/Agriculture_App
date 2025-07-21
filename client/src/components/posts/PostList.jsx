// components/Posts/PostList.jsx
import React from "react";
import PropTypes from 'prop-types';
import PostCard from "./PostCard";
import './posts.css'

const PostList = ({ posts, pagination, onPageChange }) => {
    if (!posts || posts.length === 0) {
        return <p>No posts found.</p>;
    }

    return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {pagination && pagination.total_pages > 1 && (
        <div className="pagination">
          <button key="prev" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1}>
            ← Previous
          </button>
          <span>Page {pagination.page} of {pagination.total_pages}</span>
          <button key="next" onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.total_pages}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

PostList.propTypes = {
    posts: PropTypes.array.isRequired,
    pagination: PropTypes.object,
    onPageChange: PropTypes.func.isRequired,
};

export default PostList;