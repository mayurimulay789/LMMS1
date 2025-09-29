import { Phone, ChevronDown } from "lucide-react"
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from "react-router-dom"
import { logout } from '../store/slices/authSlice'

export default function Navbar() {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  return (
    <div className="w-full bg-white">
      {/* Top banner */}
      <div className="bg-gray-100 py-2 px-4">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              Are You Ready To Prepare For Your 1<sup>st</sup> Internship
            </span>
            <button className="bg-rose-800 hover:bg-rose-900 text-white rounded-full px-6 py-2 text-sm">
              Book A Call
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
                    My Enrollments
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
          <div className="w-16 h-16 bg-rose-800 rounded-full flex items-center justify-center border-4 border-white">
            {/* Placeholder for logo - you can replace this with your actual logo */}
            <div className="text-white text-xs font-bold text-center leading-tight">
              <div>RYMA</div>
              <div>ACADEMY</div>
            </div>
          </div>

          <div className="bg-white rounded-full px-8 py-2 flex items-center justify-between gap-4">
            {/* Navigation menu */}
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Home
              </Link>

              <Link to="/courses" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Courses
              </Link>

              <a href="#" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Refer & Earn
              </a>

              <Link to="/about" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                About
              </Link>

              <Link to="/contact" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                Contact Us
              </Link>

              <a href="#" className="text-rose-800 font-medium hover:text-rose-900 transition-colors">
                More
              </a>
            </nav>

            {/* Phone number */}
            <div className="flex items-center gap-2 bg-rose-700 text-white px-4 py-2 rounded-full">
              <Phone className="w-4 h-4" />
              <span className="font-medium">+91 9873336133</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
