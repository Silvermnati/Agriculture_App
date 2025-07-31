#!/usr/bin/env python3
"""
Auto-migration script that runs during Render deployment
This ensures the comment tracking fields are added automatically
"""
import os
import sys
from datetime import datetime

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def auto_migrate():
    """Automatically apply comment tracking fields migration"""
    print("🔄 Auto-migration: Checking comment tracking fields...")
    
    try:
        # Import database directly to avoid circular import
        from server.database import db
        
        # We're already in app context when this is called from __init__.py
        if not db.engine:
            print("❌ Database not initialized")
            return False
        
        # Check if migration is needed
        with db.engine.connect() as conn:
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'comments' 
                AND column_name IN ('is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at')
            """))
            existing_columns = [row[0] for row in result]
            
            required_columns = ['is_edited', 'edit_count', 'last_edited_at', 'is_deleted', 'deleted_at']
            missing_columns = [col for col in required_columns if col not in existing_columns]
            
            if not missing_columns:
                print("✅ Comment tracking fields already exist")
                # Do not return here; continue to other migrations
            
            print(f"🔧 Adding {len(missing_columns)} missing columns: {missing_columns}")
            
            # Add missing columns
            column_definitions = {
                'is_edited': "ALTER TABLE comments ADD COLUMN is_edited BOOLEAN DEFAULT false NOT NULL",
                'edit_count': "ALTER TABLE comments ADD COLUMN edit_count INTEGER DEFAULT 0 NOT NULL", 
                'last_edited_at': "ALTER TABLE comments ADD COLUMN last_edited_at TIMESTAMP",
                'is_deleted': "ALTER TABLE comments ADD COLUMN is_deleted BOOLEAN DEFAULT false NOT NULL",
                'deleted_at': "ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP"
            }
            
            for column in missing_columns:
                try:
                    conn.execute(db.text(column_definitions[column]))
                    conn.commit()
                    print(f"✅ Added column: {column}")
                except Exception as e:
                    if "already exists" in str(e):
                        print(f"ℹ️  Column {column} already exists")
                    else:
                        print(f"❌ Failed to add column {column}: {e}")
                        return False
            
            print("✅ Comment tracking fields migration completed")

        # --- Add notification_enabled to user_follows if missing ---
        print("🔄 Auto-migration: Checking user_follows.notification_enabled column...")
        result = conn.execute(db.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_follows' 
            AND column_name = 'notification_enabled'
        """))
        exists = result.fetchone()
        if not exists:
            try:
                conn.execute(db.text("ALTER TABLE user_follows ADD COLUMN notification_enabled BOOLEAN DEFAULT TRUE NOT NULL"))
                conn.commit()
                print("✅ Added column: notification_enabled to user_follows")
            except Exception as e:
                if "already exists" in str(e):
                    print("ℹ️  Column notification_enabled already exists")
                else:
                    print(f"❌ Failed to add notification_enabled: {e}")
                    return False
        else:
            print("✅ user_follows.notification_enabled already exists")

        # --- Add image_url to communities if missing ---
        with db.engine.connect() as conn:
            print("🔄 Auto-migration: Checking communities.image_url column...")
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'communities' 
                AND column_name = 'image_url'
            """))
            exists = result.fetchone()
            if not exists:
                try:
                    conn.execute(db.text("ALTER TABLE communities ADD COLUMN image_url VARCHAR(255)"))
                    conn.commit()
                    print("✅ Added column: image_url to communities")
                except Exception as e:
                    if "already exists" in str(e):
                        print("ℹ️  Column image_url already exists")
                    else:
                        print(f"❌ Failed to add image_url: {e}")
                        return False
            else:
                print("✅ communities.image_url already exists")

        print("✅ All auto-migrations completed")
        return True
                
    except Exception as e:
        print(f"❌ Auto-migration failed: {e}")
        # Don't fail the deployment, just log the error
        return True  # Return True to not break deployment

if __name__ == "__main__":
    auto_migrate()