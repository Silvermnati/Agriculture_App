#!/usr/bin/env python3
"""
Quick fix script for Render deployment to add missing database columns.
Run this script on Render to add the country and city columns to the users table.
"""

import os
import sys

def main():
    """Main function to run the database fix."""
    
    print("🔧 Render Database Fix Script")
    print("=" * 50)
    
    try:
        # Set up the environment
        sys.path.insert(0, '/opt/render/project/src')
        sys.path.insert(0, '/opt/render/project/src/server')
        
        # Import Flask app and database
        from server import create_app
        from server.database import db
        from sqlalchemy import text
        
        print("📱 Creating Flask app...")
        app = create_app()
        
        with app.app_context():
            print("🔍 Checking database connection...")
            
            # Test database connection
            result = db.engine.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            print("🔍 Checking existing columns...")
            
            # Check existing columns
            result = db.engine.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND table_schema = 'public'
                ORDER BY column_name
            """))
            
            existing_columns = [row[0] for row in result]
            print(f"📋 Found columns: {', '.join(existing_columns)}")
            
            # Add missing columns
            changes_made = []
            
            if 'country' not in existing_columns:
                print("➕ Adding 'country' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN country VARCHAR(100)
                """))
                changes_made.append("country")
                print("✅ Added 'country' column")
            else:
                print("ℹ️  'country' column already exists")
            
            if 'city' not in existing_columns:
                print("➕ Adding 'city' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN city VARCHAR(100)
                """))
                changes_made.append("city")
                print("✅ Added 'city' column")
            else:
                print("ℹ️  'city' column already exists")
            
            # Commit changes
            if changes_made:
                db.session.commit()
                print(f"💾 Committed changes: {', '.join(changes_made)}")
            
            print("🎉 Database fix completed successfully!")
            
            # Verify the fix
            print("🔍 Verifying fix...")
            result = db.engine.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('country', 'city')
                ORDER BY column_name
            """))
            
            new_columns = [row[0] for row in result]
            print(f"✅ Verified columns: {', '.join(new_columns)}")
            
            if 'country' in new_columns and 'city' in new_columns:
                print("🎯 All required columns are now present!")
                return True
            else:
                print("⚠️  Some columns may still be missing")
                return False
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Try to rollback
        try:
            db.session.rollback()
            print("🔄 Rolled back any partial changes")
        except:
            pass
            
        return False

if __name__ == "__main__":
    success = main()
    print("=" * 50)
    if success:
        print("✅ Script completed successfully!")
        sys.exit(0)
    else:
        print("❌ Script failed!")
        sys.exit(1)