from server import create_app
from server.database import db
from sqlalchemy import text

app = create_app('development')
with app.app_context():
    # Drop all tables with CASCADE
    db.session.execute(text('DROP SCHEMA public CASCADE'))
    db.session.execute(text('CREATE SCHEMA public'))
    db.session.commit()
    
    # Recreate all tables
    db.create_all()
    print('Development database reset successfully!')
    
    # Optionally create initial data
    # Uncomment the following lines if you want to create initial data
    """
    from server.models.user import User
    from server.models.location import Country, StateProvince
    
    # Create admin user
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
    
    # Create default country and state
    if not Country.query.first():
        country = Country(name='United States', code='US')
        db.session.add(country)
        db.session.commit()
        print("Default country created!")
        
        state = StateProvince(name='California', code='CA', country_id=country.country_id)
        db.session.add(state)
        db.session.commit()
        print("Default state created!")
    """
    
    print("Development database initialization complete!")