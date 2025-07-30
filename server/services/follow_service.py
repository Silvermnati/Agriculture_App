"""
User follow service for managing follow relationships and notifications.
"""

import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from server.database import db
from server.models.user import User, UserFollow
from server.models.notifications import Notification
from server.services.notification_service import notification_service


class FollowService:
    """Service for managing user follow relationships."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def follow_user(self, follower_id: str, following_id: str, notification_enabled: bool = True) -> Dict[str, Any]:
        """
        Follow a user.
        
        Args:
            follower_id: ID of the user who wants to follow
            following_id: ID of the user to be followed
            notification_enabled: Whether to enable notifications for this follow
            
        Returns:
            Dict with success status and message
        """
        try:
            # Prevent self-following
            if follower_id == following_id:
                return {
                    'success': False,
                    'message': 'Cannot follow yourself',
                    'error': 'self_follow_not_allowed'
                }
            
            # Check if users exist
            follower = User.query.get(follower_id)
            following = User.query.get(following_id)
            
            if not follower:
                return {
                    'success': False,
                    'message': 'Follower user not found',
                    'error': 'follower_not_found'
                }
            
            if not following:
                return {
                    'success': False,
                    'message': 'User to follow not found',
                    'error': 'following_not_found'
                }
            
            # Check if already following
            existing_follow = UserFollow.query.filter_by(
                follower_id=follower_id,
                following_id=following_id
            ).first()
            
            if existing_follow:
                return {
                    'success': False,
                    'message': 'Already following this user',
                    'error': 'already_following'
                }
            
            # Create follow relationship
            follow = UserFollow(
                follower_id=follower_id,
                following_id=following_id,
                notification_enabled=notification_enabled
            )
            
            db.session.add(follow)
            db.session.commit()
            
            # Send notification to the followed user
            self._send_follow_notification(follower, following)
            
            self.logger.info(f"User {follower_id} started following {following_id}")
            
            return {
                'success': True,
                'message': 'Successfully followed user',
                'follow': follow.to_dict()
            }
            
        except IntegrityError as e:
            db.session.rollback()
            self.logger.error(f"Integrity error in follow_user: {str(e)}")
            return {
                'success': False,
                'message': 'Follow relationship already exists',
                'error': 'duplicate_follow'
            }
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in follow_user: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to follow user: {str(e)}',
                'error': 'follow_failed'
            }
    
    def unfollow_user(self, follower_id: str, following_id: str) -> Dict[str, Any]:
        """
        Unfollow a user.
        
        Args:
            follower_id: ID of the user who wants to unfollow
            following_id: ID of the user to be unfollowed
            
        Returns:
            Dict with success status and message
        """
        try:
            # Find the follow relationship
            follow = UserFollow.query.filter_by(
                follower_id=follower_id,
                following_id=following_id
            ).first()
            
            if not follow:
                return {
                    'success': False,
                    'message': 'Not following this user',
                    'error': 'not_following'
                }
            
            # Remove follow relationship
            db.session.delete(follow)
            db.session.commit()
            
            self.logger.info(f"User {follower_id} unfollowed {following_id}")
            
            return {
                'success': True,
                'message': 'Successfully unfollowed user'
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in unfollow_user: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to unfollow user: {str(e)}',
                'error': 'unfollow_failed'
            }
    
    def get_followers(self, user_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """
        Get list of users following the specified user.
        
        Args:
            user_id: ID of the user whose followers to get
            page: Page number for pagination
            per_page: Number of followers per page
            
        Returns:
            Dict with followers list and pagination info
        """
        try:
            # Query followers with pagination
            followers_query = db.session.query(User).join(
                UserFollow, User.user_id == UserFollow.follower_id
            ).filter(UserFollow.following_id == user_id)
            
            paginated = followers_query.paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            followers = []
            for user in paginated.items:
                follower_data = user.to_dict()
                # Add follow date
                follow = UserFollow.query.filter_by(
                    follower_id=user.user_id,
                    following_id=user_id
                ).first()
                if follow:
                    follower_data['followed_at'] = follow.created_at.isoformat()
                    follower_data['notification_enabled'] = follow.notification_enabled
                
                followers.append(follower_data)
            
            return {
                'success': True,
                'followers': followers,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_followers: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get followers: {str(e)}',
                'error': 'get_followers_failed'
            }
    
    def get_following(self, user_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """
        Get list of users that the specified user is following.
        
        Args:
            user_id: ID of the user whose following list to get
            page: Page number for pagination
            per_page: Number of following per page
            
        Returns:
            Dict with following list and pagination info
        """
        try:
            # Query following with pagination
            following_query = db.session.query(User).join(
                UserFollow, User.user_id == UserFollow.following_id
            ).filter(UserFollow.follower_id == user_id)
            
            paginated = following_query.paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            following = []
            for user in paginated.items:
                following_data = user.to_dict()
                # Add follow date and notification settings
                follow = UserFollow.query.filter_by(
                    follower_id=user_id,
                    following_id=user.user_id
                ).first()
                if follow:
                    following_data['followed_at'] = follow.created_at.isoformat()
                    following_data['notification_enabled'] = follow.notification_enabled
                
                following.append(following_data)
            
            return {
                'success': True,
                'following': following,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_following: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get following: {str(e)}',
                'error': 'get_following_failed'
            }
    
    def get_follow_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get follow statistics for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dict with follower and following counts
        """
        try:
            follower_count = UserFollow.query.filter_by(following_id=user_id).count()
            following_count = UserFollow.query.filter_by(follower_id=user_id).count()
            
            return {
                'success': True,
                'stats': {
                    'followers': follower_count,
                    'following': following_count
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_follow_stats: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get follow stats: {str(e)}',
                'error': 'get_stats_failed'
            }
    
    def is_following(self, follower_id: str, following_id: str) -> bool:
        """
        Check if one user is following another.
        
        Args:
            follower_id: ID of the potential follower
            following_id: ID of the potential followed user
            
        Returns:
            True if following, False otherwise
        """
        try:
            follow = UserFollow.query.filter_by(
                follower_id=follower_id,
                following_id=following_id
            ).first()
            return follow is not None
            
        except Exception as e:
            self.logger.error(f"Error in is_following: {str(e)}")
            return False
    
    def update_notification_preference(self, follower_id: str, following_id: str, enabled: bool) -> Dict[str, Any]:
        """
        Update notification preference for a follow relationship.
        
        Args:
            follower_id: ID of the follower
            following_id: ID of the followed user
            enabled: Whether notifications should be enabled
            
        Returns:
            Dict with success status and message
        """
        try:
            follow = UserFollow.query.filter_by(
                follower_id=follower_id,
                following_id=following_id
            ).first()
            
            if not follow:
                return {
                    'success': False,
                    'message': 'Follow relationship not found',
                    'error': 'follow_not_found'
                }
            
            follow.notification_enabled = enabled
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Notification preference updated successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in update_notification_preference: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to update notification preference: {str(e)}',
                'error': 'update_failed'
            }
    
    def notify_followers(self, user_id: str, event_type: str, event_data: Dict[str, Any]) -> int:
        """
        Send notifications to all followers of a user.
        
        Args:
            user_id: ID of the user whose followers should be notified
            event_type: Type of event (new_post, new_article, etc.)
            event_data: Additional data about the event
            
        Returns:
            Number of notifications sent
        """
        try:
            # Get followers with notifications enabled
            followers = db.session.query(UserFollow).filter_by(
                following_id=user_id,
                notification_enabled=True
            ).all()
            
            if not followers:
                return 0
            
            # Get the user who triggered the event
            user = User.query.get(user_id)
            if not user:
                self.logger.error(f"User {user_id} not found for follower notification")
                return 0
            
            notifications_sent = 0
            
            for follow in followers:
                try:
                    # Create notification based on event type
                    notification_data = self._create_follower_notification_data(
                        event_type, user, event_data
                    )
                    
                    if notification_data:
                        notification = Notification(
                            user_id=follow.follower_id,
                            type=event_type,
                            title=notification_data['title'],
                            message=notification_data['message'],
                            data=notification_data['data'],
                            channels=['push', 'in_app']
                        )
                        
                        db.session.add(notification)
                        db.session.flush()
                        
                        # Send notification asynchronously
                        import asyncio
                        try:
                            asyncio.run(notification_service.send_notification(notification))
                            notifications_sent += 1
                        except Exception as e:
                            self.logger.error(f"Failed to send notification: {str(e)}")
                        
                except Exception as e:
                    self.logger.error(f"Error creating notification for follower {follow.follower_id}: {str(e)}")
                    continue
            
            db.session.commit()
            self.logger.info(f"Sent {notifications_sent} follower notifications for user {user_id}")
            return notifications_sent
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in notify_followers: {str(e)}")
            return 0
    
    def _send_follow_notification(self, follower: User, following: User):
        """Send notification when someone follows a user."""
        try:
            notification = Notification(
                user_id=following.user_id,
                type='new_follower',
                title='New Follower',
                message=f'{follower.first_name} {follower.last_name} started following you',
                data={
                    'follower_id': str(follower.user_id),
                    'follower_name': f'{follower.first_name} {follower.last_name}',
                    'follower_avatar': follower.avatar_url
                },
                channels=['push', 'in_app']
            )
            
            db.session.add(notification)
            db.session.flush()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending follow notification: {str(e)}")
    
    def _create_follower_notification_data(self, event_type: str, user: User, event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create notification data for follower notifications."""
        user_name = f"{user.first_name} {user.last_name}"
        
        if event_type == 'new_post':
            return {
                'title': 'New Post',
                'message': f'{user_name} published a new post: {event_data.get("title", "Untitled")}',
                'data': {
                    'user_id': str(user.user_id),
                    'user_name': user_name,
                    'user_avatar': user.avatar_url,
                    'post_id': event_data.get('post_id'),
                    'post_title': event_data.get('title')
                }
            }
        elif event_type == 'new_article':
            return {
                'title': 'New Article',
                'message': f'{user_name} published a new article: {event_data.get("title", "Untitled")}',
                'data': {
                    'user_id': str(user.user_id),
                    'user_name': user_name,
                    'user_avatar': user.avatar_url,
                    'article_id': event_data.get('article_id'),
                    'article_title': event_data.get('title')
                }
            }
        elif event_type == 'consultation_available':
            return {
                'title': 'Consultation Available',
                'message': f'{user_name} is now available for consultations',
                'data': {
                    'user_id': str(user.user_id),
                    'user_name': user_name,
                    'user_avatar': user.avatar_url,
                    'consultation_type': event_data.get('consultation_type')
                }
            }
        else:
            self.logger.warning(f"Unknown event type for follower notification: {event_type}")
            return None


# Global follow service instance
follow_service = FollowService()