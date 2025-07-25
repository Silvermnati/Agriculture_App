from flask import request, jsonify
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from server.models.expert import ExpertReview, ExpertProfile, Consultation
from server.database import db
from server.utils.auth import token_required

def get_reviews():
    """
    Get reviews with optional filtering.
    
    Query Parameters:
    - expert_id: uuid (filter by expert)
    - rating: integer (filter by rating)
    - page: integer (default=1)
    - per_page: integer (default=10)
    """
    # Get query parameters
    expert_id = request.args.get('expert_id', type=str)
    rating = request.args.get('rating', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Base query with eager loading
    query = ExpertReview.query.options(
        joinedload(ExpertReview.expert),
        joinedload(ExpertReview.reviewer),
        joinedload(ExpertReview.consultation)
    )
    
    # Apply filters
    if expert_id:
        query = query.filter_by(expert_id=expert_id)
    
    if rating:
        query = query.filter_by(rating=rating)
    
    # Order by creation date (most recent first)
    query = query.order_by(ExpertReview.created_at.desc())
    
    # Paginate results
    reviews_page = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'reviews': [review.to_dict() for review in reviews_page.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': reviews_page.pages,
            'total_items': reviews_page.total
        }
    }), 200


@token_required
def create_review(current_user):
    """
    Create a new review for an expert.
    
    Request Body:
    {
        "expert_id": "uuid",
        "consultation_id": "uuid",  # optional
        "rating": 5,
        "comment": "Excellent advice on crop rotation!"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('expert_id') or not data.get('rating'):
        return jsonify({'message': 'Expert ID and rating are required'}), 400
    
    # Validate rating range
    rating = data.get('rating')
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400
    
    # Validate expert exists
    expert = db.session.query(ExpertProfile).filter_by(user_id=data.get('expert_id')).first()
    if not expert:
        return jsonify({'message': 'Expert not found'}), 404
    
    # Check if user is trying to review themselves
    if str(current_user.user_id) == str(data.get('expert_id')):
        return jsonify({'message': 'You cannot review yourself'}), 400
    
    # Validate consultation if provided
    consultation = None
    if data.get('consultation_id'):
        consultation = Consultation.query.filter_by(
            consultation_id=data.get('consultation_id'),
            expert_id=data.get('expert_id'),
            farmer_id=current_user.user_id,
            status='completed'
        ).first()
        
        if not consultation:
            return jsonify({'message': 'Consultation not found or not completed'}), 404
        
        # Check if consultation already has a review
        existing_review = ExpertReview.query.filter_by(consultation_id=data.get('consultation_id')).first()
        if existing_review:
            return jsonify({'message': 'This consultation has already been reviewed'}), 409
    
    # Check if user has already reviewed this expert (without consultation)
    if not data.get('consultation_id'):
        existing_review = ExpertReview.query.filter_by(
            expert_id=data.get('expert_id'),
            reviewer_id=current_user.user_id,
            consultation_id=None
        ).first()
        
        if existing_review:
            return jsonify({'message': 'You have already reviewed this expert'}), 409
    
    # Create review
    review = ExpertReview(
        expert_id=data.get('expert_id'),
        reviewer_id=current_user.user_id,
        consultation_id=data.get('consultation_id'),
        rating=rating,
        comment=data.get('comment')
    )
    
    db.session.add(review)
    db.session.flush()  # Get review_id without committing
    
    # Update expert's rating and review count
    update_expert_rating(data.get('expert_id'))
    
    db.session.commit()
    
    return jsonify({
        'message': 'Review created successfully',
        'review': review.to_dict()
    }), 201


def get_review(review_id):
    """
    Get a specific review.
    """
    review = ExpertReview.query.options(
        joinedload(ExpertReview.expert),
        joinedload(ExpertReview.reviewer),
        joinedload(ExpertReview.consultation)
    ).filter_by(review_id=review_id).first()
    
    if not review:
        return jsonify({'message': 'Review not found'}), 404
    
    return jsonify(review.to_dict()), 200


@token_required
def update_review(current_user, review_id):
    """
    Update a review (author only).
    
    Request Body:
    {
        "rating": 4,
        "comment": "Updated comment"
    }
    """
    review = ExpertReview.query.filter_by(review_id=review_id).first()
    
    if not review:
        return jsonify({'message': 'Review not found'}), 404
    
    # Check if user is the review author
    if review.reviewer_id != current_user.user_id:
        return jsonify({'message': 'You can only update your own reviews'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Update rating if provided
    if 'rating' in data:
        rating = data.get('rating')
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400
        review.rating = rating
    
    # Update comment if provided
    if 'comment' in data:
        review.comment = data.get('comment')
    
    db.session.commit()
    
    # Update expert's rating after review update
    update_expert_rating(review.expert_id)
    
    return jsonify({
        'message': 'Review updated successfully',
        'review': review.to_dict()
    }), 200


@token_required
def delete_review(current_user, review_id):
    """
    Delete a review (author or admin only).
    """
    review = ExpertReview.query.filter_by(review_id=review_id).first()
    
    if not review:
        return jsonify({'message': 'Review not found'}), 404
    
    # Check if user is the review author or admin
    if review.reviewer_id != current_user.user_id and current_user.role != 'admin':
        return jsonify({'message': 'You can only delete your own reviews'}), 403
    
    expert_id = review.expert_id
    
    db.session.delete(review)
    db.session.commit()
    
    # Update expert's rating after review deletion
    update_expert_rating(expert_id)
    
    return jsonify({'message': 'Review deleted successfully'}), 200


def update_expert_rating(expert_id):
    """
    Update expert's average rating and review count.
    """
    # Calculate new average rating and count
    result = db.session.query(
        func.avg(ExpertReview.rating).label('avg_rating'),
        func.count(ExpertReview.review_id).label('review_count')
    ).filter_by(expert_id=expert_id).first()
    
    # Update expert profile
    expert_profile = ExpertProfile.query.filter_by(user_id=expert_id).first()
    if expert_profile:
        expert_profile.rating = round(float(result.avg_rating), 2) if result.avg_rating else None
        expert_profile.review_count = result.review_count or 0
        db.session.commit()


@token_required
def get_expert_reviews(current_user, expert_id):
    """
    Get all reviews for a specific expert.
    
    Query Parameters:
    - page: integer (default=1)
    - per_page: integer (default=10)
    """
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate expert exists
    expert = db.session.query(ExpertProfile).filter_by(user_id=expert_id).first()
    if not expert:
        return jsonify({'message': 'Expert not found'}), 404
    
    # Get reviews for this expert
    reviews_page = ExpertReview.query.options(
        joinedload(ExpertReview.reviewer),
        joinedload(ExpertReview.consultation)
    ).filter_by(expert_id=expert_id).order_by(
        ExpertReview.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'expert_id': expert_id,
        'reviews': [review.to_dict() for review in reviews_page.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': reviews_page.pages,
            'total_items': reviews_page.total
        }
    }), 200