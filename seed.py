#!/usr/bin/env python3
"""
Seed script to populate the database with initial data for development.
"""

import os
import sys
from datetime import datetime
from flask import Flask
from server import create_app
from server.database import db
from server.models.user import User
from server.models.location import Country, StateProvince, Location
from server.models.crop import Crop, Livestock, UserCrop
from server.models.post import Post, Category, Tag

def seed_countries():
    """Seed countries table."""
    print("Seeding countries...")
    countries = [
        {"name": "United States", "code": "US"},
        {"name": "Canada", "code": "CA"},
        {"name": "United Kingdom", "code": "GB"},
        {"name": "Australia", "code": "AU"},
        {"name": "Nigeria", "code": "NG"},
        {"name": "Kenya", "code": "KE"},
        {"name": "South Africa", "code": "ZA"},
        {"name": "India", "code": "IN"}
    ]
    
    # Use session.no_autoflush to prevent premature flushing
    with db.session.no_autoflush:
        added_count = 0
        for country_data in countries:
            # Check if country exists by code
            existing = Country.query.filter_by(code=country_data["code"]).first()
            if not existing:
                try:
                    country = Country(**country_data)
                    db.session.add(country)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding country {country_data['name']}: {e}")
                    db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} countries")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing countries: {e}")

def seed_states():
    """Seed states/provinces table."""
    print("Seeding states/provinces...")
    us = Country.query.filter_by(code="US").first()
    
    if not us:
        print("Error: US country not found")
        return
    
    states = [
        {"name": "California", "code": "CA", "country_id": us.country_id},
        {"name": "Texas", "code": "TX", "country_id": us.country_id},
        {"name": "New York", "code": "NY", "country_id": us.country_id},
        {"name": "Florida", "code": "FL", "country_id": us.country_id},
        {"name": "Illinois", "code": "IL", "country_id": us.country_id}
    ]
    
    with db.session.no_autoflush:
        added_count = 0
        for state_data in states:
            existing = StateProvince.query.filter_by(code=state_data["code"]).first()
            if not existing:
                try:
                    state = StateProvince(**state_data)
                    db.session.add(state)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding state {state_data['name']}: {e}")
                    db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} states")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing states: {e}")

def seed_locations():
    """Seed locations table."""
    print("Seeding locations...")
    us = Country.query.filter_by(code="US").first()
    ca = StateProvince.query.filter_by(code="CA").first()
    tx = StateProvince.query.filter_by(code="TX").first()
    
    if not us or not ca or not tx:
        print("Error: Required country or states not found")
        return
    
    locations = [
        {
            "country_id": us.country_id,
            "state_id": ca.state_id,
            "city": "San Francisco",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "climate_zone": "Mediterranean"
        },
        {
            "country_id": us.country_id,
            "state_id": tx.state_id,
            "city": "Austin",
            "latitude": 30.2672,
            "longitude": -97.7431,
            "climate_zone": "Humid subtropical"
        }
    ]
    
    with db.session.no_autoflush:
        added_count = 0
        for location_data in locations:
            # Check if location already exists
            existing = Location.query.filter_by(
                country_id=location_data["country_id"],
                state_id=location_data["state_id"],
                city=location_data["city"]
            ).first()
            
            if not existing:
                try:
                    location = Location(**location_data)
                    db.session.add(location)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding location {location_data['city']}: {e}")
                    db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} locations")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing locations: {e}")

