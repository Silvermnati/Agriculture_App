import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'}

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, subfolder=''):
    """
    Save a file to the upload folder.
    
    Args:
        file: The file object from request.files
        subfolder: Optional subfolder within the upload folder
    
    Returns:
        The URL path to the saved file
    """
    if file and allowed_file(file.filename):
        # Generate a secure filename with UUID to prevent duplicates
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Create subfolder if it doesn't exist
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
        os.makedirs(upload_path, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        # Return the URL path (not the full filesystem path)
        # Use forward slashes for URL paths regardless of OS
        if subfolder:
            return f"/uploads/{subfolder}/{unique_filename}"
        else:
            return f"/uploads/{unique_filename}"
    
    return None

def delete_file(file_path):
    """
    Delete a file from the upload folder.
    
    Args:
        file_path: The URL path to the file (e.g., /uploads/images/file.jpg)
    
    Returns:
        True if the file was deleted, False otherwise
    """
    # Convert URL path to filesystem path
    if file_path.startswith('/uploads/'):
        file_path = file_path.replace('/uploads/', '', 1)
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
        
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    
    return False