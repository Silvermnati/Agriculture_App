from flask import Flask
from flask_migrate import Migrate
from server import create_app
from server.database import db

# Import all models to ensure they're included in migrations
from server.models.user import User, UserExpertise, UserFollow
from server.models.location import Country, StateProvince, Location
from server.models.crop import Crop, Livestock, UserCrop
from server.models.post import Category, Tag, Post, Comment, ArticlePostLike
from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
from server.models.expert import ExpertProfile, Consultation, ExpertReview
from server.models.article import Article

# Create the Flask application
app = create_app('production')

# Initialize Flask-Migrate
migrate = Migrate(app, db)

if __name__ == '__main__':
    # This script can be run to initialize the migrations directory
    print("Flask-Migrate initialized. You can now run 'flask db init' to create the migrations directory.")