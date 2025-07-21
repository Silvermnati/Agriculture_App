import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getExpert } from '../../store/slices/expertsSlice';
import ExpertProfile from '../../components/Experts/ExpertProfile';
import ConsultationForm from '../../components/Experts/ConsultationForm';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

const ExpertDetailPage = () => {
  const { expertId } = useParams();
  const dispatch = useDispatch();
  const { expert, isLoading, isError, message } = useSelector((state) => state.experts);

  useEffect(() => {
    dispatch(getExpert(expertId));
  }, [dispatch, expertId]);

  const handleBookConsultation = (formData) => {
    console.log("Booking consultation:", formData);
    // dispatch(bookConsultation({ ...formData, expertId }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <LoadingSpinner text="Loading Expert Profile..." />
      ) : isError ? (
        <div className="text-center text-red-500">{message}</div>
      ) : expert ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ExpertProfile expert={expert} />
          </div>
          <div>
            <ConsultationForm expert={expert} onSubmit={handleBookConsultation} />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">Expert not found.</div>
      )}
    </div>
  );
};

export default ExpertDetailPage;
