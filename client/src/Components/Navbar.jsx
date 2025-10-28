import { ChevronDown, Menu, X } from "lucide-react"; // Added Menu and X icons
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { logout } from '../store/slices/authSlice';
import logo from "../assets/ryma-logo.png"; // Kept for consistency, though inline usage changed


export default function Navbar() {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBookCall = () => {
    // Navigate to homepage and trigger application form
    if (window.location.pathname !== '/') {
      navigate('/?showApplicationForm=true');
    } else {
      // If already on homepage, trigger the application form
      window.dispatchEvent(new CustomEvent('showApplicationForm'));
    }
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  // Helper function to close dropdown and mobile menu on link click
  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full bg-white shadow-md">
      {/* Top banner - Hidden on smaller screens (below 'sm') */}
      <div className="hidden px-4 py-2 bg-gray-100 border-b border-gray-200 sm:block">
        <div className="flex items-center justify-end mx-auto max-w-7xl">
          {/* Become an Instructor and Fill Call button moved to the left for better spacing/flow */}
          <div className="flex items-center gap-4 mr-auto">
            <span className="text-sm text-gray-700">
              Become a instructor
            </span>
            <button
              onClick={handleBookCall}
              className="px-4 py-1 text-sm text-white transition-colors duration-200 rounded-full bg-rose-800 hover:bg-rose-900"
            >
              Fill Eligibility Call
            </button>
          </div>

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-rose-800"
              >
                {user?.name}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 z-50 w-48 py-2 mt-1 bg-white border border-gray-100 rounded-md shadow-xl top-full">
                  <Link
                    to="/dashboard"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-800"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user?.role === 'instructor' && (
                    <Link
                      to="/instructor"
                      onClick={closeMenus}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                      Instructor Panel
                    </Link>
                  )}
                  <Link
                    to="/mycourses"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-800"
                  >
                    My Courses
                  </Link>
                  <Link
                    to="/certificates"
                    onClick={closeMenus}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-800"
                  >
                    Certificates
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      closeMenus();
                    }}
                    className="block w-full px-4 py-2 mt-1 text-sm text-left text-gray-700 border-t hover:bg-rose-50 hover:text-rose-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-700 transition-colors hover:text-rose-800">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-1 text-sm text-white transition-colors duration-200 rounded-full bg-rose-800 hover:bg-rose-900">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main navigation Bar */}
      <div className="px-4 py-2 bg-rose-800 sm:px-6">
        <div className="flex items-center justify-between mx-auto max-w-7xl">


        <div className="relative">
  <div 
    className="w-28 h-32 bg-white flex items-center  justify-center overflow-hidden border-4 border-white 
               [border-bottom-left-radius:90%_95%] [border-bottom-right-radius:90%_95%] -mb-11 -mt-4
               shadow-[0_-4px_10px_rgba(0,0,0,0.25)] hover:shadow-[0_-8px_16px_rgba(0,0,0,0.35)] transition-shadow duration-300"
  >
    <img 
      src={logo} 
      alt="RYMA Academy Logo" 
      className="w-[100%] h-full object-contain"
    />
  </div>
</div>


          {/* Logo Area */}
          {/* <Link to="/" className="relative z-10 -ml-2 sm:ml-0">
            <div
              className="w-20 h-24 sm:w-28 sm:h-32 bg-white flex items-center justify-center overflow-hidden border-4 border-white
                [border-bottom-left-radius:90%_95%] [border-bottom-right-radius:90%_95%] -mb-8 sm:-mb-11 -mt-2 sm:-mt-4
                shadow-[0_-4px_10px_rgba(0,0,0,0.25)] hover:shadow-[0_-8px_16px_rgba(0,0,0,0.35)] transition-shadow duration-300"
            >
              {/* <img
                src={logo} // Use imported logo variable directly
                alt="ryma logo"
                className="w-[140%] h-full object-contain"
              /> */}
            {/* </div>
          </Link>  */}

          {/* Desktop Navigation and Call to Action */}
          <div className="items-center justify-between hidden gap-6 px-8 py-2 bg-white rounded-full shadow-lg lg:flex">
            {/* Navigation menu */}
            <nav className="flex items-center space-x-6">
              <Link to="/" className="font-medium transition-colors text-rose-800 hover:text-rose-900">Home</Link>
              <Link to="/courses" className="font-medium transition-colors text-rose-800 hover:text-rose-900">Courses</Link>
              <Link to="/refer-earn" className="font-medium transition-colors text-rose-800 hover:text-rose-900">Refer & Earn</Link>
              <Link to="/about" className="font-medium transition-colors text-rose-800 hover:text-rose-900">About</Link>
              <Link to="/contact" className="font-medium transition-colors text-rose-800 hover:text-rose-900">Contact Us</Link>
            </nav>
          </div>

          {/* Mobile Menu Button (Hamburger) - Visible only on smaller screens */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel - Collapsible */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'
          } bg-white rounded-lg shadow-xl`}
        >
          <nav className="flex flex-col p-4 space-y-2">
            <Link to="/" onClick={closeMenus} className="block px-3 py-2 font-medium rounded-md text-rose-800 hover:bg-rose-50">Home</Link>
            <Link to="/courses" onClick={closeMenus} className="block px-3 py-2 font-medium rounded-md text-rose-800 hover:bg-rose-50">Courses</Link>
            <Link to="/refer-earn" onClick={closeMenus} className="block px-3 py-2 font-medium rounded-md text-rose-800 hover:bg-rose-50">Refer & Earn</Link>
            <Link to="/about" onClick={closeMenus} className="block px-3 py-2 font-medium rounded-md text-rose-800 hover:bg-rose-50">About</Link>
            <Link to="/contact" onClick={closeMenus} className="block px-3 py-2 font-medium rounded-md text-rose-800 hover:bg-rose-50">Contact Us</Link>
          </nav>

          {/* Mobile Auth/User Menu */}
          <div className="p-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-700">Hello, {user?.name}</p>
                <Link to="/dashboard" onClick={closeMenus} className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-rose-50">Dashboard</Link>
                {user?.role === 'admin' && (
                    <Link to="/admin" onClick={closeMenus} className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-rose-50">Admin Panel</Link>
                )}
                {user?.role === 'instructor' && (
                    <Link to="/instructor" onClick={closeMenus} className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-rose-50">Instructor Panel</Link>
                )}
                <Link to="/certificates" onClick={closeMenus} className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-rose-50">Certificates</Link>
                <Link to="/mycourses" onClick={closeMenus} className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-rose-50">My Courses</Link>
                <button
                    onClick={() => { dispatch(logout()); closeMenus(); }}
                    className="w-full px-3 py-2 text-sm text-left text-white transition-colors rounded-md bg-rose-700 hover:bg-rose-800"
                >
                    Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-center text-white transition-colors rounded-md bg-rose-800 hover:bg-rose-900">
                  Sign Up
                </Link>
              </div>
            )}
            <button
                onClick={handleBookCall}
                className="w-full px-4 py-2 mt-3 text-sm font-medium text-center transition-colors bg-gray-200 rounded-md hover:bg-gray-300 text-rose-800"
            >
                Fill Eligibility Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}