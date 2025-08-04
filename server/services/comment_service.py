"""
Comment service for managing comment edit/delete functionality with history tracking.
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta, timezone

from server.database import db
from server.models.post import Comment, CommentEdit
from server.models.user import User
from server.models.notifications import Notification
from server.services.notification_service import notification_service


class CommentService:
    """Service for managing comment operations."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        # Allow editing comments for up to 24 hours after creation
        self.edit_time_limit_hours = 24
    
    def edit_comment(self, comment_id: str, user_id: str, new_content: str, edit_reason: str = None) -> Dict[str, Any]:
        """
        Edit a comment with history tracking.
        
        Args:
            comment_id: ID of the comment to edit
            user_id: ID of the user attempting to edit
            new_content: New content for the comment
            edit_reason: Optional reason for the edit
            
        Returns:
            Dict with success status and updated comment data
        """
        try:
            # Validate input
            if not new_content or not new_content.strip():
                return {
                    'success': False,
                    'message': 'Comment content cannot be empty',
                    'error': 'empty_content'
                }
            
            # Get the comment
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'message': 'Comment not found',
                    'error': 'comment_not_found'
                }
            
            # Check if comment is deleted
            if getattr(comment, 'is_deleted', False):
                return {
                    'success': False,
                    'message': 'Cannot edit deleted comment',
                    'error': 'comment_deleted'
                }
            
            # Check permissions
            if not self.can_edit_comment(comment_id, user_id):
                return {
                    'success': False,
                    'message': 'You do not have permission to edit this comment',
                    'error': 'permission_denied'
                }
            
            # Check time limit for editing
            if not self._is_within_edit_time_limit(comment):
                return {
                    'success': False,
                    'message': f'Comments can only be edited within {self.edit_time_limit_hours} hours of creation',
                    'error': 'edit_time_expired'
                }
            
            # Store original content in edit history
            original_content = comment.content
            
            # Create edit history record
            edit_record = CommentEdit(
                comment_id=comment_id,
                original_content=original_content,
                new_content=new_content.strip(),
                edited_by=user_id,
                edit_reason=edit_reason
            )
            
            # Update comment
            comment.content = new_content.strip()
            setattr(comment, 'is_edited', True)
            current_edit_count = getattr(comment, 'edit_count', 0)
            setattr(comment, 'edit_count', current_edit_count + 1)
            setattr(comment, 'last_edited_at', datetime.now(timezone.utc))
            comment.updated_at = datetime.now(timezone.utc)
            
            # Save changes
            db.session.add(edit_record)
            db.session.commit()
            
            # Send notification to post author if comment was edited by someone else
            self._send_comment_edit_notification(comment, user_id)
            
            self.logger.info(f"Comment {comment_id} edited by user {user_id}")
            
            return {
                'success': True,
                'message': 'Comment edited successfully',
                'comment': comment.to_dict(),
                'edit_record': edit_record.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in edit_comment: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to edit comment: {str(e)}',
                'error': 'edit_failed'
            }
    
    def delete_comment(self, comment_id: str, user_id: str, hard_delete: bool = False) -> Dict[str, Any]:
        """
        Delete a comment (soft delete by default).
        
        Args:
            comment_id: ID of the comment to delete
            user_id: ID of the user attempting to delete
            hard_delete: Whether to permanently delete the comment
            
        Returns:
            Dict with success status and message
        """
        try:
            # Get the comment
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'message': 'Comment not found',
                    'error': 'comment_not_found'
                }
            
            # Check if already deleted
            if getattr(comment, 'is_deleted', False):
                return {
                    'success': False,
                    'message': 'Comment is already deleted',
                    'error': 'already_deleted'
                }
            
            # Check permissions
            if not self.can_delete_comment(comment_id, user_id):
                return {
                    'success': False,
                    'message': 'You do not have permission to delete this comment',
                    'error': 'permission_denied'
                }
            
            if hard_delete:
                # Hard delete - remove from database completely
                # Also delete edit history
                CommentEdit.query.filter_by(comment_id=comment_id).delete()
                db.session.delete(comment)
                
                self.logger.info(f"Comment {comment_id} hard deleted by user {user_id}")
                message = 'Comment permanently deleted'
            else:
                # Soft delete - mark as deleted (using setattr since field may not exist)
                setattr(comment, 'is_deleted', True)
                setattr(comment, 'deleted_at', datetime.utcnow())
                comment.updated_at = datetime.utcnow()
                
                self.logger.info(f"Comment {comment_id} soft deleted by user {user_id}")
                message = 'Comment deleted successfully'
            
            db.session.commit()
            
            # Send notification to post author if comment was deleted
            self._send_comment_delete_notification(comment, user_id)
            
            return {
                'success': True,
                'message': message
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in delete_comment: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to delete comment: {str(e)}',
                'error': 'delete_failed'
            }
    
    def restore_comment(self, comment_id: str, user_id: str) -> Dict[str, Any]:
        """
        Restore a soft-deleted comment.
        
        Args:
            comment_id: ID of the comment to restore
            user_id: ID of the user attempting to restore
            
        Returns:
            Dict with success status and message
        """
        try:
            # Get the comment
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'message': 'Comment not found',
                    'error': 'comment_not_found'
                }
            
            # Check if not deleted
            if not getattr(comment, 'is_deleted', False):
                return {
                    'success': False,
                    'message': 'Comment is not deleted',
                    'error': 'not_deleted'
                }
            
            # Check permissions (only comment author or admin can restore)
            if not self.can_delete_comment(comment_id, user_id):
                return {
                    'success': False,
                    'message': 'You do not have permission to restore this comment',
                    'error': 'permission_denied'
                }
            
            # Restore comment
            setattr(comment, 'is_deleted', False)
            setattr(comment, 'deleted_at', None)
            comment.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            self.logger.info(f"Comment {comment_id} restored by user {user_id}")
            
            return {
                'success': True,
                'message': 'Comment restored successfully',
                'comment': comment.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in restore_comment: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to restore comment: {str(e)}',
                'error': 'restore_failed'
            }
    
    def get_edit_history(self, comment_id: str, user_id: str = None) -> Dict[str, Any]:
        """
        Get edit history for a comment.
        
        Args:
            comment_id: ID of the comment
            user_id: ID of the requesting user (for permission check)
            
        Returns:
            Dict with edit history
        """
        try:
            # Get the comment
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'message': 'Comment not found',
                    'error': 'comment_not_found'
                }
            
            # Check if user can view edit history
            # Generally, edit history should be visible to comment author, post author, and admins
            if user_id and not self._can_view_edit_history(comment, user_id):
                return {
                    'success': False,
                    'message': 'You do not have permission to view edit history',
                    'error': 'permission_denied'
                }
            
            # Get edit history
            edit_history = CommentEdit.query.filter_by(comment_id=comment_id).order_by(
                CommentEdit.edited_at.desc()
            ).all()
            
            return {
                'success': True,
                'comment_id': comment_id,
                'edit_history': [edit.to_dict() for edit in edit_history],
                'total_edits': len(edit_history)
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_edit_history: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get edit history: {str(e)}',
                'error': 'get_history_failed'
            }
    
    def can_edit_comment(self, comment_id: str, user_id: str) -> bool:
        """
        Check if a user can edit a comment.
        
        Args:
            comment_id: ID of the comment
            user_id: ID of the user
            
        Returns:
            True if user can edit, False otherwise
        """
        try:
            comment = Comment.query.get(comment_id)
            if not comment:
                return False
            
            user = User.query.get(user_id)
            if not user:
                return False
            
            # Comment author can edit their own comments
            if str(comment.user_id) == str(user_id):
                return True
            
            # Admins can edit any comment
            if user.role == 'admin':
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error in can_edit_comment: {str(e)}")
            return False
    
    def can_delete_comment(self, comment_id: str, user_id: str) -> bool:
        """
        Check if a user can delete a comment.
        
        Args:
            comment_id: ID of the comment
            user_id: ID of the user
            
        Returns:
            True if user can delete, False otherwise
        """
        try:
            comment = Comment.query.get(comment_id)
            if not comment:
                return False
            
            user = User.query.get(user_id)
            if not user:
                return False
            
            # Comment author can delete their own comments
            if str(comment.user_id) == str(user_id):
                return True
            
            # Post author can delete comments on their posts
            if str(comment.post.author_id) == str(user_id):
                return True
            
            # Admins can delete any comment
            if user.role == 'admin':
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error in can_delete_comment: {str(e)}")
            return False
    
    def get_comment_with_permissions(self, comment_id: str, user_id: str = None) -> Dict[str, Any]:
        """
        Get comment with user permissions.
        
        Args:
            comment_id: ID of the comment
            user_id: ID of the requesting user
            
        Returns:
            Dict with comment data and permissions
        """
        try:
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'message': 'Comment not found',
                    'error': 'comment_not_found'
                }
            
            comment_data = comment.to_dict()
            
            # Add permissions if user is provided
            if user_id:
                comment_data['permissions'] = {
                    'can_edit': self.can_edit_comment(comment_id, user_id),
                    'can_delete': self.can_delete_comment(comment_id, user_id),
                    'can_view_history': self._can_view_edit_history(comment, user_id)
                }
            
            return {
                'success': True,
                'comment': comment_data
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_comment_with_permissions: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get comment: {str(e)}',
                'error': 'get_comment_failed'
            }
    
    def _is_within_edit_time_limit(self, comment: Comment) -> bool:
        """Check if comment is within the edit time limit."""
        if not comment.created_at:
            return False
        
        time_limit = timedelta(hours=self.edit_time_limit_hours)
        return datetime.utcnow() - comment.created_at <= time_limit
    
    def _can_view_edit_history(self, comment: Comment, user_id: str) -> bool:
        """Check if user can view edit history for a comment."""
        try:
            user = User.query.get(user_id)
            if not user:
                return False
            
            # Comment author can view edit history
            if str(comment.user_id) == str(user_id):
                return True
            
            # Post author can view edit history of comments on their posts
            if str(comment.post.author_id) == str(user_id):
                return True
            
            # Admins can view any edit history
            if user.role == 'admin':
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error in _can_view_edit_history: {str(e)}")
            return False
    
    def _send_comment_edit_notification(self, comment: Comment, editor_id: str):
        """Send notification when a comment is edited."""
        try:
            # Only send notification if someone else edited the comment
            if str(comment.user_id) == str(editor_id):
                return
            
            editor = User.query.get(editor_id)
            if not editor:
                return
            
            # Notify the original comment author
            notification = Notification(
                user_id=comment.user_id,
                type='comment_edited',
                title='Comment Edited',
                message=f'Your comment was edited by {editor.first_name} {editor.last_name}',
                data={
                    'comment_id': str(comment.comment_id),
                    'post_id': str(comment.post_id),
                    'editor_id': str(editor_id),
                    'editor_name': f'{editor.first_name} {editor.last_name}'
                },
                channels=['push', 'in_app']
            )
            
            db.session.add(notification)
            db.session.flush()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending comment edit notification: {str(e)}")
    
    def _send_comment_delete_notification(self, comment: Comment, deleter_id: str):
        """Send notification when a comment is deleted."""
        try:
            # Only send notification if someone else deleted the comment
            if str(comment.user_id) == str(deleter_id):
                return
            
            deleter = User.query.get(deleter_id)
            if not deleter:
                return
            
            # Notify the original comment author
            notification = Notification(
                user_id=comment.user_id,
                type='comment_deleted',
                title='Comment Deleted',
                message=f'Your comment was deleted by {deleter.first_name} {deleter.last_name}',
                data={
                    'comment_id': str(comment.comment_id),
                    'post_id': str(comment.post_id),
                    'deleter_id': str(deleter_id),
                    'deleter_name': f'{deleter.first_name} {deleter.last_name}'
                },
                channels=['push', 'in_app']
            )
            
            db.session.add(notification)
            db.session.flush()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending comment delete notification: {str(e)}")


# Global comment service instance
comment_service = CommentService()
