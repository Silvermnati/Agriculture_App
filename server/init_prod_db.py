from . import create_app
from .database import db
from flask_migrate import Migrate

# Import all models to ensure they're included
from .models.user import User, UserExpertise, UserFollow
from .models.location import Country, StateProvince, Location
from .models.crop import Crop, Livestock, UserCrop
from .models.post import Category, Tag, Post, Comment, ArticlePostLike
from .models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
from .models.expert import ExpertProfile, Consultation, ExpertReview
from .models.article import Article

# Create the Flask application with production configuration
app = create_app('production')

# Initialize Flask-Migrate
migrate = Migrate(app, db)

with app.app_context():
    # Create all tables but leave the database empty
    db.create_all()
    print("Production database tables created successfully!")
    print("Production database initialization complete!")

# This allows the script to be run directly
if __name__ == "__main__":
    print("Script executed directly")