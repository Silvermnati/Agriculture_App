"""
Comprehensive notification service with multi-channel support.
Handles push notifications, email, SMS, and in-app notifications.
"""

import json
import logging
from datetime import datetime, time, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import pytz

from server.database import db
from server.models.notifications import Notification, NotificationPreferences, NotificationDelivery
from server.models.user import User


class NotificationChannel(Enum):
    """Notification delivery channels."""
    PUSH = "push"
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(Enum):
    """Notification status values."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class NotificationPriority(Enum):
    """Notification priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class NotificationResult:
    """Result of notification delivery attempt."""
    success: bool
    channel: str
    message: str
    provider_response: Optional[Dict] = None
    error: Optional[str] = None


class NotificationChannelBase:
    """Base class for notification channels."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(f"{self.__class__.__name__}")
    
    async def send(self, notification: Notification, user: User) -> NotificationResult:
        """Send notification through this channel."""
        raise NotImplementedError
    
    def validate_config(self) -> bool:
        """Validate channel configuration."""
        return True


class PushNotificationChannel(NotificationChannelBase):
    """Push notification channel using Firebase Cloud Messaging."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.server_key = config.get('fcm_server_key')
        self.fcm_url = "https://fcm.googleapis.com/fcm/send"
    
    async def send(self, notification: Notification, user: User) -> NotificationResult:
        """Send push notification via FCM."""
        try:
            # Get user's FCM token (would be stored in user profile)
            fcm_token = getattr(user, 'fcm_token', None)
            if not fcm_token:
                return NotificationResult(
                    success=False,
                    channel=NotificationChannel.PUSH.value,
                    message="No FCM token found for user",
                    error="missing_token"
                )
            
            headers = {
                'Authorization': f'key={self.server_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'to': fcm_token,
                'notification': {
                    'title': notification.title,
                    'body': notification.message,
                    'icon': 'default',
                    'sound': 'default'
                },
                'data': {
                    'notification_id': str(notification.notification_id),
                    'type': notification.type,
                    'data': json.dumps(notification.data or {})
                }
            }
            
            response = requests.post(self.fcm_url, headers=headers, json=payload, timeout=30)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('success', 0) > 0:
                return NotificationResult(
                    success=True,
                    channel=NotificationChannel.PUSH.value,
                    message="Push notification sent successfully",
                    provider_response=response_data
                )
            else:
                return NotificationResult(
                    success=False,
                    channel=NotificationChannel.PUSH.value,
                    message="Failed to send push notification",
                    provider_response=response_data,
                    error=response_data.get('error', 'unknown_error')
                )
                
        except Exception as e:
            self.logger.error(f"Push notification error: {str(e)}")
            return NotificationResult(
                success=False,
                channel=NotificationChannel.PUSH.value,
                message=f"Push notification failed: {str(e)}",
                error=str(e)
            )


class EmailNotificationChannel(NotificationChannelBase):
    """Email notification channel using SMTP."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.smtp_server = config.get('smtp_server', 'localhost')
        self.smtp_port = config.get('smtp_port', 587)
        self.smtp_username = config.get('smtp_username')
        self.smtp_password = config.get('smtp_password')
        self.from_email = config.get('from_email', 'noreply@agriapp.com')
        self.from_name = config.get('from_name', 'Agricultural Super App')
    
    async def send(self, notification: Notification, user: User) -> NotificationResult:
        """Send email notification via SMTP."""
        try:
            if not user.email:
                return NotificationResult(
                    success=False,
                    channel=NotificationChannel.EMAIL.value,
                    message="No email address found for user",
                    error="missing_email"
                )
            
            # Create email message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = notification.title
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = user.email
            
            # Create HTML and text versions
            text_content = notification.message
            html_content = self._create_html_template(notification, user)
            
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.smtp_username and self.smtp_password:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                
                server.send_message(msg)
            
            return NotificationResult(
                success=True,
                channel=NotificationChannel.EMAIL.value,
                message="Email sent successfully"
            )
            
        except Exception as e:
            self.logger.error(f"Email notification error: {str(e)}")
            return NotificationResult(
                success=False,
                channel=NotificationChannel.EMAIL.value,
                message=f"Email failed: {str(e)}",
                error=str(e)
            )
    
    def _create_html_template(self, notification: Notification, user: User) -> str:
        """Create HTML email template."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{notification.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c5530;">{notification.title}</h2>
                <p>Hello {user.first_name},</p>
                <p>{notification.message}</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated message from Agricultural Super App. 
                    Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """


class SMSNotificationChannel(NotificationChannelBase):
    """SMS notification channel using Twilio or similar service."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('sms_api_key')
        self.api_secret = config.get('sms_api_secret')
        self.from_number = config.get('sms_from_number')
        self.provider = config.get('sms_provider', 'twilio')
    
    async def send(self, notification: Notification, user: User) -> NotificationResult:
        """Send SMS notification."""
        try:
            phone_number = getattr(user, 'phone_number', None)
            if not phone_number:
                return NotificationResult(
                    success=False,
                    channel=NotificationChannel.SMS.value,
                    message="No phone number found for user",
                    error="missing_phone"
                )
            
            # Truncate message for SMS (160 character limit)
            sms_message = notification.message[:150] + "..." if len(notification.message) > 150 else notification.message
            
            if self.provider == 'twilio':
                return await self._send_via_twilio(phone_number, sms_message)
            else:
                return NotificationResult(
                    success=False,
                    channel=NotificationChannel.SMS.value,
                    message="SMS provider not configured",
                    error="provider_not_configured"
                )
                
        except Exception as e:
            self.logger.error(f"SMS notification error: {str(e)}")
            return NotificationResult(
                success=False,
                channel=NotificationChannel.SMS.value,
                message=f"SMS failed: {str(e)}",
                error=str(e)
            )
    
    async def _send_via_twilio(self, phone_number: str, message: str) -> NotificationResult:
        """Send SMS via Twilio API."""
        try:
            # This would use the Twilio SDK in a real implementation
            # For now, we'll simulate the API call
            
            # Simulate API call
            payload = {
                'From': self.from_number,
                'To': phone_number,
                'Body': message
            }
            
            # In real implementation, use Twilio client
            # client = Client(self.api_key, self.api_secret)
            # message = client.messages.create(**payload)
            
            return NotificationResult(
                success=True,
                channel=NotificationChannel.SMS.value,
                message="SMS sent successfully (simulated)",
                provider_response={'status': 'sent', 'sid': 'simulated_sid'}
            )
            
        except Exception as e:
            return NotificationResult(
                success=False,
                channel=NotificationChannel.SMS.value,
                message=f"Twilio SMS failed: {str(e)}",
                error=str(e)
            )


class InAppNotificationChannel(NotificationChannelBase):
    """In-app notification channel (database storage)."""
    
    async def send(self, notification: Notification, user: User) -> NotificationResult:
        """Store notification in database for in-app display."""
        try:
            # Notification is already stored in database, just mark as sent
            return NotificationResult(
                success=True,
                channel=NotificationChannel.IN_APP.value,
                message="In-app notification stored successfully"
            )
            
        except Exception as e:
            self.logger.error(f"In-app notification error: {str(e)}")
            return NotificationResult(
                success=False,
                channel=NotificationChannel.IN_APP.value,
                message=f"In-app notification failed: {str(e)}",
                error=str(e)
            )


