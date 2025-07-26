"""
Notification queue and background task processor.
Handles notification queuing, batch processing, and retry logic.
"""

import logging
import time
import threading
from datetime import datetime, timedelta
from typing import List, Optional
from queue import Queue, Empty
import asyncio
from concurrent.futures import ThreadPoolExecutor

from server.database import db
from server.models.notifications import Notification, NotificationDelivery
from server.services.notification_service import notification_service, NotificationStatus


class NotificationQueue:
    """Queue-based notification processor with retry logic."""
    
    def __init__(self, max_workers=5, batch_size=10, retry_delay=300):
        self.queue = Queue()
        self.max_workers = max_workers
        self.batch_size = batch_size
        self.retry_delay = retry_delay  # 5 minutes
        self.running = False
        self.workers = []
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Statistics
        self.stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'retried': 0,
            'started_at': None
        }
    
    def start(self):
        """Start the notification queue processor."""
        if self.running:
            self.logger.warning("Notification queue is already running")
            return
        
        self.running = True
        self.stats['started_at'] = datetime.utcnow()
        
        # Start worker threads
        for i in range(self.max_workers):
            worker = threading.Thread(
                target=self._worker,
                name=f"NotificationWorker-{i+1}",
                daemon=True
            )
            worker.start()
            self.workers.append(worker)
        
        # Start retry processor
        retry_thread = threading.Thread(
            target=self._retry_processor,
            name="NotificationRetryProcessor",
            daemon=True
        )
        retry_thread.start()
        
        # Start scheduled notification processor
        scheduled_thread = threading.Thread(
            target=self._scheduled_processor,
            name="ScheduledNotificationProcessor",
            daemon=True
        )
        scheduled_thread.start()
        
        self.logger.info(f"Notification queue started with {self.max_workers} workers")
    
    def stop(self):
        """Stop the notification queue processor."""
        self.running = False
        self.logger.info("Notification queue stopped")
    
    def enqueue_notification(self, notification_id: str, priority: str = 'normal'):
        """Add a notification to the processing queue."""
        try:
            self.queue.put({
                'notification_id': notification_id,
                'priority': priority,
                'enqueued_at': datetime.utcnow()
            })
            self.logger.debug(f"Notification {notification_id} enqueued")
        except Exception as e:
            self.logger.error(f"Error enqueuing notification {notification_id}: {str(e)}")
    
    def enqueue_bulk_notifications(self, notification_ids: List[str]):
        """Add multiple notifications to the processing queue."""
        for notification_id in notification_ids:
            self.enqueue_notification(notification_id)
        
        self.logger.info(f"Enqueued {len(notification_ids)} notifications for bulk processing")
    
    def _worker(self):
        """Worker thread for processing notifications."""
        while self.running:
            try:
                # Get notification from queue with timeout
                try:
                    item = self.queue.get(timeout=1.0)
                except Empty:
                    continue
                
                notification_id = item['notification_id']
                
                # Process the notification
                success = self._process_notification(notification_id)
                
                # Update statistics
                self.stats['processed'] += 1
                if success:
                    self.stats['successful'] += 1
                else:
                    self.stats['failed'] += 1
                
                self.queue.task_done()
                
            except Exception as e:
                self.logger.error(f"Worker error: {str(e)}")
                time.sleep(1)
    
    def _process_notification(self, notification_id: str) -> bool:
        """Process a single notification."""
        try:
            # Import here to avoid circular imports
            from server import create_app
            
            # Create app context for database operations
            app = create_app()
            with app.app_context():
                # Get notification from database
                notification = Notification.query.get(notification_id)
                if not notification:
                    self.logger.warning(f"Notification {notification_id} not found")
                    return False
                
                # Skip if already processed
                if notification.status in ['sent', 'read']:
                    self.logger.debug(f"Notification {notification_id} already processed")
                    return True
                
                # Send notification
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    results = loop.run_until_complete(
                        notification_service.send_notification(notification)
                    )
                    success = any(r.success for r in results)
                    
                    self.logger.info(f"Notification {notification_id} processed: {success}")
                    return success
                    
                finally:
                    loop.close()
                
        except Exception as e:
            self.logger.error(f"Error processing notification {notification_id}: {str(e)}")
            return False
    
    def _retry_processor(self):
        """Background processor for retrying failed notifications."""
        while self.running:
            try:
                # Process retries every 5 minutes
                time.sleep(self.retry_delay)
                
                if not self.running:
                    break
                
                retry_count = notification_service.retry_failed_notifications()
                if retry_count > 0:
                    self.stats['retried'] += retry_count
                    self.logger.info(f"Retried {retry_count} failed notifications")
                
            except Exception as e:
                self.logger.error(f"Retry processor error: {str(e)}")
                time.sleep(60)  # Wait a minute before retrying
    
    def _scheduled_processor(self):
        """Background processor for scheduled notifications."""
        while self.running:
            try:
                # Check for scheduled notifications every minute
                time.sleep(60)
                
                if not self.running:
                    break
                
                # Find notifications that should be sent now
                now = datetime.utcnow()
                scheduled_notifications = Notification.query.filter(
                    Notification.scheduled_at <= now,
                    Notification.status == 'pending'
                ).all()
                
                for notification in scheduled_notifications:
                    self.enqueue_notification(str(notification.notification_id))
                
                if scheduled_notifications:
                    self.logger.info(f"Enqueued {len(scheduled_notifications)} scheduled notifications")
                
            except Exception as e:
                self.logger.error(f"Scheduled processor error: {str(e)}")
                time.sleep(60)
    
    def get_queue_stats(self) -> dict:
        """Get queue processing statistics."""
        uptime = None
        if self.stats['started_at']:
            uptime = (datetime.utcnow() - self.stats['started_at']).total_seconds()
        
        return {
            'running': self.running,
            'queue_size': self.queue.qsize(),
            'workers': len(self.workers),
            'uptime_seconds': uptime,
            'processed': self.stats['processed'],
            'successful': self.stats['successful'],
            'failed': self.stats['failed'],
            'retried': self.stats['retried'],
            'success_rate': (
                (self.stats['successful'] / self.stats['processed'] * 100) 
                if self.stats['processed'] > 0 else 0
            )
        }
    
    def get_pending_notifications_count(self) -> int:
        """Get count of pending notifications in database."""
        return Notification.query.filter_by(status='pending').count()
    
    def process_pending_notifications(self) -> int:
        """Process all pending notifications in the database."""
        try:
            pending_notifications = Notification.query.filter_by(status='pending').all()
            
            for notification in pending_notifications:
                # Skip scheduled notifications that aren't due yet
                if notification.scheduled_at and notification.scheduled_at > datetime.utcnow():
                    continue
                
                self.enqueue_notification(str(notification.notification_id))
            
            count = len([n for n in pending_notifications 
                        if not n.scheduled_at or n.scheduled_at <= datetime.utcnow()])
            
            self.logger.info(f"Enqueued {count} pending notifications")
            return count
            
        except Exception as e:
            self.logger.error(f"Error processing pending notifications: {str(e)}")
            return 0


