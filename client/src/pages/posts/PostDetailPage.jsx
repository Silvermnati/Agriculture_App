// pages/Posts/PostDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPost, getComments, addComment, reset } from '../../store/slices/postsSlice';
import PostDetail from '../../components/posts/PostDetail';
import CommentSection from '../../components/posts/CommentSection';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';

const PostDetailPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost, postComments, isLoading, isError, message } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(getPost(postId));
    dispatch(getComments(postId));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, postId]);

  const handleCommentSubmit = (content, parentCommentId) => {
    dispatch(addComment({ postId, commentData: { content, parent_comment_id: parentCommentId } }));
  };

  if (isLoading && !currentPost) return <LoadingSpinner text="Loading post..." />;
  if (isError) return <ErrorMessage error={message} onRetry={() => { dispatch(getPost(postId)); dispatch(getComments(postId)); }} />;
  if (!currentPost) return <p>Post not found.</p>;

  return (
    <div className="post-detail-page">
      <PostDetail post={currentPost} />
      <CommentSection comments={postComments[postId] || []} onCommentSubmit={handleCommentSubmit} />
    </div>
  );
};

export default PostDetailPage;
