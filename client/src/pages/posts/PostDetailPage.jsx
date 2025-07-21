// pages/Posts/PostDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import mockPostData from '../../utils/mockPostData';
import { mockComments } from '../../utils/mockData';
import PostDetail from 'components/posts/PostDetail';
import CommentSection from 'components/posts/CommentSection';

const PostDetailPage = () => {
  const { id } = useParams();
  const post = mockPostData;
  const comments = mockComments;

  // This handler will be passed to the CommentSection
  const handleCommentSubmit = (content, parentCommentId) => {
    console.log(`Adding comment: ${content} to post ${id} with parent ${parentCommentId}`);
    // In a real application, you would dispatch an action to add the comment to the backend
    // For now, we'll just log it.
  };

  if (!post) return <p>Post not found.</p>;

  return (
    <div className="post-detail-page">
      <PostDetail post={post} />
      {/* Pass the handler to make the comment form functional */}
      <CommentSection comments={post.comments || []} onCommentSubmit={handleCommentSubmit} />
    </div>
  );
};

export default PostDetailPage;