import React, { useState } from "react";
import { MessageSquare, Heart, Share2, MoreHorizontal } from "lucide-react";

const CommunityPost = ({ post, onLike, onComment, onShare }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    if (onLike) onLike(post.id, !liked);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start space-x-3 mb-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{post.author.name}</h4>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-700 mb-3">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover h-48"
              />
            ))}
          </div>
        )}

        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

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
            <span>{post.comments}</span>
          </button>

          <button
            onClick={() => onShare && onShare(post.id)}
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
            <div className="flex space-x-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;
