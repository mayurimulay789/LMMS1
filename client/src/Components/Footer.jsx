"use client"

import { Link } from "react-router-dom"
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  MessageCircle,
  Calendar,
} from "lucide-react"
import { useState } from "react"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [isHovered, setIsHovered] = useState(false)

  const footerLinks = {
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "FAQ", path: "/about#faq" },
    ],
    courses: [
      { name: "Programming", path: "/courses?category=Programming" },
      { name: "Design", path: "/courses?category=Design" },
      { name: "Marketing", path: "/courses?category=Marketing" },
      { name: "Business", path: "/courses?category=Business" },
    ],
   
    quickLinks: [
      { name: "Pay Now", path: "/payment", icon: ArrowRight },
      { name: "Verify Certificate", path: "/verify-certificate", icon: ArrowRight },
      { name: "Book A Schedule Call", path: "/book-call", icon: Calendar },
      { name: "Want to see a course demo", path: "/demo", icon: MessageCircle },
    ],
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com" },
    { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com" },
  ]

  return (
    <footer className="text-gray-800 bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left Section - RYMA Academy with Social Links */}
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div>
                  <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-rose-800 to-red-600 bg-clip-text">
                    RYMA Academy
                  </span>
                  <p className="mt-1 text-base text-gray-600">Learn. Grow. Lead</p>
                </div>
              </Link>
              
              <p className="max-w-md text-base leading-relaxed text-gray-600">
                Empowering learners worldwide with high-quality online courses. 
                Join thousands of students and advance your career with expert-led instruction.
              </p>
            </div>

            {/* Social Links - Moved under RYMA Academy */}
            <div className="pt-2">
              <h4 className="mb-3 text-base font-semibold text-gray-700">Connect With Us</h4>
              <div className="flex space-x-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 transition-all duration-300 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-rose-50 hover:to-red-50 hover:scale-110 hover:shadow-lg group"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 text-rose-600 group-hover:text-rose-700" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="block py-2 text-base text-gray-600 transition-all duration-200 hover:text-gray-900 hover:translate-x-1 group"
                  >
                    <span className="transition-all group-hover:font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Categories
            </h3>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="block py-2 text-base text-gray-600 transition-all duration-200 hover:text-gray-900 hover:translate-x-1 group"
                  >
                    <span className="transition-all group-hover:font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-base text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group">
                <div className="p-2 transition-colors bg-blue-100 rounded-lg shadow-sm group-hover:bg-blue-200">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <span>support@rymaacademy.com</span>
              </div>
              <div className="flex items-center space-x-3 text-base text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group">
                <div className="p-2 transition-colors bg-green-100 rounded-lg shadow-sm group-hover:bg-green-200">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <span>+1000000</span>
              </div>
              <div className="flex items-center space-x-3 text-base text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group">
                <div className="p-2 transition-colors bg-purple-100 rounded-lg shadow-sm group-hover:bg-purple-200">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <span>123 Learning Street, Education City, EC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 mt-8 border-t border-gray-300">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <p className="text-base text-gray-500">
              © {currentYear} RYMA Academy. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-base text-gray-500">
              <Link to="/privacy" className="transition-colors hover:text-gray-900 hover:font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-gray-900 hover:font-medium">
                Terms of Service
              </Link>
              <Link to="/refund" className="transition-colors hover:text-gray-900 hover:font-medium">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer