import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CommunityDetail from '../../components/communities/CommunityDetail';
import CommunityPost from '../../components/communities/CommunityPost';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { getCommunity, getCommunityPosts, likeCommunityPost, commentOnCommunityPost, reset } from '../../store/slices/communitiesSlice';

const CommunityDetailPage = () => {
  const { communityId } = useParams();
  const dispatch = useDispatch();
  const { currentCommunity, communityPosts, isLoading, isError, message } = useSelector((state) => state.communities);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (communityId) {
      dispatch(getCommunity(communityId));
      dispatch(getCommunityPosts({ communityId }));
    }
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, communityId]);

  const handleLike = async (postId) => {
    try {
      await dispatch(likeCommunityPost({ communityId, postId })).unwrap();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      await dispatch(commentOnCommunityPost({ 
        communityId, 
        postId, 
        commentData: { content } 
      })).unwrap();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = (postId) => {
    // TODO: Implement share functionality
    console.log(`Share post ${postId}`);
    alert(`Sharing post ${postId}`);
  };

  const handleEditPost = (postId, content) => {
    // TODO: Implement edit functionality
    console.log(`Edit post ${postId}`);
    alert(`Editing post ${postId}`);
  };

  const handleDeletePost = (postId) => {
    // TODO: Implement delete functionality
    console.log(`Delete post ${postId}`);
    alert(`Deleting post ${postId}`);
  };

  const posts = communityPosts[communityId] || [];

  if (isLoading) {
    return <LoadingSpinner text="Loading community..." />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{message}</p>
          <button 
            onClick={() => {
              dispatch(getCommunity(communityId));
              dispatch(getCommunityPosts({ communityId }));
            }}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Community not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CommunityDetail community={currentCommunity} posts={posts} />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Community Posts</h2>
        
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <CommunityPost
                key={post.id}
                post={post}
                currentUser={user}
                communityId={currentCommunity.id}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No posts in this community yet.</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Create the first post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;