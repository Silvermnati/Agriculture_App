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

app = create_app('development')
migrate = Migrate(app, db)

with app.app_context():
    # Create all tables (this will automatically handle new columns)
    print("Creating/updating database tables...")
    db.create_all()
    print("✅ Database tables created/updated successfully!")

    # Create initial data if needed
    # Create a default admin user with location data
    if not User.query.filter_by(email='admin@example.com').first():
        admin = User(
            email='admin@example.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            role='admin',
            country='United States',
            city='San Francisco'
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created with location data!")

    # Create test countries
    if not Country.query.first():
        countries_to_create = [
            ('United States', 'US'),
            ('Canada', 'CA'),
            ('United Kingdom', 'GB'),
            ('Kenya', 'KE'),
            ('Nigeria', 'NG'),
            ('Ghana', 'GH'),
            ('South Africa', 'ZA'),
            ('India', 'IN'),
            ('Brazil', 'BR'),
            ('Australia', 'AU')
        ]
        
        for name, code in countries_to_create:
            country = Country(name=name, code=code)
            db.session.add(country)
        
        db.session.commit()
        print(f"✅ Created {len(countries_to_create)} default countries!")

        # Create a test state for the first country
        us_country = Country.query.filter_by(code='US').first()
        if us_country:
            state = StateProvince(name='California', code='CA', country_id=us_country.country_id)
            db.session.add(state)
            db.session.commit()
            print("✅ Default state created!")

    print("🎉 Database initialization complete!")