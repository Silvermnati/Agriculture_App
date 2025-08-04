from flask import Blueprint
from server.controllers.location_controller import (
    get_countries, get_states, get_locations,
    create_country, create_state, create_location,
    update_country, update_state, update_location,
    delete_country, delete_state, delete_location
)

location_bp = Blueprint('location', __name__, url_prefix='/api/locations')

# Public read-only routes
location_bp.route('/countries', methods=['GET'])(get_countries)
location_bp.route('/states/<int:country_id>', methods=['GET'])(get_states)
location_bp.route('', methods=['GET'])(get_locations)

# Admin-only creation routes
location_bp.route('/countries', methods=['POST'])(create_country)
location_bp.route('/states', methods=['POST'])(create_state)
location_bp.route('', methods=['POST'])(create_location)

# Admin-only update routes
location_bp.route('/countries/<int:country_id>', methods=['PUT'])(update_country)
location_bp.route('/states/<int:state_id>', methods=['PUT'])(update_state)
location_bp.route('/<int:location_id>', methods=['PUT'])(update_location)

# Admin-only delete routes
location_bp.route('/countries/<int:country_id>', methods=['DELETE'])(delete_country)
location_bp.route('/states/<int:state_id>', methods=['DELETE'])(delete_state)
location_bp.route('/<int:location_id>', methods=['DELETE'])(delete_location)