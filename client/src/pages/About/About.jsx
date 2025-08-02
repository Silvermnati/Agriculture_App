import React from 'react';
import { Users, Target, Award, Globe, Leaf, TrendingUp } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with fellow farmers, share experiences, and learn from agricultural experts worldwide."
    },
    {
      icon: Target,
      title: "Expert Guidance",
      description: "Access professional agricultural consultations and get personalized advice for your farming needs."
    },
    {
      icon: Award,
      title: "Quality Content",
      description: "Curated agricultural content, best practices, and latest farming techniques from industry experts."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with farmers and experts from around the world, sharing knowledge across borders."
    },
    {
      icon: Leaf,
      title: "Sustainable Farming",
      description: "Promote sustainable and eco-friendly farming practices for a better future."
    },
    {
      icon: TrendingUp,
      title: "Growth Focused",
      description: "Tools and resources to help you grow your agricultural business and improve productivity."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Agricultural engineer with 15+ years of experience in sustainable farming practices.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Technology expert passionate about bringing digital solutions to agriculture.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Agricultural Research",
      description: "PhD in Agricultural Sciences, specializing in crop optimization and soil health.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "James Wilson",
      role: "Community Manager",
      description: "Dedicated to building strong farming communities and facilitating knowledge sharing.",
      image: "/api/placeholder/150/150"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About AgriConnect
            </h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed">
              Empowering farmers worldwide through technology, community, and expert knowledge sharing.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At AgriConnect, we believe that agriculture is the backbone of our society. Our mission is to create 
            a global platform where farmers, agricultural experts, and enthusiasts can connect, share knowledge, 
            and collaborate to build a more sustainable and productive agricultural future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  AgriConnect was born from a simple observation: farmers around the world face similar challenges, 
                  yet they often work in isolation. Founded in 2023, our platform bridges this gap by creating 
                  a digital space where agricultural knowledge flows freely.
                </p>
                <p>
                  What started as a small project to help local farmers share crop rotation techniques has grown 
                  into a comprehensive platform serving thousands of users worldwide. We've facilitated countless 
                  connections between farmers and experts, leading to improved crop yields, sustainable practices, 
                  and stronger agricultural communities.
                </p>
                <p>
                  Today, AgriConnect continues to evolve, incorporating the latest technology and agricultural 
                  research to serve our growing community of farmers, experts, and agricultural enthusiasts.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Active Farmers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-gray-600">Expert Consultants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                  <div className="text-gray-600">Countries</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">25,000+</div>
                  <div className="text-gray-600">Knowledge Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our diverse team combines agricultural expertise with cutting-edge technology to serve our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-green-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We promote farming practices that protect our environment and ensure food security for future generations.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We embrace new technologies and methods that can improve agricultural productivity and efficiency.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600">
                We believe in the power of collaboration and knowledge sharing to solve agricultural challenges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;