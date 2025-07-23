from flask import request, jsonify
from datetime import datetime, timedelta
import uuid

from server.models.expert import ExpertProfile, Consultation, ExpertReview
from server.models.user import User
from server.database import db
from server.utils.auth import token_required, role_required

@token_required
def get_experts(current_user):
    """
    Get paginated experts with filters.
    
    Query Parameters:
    - page: int (default=1)
    - per_page: int (default=10)
    - specialization: string
    - location_id: int
    - rating: float (minimum rating)
    - availability: string
    - search: string
    """
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    specialization = request.args.get('specialization')
    location_id = request.args.get('location_id', type=int)
    rating = request.args.get('rating', type=float)
    availability = request.args.get('availability')
    search = request.args.get('search')
    
    # Base query - join with User to get user details
    query = db.session.query(ExpertProfile).join(User, ExpertProfile.user_id == User.user_id)
    
    # Apply filters
    if specialization:
        query = query.filter(ExpertProfile.specializations.contains([specialization]))
    
    if location_id:
        query = query.filter(ExpertProfile.service_areas.contains([location_id]))
    
    if rating:
        query = query.filter(ExpertProfile.rating >= rating)
    
    if availability:
        query = query.filter_by(availability_status=availability)
    
    if search:
        query = query.filter(
            (User.first_name.ilike(f'%{search}%')) | 
            (User.last_name.ilike(f'%{search}%')) |
            (ExpertProfile.title.ilike(f'%{search}%'))
        )
    
    # Paginate results
    experts_page = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    experts = [expert.to_dict() for expert in experts_page.items]
    
    return jsonify({
        'experts': experts,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': experts_page.pages,
            'total_items': experts_page.total
        }
    }), 200


@token_required
def get_expert(current_user, expert_id):
    """
    Get detailed expert profile.
    """
    # Get expert profile
    expert = ExpertProfile.query.filter_by(user_id=expert_id).first()
    
    if not expert:
        return jsonify({'message': 'Expert not found'}), 404
    
    # Get expert data
    expert_data = expert.to_dict()
    
    # Add reviews
    reviews = ExpertReview.query.filter_by(expert_id=expert_id).order_by(ExpertReview.created_at.desc()).limit(5).all()
    expert_data['reviews'] = [review.to_dict() for review in reviews]
    
    # Add availability calendar (simplified for now)
    expert_data['availability_calendar'] = [
        {
            'date': (datetime.utcnow().date() + timedelta(days=i)).isoformat(),
            'available_slots': ['09:00-10:00', '14:00-15:00']
        }
        for i in range(7)  # Next 7 days
    ]
    
    return jsonify(expert_data), 200


@token_required
@role_required(['expert'])
def create_expert_profile(current_user):
    """
    Create or update expert profile.
    
    Request Body:
    {
        "title": "Agricultural Scientist",
        "specializations": ["Corn", "Wheat", "Organic Farming"],
        "certification": "PhD in Agricultural Science",
        "education": "University of Agriculture",
        "years_experience": 15,
        "hourly_rate": 50.00,
        "currency": "USD",
        "availability_status": "available",
        "languages_spoken": ["English", "Spanish"],
        "service_areas": [5, 8]
    }
    """
    data = request.get_json()
    
    # Check if profile already exists
    expert = ExpertProfile.query.filter_by(user_id=current_user.user_id).first()
    
    if expert:
        # Update existing profile
        for field in ['title', 'specializations', 'certification', 'education', 
                     'years_experience', 'hourly_rate', 'currency', 
                     'availability_status', 'languages_spoken', 'service_areas']:
            if field in data:
                setattr(expert, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Expert profile updated successfully',
            'profile': expert.to_dict()
        }), 200
    else:
        # Create new profile
        expert = ExpertProfile(
            user_id=current_user.user_id,
            title=data.get('title'),
            specializations=data.get('specializations'),
            certification=data.get('certification'),
            education=data.get('education'),
            years_experience=data.get('years_experience'),
            hourly_rate=data.get('hourly_rate'),
            currency=data.get('currency', 'USD'),
            availability_status=data.get('availability_status', 'available'),
            languages_spoken=data.get('languages_spoken'),
            service_areas=data.get('service_areas')
        )
        
        db.session.add(expert)
        db.session.commit()
        
        return jsonify({
            'message': 'Expert profile created successfully',
            'profile': expert.to_dict()
        }), 201


