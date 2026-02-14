"use client"

import { Link } from "react-router-dom"
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-conditions" },
      { name: "Refund & Cancelation", path: "/refund-cancelation" },

    ],
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com" },
    { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com" },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 w-full font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        
        {/* Main Footer Container */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
          
          {/* Section 1: Brand - Centered on mobile, Left-aligned on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 lg:max-w-[300px]">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-primary-800 to-primary-700 bg-clip-text sm:text-4xl">
                RYMA Academy
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Learn. Grow. Lead
              </p>
            </Link>
            <p className="text-md leading-relaxed text-gray-600">
              Empowering learners worldwide with high-quality online courses.
              Join thousands of students and advance your career.
            </p>
          </div>

          {/* Middle Container: 2-Column Grid on mobile, Flex on desktop */}
          <div className="grid grid-cols-2 gap-8 lg:flex lg:gap-16 xl:gap-24">
            
            {/* Section 2: Company */}
            <div className="flex flex-col items-start">
              <h3 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-md text-gray-600 transition-colors hover:text-primary-800"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Contact Info */}
            <div className="flex flex-col items-start lg:max-w-[280px]">
              <h3 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 group">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-md text-gray-600 pt-0.5 break-all leading-tight">
                    support@rymaacademy.com
                  </span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-lg shrink-0 flex items-center">
                    <Phone className="w-4 h-4" /><span className="text-md text-gray-600 leading-tight px-4">
                    +91-9873336133
                  </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 group">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-600 leading-snug">
                    D-7/31 1st Floor, Sector-6, Vishram Chowk
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 4: Connect With Us - Centered on mobile, Right-aligned on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:min-w-[180px]">
            <h3 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-widest">
              Connect With Us
            </h3>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 transition-all duration-300 border border-gray-200 rounded-lg bg-gray-50 hover:bg-rose-50 hover:border-rose-200 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-gray-600 group-hover:text-rose-600 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-gray-100 flex flex-col items-center">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} <span className="font-semibold text-gray-700">RYMA Academy</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer