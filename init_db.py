#!/usr/bin/env python3
"""
Script to initialize the database and create tables.
"""

from server import create_app
from server.database import db

def init_db():
    """Initialize the database and create all tables."""
    app = create_app()
    
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()