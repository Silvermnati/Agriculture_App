"""
Seed script to populate the database with initial data.
Run this after initializing the database with init_db.py.
"""
from server import create_app
from server.database import db
from server.models.user import User
from server.models.location import Country, StateProvince, Location
from server.models.crop import Crop, Livestock
from server.models.post import Category, Tag
import uuid

def seed_data():
    """Seed the database with initial data."""
    app = create_app('development')
    
    with app.app_context():
        print("Seeding database with initial data...")
        
        # Create countries
        countries = [
            {'name': 'United States', 'code': 'USA'},
            {'name': 'Kenya', 'code': 'KEN'},
            {'name': 'India', 'code': 'IND'},
            {'name': 'Brazil', 'code': 'BRA'},
            {'name': 'Nigeria', 'code': 'NGA'}
        ]
        
        for country_data in countries:
            country = Country(**country_data)
            db.session.add(country)
        
        db.session.commit()
        print("Countries added successfully!")
        
        # Create states/provinces
        states = [
            {'country_id': 1, 'name': 'California', 'code': 'CA'},
            {'country_id': 1, 'name': 'Texas', 'code': 'TX'},
            {'country_id': 2, 'name': 'Nairobi', 'code': 'NBO'},
            {'country_id': 3, 'name': 'Maharashtra', 'code': 'MH'},
            {'country_id': 4, 'name': 'São Paulo', 'code': 'SP'},
            {'country_id': 5, 'name': 'Lagos', 'code': 'LAG'}
        ]
        
        for state_data in states:
            state = StateProvince(**state_data)
            db.session.add(state)
        
        db.session.commit()
        print("States/Provinces added successfully!")
        
        # Create locations
        locations = [
            {'country_id': 1, 'state_id': 1, 'city': 'San Francisco'},
            {'country_id': 1, 'state_id': 2, 'city': 'Austin'},
            {'country_id': 2, 'state_id': 3, 'city': 'Nairobi'},
            {'country_id': 3, 'state_id': 4, 'city': 'Mumbai'},
            {'country_id': 4, 'state_id': 5, 'city': 'São Paulo'},
            {'country_id': 5, 'state_id': 6, 'city': 'Lagos'}
        ]
        
        for location_data in locations:
            location = Location(**location_data)
            db.session.add(location)
        
        db.session.commit()
        print("Locations added successfully!")
        
        # Create crops
        crops = [
            {'name': 'Corn', 'category': 'cereal', 'growing_season': 'summer'},
            {'name': 'Wheat', 'category': 'cereal', 'growing_season': 'winter'},
            {'name': 'Rice', 'category': 'cereal', 'growing_season': 'summer'},
            {'name': 'Tomatoes', 'category': 'vegetable', 'growing_season': 'spring'},
            {'name': 'Coffee', 'category': 'beverage', 'growing_season': 'year-round'}
        ]
        
        for crop_data in crops:
            crop = Crop(**crop_data)
            db.session.add(crop)
        
        db.session.commit()
        print("Crops added successfully!")
        
        # Create livestock
        livestock = [
            {'name': 'Cattle', 'category': 'bovine', 'purpose': 'meat, dairy'},
            {'name': 'Chicken', 'category': 'poultry', 'purpose': 'meat, eggs'},
            {'name': 'Goat', 'category': 'caprine', 'purpose': 'meat, milk'},
            {'name': 'Sheep', 'category': 'ovine', 'purpose': 'meat, wool'},
            {'name': 'Pig', 'category': 'porcine', 'purpose': 'meat'}
        ]
        
        for livestock_data in livestock:
            animal = Livestock(**livestock_data)
            db.session.add(animal)
        
        db.session.commit()
        print("Livestock added successfully!")
        
        # Create categories
        categories = [
            {'name': 'Crop Management', 'description': 'Tips and advice for managing crops'},
            {'name': 'Livestock Care', 'description': 'Information about livestock health and management'},
            {'name': 'Organic Farming', 'description': 'Organic farming methods and certification'},
            {'name': 'Market Trends', 'description': 'Agricultural market trends and prices'},
            {'name': 'Technology', 'description': 'Agricultural technology and innovation'}
        ]
        
        for category_data in categories:
            category = Category(**category_data)
            db.session.add(category)
        
        db.session.commit()
        print("Categories added successfully!")
        
        # Create tags
        tags = [
            {'name': 'organic', 'category': 'technique'},
            {'name': 'irrigation', 'category': 'technique'},
            {'name': 'fertilizer', 'category': 'input'},
            {'name': 'pest-control', 'category': 'problem'},
            {'name': 'drought-resistant', 'category': 'trait'}
        ]
        
        for tag_data in tags:
            tag = Tag(**tag_data)
            db.session.add(tag)
        
        db.session.commit()
        print("Tags added successfully!")
        
        # Create admin user
        admin = User(
            email='admin@agriapp.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_verified=True
        )
        
        # Create farmer user
        farmer = User(
            email='farmer@example.com',
            password='farmerpassword',
            first_name='John',
            last_name='Farmer',
            role='farmer',
            location_id=1,
            farm_size=25.5,
            farming_experience=10,
            farming_type='organic'
        )
        
        # Create expert user
        expert = User(
            email='expert@example.com',
            password='expertpassword',
            first_name='Jane',
            last_name='Expert',
            role='expert',
            location_id=2,
            bio='Agricultural scientist with 15 years of experience in sustainable farming practices.'
        )
        
        db.session.add(admin)
        db.session.add(farmer)
        db.session.add(expert)
        
        db.session.commit()
        print("Users added successfully!")
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()