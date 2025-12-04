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
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Left Section - RYMA Academy with Social Links */}
          <div className="space-y-4 lg:col-span-2">
            <div className="space-y-3">
              <Link 
                to="/" 
                className="inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-800 to-red-600 bg-clip-text sm:text-3xl">
                  RYMA Academy
                </span>
                <p className="mt-1 text-sm text-gray-600 sm:text-base">Learn. Grow. Lead</p>
              </Link>
              
              <p className="text-sm leading-relaxed text-gray-600 sm:text-base sm:max-w-md">
                Empowering learners worldwide with high-quality online courses. 
                Join thousands of students and advance your career with expert-led instruction.
              </p>
            </div>

            {/* Social Links - Moved under RYMA Academy */}
            <div className="pt-2">
              <h4 className="mb-2 text-sm font-semibold text-gray-700 sm:text-base">Connect With Us</h4>
              <div className="flex space-x-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 transition-all duration-300 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-rose-50 hover:to-red-50 hover:scale-110 hover:shadow-lg group sm:p-3"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4 text-rose-600 group-hover:text-rose-700 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="block py-1 text-sm text-gray-600 transition-all duration-200 hover:text-gray-900 hover:translate-x-1 group sm:py-2 sm:text-base"
                  >
                    <span className="transition-all group-hover:font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
              Categories
            </h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="block py-1 text-sm text-gray-600 transition-all duration-200 hover:text-gray-900 hover:translate-x-1 group sm:py-2 sm:text-base"
                  >
                    <span className="transition-all group-hover:font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-sm text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group sm:space-x-3 sm:text-base">
                <div className="p-1 transition-colors bg-blue-100 rounded-lg shadow-sm group-hover:bg-blue-200 sm:p-2 flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
                </div>
                <span className="break-words">support@rymaacademy.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group sm:space-x-3 sm:text-base">
                <div className="flex-shrink-0 p-1 transition-colors bg-green-100 rounded-lg shadow-sm group-hover:bg-green-200 sm:p-2">
                  <Phone className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
                </div>
                <span>+91 - 9873336133</span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-600 transition-colors cursor-pointer hover:text-gray-900 group sm:space-x-3 sm:text-base">
                <div className="p-1 transition-colors bg-purple-100 rounded-lg shadow-sm group-hover:bg-purple-200 sm:p-2 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-purple-600 sm:w-5 sm:h-5" />
                </div>
<span className="break-words">D-7/31 1st Floor Main Vishram Chowk
Sector-6, Vishram Chowk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 mt-6 border-t border-gray-300 sm:pt-8 sm:mt-8">
          <div className="flex flex-col space-y-3 text-center sm:text-center sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <p className="text-xs text-center text-gray-500 sm:text-sm">
              © {currentYear} RYMA Academy. All rights reserved.
            </p>
            
            
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer