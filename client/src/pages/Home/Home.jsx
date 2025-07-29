import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../../store/slices/postsSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Image from '../../components/common/Image/Image';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, isError, message } = useSelector((state) => state.posts);

  useEffect(() => {
    // Fetch a limited number of posts for the home page blog section
    dispatch(getPosts({ page: 1, per_page: 3 }));
  }, [dispatch]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Cultivate Your Future with AgriConnect</h1>
          <p className="hero-subtitle">
            Your all-in-one platform to connect with experts, share knowledge, and grow a thriving agricultural community.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Join AgriConnect
            </Link>
            <Link to="/blog" className="btn btn-secondary">
              Explore Blog
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section section-container">
        <h2 className="section-title">Why AgriConnect?</h2>
        <p className="section-subtitle">
          Empowering farmers and agricultural enthusiasts with the tools and knowledge they need to succeed.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Expert Consultations</h3>
            <p>
              Connect directly with agricultural experts for personalized advice and solutions.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👨‍🌾</div>
            <h3>Vibrant Communities</h3>
            <p>
              Join or create communities to discuss challenges, share tips, and collaborate with peers.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Knowledge Hub</h3>
            <p>
              Access a rich library of articles, guides, and best practices for sustainable farming.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Marketplace Access</h3>
            <p>
              Discover and connect with suppliers for quality seeds, fertilizers, and equipment.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section section-container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Getting started with AgriConnect is simple. Follow these easy steps to unlock a world of agricultural knowledge.
        </p>
        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-icon">1️⃣</div>
            <h3>Register & Create Profile</h3>
            <p>Sign up in minutes and tell us about your farming interests and needs.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">2️⃣</div>
            <h3>Explore & Connect</h3>
            <p>Browse experts, join communities, and discover valuable articles and posts.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">3️⃣</div>
            <h3>Grow & Succeed</h3>
            <p>Apply new knowledge, share your experiences, and watch your agricultural endeavors flourish.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section section-container">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">
          Hear from farmers and experts who have transformed their practices with AgriConnect.
        </p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">
              "AgriConnect has revolutionized how I approach farming. The expert advice is invaluable!"
            </p>
            <p className="testimonial-author">- Jane Doe, Farmer</p>
            <p className="testimonial-role">Small-scale Farmer, Kenya</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-quote">
              "The community forums are a goldmine of information. I've solved so many issues thanks to fellow farmers."
            </p>
            <p className="testimonial-author">- John Smith, Farmer</p>
            <p className="testimonial-role">Organic Farmer, USA</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-quote">
              "As an expert, AgriConnect allows me to reach and help so many more people than I ever could before.&quot;
            </p>
            <p className="testimonial-author">- Dr. Emily White, Agronomist</p>
            <p className="testimonial-role">Agricultural Expert, India</p>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="latest-blog-section section-container">
        <h2 className="section-title">Latest from Our Blog</h2>
        <p className="section-subtitle">
          Stay updated with the newest trends, tips, and insights in the agricultural world.
        </p>
        <div className="blog-posts-grid">
          {isLoading ? (
            <LoadingSpinner text="Loading latest blog posts..." />
          ) : isError ? (
            <ErrorMessage message={message} />
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <div className="blog-post-card" key={post.id || post.post_id}>
                <Image 
                  src={post.featured_image_url} 
                  alt={post.title || 'Blog post'} 
                  className="blog-post-image"
                  fallbackType="postSmall"
                />
                <div className="blog-post-content">
                  <h3>{post.title || 'Untitled Post'}</h3>
                  <p>{post.summary || (post.content ? post.content.substring(0, 150) + '...' : 'No content available')}</p>
                  <Link to={`/posts/${post.id || post.post_id}`} className="blog-post-link">Read More</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts-message">
              <p>No blog posts available at the moment.</p>
              <Link to="/posts" className="btn btn-primary">View All Posts</Link>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Farming?</h2>
          <p>
            Join thousands of thriving farmers and agricultural experts. Sign up today and cultivate your success!
          </p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;