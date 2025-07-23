import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, RotateCw, ZoomIn, ZoomOut, Crop } from 'lucide-react';
import { 
  uploadProfilePicture, 
  setShowImageCropModal, 
  setSelectedImage,
  setCropData 
} from '../../store/slices/profileSlice';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import './ImageCropModal.css';

const ImageCropModal = () => {
  const dispatch = useDispatch();
  const { 
    showImageCropModal, 
    selectedImage, 
    cropData, 
    isUploadingImage 
  } = useSelector((state) => state.profile);

  const [imagePreview, setImagePreview] = useState(null);
  const [cropSettings, setCropSettings] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  React.useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  }, [selectedImage]);

  const handleClose = () => {
    dispatch(setShowImageCropModal(false));
    dispatch(setSelectedImage(null));
    dispatch(setCropData(null));
    setImagePreview(null);
    setCropSettings({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      scale: 1,
      rotation: 0
    });
  };

  const handleScaleChange = (delta) => {
    setCropSettings(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta))
    }));
  };

  const handleRotation = () => {
    setCropSettings(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropSettings.x,
      y: e.clientY - cropSettings.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    setCropSettings(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const getCroppedImage = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      
      if (!canvas || !image) {
        resolve(null);
        return;
      }

      const ctx = canvas.getContext('2d');
      const { width, height, x, y, scale, rotation } = cropSettings;

      // Set canvas size
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Draw image
      const drawWidth = image.naturalWidth;
      const drawHeight = image.naturalHeight;
      ctx.drawImage(
        image,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      // Restore context
      ctx.restore();

      // Convert to blob
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        // Create a File object from the blob
        const croppedFile = new File([croppedBlob], 'profile-picture.jpg', {
          type: 'image/jpeg'
        });
        
        await dispatch(uploadProfilePicture(croppedFile)).unwrap();
        handleClose();
      }
    } catch (error) {
      console.error('Failed to save cropped image:', error);
    }
  };

  if (!showImageCropModal || !selectedImage) return null;

  return (
    <Modal
      isOpen={showImageCropModal}
      onClose={handleClose}
      title="Crop Profile Picture"
      size="large"
      className="image-crop-modal"
    >
      <div className="crop-modal-content">
        {isUploadingImage ? (
          <div className="crop-loading">
            <LoadingSpinner text="Uploading profile picture..." />
          </div>
        ) : (
          <>
            <div className="crop-editor">
              <div className="crop-preview-container">
                {imagePreview && (
                  <>
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="Crop preview"
                      className="crop-image"
                      style={{
                        transform: `scale(${cropSettings.scale}) rotate(${cropSettings.rotation}deg)`,
                        left: cropSettings.x,
                        top: cropSettings.y
                      }}
                      onMouseDown={handleMouseDown}
                      draggable={false}
                    />
                    <div className="crop-overlay">
                      <div className="crop-area" />
                    </div>
                  </>
                )}
              </div>

              <div className="crop-controls">
                <div className="control-group">
                  <label>Zoom</label>
                  <div className="control-buttons">
                    <button
                      type="button"
                      onClick={() => handleScaleChange(-0.1)}
                      className="control-btn"
                      disabled={cropSettings.scale <= 0.5}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="scale-value">
                      {Math.round(cropSettings.scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScaleChange(0.1)}
                      className="control-btn"
                      disabled={cropSettings.scale >= 3}
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <label>Rotate</label>
                  <button
                    type="button"
                    onClick={handleRotation}
                    className="control-btn"
                  >
                    <RotateCw size={16} />
                    Rotate 90°
                  </button>
                </div>
              </div>
            </div>

            <div className="crop-preview-result">
              <h4>Preview</h4>
              <div className="preview-circle">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="preview-canvas"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="modal-actions">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isUploadingImage}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isUploadingImage}
          icon={<Crop size={16} />}
        >
          {isUploadingImage ? 'Uploading...' : 'Save Picture'}
        </Button>
      </div>
    </Modal>
  );
};

export default ImageCropModal;