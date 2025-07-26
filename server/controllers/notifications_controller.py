"""
Enhanced notifications controller with comprehensive notification management.
This controller provides advanced notification features including preferences,
analytics, and multi-channel delivery tracking.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime, timedelta
import asyncio

from server.database import db
from server.models.notifications import Notification, NotificationPreferences
from server.services.notification_service import notification_service
from server.utils.error_handlers import handle_error


class NotificationController:
    """Enhanced notification controller with comprehensive features."""
    
    @staticmethod
    def create_notification(user_id, notification_type, title, message, 
                          channels=None, data=None, priority='normal', 
                          scheduled_at=None):
        """
        Create a new notification.
        
        Args:
            user_id: Target user ID
            notification_type: Type of notification (e.g., 'payment_confirmation')
            title: Notification title
            message: Notification message
            channels: List of delivery channels (default: ['in_app'])
            data: Additional context data
            priority: Notification priority (low, normal, high, urgent)
            scheduled_at: When to send the notification (optional)
        
        Returns:
            Notification object
        """
        try:
            if channels is None:
                channels = ['in_app']
            
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                channels=channels,
                data=data or {},
                priority=priority,
                scheduled_at=scheduled_at
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send notification immediately if not scheduled
            if not scheduled_at:
                try:
                    results = asyncio.run(notification_service.send_notification(notification))
                    current_app.logger.info(f"Notification {notification.notification_id} sent with results: {results}")
                except Exception as e:
                    current_app.logger.error(f"Error sending notification {notification.notification_id}: {str(e)}")
            
            return notification
            
        except Exception as e:
            current_app.logger.error(f"Error creating notification: {str(e)}")
            db.session.rollback()
            raise
    
    @staticmethod
    def send_payment_confirmation(user_id, payment_data):
        """Send payment confirmation notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='payment_confirmation',
            title='Payment Confirmed',
            message=f"Your payment of KES {payment_data.get('amount', 0)} has been confirmed.",
            channels=['in_app', 'push', 'email'],
            data=payment_data,
            priority='high'
        )
    
    @staticmethod
    def send_consultation_booking(user_id, expert_name, consultation_data):
        """Send consultation booking notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='consultation_booked',
            title='Consultation Booked',
            message=f"Your consultation with {expert_name} has been confirmed.",
            channels=['in_app', 'push', 'email'],
            data=consultation_data,
            priority='high'
        )
    
    @staticmethod
    def send_expert_response(user_id, expert_name, response_data):
        """Send expert response notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='expert_response',
            title='Expert Response',
            message=f"{expert_name} has responded to your question.",
            channels=['in_app', 'push'],
            data=response_data,
            priority='normal'
        )
    
    @staticmethod
    def send_new_comment(user_id, commenter_name, post_title):
        """Send new comment notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='new_comment',
            title='New Comment',
            message=f"{commenter_name} commented on your post: {post_title}",
            channels=['in_app', 'push'],
            data={'commenter_name': commenter_name, 'post_title': post_title},
            priority='normal'
        )
    
    @staticmethod
    def send_new_follower(user_id, follower_name):
        """Send new follower notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='new_follower',
            title='New Follower',
            message=f"{follower_name} started following you.",
            channels=['in_app', 'push'],
            data={'follower_name': follower_name},
            priority='low'
        )
    
    @staticmethod
    def send_community_activity(user_id, community_name, activity_data):
        """Send community activity notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='community_activity',
            title='Community Activity',
            message=f"New activity in {community_name}",
            channels=['in_app'],
            data=activity_data,
            priority='low'
        )
    
    @staticmethod
    def send_system_update(user_id, update_title, update_message):
        """Send system update notification."""
        return NotificationController.create_notification(
            user_id=user_id,
            notification_type='system_updates',
            title=update_title,
            message=update_message,
            channels=['in_app', 'push', 'email'],
            priority='high'
        )
    
    @staticmethod
    def process_scheduled_notifications():
        """Process notifications that are scheduled to be sent."""
        try:
            now = datetime.utcnow()
            scheduled_notifications = Notification.query.filter(
                Notification.scheduled_at <= now,
                Notification.status == 'pending'
            ).all()
            
            for notification in scheduled_notifications:
                try:
                    results = asyncio.run(notification_service.send_notification(notification))
                    current_app.logger.info(f"Scheduled notification {notification.notification_id} sent")
                except Exception as e:
                    current_app.logger.error(f"Error sending scheduled notification {notification.notification_id}: {str(e)}")
            
            return len(scheduled_notifications)
            
        except Exception as e:
            current_app.logger.error(f"Error processing scheduled notifications: {str(e)}")
            return 0
    
    @staticmethod
    def cleanup_old_notifications(days_to_keep=90):
        """Clean up old notifications to maintain database performance."""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Delete old notifications and their deliveries
            deleted_count = Notification.query.filter(
                Notification.created_at < cutoff_date
            ).delete()
            
            db.session.commit()
            current_app.logger.info(f"Cleaned up {deleted_count} old notifications")
            return deleted_count
            
        except Exception as e:
            current_app.logger.error(f"Error cleaning up notifications: {str(e)}")
            db.session.rollback()
            return 0


# Create controller instance
notification_controller = NotificationController()
