import React from "react";
import ProfilePicture from '../Profile/ProfilePicture';

const PostHeader = ({ author, timestamp, isAuthor, isAdmin, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = React.useState(false);
  
  const handleOptionsClick = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="flex items-start space-x-3 mb-4">
      <ProfilePicture 
        imageUrl={author.avatar}
        userName={author.name}
        size="small"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{author.name}</h4>
            <p className="text-sm text-gray-500">{timestamp}</p>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={handleOptionsClick}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onEdit();
                      setShowOptions(false);
                    }}
                  >
                    Edit Post
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      onDelete();
                      setShowOptions(false);
                    }}
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostHeader;