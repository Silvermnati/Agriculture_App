"""
Unit tests for the notification system.
Tests notification service, queue processing, and API endpoints.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
import json

from server import create_app
from server.database import db
from server.models.user import User
from server.models.notifications import Notification, NotificationPreferences, NotificationDelivery
from server.services.notification_service import (
    notification_service, NotificationChannel, NotificationStatus, NotificationPriority
)
from server.services.notification_queue import notification_queue, batch_processor
from server.controllers.notifications_controller import notification_controller


@pytest.fixture
def app():
    """Create test Flask app."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def test_user(app):
    """Create test user."""
    user = User(
        email='test@example.com',
        password='testpassword',
        first_name='Test',
        last_name='User',
        role='farmer'
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def test_notification(app, test_user):
    """Create test notification."""
    notification = Notification(
        user_id=test_user.user_id,
        type='test_notification',
        title='Test Notification',
        message='This is a test notification',
        channels=['in_app', 'push'],
        priority='normal'
    )
    db.session.add(notification)
    db.session.commit()
    return notification


class TestNotificationService:
    """Test notification service functionality."""
    
    def test_get_user_preferences_creates_default(self, app, test_user):
        """Test that default preferences are created for new users."""
        preferences = notification_service.get_user_preferences(str(test_user.user_id))
        
        assert preferences is not None
        assert preferences.user_id == test_user.user_id
        assert preferences.email_notifications is True
        assert preferences.push_notifications is True
        assert preferences.in_app_notifications is True
        assert preferences.sms_notifications is False
    
    def test_update_user_preferences(self, app, test_user):
        """Test updating user notification preferences."""
        preferences_data = {
            'email_notifications': False,
            'push_notifications': True,
            'notification_types': {
                'payment_confirmation': True,
                'new_comment': False
            }
        }
        
        preferences = notification_service.update_user_preferences(
            str(test_user.user_id), 
            preferences_data
        )
        
        assert preferences.email_notifications is False
        assert preferences.push_notifications is True
        assert preferences.notification_types['payment_confirmation'] is True
        assert preferences.notification_types['new_comment'] is False
    
    @pytest.mark.asyncio
    async def test_send_notification_in_app(self, app, test_notification):
        """Test sending in-app notification."""
        # Mock the channel to avoid external dependencies
        with patch.object(notification_service.channels['in_app'], 'send') as mock_send:
            mock_send.return_value = Mock(success=True, channel='in_app', message='Success')
            
            results = await notification_service.send_notification(test_notification)
            
            assert len(results) > 0
            assert any(r.success for r in results)
            assert test_notification.status == NotificationStatus.SENT.value
    
    @pytest.mark.asyncio
    async def test_send_notification_respects_preferences(self, app, test_user):
        """Test that notifications respect user preferences."""
        # Disable email notifications
        preferences = notification_service.get_user_preferences(str(test_user.user_id))
        preferences.email_notifications = False
        db.session.commit()
        
        notification = Notification(
            user_id=test_user.user_id,
            type='test_notification',
            title='Test',
            message='Test message',
            channels=['email', 'in_app']
        )
        db.session.add(notification)
        db.session.commit()
        
        with patch.object(notification_service.channels['in_app'], 'send') as mock_in_app:
            mock_in_app.return_value = Mock(success=True, channel='in_app', message='Success')
            
            results = await notification_service.send_notification(notification)
            
            # Should only have in_app channel, email should be filtered out
            assert notification.channels == ['in_app']
    
    def test_notification_analytics(self, app, test_user, test_notification):
        """Test notification analytics generation."""
        # Create some delivery records
        delivery = NotificationDelivery(
            notification_id=test_notification.notification_id,
            channel='in_app',
            status='sent',
            delivered_at=datetime.utcnow()
        )
        db.session.add(delivery)
        db.session.commit()
        
        analytics = notification_service.get_notification_analytics(
            user_id=str(test_user.user_id),
            days=30
        )
        
        assert analytics['total_notifications'] >= 1
        assert analytics['successful_deliveries'] >= 1
        assert 'in_app' in analytics['channel_breakdown']
        assert analytics['success_rate'] > 0


class TestNotificationController:
    """Test notification controller functionality."""
    
    def test_create_notification(self, app, test_user):
        """Test creating a notification through the controller."""
        notification = notification_controller.create_notification(
            user_id=test_user.user_id,
            notification_type='payment_confirmation',
            title='Payment Confirmed',
            message='Your payment has been processed',
            channels=['in_app', 'push'],
            priority='high'
        )
        
        assert notification is not None
        assert notification.user_id == test_user.user_id
        assert notification.type == 'payment_confirmation'
        assert notification.priority == 'high'
        assert 'in_app' in notification.channels
        assert 'push' in notification.channels
    
    def test_send_payment_confirmation(self, app, test_user):
        """Test sending payment confirmation notification."""
        payment_data = {
            'amount': 1000.00,
            'payment_id': 'test_payment_123',
            'method': 'M-Pesa'
        }
        
        notification = notification_controller.send_payment_confirmation(
            test_user.user_id, 
            payment_data
        )
        
        assert notification.type == 'payment_confirmation'
        assert 'KES 1000.0' in notification.message
        assert notification.priority == 'high'
    
    def test_send_consultation_booking(self, app, test_user):
        """Test sending consultation booking notification."""
        consultation_data = {
            'consultation_id': 'test_consultation_123',
            'date': '2024-12-01T10:00:00Z'
        }
        
        notification = notification_controller.send_consultation_booking(
            test_user.user_id,
            'Dr. Expert',
            consultation_data
        )
        
        assert notification.type == 'consultation_booked'
        assert 'Dr. Expert' in notification.message
        assert notification.priority == 'high'
    
    def test_process_scheduled_notifications(self, app, test_user):
        """Test processing scheduled notifications."""
        # Create a scheduled notification that should be sent
        past_time = datetime.utcnow() - timedelta(minutes=5)
        notification = Notification(
            user_id=test_user.user_id,
            type='scheduled_test',
            title='Scheduled Test',
            message='This was scheduled',
            channels=['in_app'],
            scheduled_at=past_time,
            status='pending'
        )
        db.session.add(notification)
        db.session.commit()
        
        with patch.object(notification_service, 'send_notification') as mock_send:
            mock_send.return_value = asyncio.Future()
            mock_send.return_value.set_result([Mock(success=True)])
            
            count = notification_controller.process_scheduled_notifications()
            
            assert count >= 1
            mock_send.assert_called()


class TestNotificationQueue:
    """Test notification queue functionality."""
    
    def test_enqueue_notification(self, app, test_notification):
        """Test enqueuing a notification for processing."""
        initial_size = notification_queue.queue.qsize()
        
        notification_queue.enqueue_notification(
            str(test_notification.notification_id),
            'normal'
        )
        
        assert notification_queue.queue.qsize() == initial_size + 1
    
    def test_get_queue_stats(self, app):
        """Test getting queue statistics."""
        stats = notification_queue.get_queue_stats()
        
        assert 'running' in stats
        assert 'queue_size' in stats
        assert 'workers' in stats
        assert 'processed' in stats
        assert 'successful' in stats
        assert 'failed' in stats
        assert 'success_rate' in stats
    
    def test_get_pending_notifications_count(self, app, test_user):
        """Test getting count of pending notifications."""
        # Create a pending notification
        notification = Notification(
            user_id=test_user.user_id,
            type='pending_test',
            title='Pending Test',
            message='This is pending',
            channels=['in_app'],
            status='pending'
        )
        db.session.add(notification)
        db.session.commit()
        
        count = notification_queue.get_pending_notifications_count()
        assert count >= 1


class TestBatchProcessor:
    """Test batch notification processing."""
    
    def test_create_bulk_notifications(self, app, test_user):
        """Test creating bulk notifications."""
        user_ids = [str(test_user.user_id)]
        
        notifications = batch_processor.create_bulk_notifications(
            user_ids=user_ids,
            notification_type='bulk_test',
            title='Bulk Test',
            message='This is a bulk notification',
            channels=['in_app'],
            priority='low'
        )
        
        assert len(notifications) == 1
        assert notifications[0].type == 'bulk_test'
        assert notifications[0].priority == 'low'
    
    @pytest.mark.asyncio
    async def test_process_bulk_notifications(self, app, test_user):
        """Test processing bulk notifications."""
        notifications = [
            Notification(
                user_id=test_user.user_id,
                type='bulk_test',
                title=f'Bulk Test {i}',
                message=f'Bulk message {i}',
                channels=['in_app']
            ) for i in range(3)
        ]
        
        for notification in notifications:
            db.session.add(notification)
        db.session.commit()
        
        with patch.object(notification_service, 'send_bulk_notifications') as mock_send:
            mock_send.return_value = [[Mock(success=True)] for _ in notifications]
            
            result = await batch_processor.process_bulk_notifications(notifications)
            
            assert result['total_notifications'] == 3
            assert result['total_successful'] == 3
            assert result['success_rate'] == 100.0


class TestNotificationAPI:
    """Test notification API endpoints."""
    
    def test_get_notifications_unauthorized(self, client):
        """Test getting notifications without authentication."""
        response = client.get('/api/notifications')
        assert response.status_code == 401
    
    def test_get_notifications_authorized(self, client, test_user, test_notification):
        """Test getting notifications with authentication."""
        with client.session_transaction() as sess:
            sess['user_id'] = str(test_user.user_id)
        
        # Mock login_required decorator
        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get('/api/notifications')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'notifications' in data
            assert 'unread_count' in data
    
    def test_mark_notification_read(self, client, test_user, test_notification):
        """Test marking a notification as read."""
        with client.session_transaction() as sess:
            sess['user_id'] = str(test_user.user_id)
        
        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.post(f'/api/notifications/{test_notification.notification_id}/read')
            
            assert response.status_code == 200
            
            # Verify notification was marked as read
            db.session.refresh(test_notification)
            assert test_notification.read_at is not None
            assert test_notification.status == 'read'
    
    def test_get_notification_preferences(self, client, test_user):
        """Test getting notification preferences."""
        with client.session_transaction() as sess:
            sess['user_id'] = str(test_user.user_id)
        
        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get('/api/notifications/preferences')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'email_notifications' in data
            assert 'push_notifications' in data
    
    def test_update_notification_preferences(self, client, test_user):
        """Test updating notification preferences."""
        with client.session_transaction() as sess:
            sess['user_id'] = str(test_user.user_id)
        
        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value = test_user
            
            preferences_data = {
                'email_notifications': False,
                'push_notifications': True,
                'notification_types': {
                    'payment_confirmation': True,
                    'new_comment': False
                }
            }
            
            response = client.put(
                '/api/notifications/preferences',
                data=json.dumps(preferences_data),
                content_type='application/json'
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['preferences']['email_notifications'] is False
            assert data['preferences']['push_notifications'] is True
    
    def test_send_test_notification(self, client, test_user):
        """Test sending a test notification."""
        with client.session_transaction() as sess:
            sess['user_id'] = str(test_user.user_id)
        
        with patch('flask_login.utils._get_user') as mock_user:
            mock_user.return_value = test_user
            
            test_data = {
                'title': 'Custom Test',
                'message': 'Custom test message',
                'channels': ['in_app']
            }
            
            with patch.object(notification_service, 'send_notification') as mock_send:
                mock_send.return_value = asyncio.Future()
                mock_send.return_value.set_result([Mock(success=True, channel='in_app', message='Success')])
                
                response = client.post(
                    '/api/notifications/test',
                    data=json.dumps(test_data),
                    content_type='application/json'
                )
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert 'notification' in data
                assert 'delivery_results' in data


class TestNotificationChannels:
    """Test individual notification channels."""
    
    @pytest.mark.asyncio
    async def test_in_app_channel(self, app, test_user):
        """Test in-app notification channel."""
        from server.services.notification_service import InAppNotificationChannel
        
        channel = InAppNotificationChannel({})
        notification = Notification(
            user_id=test_user.user_id,
            type='test',
            title='Test',
            message='Test message'
        )
        
        result = await channel.send(notification, test_user)
        
        assert result.success is True
        assert result.channel == 'in_app'
    
    @pytest.mark.asyncio
    async def test_email_channel_no_email(self, app, test_user):
        """Test email channel when user has no email."""
        from server.services.notification_service import EmailNotificationChannel
        
        # Remove user email
        test_user.email = None
        
        channel = EmailNotificationChannel({})
        notification = Notification(
            user_id=test_user.user_id,
            type='test',
            title='Test',
            message='Test message'
        )
        
        result = await channel.send(notification, test_user)
        
        assert result.success is False
        assert 'missing_email' in result.error
    
    @pytest.mark.asyncio
    async def test_push_channel_no_token(self, app, test_user):
        """Test push channel when user has no FCM token."""
        from server.services.notification_service import PushNotificationChannel
        
        channel = PushNotificationChannel({'fcm_server_key': 'test_key'})
        notification = Notification(
            user_id=test_user.user_id,
            type='test',
            title='Test',
            message='Test message'
        )
        
        result = await channel.send(notification, test_user)
        
        assert result.success is False
        assert 'missing_token' in result.error


if __name__ == '__main__':
    pytest.main([__file__])