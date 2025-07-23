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

# Create the Flask application with testing configuration
app = create_app('testing')

# Initialize Flask-Migrate
migrate = Migrate(app, db)

with app.app_context():
    # Create all tables
    db.create_all()
    print("Database tables created successfully in the test database!")

    # Create initial data if needed
    # For example, create a default admin user
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

    # Create test country and state
    if not Country.query.first():
        country = Country(name='United States', code='US')
        db.session.add(country)
        db.session.commit()
        print("Default country created!")

        state = StateProvince(name='California', code='CA', country_id=country.country_id)
        db.session.add(state)
        db.session.commit()
        print("Default state created!")

    print("Test database initialization complete!")