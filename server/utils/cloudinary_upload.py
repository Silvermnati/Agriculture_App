import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import current_app

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

def upload_image(file, folder="uploads", allowed_formats=None):
    """
    Upload an image to Cloudinary.
    
    Args:
        file: The file object from request.files
        folder: The folder in Cloudinary to store the image
        allowed_formats: List of allowed image formats (e.g., ['jpg', 'png'])
    
    Returns:
        dict: The Cloudinary response containing the image URL and other metadata
        None: If upload fails
    """
    if not file:
        return None
    
    try:
        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            allowed_formats=allowed_formats or ['jpg', 'jpeg', 'png', 'gif'],
            resource_type="image"
        )
        
        return {
            'public_id': result.get('public_id'),
            'url': result.get('secure_url'),
            'format': result.get('format'),
            'width': result.get('width'),
            'height': result.get('height'),
            'resource_type': result.get('resource_type')
        }
    except Exception as e:
        current_app.logger.error(f"Cloudinary upload error: {str(e)}")
        return None

def delete_image(public_id):
    """
    Delete an image from Cloudinary.
    
    Args:
        public_id: The public ID of the image to delete
    
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    if not public_id:
        return False
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        current_app.logger.error(f"Cloudinary delete error: {str(e)}")
        return False

def get_image_url(public_id, **options):
    """
    Get a transformed image URL from Cloudinary.
    
    Args:
        public_id: The public ID of the image
        options: Transformation options (width, height, crop, etc.)
    
    Returns:
        str: The transformed image URL
    """
    if not public_id:
        return None
    
    try:
        return cloudinary.CloudinaryImage(public_id).build_url(**options)
    except Exception as e:
        current_app.logger.error(f"Cloudinary URL generation error: {str(e)}")
        return None