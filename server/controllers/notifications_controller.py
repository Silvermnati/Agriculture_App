from flask import jsonify
from flask_login import current_user, login_required
from server.models.notifications import Notification
from server.database import db
from server import app 

@app.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    """Fetch recent notifications for the current user."""
    # Fetch the last 20 notifications for the user, both read and unread,
    # to provide a more consistent history in the dropdown.
    notifications = Notification.query.filter_by(user_id=current_user.user_id)\
                                      .order_by(Notification.created_at.desc())\
                                      .limit(10).all()
    return jsonify([notification.to_dict() for notification in notifications])


@app.route('/api/notifications/<notification_id>', methods=['PUT'])
@login_required
def mark_notification_as_read(notification_id):
    """Mark a notification as read."""
    notification = Notification.query.get(notification_id)
    if notification is None:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    notification.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'})
