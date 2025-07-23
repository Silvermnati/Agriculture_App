from flask import Blueprint, request, jsonify
from server.utils.auth import token_required
from server.utils.file_upload import save_file, delete_file
from server.utils.cloudinary_upload import upload_image, delete_image

upload_bp = Blueprint('upload', __name__, url_prefix='/api/uploads')

@upload_bp.route('', methods=['POST'])
@token_required
def upload_file(current_user):
    """
    Upload a file.
    
    Request:
        - Multipart form with 'file' field
        - Optional 'folder' field
        - Optional 'use_cloudinary' field (true/false)
    
    Response:
        {
            "message": "File uploaded successfully",
            "file_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/uploads/image.jpg",
            "public_id": "uploads/image" (only for Cloudinary uploads)
        }
    """
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    # Check if we should use Cloudinary
    use_cloudinary = request.form.get('use_cloudinary', 'true').lower() == 'true'
    
    if use_cloudinary:
        # Use Cloudinary for upload
        folder = request.form.get('folder', 'uploads')
        result = upload_image(file, folder=folder)
        
        if result:
            return jsonify({
                'message': 'File uploaded successfully to Cloudinary',
                'file_url': result['url'],
                'public_id': result['public_id'],
                'width': result['width'],
                'height': result['height'],
                'format': result['format']
            }), 201
        else:
            return jsonify({'message': 'Failed to upload file to Cloudinary'}), 500
    else:
        # Use local file system for upload
        subfolder = request.form.get('folder', '')
        file_url = save_file(file, subfolder)
        
        if file_url:
            return jsonify({
                'message': 'File uploaded successfully to local storage',
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
        "file_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/uploads/image.jpg",
        "public_id": "uploads/image", (required for Cloudinary files)
        "is_cloudinary": true/false
    }
    
    Response:
    {
        "message": "File deleted successfully"
    }
    """
    data = request.get_json()
    
    if not data or 'file_url' not in data:
        return jsonify({'message': 'File URL is required'}), 400
    
    # Check if it's a Cloudinary file
    is_cloudinary = data.get('is_cloudinary', False)
    
    if is_cloudinary:
        if 'public_id' not in data:
            return jsonify({'message': 'Public ID is required for Cloudinary files'}), 400
            
        public_id = data['public_id']
        if delete_image(public_id):
            return jsonify({'message': 'File deleted successfully from Cloudinary'}), 200
        else:
            return jsonify({'message': 'File not found or could not be deleted from Cloudinary'}), 404
    else:
        # Local file deletion
        file_url = data['file_url']
        if delete_file(file_url):
            return jsonify({'message': 'File deleted successfully from local storage'}), 200
        else:
            return jsonify({'message': 'File not found or could not be deleted from local storage'}), 404