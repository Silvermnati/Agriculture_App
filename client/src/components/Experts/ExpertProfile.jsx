import React from "react";
import { Star, MapPin, MessageSquare, UserPlus, Calendar } from "lucide-react";

const ExpertProfile = ({ expert, onFollow, onMessage, isFollowing }) => {
  const {
    name,
    title,
    avatar_url,
    specializations = [],
    rating,
    review_count,
    hourly_rate,
    currency,
    service_areas = [],
    availability_status,
    languages_spoken = [],
    bio,
    education,
    certification,
    years_experience,
  } = expert;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-green-50 p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
          <img
            src={avatar_url}
            alt={name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="md:ml-6 mt-4 md:mt-0">
            <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
            <p className="text-green-700 font-semibold text-lg">{title}</p>
            <div className="flex items-center justify-center md:justify-start text-yellow-500 mt-2">
              <Star className="w-6 h-6" />
              <span className="ml-1 font-bold text-xl">{rating}</span>
              <span className="text-gray-500 ml-2">({review_count} reviews)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">About Me</h3>
            <p className="text-gray-600 mb-6">{bio}</p>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Credentials</h3>
            <ul className="space-y-2 text-gray-600">
              <li><strong>Experience:</strong> {years_experience} years</li>
              <li><strong>Education:</strong> {education}</li>
              <li><strong>Certification:</strong> {certification}</li>
            </ul>
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Details</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-green-600" /> {service_areas.join(", ")}</li>
                <li className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-green-600" /> {availability_status}</li>
                <li className="flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-green-600" /> {languages_spoken.join(", ")}</li>
              </ul>
              <div className="mt-6">
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-bold">
                  Book Consultation (${hourly_rate}/{currency})
                </button>
                <button
                  onClick={() => onFollow(expert.id)}
                  className={`w-full mt-2 flex items-center justify-center px-4 py-2 rounded-md text-sm ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;