class NotificationBatchProcessor:
    """Batch processor for high-volume notification scenarios."""
    
    def __init__(self, batch_size=50, delay_between_batches=1.0):
        self.batch_size = batch_size
        self.delay_between_batches = delay_between_batches
        self.logger = logging.getLogger(self.__class__.__name__)
    
    async def process_bulk_notifications(self, notifications: List[Notification]) -> dict:
        """Process notifications in batches."""
        total_notifications = len(notifications)
        successful_batches = 0
        failed_batches = 0
        total_successful = 0
        total_failed = 0
        
        self.logger.info(f"Starting bulk processing of {total_notifications} notifications")
        
        # Process in batches
        for i in range(0, total_notifications, self.batch_size):
            batch = notifications[i:i + self.batch_size]
            batch_num = (i // self.batch_size) + 1
            
            try:
                self.logger.info(f"Processing batch {batch_num} ({len(batch)} notifications)")
                
                # Send batch
                results = await notification_service.send_bulk_notifications(batch)
                
                # Count results
                batch_successful = sum(1 for result_list in results for r in result_list if r.success)
                batch_failed = sum(1 for result_list in results for r in result_list if not r.success)
                
                total_successful += batch_successful
                total_failed += batch_failed
                successful_batches += 1
                
                self.logger.info(f"Batch {batch_num} completed: {batch_successful} successful, {batch_failed} failed")
                
                # Delay between batches to avoid overwhelming external services
                if i + self.batch_size < total_notifications:
                    await asyncio.sleep(self.delay_between_batches)
                
            except Exception as e:
                self.logger.error(f"Error processing batch {batch_num}: {str(e)}")
                failed_batches += 1
                total_failed += len(batch)
        
        result = {
            'total_notifications': total_notifications,
            'successful_batches': successful_batches,
            'failed_batches': failed_batches,
            'total_successful': total_successful,
            'total_failed': total_failed,
            'success_rate': (total_successful / total_notifications * 100) if total_notifications > 0 else 0
        }
        
        self.logger.info(f"Bulk processing completed: {result}")
        return result
    
    def create_bulk_notifications(self, user_ids: List[str], notification_type: str, 
                                title: str, message: str, channels: List[str] = None,
                                data: dict = None, priority: str = 'normal') -> List[Notification]:
        """Create multiple notifications for bulk processing."""
        notifications = []
        
        if channels is None:
            channels = ['in_app']
        
        try:
            for user_id in user_ids:
                notification = Notification(
                    user_id=user_id,
                    type=notification_type,
                    title=title,
                    message=message,
                    channels=channels,
                    data=data or {},
                    priority=priority
                )
                notifications.append(notification)
            
            # Bulk insert
            db.session.bulk_save_objects(notifications)
            db.session.commit()
            
            self.logger.info(f"Created {len(notifications)} notifications for bulk processing")
            return notifications
            
        except Exception as e:
            self.logger.error(f"Error creating bulk notifications: {str(e)}")
            db.session.rollback()
            return []


# Global instances
notification_queue = NotificationQueue()
batch_processor = NotificationBatchProcessor()