class NotificationService:
    """Comprehensive notification service with multi-channel support."""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Initialize channels
        self.channels = {
            NotificationChannel.PUSH.value: PushNotificationChannel(self.config.get('push', {})),
            NotificationChannel.EMAIL.value: EmailNotificationChannel(self.config.get('email', {})),
            NotificationChannel.SMS.value: SMSNotificationChannel(self.config.get('sms', {})),
            NotificationChannel.IN_APP.value: InAppNotificationChannel(self.config.get('in_app', {}))
        }
    
    async def send_notification(self, notification: Notification) -> List[NotificationResult]:
        """Send notification through specified channels."""
        results = []
        user = User.query.get(notification.user_id)
        
        if not user:
            self.logger.error(f"User not found for notification {notification.notification_id}")
            return results
        
        # Check user preferences and quiet hours
        if not self._should_send_notification(notification, user):
            self.logger.info(f"Notification {notification.notification_id} blocked by user preferences")
            return results
        
        # Send through each specified channel
        for channel_name in notification.channels:
            if channel_name in self.channels:
                try:
                    # Create delivery record
                    delivery = NotificationDelivery(
                        notification_id=notification.notification_id,
                        channel=channel_name,
                        status=NotificationStatus.PENDING.value
                    )
                    db.session.add(delivery)
                    db.session.flush()
                    
                    # Send notification
                    channel = self.channels[channel_name]
                    result = await channel.send(notification, user)
                    results.append(result)
                    
                    # Update delivery record
                    delivery.attempts += 1
                    delivery.last_attempt_at = datetime.utcnow()
                    delivery.provider_response = result.provider_response
                    
                    if result.success:
                        delivery.status = NotificationStatus.SENT.value
                        delivery.delivered_at = datetime.utcnow()
                    else:
                        delivery.status = NotificationStatus.FAILED.value
                        delivery.error_message = result.error
                        delivery.failed_at = datetime.utcnow()
                    
                    db.session.commit()
                    
                except Exception as e:
                    self.logger.error(f"Error sending notification via {channel_name}: {str(e)}")
                    db.session.rollback()
                    results.append(NotificationResult(
                        success=False,
                        channel=channel_name,
                        message=f"Channel error: {str(e)}",
                        error=str(e)
                    ))
        
        # Update notification status
        if any(r.success for r in results):
            notification.status = NotificationStatus.SENT.value
            notification.sent_at = datetime.utcnow()
        else:
            notification.status = NotificationStatus.FAILED.value
        
        db.session.commit()
        return results
    
    async def send_bulk_notifications(self, notifications: List[Notification]) -> List[List[NotificationResult]]:
        """Send multiple notifications in batch."""
        results = []
        
        # Process in batches to avoid overwhelming external services
        batch_size = 10
        for i in range(0, len(notifications), batch_size):
            batch = notifications[i:i + batch_size]
            batch_results = []
            
            for notification in batch:
                try:
                    result = await self.send_notification(notification)
                    batch_results.append(result)
                except Exception as e:
                    self.logger.error(f"Error in bulk notification: {str(e)}")
                    batch_results.append([])
            
            results.extend(batch_results)
            
            # Small delay between batches
            if i + batch_size < len(notifications):
                await asyncio.sleep(0.1)
        
        return results
    
    def retry_failed_notifications(self, max_age_hours: int = 24) -> int:
        """Retry failed notification deliveries."""
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        failed_deliveries = NotificationDelivery.query.filter(
            NotificationDelivery.status == NotificationStatus.FAILED.value,
            NotificationDelivery.attempts < NotificationDelivery.max_attempts,
            NotificationDelivery.created_at > cutoff_time
        ).all()
        
        retry_count = 0
        for delivery in failed_deliveries:
            try:
                notification = delivery.notification
                user = User.query.get(notification.user_id)
                
                if user and notification:
                    channel = self.channels.get(delivery.channel)
                    if channel:
                        # Use asyncio.run for synchronous context
                        result = asyncio.run(channel.send(notification, user))
                        
                        delivery.attempts += 1
                        delivery.last_attempt_at = datetime.utcnow()
                        delivery.provider_response = result.provider_response
                        
                        if result.success:
                            delivery.status = NotificationStatus.SENT.value
                            delivery.delivered_at = datetime.utcnow()
                            retry_count += 1
                        else:
                            delivery.error_message = result.error
                            if delivery.attempts >= delivery.max_attempts:
                                delivery.failed_at = datetime.utcnow()
                        
                        db.session.commit()
                        
            except Exception as e:
                self.logger.error(f"Error retrying delivery {delivery.delivery_id}: {str(e)}")
                db.session.rollback()
        
        return retry_count
    
    def get_user_preferences(self, user_id: str) -> NotificationPreferences:
        """Get user notification preferences."""
        preferences = NotificationPreferences.query.get(user_id)
        if not preferences:
            # Create default preferences
            preferences = NotificationPreferences(user_id=user_id)
            db.session.add(preferences)
            db.session.commit()
        return preferences
    
    def update_user_preferences(self, user_id: str, preferences_data: Dict[str, Any]) -> NotificationPreferences:
        """Update user notification preferences."""
        preferences = self.get_user_preferences(user_id)
        
        # Update preferences
        for key, value in preferences_data.items():
            if hasattr(preferences, key):
                setattr(preferences, key, value)
        
        preferences.updated_at = datetime.utcnow()
        db.session.commit()
        return preferences
    
    def _should_send_notification(self, notification: Notification, user: User) -> bool:
        """Check if notification should be sent based on user preferences."""
        preferences = self.get_user_preferences(str(user.user_id))
        
        # Check if notification type is enabled
        notification_types = preferences.notification_types or {}
        if notification.type in notification_types and not notification_types[notification.type]:
            return False
        
        # Check channel preferences
        filtered_channels = []
        for channel in notification.channels:
            if channel == NotificationChannel.EMAIL.value and not preferences.email_notifications:
                continue
            elif channel == NotificationChannel.PUSH.value and not preferences.push_notifications:
                continue
            elif channel == NotificationChannel.SMS.value and not preferences.sms_notifications:
                continue
            elif channel == NotificationChannel.IN_APP.value and not preferences.in_app_notifications:
                continue
            filtered_channels.append(channel)
        
        # Update notification channels based on preferences
        notification.channels = filtered_channels
        
        # If no channels remain, don't send
        if not filtered_channels:
            return False
        
        # Check quiet hours (skip for urgent notifications)
        if (notification.priority != NotificationPriority.URGENT.value and 
            preferences.quiet_hours_start and preferences.quiet_hours_end):
            
            user_tz = pytz.timezone(preferences.timezone)
            current_time = datetime.now(user_tz).time()
            
            if self._is_in_quiet_hours(current_time, preferences.quiet_hours_start, preferences.quiet_hours_end):
                # Schedule for after quiet hours
                tomorrow = datetime.now(user_tz).date() + timedelta(days=1)
                notification.scheduled_at = user_tz.localize(
                    datetime.combine(tomorrow, preferences.quiet_hours_end)
                ).astimezone(pytz.UTC).replace(tzinfo=None)
                return False
        
        return True
    
    def _is_in_quiet_hours(self, current_time: time, start_time: time, end_time: time) -> bool:
        """Check if current time is within quiet hours."""
        if start_time <= end_time:
            # Same day quiet hours (e.g., 22:00 to 08:00 next day)
            return start_time <= current_time <= end_time
        else:
            # Overnight quiet hours (e.g., 22:00 to 08:00 next day)
            return current_time >= start_time or current_time <= end_time
    
    def get_notification_analytics(self, user_id: Optional[str] = None, days: int = 30) -> Dict[str, Any]:
        """Get notification delivery analytics."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = db.session.query(NotificationDelivery).join(Notification)
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        query = query.filter(NotificationDelivery.created_at > cutoff_date)
        
        deliveries = query.all()
        
        analytics = {
            'total_notifications': len(deliveries),
            'successful_deliveries': len([d for d in deliveries if d.status == NotificationStatus.SENT.value]),
            'failed_deliveries': len([d for d in deliveries if d.status == NotificationStatus.FAILED.value]),
            'pending_deliveries': len([d for d in deliveries if d.status == NotificationStatus.PENDING.value]),
            'channel_breakdown': {},
            'type_breakdown': {},
            'success_rate': 0.0
        }
        
        # Channel breakdown
        for delivery in deliveries:
            channel = delivery.channel
            if channel not in analytics['channel_breakdown']:
                analytics['channel_breakdown'][channel] = {'total': 0, 'successful': 0}
            
            analytics['channel_breakdown'][channel]['total'] += 1
            if delivery.status == NotificationStatus.SENT.value:
                analytics['channel_breakdown'][channel]['successful'] += 1
        
        # Type breakdown
        for delivery in deliveries:
            notification_type = delivery.notification.type
            if notification_type not in analytics['type_breakdown']:
                analytics['type_breakdown'][notification_type] = {'total': 0, 'successful': 0}
            
            analytics['type_breakdown'][notification_type]['total'] += 1
            if delivery.status == NotificationStatus.SENT.value:
                analytics['type_breakdown'][notification_type]['successful'] += 1
        
        # Calculate success rate
        if analytics['total_notifications'] > 0:
            analytics['success_rate'] = (analytics['successful_deliveries'] / analytics['total_notifications']) * 100
        
        return analytics


# Global notification service instance
notification_service = NotificationService()