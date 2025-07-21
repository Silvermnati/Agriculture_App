import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, Share2 } from "lucide-react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import CommentItem from "./CommentItem";
import { getCommentsForPost, getCurrentUser } from "../../utils/mockData";

const CommunityPost = ({ 
  post, 
  currentUser = getCurrentUser(), // Default to mock current user if not provided
  communityId,
  onLike, 
  onComment, 
  onShare,
  onEdit,
  onDelete
}) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already liked the post
  useEffect(() => {
    if (post.userHasLiked) {
      setLiked(true);
    }
  }, [post.userHasLiked]);

  // Load comments when comment section is opened
  useEffect(() => {
    if (showComments && comments.length === 0) {
      setIsLoading(true);
      // Simulate API call with timeout
      setTimeout(() => {
        const postComments = getCommentsForPost(post.id);
        setComments(postComments);
        setIsLoading(false);
      }, 500);
    }
  }, [showComments, post.id, comments.length]);

  const handleLike = () => {
    setLiked(!liked);
    // Update mock data (in a real app, this would be an API call)
    if (onLike) {
      onLike(post.id, !liked);
    } else {
      console.log(`${liked ? 'Unlike' : 'Like'} post ${post.id}`);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // Create a new comment with mock data
    const newComment = {
      id: `comment${Date.now()}`,
      postId: post.id,
      content: commentText,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      timestamp: new Date().toISOString(),
      isEdited: false
    };
    
    // Update local state
    setComments([newComment, ...comments]);
    setCommentText("");
    setCommentCount(commentCount + 1);
    
    // In a real app, this would be an API call
    if (onComment) {
      onComment(post.id, commentText);
    } else {
      console.log(`Add comment to post ${post.id}: ${commentText}`);
    }
  };

  const handleEditPost = () => {
    if (onEdit) {
      onEdit(post.id, post.content);
    } else {
      console.log(`Edit post ${post.id}`);
    }
  };

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id);
    } else {
      console.log(`Delete post ${post.id}`);
    }
  };

  const handleEditComment = (commentId, content) => {
    // Update local state
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, content, isEdited: true } 
        : comment
    ));
    
    // In a real app, this would be an API call
    console.log(`Edit comment ${commentId} with content: ${content}`);
  };

  const handleDeleteComment = (commentId) => {
    // Update local state
    setComments(comments.filter(comment => comment.id !== commentId));
    setCommentCount(commentCount - 1);
    
    // In a real app, this would be an API call
    console.log(`Delete comment ${commentId}`);
  };

  const isAuthor = currentUser && post.author.id === currentUser.id;
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <PostHeader 
        author={post.author}
        timestamp={post.timestamp}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />

      <PostContent 
        title={post.title}
        content={post.content}
        images={post.images}
        tags={post.tags}
        crops={post.crops}
        season={post.season}
        location={post.location}
      />

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              liked ? "text-red-600" : "text-gray-500 hover:text-red-600"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-600"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{commentCount}</span>
          </button>

          <button
            onClick={() => {
              if (onShare) {
                onShare(post.id);
              } else {
                console.log(`Share post ${post.id}`);
                alert(`Sharing post: ${post.title}`);
              }
            }}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-3">
              {currentUser && currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">
                    {currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </form>
            
            {/* Comments list */}
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading comments...</p>
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="mt-4 space-y-2 divide-y divide-gray-100">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUser ? currentUser.id : null}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;