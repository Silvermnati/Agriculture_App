from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import inspect, text
import uuid

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)
    
    # Always try to create tables on startup (safe operation - won't overwrite existing)
    with app.app_context():
        try:
            # Import all models to ensure they're registered with SQLAlchemy
            import server.models
            
            print("🔍 Checking database connection...")
            # Test database connection
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            print("🔍 Checking existing tables...")
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            print(f"📋 Found tables: {', '.join(existing_tables) if existing_tables else 'None'}")
            
            # Create all tables (this is safe - won't overwrite existing tables)
            print("🏗️  Creating/updating database schema...")
            db.create_all()
            print("✅ Database schema updated successfully!")
            
            # Check if this is a fresh database (no users table or empty users table)
            if 'users' not in existing_tables:
                print("🆕 Fresh database detected - creating initial data...")
                create_initial_data()
            else:
                # Check if users table is empty
                from server.models.user import User
                user_count = User.query.count()
                if user_count == 0:
                    print("📭 Empty database detected - creating initial data...")
                    create_initial_data()
                else:
                    print(f"ℹ️  Database already has {user_count} users")
                    
        except Exception as e:
            print(f"❌ Error during database initialization: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            # Don't fail the app startup, just log the error
            try:
                db.session.rollback()
            except:
                pass

def create_initial_data():
    """Create initial data for a fresh database."""
    try:
        from server.models.user import User
        from server.models.location import Country, StateProvince
        from server.models.post import Category
        
        # Create admin user
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            admin = User(
                email='admin@example.com',
                password='adminpassword',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            db.session.add(admin)
            print("👤 Admin user created!")
        
        # Create default country and state
        country = Country.query.first()
        if not country:
            country = Country(name='United States', code='US')
            db.session.add(country)
            db.session.flush()  # Get the ID
            
            state = StateProvince(name='California', code='CA', country_id=country.country_id)
            db.session.add(state)
            print("🌍 Default location data created!")
        
        # Create default categories
        category_count = Category.query.count()
        if category_count == 0:
            categories = [
                {'name': 'Crop Management', 'description': 'Best practices for growing and managing crops'},
                {'name': 'Pest and Disease Control', 'description': 'Methods to prevent and treat plant diseases and pests'},
                {'name': 'Soil Health', 'description': 'Maintaining and improving soil quality'},
                {'name': 'Harvesting and Post-Harvesting', 'description': 'Techniques for harvesting and post-harvest handling'},
                {'name': 'Agricultural Technology', 'description': 'Modern tools and technology in agriculture'}
            ]
            
            for cat_data in categories:
                category = Category(
                    name=cat_data['name'],
                    description=cat_data['description'],
                    is_agricultural_specific=True
                )
                db.session.add(category)
            
            print("📂 Default categories created!")
        
        db.session.commit()
        print("💾 Initial data committed successfully!")
        
    except Exception as e:
        print(f"❌ Error creating initial data: {str(e)}")
        db.session.rollback()
        raise