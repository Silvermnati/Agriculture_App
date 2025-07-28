import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ProfilePicture from '../../../components/Profile/ProfilePicture';

// Mock file reader
global.FileReader = class {
  constructor() {
    this.readAsDataURL = vi.fn(() => {
      this.onload({ target: { result: 'data:image/jpeg;base64,test' } });
    });
  }
};

describe('ProfilePicture', () => {
  const defaultProps = {
    userName: 'John Doe',
    size: 'medium',
    editable: false,
    onImageChange: vi.fn(),
    isUploading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with default avatar when no image provided', () => {
      render(<ProfilePicture {...defaultProps} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render with provided image', () => {
      const imageUrl = 'https://example.com/avatar.jpg';
      render(<ProfilePicture {...defaultProps} imageUrl={imageUrl} />);
      
      const img = screen.getByAltText("John Doe's profile");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', imageUrl);
    });

    it('should generate correct initials', () => {
      render(<ProfilePicture {...defaultProps} userName="Jane Smith" />);
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should handle single name', () => {
      render(<ProfilePicture {...defaultProps} userName="Madonna" />);
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should handle empty name', () => {
      render(<ProfilePicture {...defaultProps} userName="" />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(
        <ProfilePicture {...defaultProps} size="small" />
      );
      
      expect(container.firstChild).toHaveClass('profile-picture-small');
    });

    it('should apply medium size class', () => {
      const { container } = render(
        <ProfilePicture {...defaultProps} size="medium" />
      );
      
      expect(container.firstChild).toHaveClass('profile-picture-medium');
    });

    it('should apply large size class', () => {
      const { container } = render(
        <ProfilePicture {...defaultProps} size="large" />
      );
      
      expect(container.firstChild).toHaveClass('profile-picture-large');
    });
  });

  describe('editable functionality', () => {
    it('should show overlay when editable', () => {
      render(<ProfilePicture {...defaultProps} editable={true} />);
      
      const container = screen.getByRole('button');
      expect(container).toBeInTheDocument();
    });

    it('should not show overlay when not editable', () => {
      render(<ProfilePicture {...defaultProps} editable={false} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle file selection', async () => {
      const onImageChange = vi.fn();
      render(
        <ProfilePicture 
          {...defaultProps} 
          editable={true} 
          onImageChange={onImageChange}
        />
      );
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('Change profile picture');
      
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(onImageChange).toHaveBeenCalledWith(file);
    });

    it('should validate file type', async () => {
      const onImageChange = vi.fn();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <ProfilePicture 
          {...defaultProps} 
          editable={true} 
          onImageChange={onImageChange}
        />
      );
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText('Change profile picture');
      
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(alertSpy).toHaveBeenCalledWith('Please select an image file');
      expect(onImageChange).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });

    it('should validate file size', async () => {
      const onImageChange = vi.fn();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <ProfilePicture 
          {...defaultProps} 
          editable={true} 
          onImageChange={onImageChange}
        />
      );
      
      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const input = screen.getByLabelText('Change profile picture');
      
      fireEvent.change(input, { target: { files: [largeFile] } });
      
      expect(alertSpy).toHaveBeenCalledWith('Image size must be less than 5MB');
      expect(onImageChange).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });

    it('should handle keyboard interaction', () => {
      const onImageChange = vi.fn();
      render(
        <ProfilePicture 
          {...defaultProps} 
          editable={true} 
          onImageChange={onImageChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      // File input should be triggered (though we can't easily test the click)
      
      fireEvent.keyDown(button, { key: ' ' });
      // File input should be triggered
      
      fireEvent.keyDown(button, { key: 'Tab' });
      // Should not trigger file input
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when uploading', () => {
      render(<ProfilePicture {...defaultProps} isUploading={true} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should disable interaction when uploading', () => {
      render(
        <ProfilePicture 
          {...defaultProps} 
          editable={true} 
          isUploading={true}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should fallback to default avatar on image error', () => {
      const imageUrl = 'https://example.com/broken-image.jpg';
      render(<ProfilePicture {...defaultProps} imageUrl={imageUrl} />);
      
      const img = screen.getByAltText("John Doe's profile");
      fireEvent.error(img);
      
      // Should show initials instead
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes when editable', () => {
      render(<ProfilePicture {...defaultProps} editable={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Change profile picture');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not editable', () => {
      render(<ProfilePicture {...defaultProps} editable={false} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      render(<ProfilePicture {...defaultProps} editable={true} />);
      
      const input = screen.getByLabelText('Change profile picture');
      expect(input).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ProfilePicture {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});