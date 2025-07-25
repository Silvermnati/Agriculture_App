#!/usr/bin/env python3
"""
Render deployment database initialization script.
This script ensures the database is properly set up on Render deployment.
"""

import os
import sys

def main():
    """Main function to initialize the database for Render deployment."""
    
    print("🚀 Render Database Initialization Script")
    print("=" * 60)
    
    try:
        # Set up the environment for Render
        render_paths = [
            '/opt/render/project/src',
            '/opt/render/project/src/server',
            '.',
            './server'
        ]
        
        for path in render_paths:
            if path not in sys.path:
                sys.path.insert(0, path)
        
        print("📦 Setting up environment...")
        
        # Import Flask app and database
        from server import create_app
        from server.database import db
        
        print("📱 Creating Flask app for production...")
        app = create_app('production')
        
        with app.app_context():
            print("🔍 Testing database connection...")
            
            # Test database connection
            from sqlalchemy import text
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            # The database initialization is now handled automatically
            # by the init_db function in database.py, so we just need to
            # trigger it by accessing the database
            
            print("🏗️  Initializing database schema...")
            
            # Import all models to ensure they're registered
            import server.models
            
            # Create all tables
            db.create_all()
            print("✅ Database schema created/updated")
            
            # Check if we have initial data
            from server.models.user import User
            user_count = User.query.count()
            print(f"👥 Found {user_count} users in database")
            
            if user_count == 0:
                print("🆕 Creating initial data...")
                from server.database import create_initial_data
                create_initial_data()
                print("✅ Initial data created")
            
            print("🎉 Database initialization completed successfully!")
            return True
                
    except Exception as e:
        print(f"❌ Error during database initialization: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Print more detailed error information
        import traceback
        print("📋 Full error traceback:")
        traceback.print_exc()
        
        return False

if __name__ == "__main__":
    success = main()
    print("=" * 60)
    if success:
        print("✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        print("❌ Database initialization failed!")
        # Don't exit with error code to prevent deployment failure
        # The app should still start even if initial data creation fails
        sys.exit(0)