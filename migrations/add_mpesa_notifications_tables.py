"""
Database migration script for M-Pesa and Notifications system.
This script adds the new tables and updates existing ones.
"""

import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.database import db
from server.config import config
from flask import Flask

def create_app():
    """Create Flask app for migration."""
    app = Flask(__name__)
    
    # Get config based on environment
    env = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[env])
    
    # Initialize database
    db.init_app(app)
    
    return app

def run_migration():
    """Run the migration to add M-Pesa and notifications tables."""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚀 Starting M-Pesa and Notifications migration...")
            
            # Import all models to ensure they're registered
            from server.models.payment import Payment, TransactionLog
            from server.models.notifications import Notification, NotificationPreferences, NotificationDelivery
            from server.models.post import CommentEdit
            from server.models.user import UserFollow
            
            # Create new tables
            print("📋 Creating new tables...")
            
            # Use SQLAlchemy's create_all method instead of raw SQL
            print("📋 Creating tables using SQLAlchemy...")
            db.create_all()
            
            # For any additional SQL operations, use proper connection handling
            from sqlalchemy import text
            
            with db.engine.connect() as connection:
                # Create indexes for performance
                print("📊 Creating indexes...")
                
                indexes = [
                    "CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);",
                    "CREATE INDEX IF NOT EXISTS idx_payments_consultation ON payments(consultation_id);",
                    "CREATE INDEX IF NOT EXISTS idx_payments_checkout_request ON payments(checkout_request_id);",
                    "CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment ON transaction_logs(payment_id);",
                    "CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);",
                    "CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications(type, created_at);",
                    "CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at) WHERE scheduled_at IS NOT NULL;",
                    "CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status, last_attempt_at);",
                    "CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id);",
                    "CREATE INDEX IF NOT EXISTS idx_comment_edits_comment ON comment_edits(comment_id);",
                    "CREATE INDEX IF NOT EXISTS idx_user_follows_notification ON user_follows(following_id) WHERE notification_enabled = true;",
                    "CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(is_deleted, created_at);"
                ]
                
                for index_sql in indexes:
                    try:
                        connection.execute(text(index_sql))
                        connection.commit()
                    except Exception as e:
                        print(f"⚠️  Index creation (might already exist): {e}")
                
                # Add notification_enabled to user_follows table
                try:
                    connection.execute(text("""
                        ALTER TABLE user_follows 
                        ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true NOT NULL;
                    """))
                    connection.commit()
                    print("✅ Added notification_enabled to user_follows")
                except Exception as e:
                    print(f"⚠️  user_follows update (might already exist): {e}")
                
                # Add edit/delete fields to comments table
                try:
                    connection.execute(text("""
                        ALTER TABLE comments 
                        ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false NOT NULL,
                        ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0 NOT NULL,
                        ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP,
                        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL,
                        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
                    """))
                    connection.commit()
                    print("✅ Added edit/delete fields to comments")
                except Exception as e:
                    print(f"⚠️  comments update (might already exist): {e}")
                
                # Create default notification preferences for existing users
                print("👥 Creating default notification preferences for existing users...")
                try:
                    connection.execute(text("""
                        INSERT INTO notification_preferences (user_id)
                        SELECT user_id FROM users 
                        WHERE user_id NOT IN (SELECT user_id FROM notification_preferences);
                    """))
                    connection.commit()
                    print("✅ Default notification preferences created!")
                except Exception as e:
                    print(f"⚠️  Default preferences creation: {e}")
            
                print("✅ Indexes created successfully!")
            
            print("🎉 Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    run_migration()