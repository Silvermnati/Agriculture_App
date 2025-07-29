import React from 'react';
import RegisterForm from '../../components/Auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="hidden lg:flex flex-col justify-center p-12 bg-green-50 border-r border-green-100">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Join Our Agricultural Community</h1>
          <p className="text-gray-600 mb-8">Create an account to connect with agricultural experts, share knowledge, and grow together.</p>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
                <span>🌾</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Expert Knowledge</h3>
                <p className="text-gray-500 text-sm">Access agricultural expertise and best practices from professionals.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
                <span>👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Community Support</h3>
                <p className="text-gray-500 text-sm">Connect with other farmers facing similar challenges.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
                <span>📱</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Mobile Access</h3>
                <p className="text-gray-500 text-sm">Access agricultural information anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;