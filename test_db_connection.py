from server import create_app
from server.database import db
import sys

def test_connection(config_name):
    """Test database connection with the specified configuration."""
    app = create_app(config_name)
    with app.app_context():
        try:
            # Try to execute a simple query
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1")).scalar()
            db_uri = app.config['SQLALCHEMY_DATABASE_URI']
            print(f"✅ Successfully connected to database with {config_name} configuration")
            print(f"Database URI: {db_uri}")
            print(f"Query result: {result}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to database with {config_name} configuration")
            print(f"Error: {str(e)}")
            return False

if __name__ == "__main__":
    config_name = sys.argv[1] if len(sys.argv) > 1 else 'development'
    success = test_connection(config_name)
    if not success:
        sys.exit(1)