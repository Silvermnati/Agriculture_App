from flask import Flask
from flask_cors import CORS
import os

from server.config import config
from server.database import init_db, db
from server.utils.error_handlers import register_error_handlers

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
    
    # Register global error handlers
    register_error_handlers(app)
    
    # Import and register blueprints
    try:
        from server.routes.auth_routes import auth_bp
        from server.routes.post_routes import post_bp
        from server.routes.community_routes import community_bp
        from server.routes.expert_routes import expert_bp, consultation_bp
        from server.routes.upload_routes import upload_bp
        from server.routes.article_routes import article_bp
        from server.routes.crop_routes import crop_bp, user_crop_bp
        from server.routes.location_routes import location_bp
        from server.routes.category_routes import category_bp, tag_bp
        from server.routes.review_routes import review_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(post_bp)
        app.register_blueprint(community_bp)
        app.register_blueprint(expert_bp)
        app.register_blueprint(consultation_bp)
        app.register_blueprint(upload_bp)
        app.register_blueprint(article_bp)
        app.register_blueprint(crop_bp)
        app.register_blueprint(user_crop_bp)
        app.register_blueprint(location_bp)
        app.register_blueprint(category_bp)
        app.register_blueprint(tag_bp)
        app.register_blueprint(review_bp)
        print("✅ All blueprints registered successfully")
    except ImportError as e:
        print(f"⚠️  Warning: Could not import some blueprints: {e}")
        # Continue without failing - some routes might not be implemented yet
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    @app.route('/')
    def index():
        return {'message': 'Agricultural Super App API', 'status': 'running'}
    
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        try:
            # Test database connection
            from sqlalchemy import text
            with db.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return {'status': 'healthy', 'database': 'connected'}
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}, 500
    
    return app
