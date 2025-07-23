#!/usr/bin/env python3
"""
Production database table creation script.
This script creates/updates all database tables based on the current SQLAlchemy models.
It's designed to work on Render and other production environments.
"""

import os
import sys
from sqlalchemy import text, inspect

# Add the server directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

def create_tables():
    """Create or update all database tables based on current models."""
    
    try:
        # Import after adding to path
        from server import create_app
        from server.database import db
        
        # Import all models to ensure they're registered
        from server.models.user import User, UserExpertise, UserFollow
        from server.models.location import Country, StateProvince, Location
        from server.models.crop import Crop, Livestock, UserCrop
        from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
        from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
        from server.models.expert import ExpertProfile, Consultation, ExpertReview
        from server.models.article import Article
        
        print("🚀 Starting database table creation/update...")
        
        # Create Flask app
        app = create_app()
        
        with app.app_context():
            print("📊 Checking database connection...")
            
            # Test database connection
            db.engine.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            print("🔍 Inspecting current database schema...")
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"📋 Found {len(existing_tables)} existing tables")
            
            # Check if users table exists and what columns it has
            if 'users' in existing_tables:
                existing_columns = [col['name'] for col in inspector.get_columns('users')]
                print(f"👤 Users table columns: {', '.join(existing_columns)}")
                
                # Check for new location fields
                missing_fields = []
                if 'country' not in existing_columns:
                    missing_fields.append('country')
                if 'city' not in existing_columns:
                    missing_fields.append('city')
                
                if missing_fields:
                    print(f"➕ Missing location fields: {', '.join(missing_fields)}")
                else:
                    print("✅ All location fields present")
            
            print("🏗️  Creating/updating all tables...")
            
            # This will create new tables and add missing columns to existing tables
            db.create_all()
            
            print("✅ Database tables created/updated successfully!")
            
            # Verify the users table now has all required columns
            if 'users' in inspector.get_table_names():
                # Refresh inspector after create_all
                inspector = inspect(db.engine)
                updated_columns = [col['name'] for col in inspector.get_columns('users')]
                
                required_fields = ['country', 'city', 'phone_number']
                missing_after_update = [field for field in required_fields if field not in updated_columns]
                
                if missing_after_update:
                    print(f"⚠️  Still missing fields: {', '.join(missing_after_update)}")
                    print("   This might require manual column addition")
                else:
                    print("🎯 All required fields are now present!")
            
            # Create initial data if needed (like in init_db.py)
            print("🌱 Checking for initial data...")
            
            # Create default country if none exists
            if not Country.query.first():
                print("🌍 Creating default countries...")
                countries_to_create = [
                    ('United States', 'US'),
                    ('Canada', 'CA'),
                    ('United Kingdom', 'GB'),
                    ('Kenya', 'KE'),
                    ('Nigeria', 'NG'),
                    ('Ghana', 'GH'),
                    ('South Africa', 'ZA')
                ]
                
                for name, code in countries_to_create:
                    country = Country(name=name, code=code)
                    db.session.add(country)
                
                db.session.commit()
                print(f"✅ Created {len(countries_to_create)} default countries")
            
            print("🎉 Database initialization completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Database creation failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Print more detailed error info
        import traceback
        print("📋 Full error traceback:")
        traceback.print_exc()
        
        return False

def check_database_status():
    """Check the current status of the database."""
    
    try:
        from server import create_app
        from server.database import db
        from sqlalchemy import inspect
        
        app = create_app()
        
        with app.app_context():
            print("🔍 Database Status Check")
            print("=" * 40)
            
            # Test connection
            db.engine.execute(text("SELECT 1"))
            print("✅ Database connection: OK")
            
            # Check tables
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📊 Total tables: {len(tables)}")
            
            # Check users table specifically
            if 'users' in tables:
                columns = [col['name'] for col in inspector.get_columns('users')]
                print(f"👤 Users table columns ({len(columns)}): {', '.join(columns)}")
                
                # Check for required fields
                required_fields = ['country', 'city', 'phone_number', 'email', 'first_name', 'last_name']
                missing = [field for field in required_fields if field not in columns]
                
                if missing:
                    print(f"⚠️  Missing required fields: {', '.join(missing)}")
                else:
                    print("✅ All required fields present")
            else:
                print("❌ Users table not found")
            
            print("=" * 40)
            return True
            
    except Exception as e:
        print(f"❌ Status check failed: {str(e)}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Production database table management')
    parser.add_argument('--check', action='store_true', 
                       help='Check database status without making changes')
    parser.add_argument('--force', action='store_true',
                       help='Force recreation of tables (use with caution)')
    
    args = parser.parse_args()
    
    if args.check:
        success = check_database_status()
    else:
        success = create_tables()
    
    sys.exit(0 if success else 1)