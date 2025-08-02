import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navigation from '../Navigation';


const Layout = ({ children }) => {
  const location = useLocation();
  const noNavRoutes = ['/login', '/register', '/admin/login'];
  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100">
      {showNav && <Navigation />}
      <main>
        <div>
          {children}
        </div>
      </main>
      {showNav && (
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
            <div className="flex justify-center space-x-6 md:order-2">
              <Link to="/about" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">About</span>
                About
              </Link>

              <Link to="/privacy" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy Policy</span>
                Privacy Policy
              </Link>

              <Link to="/terms" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms of Service</span>
                Terms of Service
              </Link>

              <Link to="/contact" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                Contact
              </Link>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;