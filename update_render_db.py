#!/usr/bin/env python3
"""
Simple database update script for Render.
This uses the same approach as init_db.py but is designed for production updates.
"""

from server import create_app
from server.database import db

# Import all models to ensure they're registered with SQLAlchemy
from server.models.user import User, UserExpertise, UserFollow
from server.models.location import Country, StateProvince, Location
from server.models.crop import Crop, Livestock, UserCrop
from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
from server.models.expert import ExpertProfile, Consultation, ExpertReview
from server.models.article import Article

def main():
    """Update database schema on Render."""
    
    print("🚀 Render Database Update")
    print("=" * 30)
    
    # Create Flask app (will use production config on Render)
    app = create_app()
    
    with app.app_context():
        try:
            print("📊 Testing database connection...")
            
            # Test connection
            result = db.engine.execute("SELECT 1")
            print("✅ Database connection successful")
            
            print("🏗️  Updating database schema...")
            
            # This will create any missing tables and columns based on current models
            db.create_all()
            
            print("✅ Database schema updated successfully!")
            
            # Test that we can query the users table with new columns
            print("🔍 Verifying schema update...")
            
            # Try to query a user (this will fail if columns don't exist)
            user_count = User.query.count()
            print(f"👤 Found {user_count} users in database")
            
            # Test creating a user with location data
            test_email = 'schema_test@example.com'
            existing_test = User.query.filter_by(email=test_email).first()
            
            if not existing_test:
                print("🧪 Testing new location fields...")
                test_user = User(
                    email=test_email,
                    password='testpass',
                    first_name='Schema',
                    last_name='Test',
                    role='farmer',
                    country='Test Country',
                    city='Test City'
                )
                db.session.add(test_user)
                db.session.commit()
                print("✅ Location fields working correctly!")
                
                # Clean up test user
                db.session.delete(test_user)
                db.session.commit()
                print("🧹 Cleaned up test data")
            
            print("🎉 Database update completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Database update failed: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            
            # Try to rollback any partial changes
            try:
                db.session.rollback()
                print("🔄 Rolled back partial changes")
            except:
                pass
            
            return False

if __name__ == "__main__":
    success = main()
    print("=" * 30)
    if success:
        print("✅ Update completed successfully!")
        exit(0)
    else:
        print("❌ Update failed!")
        exit(1)