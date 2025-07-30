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
                return True
            
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
            return True
                
    except Exception as e:
        print(f"❌ Auto-migration failed: {e}")
        # Don't fail the deployment, just log the error
        return True  # Return True to not break deployment

if __name__ == "__main__":
    auto_migrate()