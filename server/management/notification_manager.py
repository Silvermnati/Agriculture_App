#!/usr/bin/env python3
"""
Notification management CLI tool.
Provides commands for managing notifications, processing queues, and maintenance tasks.
"""

import sys
import os
import argparse
import logging
from datetime import datetime, timedelta

# Add the project root directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from server import create_app
from server.database import db
from server.models.notifications import Notification, NotificationDelivery, NotificationPreferences
from server.services.notification_service import notification_service
from server.services.notification_queue import notification_queue, batch_processor
from server.controllers.notifications_controller import notification_controller


def setup_logging(verbose=False):
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('notification_manager.log')
        ]
    )


def process_scheduled_notifications(args):
    """Process notifications that are scheduled to be sent."""
    print("Processing scheduled notifications...")
    
    try:
        count = notification_controller.process_scheduled_notifications()
        print(f"✅ Processed {count} scheduled notifications")
        return True
    except Exception as e:
        print(f"❌ Error processing scheduled notifications: {str(e)}")
        return False


def retry_failed_notifications(args):
    """Retry failed notification deliveries."""
    print("Retrying failed notifications...")
    
    try:
        max_age_hours = args.max_age_hours if hasattr(args, 'max_age_hours') else 24
        count = notification_service.retry_failed_notifications(max_age_hours)
        print(f"✅ Retried {count} failed notifications")
        return True
    except Exception as e:
        print(f"❌ Error retrying failed notifications: {str(e)}")
        return False


def cleanup_old_notifications(args):
    """Clean up old notifications to maintain database performance."""
    print("Cleaning up old notifications...")
    
    try:
        days_to_keep = args.days_to_keep if hasattr(args, 'days_to_keep') else 90
        count = notification_controller.cleanup_old_notifications(days_to_keep)
        print(f"✅ Cleaned up {count} old notifications (keeping last {days_to_keep} days)")
        return True
    except Exception as e:
        print(f"❌ Error cleaning up notifications: {str(e)}")
        return False


def show_queue_stats(args):
    """Show notification queue statistics."""
    print("Notification Queue Statistics:")
    print("=" * 40)
    
    try:
        stats = notification_queue.get_queue_stats()
        
        print(f"Status: {'Running' if stats['running'] else 'Stopped'}")
        print(f"Queue Size: {stats['queue_size']}")
        print(f"Workers: {stats['workers']}")
        
        if stats['uptime_seconds']:
            uptime_hours = stats['uptime_seconds'] / 3600
            print(f"Uptime: {uptime_hours:.2f} hours")
        
        print(f"Processed: {stats['processed']}")
        print(f"Successful: {stats['successful']}")
        print(f"Failed: {stats['failed']}")
        print(f"Retried: {stats['retried']}")
        print(f"Success Rate: {stats['success_rate']:.2f}%")
        
        # Database stats
        pending_count = notification_queue.get_pending_notifications_count()
        print(f"Pending in DB: {pending_count}")
        
        return True
    except Exception as e:
        print(f"❌ Error getting queue stats: {str(e)}")
        return False


def show_notification_stats(args):
    """Show notification delivery statistics."""
    print("Notification Delivery Statistics:")
    print("=" * 40)
    
    try:
        days = args.days if hasattr(args, 'days') else 7
        analytics = notification_service.get_notification_analytics(days=days)
        
        print(f"Period: Last {days} days")
        print(f"Total Notifications: {analytics['total_notifications']}")
        print(f"Successful Deliveries: {analytics['successful_deliveries']}")
        print(f"Failed Deliveries: {analytics['failed_deliveries']}")
        print(f"Pending Deliveries: {analytics['pending_deliveries']}")
        print(f"Success Rate: {analytics['success_rate']:.2f}%")
        
        print("\nChannel Breakdown:")
        for channel, stats in analytics['channel_breakdown'].items():
            success_rate = (stats['successful'] / stats['total'] * 100) if stats['total'] > 0 else 0
            print(f"  {channel}: {stats['successful']}/{stats['total']} ({success_rate:.1f}%)")
        
        print("\nType Breakdown:")
        for notification_type, stats in analytics['type_breakdown'].items():
            success_rate = (stats['successful'] / stats['total'] * 100) if stats['total'] > 0 else 0
            print(f"  {notification_type}: {stats['successful']}/{stats['total']} ({success_rate:.1f}%)")
        
        return True
    except Exception as e:
        print(f"❌ Error getting notification stats: {str(e)}")
        return False


def process_pending_notifications(args):
    """Process all pending notifications in the database."""
    print("Processing pending notifications...")
    
    try:
        count = notification_queue.process_pending_notifications()
        print(f"✅ Enqueued {count} pending notifications for processing")
        return True
    except Exception as e:
        print(f"❌ Error processing pending notifications: {str(e)}")
        return False


def send_test_notification(args):
    """Send a test notification to verify the system."""
    print("Sending test notification...")
    
    try:
        if not hasattr(args, 'user_id') or not args.user_id:
            print("❌ User ID is required for test notification")
            return False
        
        # Create test notification
        notification = notification_controller.create_notification(
            user_id=args.user_id,
            notification_type='system_test',
            title='Test Notification',
            message='This is a test notification to verify the notification system is working.',
            channels=['in_app', 'push'],
            priority='normal'
        )
        
        print(f"✅ Test notification sent to user {args.user_id}")
        print(f"   Notification ID: {notification.notification_id}")
        return True
    except Exception as e:
        print(f"❌ Error sending test notification: {str(e)}")
        return False


def create_bulk_notifications(args):
    """Create bulk notifications for testing."""
    print("Creating bulk notifications...")
    
    try:
        if not hasattr(args, 'user_ids') or not args.user_ids:
            print("❌ User IDs are required for bulk notifications")
            return False
        
        user_ids = args.user_ids.split(',')
        notifications = batch_processor.create_bulk_notifications(
            user_ids=user_ids,
            notification_type='system_test',
            title='Bulk Test Notification',
            message='This is a bulk test notification.',
            channels=['in_app'],
            priority='low'
        )
        
        print(f"✅ Created {len(notifications)} bulk notifications")
        return True
    except Exception as e:
        print(f"❌ Error creating bulk notifications: {str(e)}")
        return False


def show_failed_deliveries(args):
    """Show recent failed notification deliveries."""
    print("Recent Failed Deliveries:")
    print("=" * 40)
    
    try:
        hours = args.hours if hasattr(args, 'hours') else 24
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        failed_deliveries = NotificationDelivery.query.filter(
            NotificationDelivery.status == 'failed',
            NotificationDelivery.created_at > cutoff_time
        ).order_by(NotificationDelivery.created_at.desc()).limit(20).all()
        
        if not failed_deliveries:
            print("No failed deliveries found in the specified time period.")
            return True
        
        for delivery in failed_deliveries:
            print(f"ID: {delivery.delivery_id}")
            print(f"  Channel: {delivery.channel}")
            print(f"  Attempts: {delivery.attempts}/{delivery.max_attempts}")
            print(f"  Error: {delivery.error_message}")
            print(f"  Failed At: {delivery.failed_at}")
            print(f"  Notification: {delivery.notification.type} - {delivery.notification.title}")
            print("-" * 20)
        
        return True
    except Exception as e:
        print(f"❌ Error showing failed deliveries: {str(e)}")
        return False


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description='Notification Management CLI')
    parser.add_argument('-v', '--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--config', default='development', help='Configuration environment')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Process scheduled notifications
    scheduled_parser = subparsers.add_parser('process-scheduled', help='Process scheduled notifications')
    scheduled_parser.set_defaults(func=process_scheduled_notifications)
    
    # Retry failed notifications
    retry_parser = subparsers.add_parser('retry-failed', help='Retry failed notifications')
    retry_parser.add_argument('--max-age-hours', type=int, default=24, 
                             help='Maximum age of notifications to retry (hours)')
    retry_parser.set_defaults(func=retry_failed_notifications)
    
    # Cleanup old notifications
    cleanup_parser = subparsers.add_parser('cleanup', help='Clean up old notifications')
    cleanup_parser.add_argument('--days-to-keep', type=int, default=90,
                               help='Number of days of notifications to keep')
    cleanup_parser.set_defaults(func=cleanup_old_notifications)
    
    # Show queue statistics
    queue_stats_parser = subparsers.add_parser('queue-stats', help='Show queue statistics')
    queue_stats_parser.set_defaults(func=show_queue_stats)
    
    # Show notification statistics
    stats_parser = subparsers.add_parser('stats', help='Show notification statistics')
    stats_parser.add_argument('--days', type=int, default=7, help='Number of days to analyze')
    stats_parser.set_defaults(func=show_notification_stats)
    
    # Process pending notifications
    pending_parser = subparsers.add_parser('process-pending', help='Process pending notifications')
    pending_parser.set_defaults(func=process_pending_notifications)
    
    # Send test notification
    test_parser = subparsers.add_parser('test', help='Send test notification')
    test_parser.add_argument('--user-id', required=True, help='User ID to send test notification to')
    test_parser.set_defaults(func=send_test_notification)
    
    # Create bulk notifications
    bulk_parser = subparsers.add_parser('bulk-test', help='Create bulk test notifications')
    bulk_parser.add_argument('--user-ids', required=True, 
                            help='Comma-separated list of user IDs')
    bulk_parser.set_defaults(func=create_bulk_notifications)
    
    # Show failed deliveries
    failed_parser = subparsers.add_parser('failed', help='Show recent failed deliveries')
    failed_parser.add_argument('--hours', type=int, default=24, 
                              help='Hours to look back for failed deliveries')
    failed_parser.set_defaults(func=show_failed_deliveries)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Setup logging
    setup_logging(args.verbose)
    
    # Create Flask app context
    app = create_app(args.config)
    
    with app.app_context():
        try:
            success = args.func(args)
            return 0 if success else 1
        except KeyboardInterrupt:
            print("\n⚠️  Operation cancelled by user")
            return 1
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            if args.verbose:
                import traceback
                traceback.print_exc()
            return 1


if __name__ == '__main__':
    sys.exit(main())