/**
 * LoginPage.jsx
 * 
 * Layout and structure inspired by Image A (centered card, top navigation, title)
 * Color palette and neon aesthetic from Image B (purple/pink gradients, turquoise accents)
 */

import React, { useState } from 'react';
import './login.css'; // Plain CSS fallback
// Optional: import './LoginPage.tailwind.css'; // Tailwind utility classes

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Submit logic here
      console.log('Form submitted:', formData);
      // You would typically call your authentication API here
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="login-page">
      {/* Full-screen hero background with neon gradient - Image B colors */}
      <div className="hero-background"></div>
      
      {/* Top Navigation - Image A layout */}
      <header className="top-navigation">
        <div className="nav-container">
          {/* Site title top-left - Image A style with gradient text */}
          <div className="site-title">
            BIREENA<span className="gradient-text">अतिथि</span>
          </div>
          
          {/* Center navigation menu - Image A layout */}
          <nav className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
          
          {/* Login button far right - Image A style */}
          <button className="nav-login-btn">
            Login →
          </button>
        </div>
      </header>

      {/* Centered login container - Image A centered layout */}
      <main className="login-main">
        <div className="login-card">
          {/* Card heading with gradient accent on "Back" - Image A style */}
          <h1 className="card-heading">
            Welcome <span className="gradient-accent">Back</span>
          </h1>
          <p className="card-subtitle">Sign in to your account to continue</p>
          
          {/* Login form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email input with icon */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  aria-label="Email Address"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password input with toggle visibility */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  aria-label="Password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Forgot password link */}
            <div className="form-actions">
              <a href="#forgot" className="forgot-link">Forgot your password?</a>
            </div>

            {/* Primary CTA button - neon aqua/turquoise with glow effect */}
            <button type="submit" className="login-button">
              <span className="button-icon" aria-hidden="true">🔒</span>
              Log In
              <span className="button-arrow" aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
