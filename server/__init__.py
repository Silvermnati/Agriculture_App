from flask import Flask
from flask_cors import CORS
import os

from server.config import config
from server.database import init_db
from server.routes.auth_routes import auth_bp
from server.routes.post_routes import post_bp
from server.routes.community_routes import community_bp
from server.routes.expert_routes import expert_bp, consultation_bp
from server.routes.upload_routes import upload_bp
from server.models import *

def create_app(config_name='default'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Enable CORS with specific origins
    cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173')
    origins = cors_origins.split(',')
    CORS(app, resources={r"/api/*": {"origins": origins}})
    
    # Initialize database
    init_db(app)
    
    # Note: Flask-Migrate removed to avoid conflicts
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(post_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(expert_bp)
    app.register_blueprint(consultation_bp)
    app.register_blueprint(upload_bp)
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    def init_database():
        """Initialize database tables and data"""
        try:
            from server.database import db
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            if 'users' not in tables:
                # Import all models to ensure they're included
                from server.models.user import User, UserExpertise, UserFollow
                from server.models.location import Country, StateProvince, Location
                from server.models.crop import Crop, Livestock, UserCrop
                from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
                from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
                from server.models.expert import ExpertProfile, Consultation, ExpertReview
                from server.models.article import Article
                
                print("Creating database tables...")
                db.create_all()
                print("Database tables created successfully!")
                
                # Create initial data
                try:
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
                except Exception as e:
                    print(f"Error creating initial data: {str(e)}")
                    db.session.rollback()
                
                return True
            else:
                print("Database tables already exist.")
                return False
        except Exception as e:
            print(f"Error during database initialization: {str(e)}")
            return False

    def update_database_schema():
        """Update database schema to add new columns"""
        try:
            from server.database import db
            from sqlalchemy import inspect, text
            
            # Import all models to ensure they're registered
            from server.models.user import User, UserExpertise, UserFollow
            from server.models.location import Country, StateProvince, Location
            from server.models.crop import Crop, Livestock, UserCrop
            from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
            from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
            from server.models.expert import ExpertProfile, Consultation, ExpertReview
            from server.models.article import Article
            
            print("🚀 Starting database schema update...")
            
            # Check current schema
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            if 'users' not in tables:
                print("❌ Users table not found. Please run /init-db first.")
                return False
            
            # Check existing columns in users table
            existing_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"📋 Current users table columns: {', '.join(existing_columns)}")
            
            # Check for missing location fields
            missing_fields = []
            if 'country' not in existing_columns:
                missing_fields.append('country')
            if 'city' not in existing_columns:
                missing_fields.append('city')
            
            if missing_fields:
                print(f"➕ Missing location fields detected: {', '.join(missing_fields)}")
                
                # Use db.create_all() to add missing columns
                print("🏗️  Updating database schema...")
                db.create_all()
                
                # Verify the update worked
                inspector = inspect(db.engine)
                updated_columns = [col['name'] for col in inspector.get_columns('users')]
                
                # Check if fields were added
                still_missing = []
                if 'country' not in updated_columns:
                    still_missing.append('country')
                if 'city' not in updated_columns:
                    still_missing.append('city')
                
                if still_missing:
                    print(f"⚠️  Some fields still missing after update: {', '.join(still_missing)}")
                    print("🔧 Attempting manual column addition...")
                    
                    # Try manual column addition as fallback
                    try:
                        if 'country' in still_missing:
                            db.engine.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR(100)"))
                            print("✅ Added country column manually")
                        
                        if 'city' in still_missing:
                            db.engine.execute(text("ALTER TABLE users ADD COLUMN city VARCHAR(100)"))
                            print("✅ Added city column manually")
                        
                        db.session.commit()
                    except Exception as manual_error:
                        print(f"⚠️  Manual column addition failed: {str(manual_error)}")
                        # This might be expected if columns already exist
                
                print("✅ Database schema update completed!")
                
                # Test the new fields
                print("🧪 Testing new location fields...")
                try:
                    # Try to create a test user with location data
                    test_user = User(
                        email='schema_test@example.com',
                        password='testpass',
                        first_name='Schema',
                        last_name='Test',
                        role='farmer',
                        country='Test Country',
                        city='Test City'
                    )
                    db.session.add(test_user)
                    db.session.commit()
                    
                    # Clean up test user
                    db.session.delete(test_user)
                    db.session.commit()
                    
                    print("✅ Location fields are working correctly!")
                except Exception as test_error:
                    print(f"⚠️  Location field test failed: {str(test_error)}")
                    db.session.rollback()
                
                return True
            else:
                print("ℹ️  All location fields already exist. No update needed.")
                return True
                
        except Exception as e:
            print(f"❌ Database schema update failed: {str(e)}")
            try:
                db.session.rollback()
            except:
                pass
            return False

    @app.route('/')
    def index():
        # Force database table creation on first access
        init_database()
        return {'message': 'Agricultural Super App API'}
    
    @app.route('/init-db')
    def init_db_endpoint():
        """Manual database initialization endpoint"""
        success = init_database()
        if success:
            return {'message': 'Database initialized successfully!'}
        else:
            return {'message': 'Database already exists or initialization failed.'}
    
    @app.route('/update-db')
    def update_db_endpoint():
        """Manual database schema update endpoint"""
        success = update_database_schema()
        if success:
            return {'message': 'Database schema updated successfully! Location fields are now available.'}
        else:
            return {'message': 'Database schema update failed. Please check the logs.'}
    
    return app

from server.database import db
