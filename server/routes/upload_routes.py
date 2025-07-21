from flask import Blueprint, request, jsonify
from server.utils.auth import token_required
from server.utils.file_upload import save_file, delete_file

upload_bp = Blueprint('upload', __name__, url_prefix='/api/uploads')

@upload_bp.route('', methods=['POST'])
@token_required
def upload_file(current_user):
    """
    Upload a file.
    
    Request:
        - Multipart form with 'file' field
        - Optional 'subfolder' field
    
    Response:
        {
            "message": "File uploaded successfully",
            "file_url": "/uploads/images/uuid_filename.jpg"
        }
    """
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    subfolder = request.form.get('subfolder', '')
    
    file_url = save_file(file, subfolder)
    
    if file_url:
        return jsonify({
            'message': 'File uploaded successfully',
            'file_url': file_url
        }), 201
    else:
        return jsonify({'message': 'Invalid file type'}), 400


@upload_bp.route('', methods=['DELETE'])
@token_required
def remove_file(current_user):
    """
    Delete a file.
    
    Request Body:
    {
        "file_url": "/uploads/images/uuid_filename.jpg"
    }
    
    Response:
    {
        "message": "File deleted successfully"
    }
    """
    data = request.get_json()
    
    if not data or 'file_url' not in data:
        return jsonify({'message': 'File URL is required'}), 400
    
    file_url = data['file_url']
    
    if delete_file(file_url):
        return jsonify({'message': 'File deleted successfully'}), 200
    else:
        return jsonify({'message': 'File not found or could not be deleted'}), 404