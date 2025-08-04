import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import NotificationBell from "./Notifications/NotificationBell";
import Image from "./common/Image/Image";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileMenuOpen &&
        !event.target.closest(".profile-menu-container")
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    navigate("/login");
  };

  const renderNavLinks = () => (
    <>
      <NavLink
        to="/"
        className="text-gray-600 hover:text-green-600 transition duration-300"
        end
      >
        Home
      </NavLink>
      <NavLink
        to="/posts"
        className="text-gray-600 hover:text-green-600 transition duration-300"
      >
        Blog
      </NavLink>
      <NavLink
        to="/experts"
        className="text-gray-600 hover:text-green-600 transition duration-300"
      >
        Experts
      </NavLink>
      <NavLink
        to="/communities"
        className="text-gray-600 hover:text-green-600 transition duration-300"
      >
        Communities
      </NavLink>
      {user?.role === "admin" && (
        <NavLink
          to="/admin/dashboard"
          className="text-gray-600 hover:text-green-600 transition duration-300"
        >
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-green-800">
          AgriConnect
        </NavLink>

        <nav className="hidden md:flex space-x-6">{renderNavLinks()}</nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="relative profile-menu-container">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-colors duration-200 flex-shrink-0">
                    <Image
                      src={user?.avatar_url}
                      alt={`${user?.first_name || user?.email || "User"} profile`}
                      className="w-full h-full object-cover"
                      fallbackType="avatar"
                    />
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="py-2">
                      <NavLink
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Profile
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-600 hover:text-green-600 transition duration-300"
              >
                Login
              </button>
              <Link
                to="/register"
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-green-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-2">
              {renderNavLinks()}
              <div className="border-t border-gray-100 my-2"></div>
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    className="py-2 text-gray-600 hover:text-green-600 transition duration-300"
                  >
                    My Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="py-2 text-left text-gray-600 hover:text-green-600 transition duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="py-2 text-gray-600 hover:text-green-600 transition duration-300"
                  >
                    Login
                  </button>
                  <Link
                    to="/register"
                    className="py-2 text-gray-600 hover:text-green-600 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