@token_required
def book_consultation(current_user):
    """
    Book a consultation with an expert.
    
    Request Body:
    {
        "expert_id": "uuid",
        "consultation_type": "video",
        "scheduled_start": "2023-07-20T09:00:00Z",
        "scheduled_end": "2023-07-20T10:00:00Z",
        "topic": "Organic pest control for corn",
        "description": "I'm having issues with pests in my organic corn field...",
        "related_crops": [1],
        "farm_location_id": 12
    }
    """
    data = request.get_json()
    
    # Check if expert exists
    expert_id = data.get('expert_id')
    expert = User.query.filter_by(user_id=expert_id, role='expert').first()
    
    if not expert:
        return jsonify({'message': 'Expert not found'}), 404
    
    # Check if expert has a profile
    expert_profile = ExpertProfile.query.filter_by(user_id=expert_id).first()
    
    if not expert_profile:
        return jsonify({'message': 'Expert profile not found'}), 404
    
    # Create consultation
    consultation = Consultation(
        expert_id=expert_id,
        farmer_id=current_user.user_id,
        consultation_type=data.get('consultation_type'),
        scheduled_start=datetime.fromisoformat(data.get('scheduled_start').replace('Z', '+00:00')),
        scheduled_end=datetime.fromisoformat(data.get('scheduled_end').replace('Z', '+00:00')),
        topic=data.get('topic'),
        description=data.get('description'),
        related_crops=data.get('related_crops'),
        farm_location_id=data.get('farm_location_id'),
        status='pending',
        payment_status='unpaid',
        amount=expert_profile.hourly_rate,
        currency=expert_profile.currency
    )
    
    db.session.add(consultation)
    db.session.commit()
    
    return jsonify({
        'message': 'Consultation booked successfully',
        'consultation': consultation.to_dict()
    }), 201


@token_required
def get_consultations(current_user):
    """
    Get user's consultations.
    
    Query Parameters:
    - role: string (expert, farmer)
    - status: string (pending, confirmed, completed, cancelled)
    """
    # Get query parameters
    role = request.args.get('role')
    status = request.args.get('status')
    
    # Base query
    if role == 'expert':
        query = Consultation.query.filter_by(expert_id=current_user.user_id)
    elif role == 'farmer':
        query = Consultation.query.filter_by(farmer_id=current_user.user_id)
    else:
        # Default to all consultations for the user
        query = Consultation.query.filter(
            (Consultation.expert_id == current_user.user_id) | 
            (Consultation.farmer_id == current_user.user_id)
        )
    
    # Apply status filter
    if status:
        query = query.filter_by(status=status)
    
    # Order by scheduled start
    query = query.order_by(Consultation.scheduled_start)
    
    # Get consultations
    consultations = query.all()
    
    return jsonify({
        'consultations': [consultation.to_dict() for consultation in consultations]
    }), 200


@token_required
def update_consultation_status(current_user, consultation_id):
    """
    Update consultation status.
    
    Request Body:
    {
        "status": "confirmed"
    }
    """
    consultation = Consultation.query.get(consultation_id)
    
    if not consultation:
        return jsonify({'message': 'Consultation not found'}), 404
    
    # Check if user is expert or farmer
    if consultation.expert_id != current_user.user_id and consultation.farmer_id != current_user.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update status
    consultation.status = data.get('status')
    db.session.commit()
    
    return jsonify({
        'message': 'Consultation status updated successfully',
        'consultation': consultation.to_dict()
    }), 200


@token_required
def add_review(current_user, expert_id):
    """
    Add a review for an expert.
    
    Request Body:
    {
        "consultation_id": "uuid",  # Optional
        "rating": 5,
        "comment": "Excellent advice on organic pest control!"
    }
    """
    # Check if expert exists
    expert = User.query.filter_by(user_id=expert_id, role='expert').first()
    
    if not expert:
        return jsonify({'message': 'Expert not found'}), 404
    
    data = request.get_json()
    
    # Check if consultation exists if provided
    consultation_id = data.get('consultation_id')
    if consultation_id:
        consultation = Consultation.query.get(consultation_id)
        
        if not consultation:
            return jsonify({'message': 'Consultation not found'}), 404
        
        # Check if user is the farmer in the consultation
        if consultation.farmer_id != current_user.user_id:
            return jsonify({'message': 'Unauthorized'}), 403
    
    # Create review
    review = ExpertReview(
        expert_id=expert_id,
        reviewer_id=current_user.user_id,
        consultation_id=consultation_id,
        rating=data.get('rating'),
        comment=data.get('comment')
    )
    
    db.session.add(review)
    
    # Update expert profile rating
    expert_profile = ExpertProfile.query.filter_by(user_id=expert_id).first()
    
    if expert_profile:
        # Calculate new rating
        reviews = ExpertReview.query.filter_by(expert_id=expert_id).all()
        total_rating = sum(review.rating for review in reviews) + data.get('rating')
        new_rating = total_rating / (len(reviews) + 1)
        
        expert_profile.rating = new_rating
        expert_profile.review_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': 'Review added successfully',
        'review': review.to_dict()
    }), 201