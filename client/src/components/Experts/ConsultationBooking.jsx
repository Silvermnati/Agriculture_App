import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, DollarSign, User, MessageSquare } from 'lucide-react';
import { bookConsultation } from '../../store/slices/expertsSlice';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import MpesaPaymentModal from '../common/MpesaPaymentModal/MpesaPaymentModal';

const ConsultationBooking = ({ expert, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.experts);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    duration: 60, // Default 1 hour
  });

  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingConsultation, setPendingConsultation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-calculate end time when start time or duration changes
    if (name === 'scheduled_start' || name === 'duration') {
      const startTime = name === 'scheduled_start' ? value : formData.scheduled_start;
      const duration = name === 'duration' ? parseInt(value) : formData.duration;
      
      if (startTime && duration) {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60000); // duration in minutes
        setFormData(prev => ({
          ...prev,
          scheduled_end: end.toISOString().slice(0, 16) // Format for datetime-local input
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.scheduled_start) {
      newErrors.scheduled_start = 'Start time is required';
    } else {
      const startTime = new Date(formData.scheduled_start);
      const now = new Date();
      if (startTime <= now) {
        newErrors.scheduled_start = 'Start time must be in the future';
      }
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const consultationData = {
      expert_id: expert.id,
      topic: formData.topic,
      description: formData.description,
      scheduled_start: new Date(formData.scheduled_start).toISOString(),
      scheduled_end: new Date(formData.scheduled_end).toISOString(),
    };

    // Store consultation data and show payment modal
    setPendingConsultation(consultationData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Include payment information with consultation booking
      const consultationWithPayment = {
        ...pendingConsultation,
        payment_id: paymentData.payment_id
      };

      await dispatch(bookConsultation(consultationWithPayment)).unwrap();
      
      // Reset form and close modals on success
      setFormData({
        topic: '',
        description: '',
        scheduled_start: '',
        scheduled_end: '',
        duration: 60,
      });
      setErrors({});
      setPendingConsultation(null);
      setShowPaymentModal(false);
      onClose();
      
      alert('Consultation booked and payment confirmed successfully!');
    } catch (error) {
      console.error('Failed to book consultation after payment:', error);
      alert('Payment successful but consultation booking failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setShowPaymentModal(false);
    setPendingConsultation(null);
  };

  const calculateCost = () => {
    const duration = formData.duration || 60;
    const hourlyRate = expert.hourly_rate || 0;
    return ((duration / 60) * hourlyRate).toFixed(2);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (!expert) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Consultation">
      <div className="max-w-md mx-auto">
        {/* Expert Info */}
        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={expert.avatar_url}
            alt={expert.name}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{expert.name}</h3>
            <p className="text-sm text-gray-600">{expert.title}</p>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>${expert.hourly_rate}/hour</span>
            </div>
          </div>
        </div>

        {isError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Topic *
            </label>
            <Input
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Organic farming techniques"
              error={errors.topic}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you'd like to discuss..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="scheduled_start" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="datetime-local"
                id="scheduled_start"
                name="scheduled_start"
                value={formData.scheduled_start}
                onChange={handleChange}
                min={getMinDateTime()}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.scheduled_start ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.scheduled_start && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_start}</p>
            )}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          {/* Cost Calculation */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Cost:</span>
              <span className="text-lg font-semibold text-green-600">
                ${calculateCost()} {expert.currency || 'USD'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.duration} minutes × ${expert.hourly_rate}/hour
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Booking...' : 'Book Consultation'}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            You&apos;ll receive a confirmation email with meeting details once the expert accepts your booking.
          </p>
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingConsultation(null);
        }}
        amount={calculateCost()}
        currency="KES"
        description={`Consultation with ${expert.name} - ${formData.topic}`}
        consultationId={pendingConsultation?.consultation_id}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </Modal>
  );
};

export default ConsultationBooking;