def seed_crops():
    """Seed crops table."""
    print("Seeding crops...")
    crops = [
        {
            "name": "Corn",
            "scientific_name": "Zea mays",
            "category": "cereal",
            "growing_season": "summer",
            "climate_requirements": "Warm, sunny conditions with moderate rainfall",
            "water_requirements": "medium",
            "soil_type": "Well-drained loamy soil",
            "maturity_days": 90
        },
        {
            "name": "Wheat",
            "scientific_name": "Triticum aestivum",
            "category": "cereal",
            "growing_season": "winter",
            "climate_requirements": "Cool to moderate temperatures",
            "water_requirements": "medium",
            "soil_type": "Loamy soil with good drainage",
            "maturity_days": 120
        },
        {
            "name": "Tomato",
            "scientific_name": "Solanum lycopersicum",
            "category": "vegetable",
            "growing_season": "summer",
            "climate_requirements": "Warm, sunny conditions",
            "water_requirements": "high",
            "soil_type": "Well-drained, fertile soil",
            "maturity_days": 70
        }
    ]
    
    with db.session.no_autoflush:
        added_count = 0
        for crop_data in crops:
            existing = Crop.query.filter_by(name=crop_data["name"]).first()
            if not existing:
                try:
                    crop = Crop(**crop_data)
                    db.session.add(crop)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding crop {crop_data['name']}: {e}")
                    db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} crops")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing crops: {e}")

def seed_users():
    """Seed users table with demo accounts."""
    print("Seeding users...")
    
    # Get a location for the users
    sf_location = Location.query.filter_by(city="San Francisco").first()
    austin_location = Location.query.filter_by(city="Austin").first()
    
    if not sf_location or not austin_location:
        print("Error: Required locations not found")
        return
    
    added_count = 0
    with db.session.no_autoflush:
        # Create demo farmer user
        if not User.query.filter_by(email="farmer@example.com").first():
            try:
                farmer = User(
                    email="farmer@example.com",
                    password="farmerpassword",
                    first_name="John",
                    last_name="Farmer",
                    role="farmer",
                    location_id=sf_location.location_id,
                    farm_size=25.5,
                    farm_size_unit="hectares",
                    farming_experience=10,
                    farming_type="organic",
                    bio="Experienced organic farmer specializing in sustainable practices.",
                    is_verified=True
                )
                db.session.add(farmer)
                added_count += 1
            except Exception as e:
                print(f"Error adding farmer user: {e}")
                db.session.rollback()
        
        # Create demo expert user
        if not User.query.filter_by(email="expert@example.com").first():
            try:
                expert = User(
                    email="expert@example.com",
                    password="expertpassword",
                    first_name="Jane",
                    last_name="Expert",
                    role="expert",
                    location_id=austin_location.location_id,
                    bio="Agricultural scientist with 15 years of experience in sustainable farming practices.",
                    is_verified=True
                )
                db.session.add(expert)
                added_count += 1
            except Exception as e:
                print(f"Error adding expert user: {e}")
                db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} demo users")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing users: {e}")

def seed_user_crops():
    """Seed user_crops table."""
    print("Seeding user crops...")
    
    farmer = User.query.filter_by(email="farmer@example.com").first()
    corn = Crop.query.filter_by(name="Corn").first()
    tomato = Crop.query.filter_by(name="Tomato").first()
    
    if not farmer or not corn or not tomato:
        print("Error: Required user or crops not found")
        return
    
    added_count = 0
    with db.session.no_autoflush:
        # Add corn to farmer
        if not UserCrop.query.filter_by(user_id=farmer.user_id, crop_id=corn.crop_id).first():
            try:
                user_crop1 = UserCrop(
                    user_id=farmer.user_id,
                    crop_id=corn.crop_id,
                    area_planted=10.5,
                    area_unit="hectares",
                    planting_date=datetime(2023, 4, 15),
                    expected_harvest=datetime(2023, 7, 15),
                    season="summer2023"
                )
                db.session.add(user_crop1)
                added_count += 1
            except Exception as e:
                print(f"Error adding corn to farmer: {e}")
                db.session.rollback()
        
        # Add tomato to farmer
        if not UserCrop.query.filter_by(user_id=farmer.user_id, crop_id=tomato.crop_id).first():
            try:
                user_crop2 = UserCrop(
                    user_id=farmer.user_id,
                    crop_id=tomato.crop_id,
                    area_planted=5.2,
                    area_unit="hectares",
                    planting_date=datetime(2023, 5, 1),
                    expected_harvest=datetime(2023, 7, 10),
                    season="summer2023"
                )
                db.session.add(user_crop2)
                added_count += 1
            except Exception as e:
                print(f"Error adding tomato to farmer: {e}")
                db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} user crops")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing user crops: {e}")

