#!/usr/bin/env python3
"""
Initialize default categories for the agriculture app.
This script ensures the database has the categories that the frontend expects.
"""

import os
import sys

# Add the parent directory to sys.path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import create_app
from server.database import db
from server.models.post import Category

def init_categories():
    """Initialize default categories."""
    config_name = os.environ.get('FLASK_CONFIG', 'production')
    app = create_app(config_name)
    
    with app.app_context():
        # Define the categories that the frontend expects
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
        updated_count = 0
        
        for cat_data in default_categories:
            # Check if category exists
            existing_category = Category.query.filter_by(category_id=cat_data['category_id']).first()
            
            if existing_category:
                # Update existing category
                existing_category.name = cat_data['name']
                existing_category.description = cat_data['description']
                existing_category.is_agricultural_specific = cat_data['is_agricultural_specific']
                updated_count += 1
                print(f"Updated category: {cat_data['name']}")
            else:
                # Create new category
                new_category = Category(**cat_data)
                db.session.add(new_category)
                created_count += 1
                print(f"Created category: {cat_data['name']}")
        
        try:
            db.session.commit()
            print(f"\n✅ Categories initialized successfully!")
            print(f"   Created: {created_count}")
            print(f"   Updated: {updated_count}")
            
            # Verify categories exist
            all_categories = Category.query.all()
            print(f"\nTotal categories in database: {len(all_categories)}")
            for cat in all_categories:
                print(f"  ID: {cat.category_id}, Name: {cat.name}")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error initializing categories: {e}")
            raise

if __name__ == "__main__":
    init_categories()