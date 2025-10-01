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
    support: [
      { name: "Help Center", path: "/help" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
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
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Section - RYMA Academy with Social Links */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-rose-800 to-red-600 bg-clip-text text-transparent">
                    RYMA Academy
                  </span>
                  <p className="text-base text-gray-600 mt-1">Learn. Grow. Lead</p>
                </div>
              </Link>
              
              <p className="text-gray-600 text-base leading-relaxed max-w-md">
                Empowering learners worldwide with high-quality online courses. 
                Join thousands of students and advance your career with expert-led instruction.
              </p>
            </div>

            {/* Social Links - Moved under RYMA Academy */}
            <div className="pt-2">
              <h4 className="text-base font-semibold text-gray-700 mb-3">Connect With Us</h4>
              <div className="flex space-x-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-rose-50 hover:to-red-50 transition-all duration-300 hover:scale-110 hover:shadow-lg border border-gray-200 group"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5 text-rose-600 group-hover:text-rose-700" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-gray-900 text-base transition-all duration-200 hover:translate-x-1 group py-2 block"
                  >
                    <span className="group-hover:font-medium transition-all">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Categories
            </h3>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-gray-900 text-base transition-all duration-200 hover:translate-x-1 group py-2 block"
                  >
                    <span className="group-hover:font-medium transition-all">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-base text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <span>support@rymaacademy.com</span>
              </div>
              <div className="flex items-center space-x-3 text-base text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors shadow-sm">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-base text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors shadow-sm">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <p className="text-gray-500 text-base">
              © {currentYear} RYMA Academy. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-base text-gray-500">
              <Link to="/privacy" className="hover:text-gray-900 transition-colors hover:font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors hover:font-medium">
                Terms of Service
              </Link>
              <Link to="/refund" className="hover:text-gray-900 transition-colors hover:font-medium">
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