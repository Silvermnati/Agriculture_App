from server import create_app
from server.database import db
from sqlalchemy import text

app = create_app('testing')
with app.app_context():
    # Drop all tables with CASCADE
    db.session.execute(text('DROP SCHEMA public CASCADE'))
    db.session.execute(text('CREATE SCHEMA public'))
    db.session.commit()
    
    # Recreate all tables
    db.create_all()
    print('Test database reset successfully!')