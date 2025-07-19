import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommunityDetail from '../../components/communities/CommunityDetail';
import CommunityPost from '../../components/communities/CommunityPost';
import { getCommunityById, getPostsForCommunity, getCurrentUser } from '../../utils/mockData';

const CommunityDetailPage = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Simulate API call with timeout
    setLoading(true);
    setTimeout(() => {
      const communityData = getCommunityById(communityId || 'comm1');
      const communityPosts = getPostsForCommunity(communityId || 'comm1');
      
      setCommunity(communityData);
      setPosts(communityPosts);
      setLoading(false);
    }, 500);
  }, [communityId]);

  const handleLike = (postId, liked) => {
    // Update local state
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: liked ? post.likes + 1 : post.likes - 1, userHasLiked: liked } 
        : post
    ));
    
    console.log(`${liked ? 'Like' : 'Unlike'} post ${postId}`);
  };

  const handleComment = (postId, content) => {
    // Update local state
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 } 
        : post
    ));
    
    console.log(`Comment on post ${postId}: ${content}`);
  };

  const handleShare = (postId) => {
    console.log(`Share post ${postId}`);
    alert(`Sharing post ${postId}`);
  };

  const handleEditPost = (postId, content) => {
    // In a real app, this would open an edit modal
    console.log(`Edit post ${postId}`);
    alert(`Editing post ${postId}`);
  };

  const handleDeletePost = (postId) => {
    // Update local state
    setPosts(posts.filter(post => post.id !== postId));
    
    console.log(`Delete post ${postId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!community) {
    return <div className="text-center py-8">Community not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CommunityDetail community={community} posts={[]} />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Community Posts</h2>
        
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <CommunityPost
                key={post.id}
                post={post}
                currentUser={currentUser}
                communityId={community.id}
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