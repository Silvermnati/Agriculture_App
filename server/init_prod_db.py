import os
import sys
import traceback
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import create_app
from server.database import db
from flask_migrate import Migrate

# Import all models to ensure they're included
from server.models.user import User, UserExpertise, UserFollow
from server.models.location import Country, StateProvince, Location
from server.models.crop import Crop, Livestock, UserCrop
from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
from server.models.expert import ExpertProfile, Consultation, ExpertReview
from server.models.article import Article

def init_production_db():
    try:
        print("Starting production database initialization...")
        
        # Create the Flask application with production configuration
        app = create_app('production')
        
        # Initialize Flask-Migrate
        migrate = Migrate(app, db)
        
        with app.app_context():
            # Try to drop all tables first to ensure a clean slate
            try:
                print("Attempting to drop existing tables...")
                db.session.execute(text('DROP SCHEMA public CASCADE'))
                db.session.execute(text('CREATE SCHEMA public'))
                db.session.commit()
                print("Successfully dropped existing tables.")
            except Exception as e:
                print(f"Error dropping tables: {str(e)}")
                db.session.rollback()
                print("Proceeding with table creation...")
            
            # Create all tables
            print("Creating database tables...")
            db.create_all()
            print("Production database tables created successfully!")
            
            # Create a default admin user if it doesn't exist
            print("Creating default admin user...")
            if not User.query.filter_by(email='admin@example.com').first():
                admin = User(
                    email='admin@example.com',
                    password='adminpassword',  # This will be hashed by the User model
                    first_name='Admin',
                    last_name='User',
                    role='admin'
                )
                db.session.add(admin)
                db.session.commit()
                print("Admin user created!")
            
            # Create default country and state
            print("Creating default country and state...")
            if not Country.query.first():
                country = Country(name='United States', code='US')
                db.session.add(country)
                db.session.commit()
                print("Default country created!")
                
                state = StateProvince(name='California', code='CA', country_id=country.country_id)
                db.session.add(state)
                db.session.commit()
                print("Default state created!")
            
            print("Production database initialization complete!")
            return True
    except Exception as e:
        print(f"Error initializing production database: {str(e)}")
        traceback.print_exc()
        return False

# This allows the script to be run directly
if __name__ == "__main__":
    success = init_production_db()
    if not success:
        sys.exit(1)
    print("Script executed successfully")