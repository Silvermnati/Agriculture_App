import React from 'react';
import Navigation from '../Navigation';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Agricultural Super App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;