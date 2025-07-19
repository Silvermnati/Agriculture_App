import React, { useState } from "react";
import { Lock, Plus, MessageSquare } from "lucide-react";

const CommunityDetail = ({ community, posts }) => {
  const [activeTab, setActiveTab] = useState("posts");

  if (!community) return <div>Community not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative h-64">
          <img
            src={community.image_url}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
              <p className="text-lg opacity-90">{community.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {community.member_count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {community.posts_count}
              </div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {community.admin_count}
              </div>
              <div className="text-sm text-gray-500">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {community.focus_crops.length}
              </div>
              <div className="text-sm text-gray-500">Focus Areas</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  community.community_type === "Regional"
                    ? "bg-blue-100 text-blue-800"
                    : community.community_type === "Crop-Specific"
                    ? "bg-green-100 text-green-800"
                    : community.community_type === "Urban"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {community.community_type}
              </span>
              {community.is_private && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Private
                </span>
              )}
            </div>

            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
              Join Community
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {["posts", "members", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              <button className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-left hover:bg-green-100 transition-colors">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-600 font-medium">
                    Share something with the community...
                  </span>
                </div>
              </button>

              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {post.author}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {post.timestamp}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {post.title}
                      </h4>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="hover:text-green-600">
                          👍 {post.likes}
                        </button>
                        <button className="hover:text-green-600">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "members" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Community Members</h3>
              <div className="text-gray-500">
                Member list functionality would be implemented here
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                About this Community
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-700">{community.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {community.focus_crops.map((crop) => (
                      <span
                        key={crop}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                {community.location.city && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-700">
                      {community.location.city}, {community.location.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
