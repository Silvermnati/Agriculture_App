"""
Database initialization script.
Run this script to set up the database and create initial migrations.
"""
import os
import subprocess
from flask_migrate import init, migrate, upgrade
from run import app, db

def init_database():
    """Initialize the database with migrations."""
    print("Setting up the database...")
    
    # Create migrations directory if it doesn't exist
    if not os.path.exists('migrations'):
        print("Initializing migrations directory...")
        with app.app_context():
            init()
    
    # Create initial migration
    print("Creating initial migration...")
    with app.app_context():
        migrate(message="Initial migration with agricultural models")
    
    # Apply migration
    print("Applying migration...")
    with app.app_context():
        upgrade()
    
    print("Database setup complete!")

if __name__ == '__main__':
    init_database()