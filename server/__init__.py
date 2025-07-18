from flask import Flask
from flask_cors import CORS
import os

from server.config import config
from server.database import init_db
from server.routes.auth_routes import auth_bp
from server.routes.post_routes import post_bp

def create_app(config_name='default'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(post_bp)
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    @app.route('/')
    def index():
        return {'message': 'Agricultural Super App API'}
    
    return app