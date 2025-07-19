import React from 'react';
import Navigation from '../Navigation';
import './Layout.css';

/**
 * Layout component that wraps all pages with navigation and consistent styling
 * Provides responsive container for all content
 */
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Agricultural Super App. All rights reserved.</p>
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;