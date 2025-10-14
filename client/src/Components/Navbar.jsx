import { ChevronDown, LogIn } from "lucide-react"
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from "react-router-dom"
import { logout } from '../store/slices/authSlice'
import logo from "../assets/ryma-logo.png";


export default function Navbar() {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleBookCall = () => {
    // Navigate to homepage and trigger application form
    if (window.location.pathname !== '/') {
      navigate('/?showApplicationForm=true')
    } else {
      // If already on homepage, trigger the application form
      window.dispatchEvent(new CustomEvent('showApplicationForm'))
    }
  }

  return (
    <div className="w-full bg-white">
      {/* Top banner */}
      <div className="bg-gray-100 py-2 px-4">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              Become a instructor
            </span>
            <button 
              onClick={handleBookCall}
              className="bg-rose-800 hover:bg-rose-900 text-white rounded-full px-6 py-2 text-sm">
              Fill Eligibility Call
            </button>
          </div>
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-rose-800 text-sm font-medium"
              >
                {user?.name}
                <ChevronDown className="w-3 h-3" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-2 w-48 z-50 border">
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user?.role === 'instructor' && (
                    <Link
                      to="/instructor"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Instructor Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Courses
                  </Link>
                  <Link
                    to="/certificates"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Certificates
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout())
                      setDropdownOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a href="/login" className="text-gray-700 hover:text-rose-800 text-sm font-medium">
                Sign In
              </a>
              <a href="/register" className="bg-rose-800 hover:bg-rose-900 text-white rounded-full px-6 py-2 text-sm">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <div className="bg-rose-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="relative">
  <div 
    className="w-28 h-32 bg-white flex items-center  justify-center overflow-hidden border-4 border-white 
               [border-bottom-left-radius:90%_95%] [border-bottom-right-radius:90%_95%] -mb-11 -mt-4
               shadow-[0_-4px_10px_rgba(0,0,0,0.25)] hover:shadow-[0_-8px_16px_rgba(0,0,0,0.35)] transition-shadow duration-300"
  >
    <img 
      src={logo} 
      alt="RYMA Academy Logo" 
      className="w-[140%] h-full object-contain"
    />
  </div>
</div>


          <div className="bg-white rounded-full px-8 py-2 flex items-center justify-between gap-3">
            {/* Navigation menu */}
            <nav className="flex items-center space-x-6 -ml-4 ">
              <Link to="/" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Home
              </Link>

              <Link to="/courses" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Courses
              </Link>

             <Link to="/refer-earn" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
    Refer & Earn
  </Link>

              <Link to="/about" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                About
              </Link>

              <Link to="/contact" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Contact Us
              </Link>

              
            </nav>

            {/* Login Button - Replaced Phone Number */}
            <a href="/login" className="flex items-center gap-2 bg-rose-700 text-white px-4 py-2 rounded-full hover:bg-rose-800 transition-colors">
              <LogIn className="w-4 h-4" />
              <span className="font-medium">Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}