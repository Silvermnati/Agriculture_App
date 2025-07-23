from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)
    
    # In production, automatically create tables if they don't exist
    if app.config.get('FLASK_ENV') == 'production' or app.config.get('ENV') == 'production':
        with app.app_context():
            # Import all models to ensure they're included
            from server.models.user import User, UserExpertise, UserFollow
            from server.models.location import Country, StateProvince, Location
            from server.models.crop import Crop, Livestock, UserCrop
            from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
            from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
            from server.models.expert import ExpertProfile, Consultation, ExpertReview
            from server.models.article import Article
            
            # Check if users table exists
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            if 'users' not in tables:
                print("Tables don't exist. Creating all tables...")
                db.create_all()
                print("Tables created successfully!")
                
                # Create initial data
                if not User.query.filter_by(email='admin@example.com').first():
                    admin = User(
                        email='admin@example.com',
                        password='adminpassword',
                        first_name='Admin',
                        last_name='User',
                        role='admin'
                    )
                    db.session.add(admin)
                    db.session.commit()
                    print("Admin user created!")
                
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
                print("Tables already exist. Skipping table creation.")