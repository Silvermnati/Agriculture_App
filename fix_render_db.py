#!/usr/bin/env python3
"""
Database initialization script for Render deployment.
This script sets up the database with required tables and initial data.
"""

import os
import sys

# Add the server directory to sys.path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

def main():
    """Main function to initialize the database for Render deployment."""
    try:
        from server import create_app
        from server.database import db
        from server.models.post import Category
        
        # Get configuration from environment
        config_name = os.environ.get('FLASK_CONFIG', 'production')
        app = create_app(config_name)
        
        with app.app_context():
            print("🚀 Starting database initialization for Render deployment...")
            
            # Create all tables
            print("📋 Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # Initialize default categories
            print("📂 Initializing default categories...")
            default_categories = [
                {
                    'category_id': 1,
                    'name': 'Crop Management',
                    'description': 'Best practices for growing and managing crops',
                    'is_agricultural_specific': True
                },
                {
                    'category_id': 2,
                    'name': 'Pest and Disease Control',
                    'description': 'Methods and strategies for controlling pests and diseases',
                    'is_agricultural_specific': True
                },
                {
                    'category_id': 3,
                    'name': 'Soil Health',
                    'description': 'Soil management, fertilization, and health improvement',
                    'is_agricultural_specific': True
                },
                {
                    'category_id': 4,
                    'name': 'Harvesting and Post-Harvesting',
                    'description': 'Harvesting techniques and post-harvest handling',
                    'is_agricultural_specific': True
                },
                {
                    'category_id': 5,
                    'name': 'Agricultural Technology',
                    'description': 'Modern farming technologies and innovations',
                    'is_agricultural_specific': True
                }
            ]
            
            created_count = 0
            for cat_data in default_categories:
                # Check if category exists
                existing_category = Category.query.filter_by(category_id=cat_data['category_id']).first()
                
                if not existing_category:
                    # Create new category
                    new_category = Category(**cat_data)
                    db.session.add(new_category)
                    created_count += 1
                    print(f"  ➕ Created category: {cat_data['name']}")
                else:
                    print(f"  ✅ Category already exists: {cat_data['name']}")
            
            # Commit all changes
            db.session.commit()
            print(f"✅ Categories initialized successfully! Created {created_count} new categories.")
            
            # Create upload directories
            print("📁 Creating upload directories...")
            upload_folder = app.config.get('UPLOAD_FOLDER')
            if upload_folder:
                os.makedirs(upload_folder, exist_ok=True)
                os.makedirs(os.path.join(upload_folder, 'images'), exist_ok=True)
                print("✅ Upload directories created successfully!")
            
            print("🎉 Database initialization completed successfully!")
            
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()