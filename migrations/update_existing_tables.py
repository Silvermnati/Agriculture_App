"""
Simple migration to update existing tables with new columns.
"""

import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.database import db
from server.config import config
from flask import Flask
from sqlalchemy import text

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
    """Run the migration to update existing tables."""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚀 Starting table updates...")
            
            # Add notification_enabled to user_follows table
            print("🔄 Updating user_follows table...")
            try:
                with db.engine.connect() as connection:
                    connection.execute(text("""
                        ALTER TABLE user_follows 
                        ADD COLUMN notification_enabled BOOLEAN DEFAULT true NOT NULL;
                    """))
                    connection.commit()
                    print("✅ Added notification_enabled to user_follows")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column" in str(e):
                    print("✅ notification_enabled column already exists in user_follows")
                else:
                    print(f"⚠️  user_follows update error: {e}")
            
            # Add edit/delete fields to comments table one by one
            print("🔄 Updating comments table...")
            
            comment_columns = [
                ("is_edited", "BOOLEAN DEFAULT false NOT NULL"),
                ("edit_count", "INTEGER DEFAULT 0 NOT NULL"),
                ("last_edited_at", "TIMESTAMP"),
                ("is_deleted", "BOOLEAN DEFAULT false NOT NULL"),
                ("deleted_at", "TIMESTAMP")
            ]
            
            for column_name, column_def in comment_columns:
                try:
                    with db.engine.connect() as connection:
                        connection.execute(text(f"""
                            ALTER TABLE comments 
                            ADD COLUMN {column_name} {column_def};
                        """))
                        connection.commit()
                        print(f"✅ Added {column_name} to comments")
                except Exception as e:
                    if "already exists" in str(e) or "duplicate column" in str(e):
                        print(f"✅ {column_name} column already exists in comments")
                    else:
                        print(f"⚠️  comments {column_name} update error: {e}")
            
            # Create indexes that depend on the new columns
            print("📊 Creating indexes for new columns...")
            
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_user_follows_notification ON user_follows(following_id) WHERE notification_enabled = true;",
                "CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(is_deleted, created_at);"
            ]
            
            for index_sql in indexes:
                try:
                    with db.engine.connect() as connection:
                        connection.execute(text(index_sql))
                        connection.commit()
                        print(f"✅ Created index: {index_sql.split()[5]}")
                except Exception as e:
                    if "already exists" in str(e):
                        print(f"✅ Index already exists")
                    else:
                        print(f"⚠️  Index creation error: {e}")
            
            print("🎉 Table updates completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    run_migration()