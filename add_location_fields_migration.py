#!/usr/bin/env python3
"""
Database migration script to add country and city fields to users table.
This script adds the new location fields that were added to the User model.
"""

import os
import sys
from sqlalchemy import text

# Add the server directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from server.database import db
from server import create_app

def run_migration():
    """Run the migration to add country and city fields to users table."""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Starting migration: Adding country and city fields to users table...")
            
            # Check if columns already exist
            result = db.engine.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('country', 'city')
            """))
            
            existing_columns = [row[0] for row in result]
            
            # Add country column if it doesn't exist
            if 'country' not in existing_columns:
                print("Adding 'country' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN country VARCHAR(100)
                """))
                print("✅ Added 'country' column successfully")
            else:
                print("ℹ️  'country' column already exists")
            
            # Add city column if it doesn't exist
            if 'city' not in existing_columns:
                print("Adding 'city' column...")
                db.engine.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN city VARCHAR(100)
                """))
                print("✅ Added 'city' column successfully")
            else:
                print("ℹ️  'city' column already exists")
            
            # Commit the changes
            db.session.commit()
            print("✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            db.session.rollback()
            raise
        
        finally:
            db.session.close()

def rollback_migration():
    """Rollback the migration by removing the added columns."""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("Starting rollback: Removing country and city fields from users table...")
            
            # Remove city column
            print("Removing 'city' column...")
            db.engine.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS city
            """))
            print("✅ Removed 'city' column")
            
            # Remove country column
            print("Removing 'country' column...")
            db.engine.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS country
            """))
            print("✅ Removed 'country' column")
            
            # Commit the changes
            db.session.commit()
            print("✅ Rollback completed successfully!")
            
        except Exception as e:
            print(f"❌ Rollback failed: {str(e)}")
            db.session.rollback()
            raise
        
        finally:
            db.session.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Database migration for location fields')
    parser.add_argument('--rollback', action='store_true', 
                       help='Rollback the migration (remove the columns)')
    
    args = parser.parse_args()
    
    if args.rollback:
        rollback_migration()
    else:
        run_migration()