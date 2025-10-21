import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section with FLEXIFY Logo */}
      <section className="hero-section">
        <div className="hero-content">
          {/* FLEXIFY Logo Container */}
          <div className="flexify-logo">
            {/* Abstract Logo Symbol */}
            <div className="logo-symbol">
              <div className="symbol-inner"></div>
            </div>
            
            {/* FLEXIFY Brand Name */}
            <h1 className="brand-name">FLEXIFY</h1>
          </div>
          
          {/* Tagline */}
          <p className="hero-tagline">HIRE ANYTIME, ANYWHERE</p>
          
          {/* Call to Action Buttons */}
          <div className="cta-buttons">
            <Link to="/booking/new" className="btn btn-primary">Book Now</Link>
            <Link to="/register/user" className="btn btn-outline">Sign Up as User</Link>
            <Link to="/register/provider" className="btn btn-outline">Become a Provider</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose FLEXIFY?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Instant Booking</h3>
            <p>Book professional services in minutes with our streamlined platform. No more waiting or complicated processes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Providers</h3>
            <p>All our service providers are thoroughly vetted and background-checked for your safety and peace of mind.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Transparent Pricing</h3>
            <p>Clear, upfront pricing with no hidden fees. Know exactly what you'll pay before booking.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure & Reliable</h3>
            <p>Your data and payments are protected with bank-level security and encryption.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who trust FLEXIFY for their service needs. Experience the difference today!</p>
        <div className="cta-buttons">
          <Link to="/booking/new" className="btn btn-primary">Book a Service Now</Link>
          <Link to="/services" className="btn btn-outline">View All Services</Link>
        </div>
      </section>

      {/* Quick Services */}
      <section className="quick-services">
        <h2>Popular Services</h2>
        <div className="service-categories">
          <Link to="/services?category=maid" className="service-category">
            <div className="service-icon">🧹</div>
            <span>Maid Services</span>
          </Link>
          <Link to="/services?category=plumber" className="service-category">
            <div className="service-icon">🔧</div>
            <span>Plumbing</span>
          </Link>
          <Link to="/services?category=electrician" className="service-category">
            <div className="service-icon">⚡</div>
            <span>Electrical</span>
          </Link>
          <Link to="/services?category=cook" className="service-category">
            <div className="service-icon">👨‍🍳</div>
            <span>Cooking</span>
          </Link>
          <Link to="/services?category=driver" className="service-category">
            <div className="service-icon">🚗</div>
            <span>Driving</span>
          </Link>
          <Link to="/services?category=cleaner" className="service-category">
            <div className="service-icon">🧽</div>
            <span>Cleaning</span>
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/booking/new" className="btn btn-primary">Book a Service Now</Link>
          <Link to="/services" className="btn btn-outline">View All Services</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
