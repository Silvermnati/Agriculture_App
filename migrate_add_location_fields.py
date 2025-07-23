#!/usr/bin/env python3
"""
Production-safe database migration to add country and city fields to users table.
This script can be run on Render or any production environment.
"""

import os
import sys
from sqlalchemy import text, inspect

# Add the server directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

def run_migration():
    """Run the migration to add country and city fields to users table."""
    
    try:
        # Import after adding to path
        from server.database import db
        from server import create_app
        
        app = create_app()
        
        with app.app_context():
            print("🚀 Starting migration: Adding country and city fields to users table...")
            
            # Get database inspector
            inspector = inspect(db.engine)
            
            # Check if users table exists
            if 'users' not in inspector.get_table_names():
                print("❌ Users table not found!")
                return False
            
            # Get existing columns
            existing_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"📋 Existing columns: {existing_columns}")
            
            migrations_run = []
            
            # Add country column if it doesn't exist
            if 'country' not in existing_columns:
                print("➕ Adding 'country' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN country VARCHAR(100)
                """))
                migrations_run.append("Added 'country' column")
                print("✅ Added 'country' column successfully")
            else:
                print("ℹ️  'country' column already exists")
            
            # Add city column if it doesn't exist
            if 'city' not in existing_columns:
                print("➕ Adding 'city' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN city VARCHAR(100)
                """))
                migrations_run.append("Added 'city' column")
                print("✅ Added 'city' column successfully")
            else:
                print("ℹ️  'city' column already exists")
            
            # Commit the changes
            db.session.commit()
            
            if migrations_run:
                print(f"✅ Migration completed successfully! Changes: {', '.join(migrations_run)}")
            else:
                print("ℹ️  No migrations needed - all columns already exist")
            
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        try:
            db.session.rollback()
        except:
            pass
        return False

def check_migration_status():
    """Check if the migration has been applied."""
    
    try:
        from server.database import db
        from server import create_app
        
        app = create_app()
        
        with app.app_context():
            inspector = inspect(db.engine)
            
            if 'users' not in inspector.get_table_names():
                print("❌ Users table not found!")
                return False
            
            existing_columns = [col['name'] for col in inspector.get_columns('users')]
            
            has_country = 'country' in existing_columns
            has_city = 'city' in existing_columns
            
            print(f"📊 Migration Status:")
            print(f"   - Country column: {'✅ Present' if has_country else '❌ Missing'}")
            print(f"   - City column: {'✅ Present' if has_city else '❌ Missing'}")
            
            return has_country and has_city
            
    except Exception as e:
        print(f"❌ Status check failed: {str(e)}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Database migration for location fields')
    parser.add_argument('--check', action='store_true', 
                       help='Check migration status without running')
    
    args = parser.parse_args()
    
    if args.check:
        check_migration_status()
    else:
        success = run_migration()
        sys.exit(0 if success else 1)