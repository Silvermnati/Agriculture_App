import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../../store/slices/postsSlice';
import { 
  Sprout, 
  Users, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  Play,
  CheckCircle,
  Star,
  MessageSquare,
  Heart,
  Eye,
  Calendar,
  Award,
  Shield,
  Zap
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Image from '../../components/common/Image/Image';



const Home = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, isError, message } = useSelector((state) => state.posts);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [activeFeature, setActiveFeature] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "John Mathews",
      role: "Organic Farmer, Iowa",
      content: "AgriConnect has transformed how I manage my farm. The expert advice helped me increase my yield by 30% while using fewer resources. The community support is invaluable.",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      role: "Small-scale Farmer, California",
      content: "As a first-generation farmer, I had so many questions. The experts on AgriConnect guided me through every challenge, from soil preparation to market strategies.",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "David Okonkwo",
      role: "Livestock Specialist, Texas",
      content: "The platform connects me with farmers who need my expertise. It's created new business opportunities while helping me contribute to sustainable agriculture.",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    dispatch(getPosts({ page: 1, per_page: 6 }));
  }, [dispatch]);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Network",
      description: "Connect with certified agricultural experts worldwide",
      stats: "500+ Experts"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Knowledge Base",
      description: "Access thousands of articles, guides, and research papers",
      stats: "10,000+ Articles"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Community Forums",
      description: "Join discussions with farmers from around the globe",
      stats: "50,000+ Members"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Market Insights",
      description: "Get real-time market data and price predictions",
      stats: "Live Data"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "50,000+", label: "Active Farmers" },
    { icon: <Award className="w-6 h-6" />, value: "500+", label: "Certified Experts" },
    { icon: <BookOpen className="w-6 h-6" />, value: "10,000+", label: "Knowledge Articles" },
    { icon: <Star className="w-6 h-6" />, value: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl font-bold text-green-800 mb-6">Growing Together: The Agricultural Super App</h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with experts, join farming communities, access resources, and transform your agricultural practices with our all-in-one platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition duration-300 text-center">
                  Get Started
                </Link>
                <Link to="/blog" className="bg-white border border-green-600 text-green-600 font-bold py-3 px-6 rounded-full hover:bg-green-50 transition duration-300 text-center">
                  Explore Resources
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" 
                alt="Farmers in field" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together all the tools, resources, and connections farmers need to thrive in modern agriculture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-800 mb-2">10,000+</div>
              <p className="text-gray-600">Registered Farmers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-800 mb-2">500+</div>
              <p className="text-gray-600">Agricultural Experts</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-800 mb-2">250+</div>
              <p className="text-gray-600">Active Communities</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-800 mb-2">50+</div>
              <p className="text-gray-600">Countries Represented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from farmers and experts who have transformed their agricultural practices with AgriConnect.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.imageUrl} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Agricultural Journey?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of farmers who are already benefiting from our platform's resources, expert advice, and community support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="bg-white text-green-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300">
                Sign Up Now
              </Link>
              <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-green-600 transition duration-300">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;