def main():
    """Main function to seed the database."""
    app = create_app()
    
    with app.app_context():
        # Seed data in order of dependencies
        seed_countries()
        seed_states()
        seed_locations()
        seed_crops()
        seed_categories()  # Add categories before users and posts
        seed_users()
        seed_user_crops()
        seed_posts()
        
        print("Database seeding completed successfully!")

##################################################################

def seed_categories():
    """Seed categories table with default agricultural categories."""
    print("Seeding categories...")
    
    default_categories = [
        {
            'category_id': 1,
            'name': 'Crop Management',
            'description': 'Best practices for growing and managing crops',
            'is_agricultural_specific': True
        },
        {
            'category_id': 2,
            'name': 'Pest and Disease Control',
            'description': 'Methods and strategies for controlling pests and diseases',
            'is_agricultural_specific': True
        },
        {
            'category_id': 3,
            'name': 'Soil Health',
            'description': 'Soil management, fertilization, and health improvement',
            'is_agricultural_specific': True
        },
        {
            'category_id': 4,
            'name': 'Harvesting and Post-Harvesting',
            'description': 'Harvesting techniques and post-harvest handling',
            'is_agricultural_specific': True
        },
        {
            'category_id': 5,
            'name': 'Agricultural Technology',
            'description': 'Modern farming technologies and innovations',
            'is_agricultural_specific': True
        }
    ]
    
    with db.session.no_autoflush:
        added_count = 0
        for cat_data in default_categories:
            existing = Category.query.filter_by(category_id=cat_data['category_id']).first()
            if not existing:
                try:
                    category = Category(**cat_data)
                    db.session.add(category)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding category {cat_data['name']}: {e}")
                    db.session.rollback()
    
    try:
        db.session.commit()
        print(f"Added {added_count} categories")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing categories: {e}")

def seed_posts():
    # Fetch an existing user to assign as author
    user = User.query.first()
    if not user:
        print("No user found to assign posts.")
        return

    # Get the first category (should exist after seed_categories)
    category = Category.query.first()
    if not category:
        print("No category found for posts.")
        return

    # Create a default tag if none exist
    tag = Tag.query.filter_by(name='farming').first()
    if not tag:
        tag = Tag(name='farming')
        db.session.add(tag)
    
    # Flush to get IDs if they were just created
    db.session.flush()

    # Check if posts already exist to avoid duplicates
    if Post.query.count() > 0:
        print("Posts already exist, skipping seeding.")
        return

    post1 = Post(
        title="How to Start Organic Farming in Kenya",
        content="A step-by-step guide on starting organic farming in the Kenyan highlands. Focus on soil preparation and water management.",
        excerpt="Learn the fundamentals of organic farming, from soil health to choosing the right crops for the Kenyan climate.",
        author=user,
        category=category,
        tags=[tag],
        related_crops=['maize', 'beans', 'kale'],
        applicable_locations=['nairobi', 'nakuru', 'eldoret'],
        season_relevance='spring',
        status='published',
        published_at=datetime.utcnow(),
        read_time=5
    )

    post2 = Post(
        title="Benefits of Crop Rotation for Maize",
        content="Crop rotation is a crucial practice for maintaining soil fertility and reducing pest and disease pressure. This article explores a 3-year rotation cycle involving maize, legumes, and root vegetables.",
        excerpt="Discover how crop rotation can boost your maize yield and improve long-term soil health on your farm.",
        author=user,
        category=category,
        tags=[tag],
        related_crops=['maize', 'corn'],
        applicable_locations=['kitale', 'trans-nzoia'],
        season_relevance='summer',
        status='published',
        published_at=datetime.utcnow(),
        read_time=4
    )

    db.session.add_all([post1, post2])
    db.session.commit()
    print("Posts seeded successfully.")

if __name__ == "__main__":
    main()