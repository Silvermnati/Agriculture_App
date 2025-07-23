import os
import sys
import traceback
from sqlalchemy import text

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

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

def create_tables():
    try:
        print("Starting database table creation...")
        
        # Create the Flask application with production configuration
        app = create_app('production')
        
        # Initialize Flask-Migrate
        migrate = Migrate(app, db)
        
        with app.app_context():
            # Print the database URL (with password masked)
            db_url = app.config['SQLALCHEMY_DATABASE_URI']
            if 'postgres://' in db_url:
                # Mask the password in the URL for security
                parts = db_url.split('@')
                if len(parts) > 1:
                    user_pass = parts[0].split('://')
                    if len(user_pass) > 1:
                        user = user_pass[1].split(':')[0]
                        masked_url = f"{user_pass[0]}://{user}:****@{parts[1]}"
                        print(f"Using database: {masked_url}")
            
            # Create all tables
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully!")
            
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
            else:
                print("Admin user already exists.")
            
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
            else:
                print("Default country already exists.")
            
            # List all tables that were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print("\nTables created in the database:")
            for table in tables:
                print(f"- {table}")
            
            print("\nDatabase initialization complete!")
            return True
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_tables()
    if not success:
        sys.exit(1)
    print("Script executed successfully")