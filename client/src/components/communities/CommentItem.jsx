import React, { useState } from "react";
import PropTypes from 'prop-types';
import { MoreHorizontal } from "lucide-react";

const CommentItem = ({ comment, currentUserId, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  
  const isAuthor = comment.author.id === currentUserId;
  
  const handleEdit = () => {
    setIsEditing(true);
    setShowOptions(false);
  };
  
  const handleSave = () => {
    onEdit(comment.id, editedContent);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };
  
  return (
    <div className="flex space-x-3 py-3">
      <img
        src={comment.author.avatar}
        alt={comment.author.name}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-medium text-gray-900 text-sm">
              {comment.author.name}
            </h5>
            <p className="text-xs text-gray-500">{comment.timestamp}</p>
          </div>
          
          {isAuthor && (
            <div className="relative">
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 py-1">
                  <button
                    className="block w-full text-left px-4 py-1 text-xs text-gray-700 hover:bg-gray-100"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-1 text-xs text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      onDelete(comment.id);
                      setShowOptions(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
        )}
      </div>
    </div>
  );
};

CommentItem.propTypes = {
    comment: PropTypes.object.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default CommentItem;