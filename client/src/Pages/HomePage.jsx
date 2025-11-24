// C:\Users\mrunal\OneDrive\Desktop\new lms\LMMS1\client\src\Pages\HomePage.jsx

"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Users, Award, TrendingUp, Play, Star, ArrowRight, Quote } from "lucide-react"
import CourseCard from "../Components/CourseCard"
import { generateDefaultAvatar } from "../utils/imageUtils"

import InstructorApplicationForm from "../Components/InstructorApplicationForm"
import { apiRequest } from "../config/api" // Assuming this function handles the fetch and JSON parsing internally

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const stats = {
    totalStudents: 50000,
    totalCourses: 1200,
    totalInstructors: 150,
    completionRate: 94,
  }
  const [isLoading, setIsLoading] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const fetchedRef = useRef(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchFeaturedCourses()
      fetchedRef.current = true
    }

    const showForm = searchParams.get('showApplicationForm')
    if (showForm === 'true') {
      setShowApplicationForm(true)
    }

    const handleShowApplicationForm = () => {
      setShowApplicationForm(true)
    }

    window.addEventListener('showApplicationForm', handleShowApplicationForm)

    return () => {
      window.removeEventListener('showApplicationForm', handleShowApplicationForm)
    }
  }, [searchParams])

  // ------------------------------------------------------------------
  // FIX APPLIED HERE: Safely extracting the course array from the API response
  // ------------------------------------------------------------------
  const fetchFeaturedCourses = async () => {
    try {
      const result = await apiRequest("courses/meta/featured-five") 
      
      let coursesArray = []

      // Check if the result is a plain array (Scenario 1)
      if (Array.isArray(result)) {
        coursesArray = result
      } 
      // Check if the result is an object with a 'data' property that is an array (Scenario 2 - Most Common)
      else if (result && Array.isArray(result.data)) {
        coursesArray = result.data
      } 
      // Check if the result is an object with a 'courses' property that is an array
      else if (result && Array.isArray(result.courses)) {
        coursesArray = result.courses
      } 
      // Fallback: Log a warning if the data structure is unexpected
      else {
        console.warn("API response for featured courses was not a standard array or object with a 'data'/'courses' array:", result)
        coursesArray = [] // Default to empty array to prevent map() error
      }
      
      setFeaturedCourses(coursesArray)
      
    } catch (error) {
      console.error("Error fetching featured courses:", error)
      setFeaturedCourses([]) // **CRITICAL:** Set to empty array on error
    } finally {
      setIsLoading(false)
    }
  }
  // ------------------------------------------------------------------

  const features = [
    { icon: BookOpen, title: "Expert-Led Courses", description: "Learn from industry professionals with years of experience", },
    { icon: Users, title: "Community Learning", description: "Join a vibrant community of learners and share knowledge", },
    { icon: Award, title: "Certificates", description: "Earn recognized certificates upon course completion", },
    { icon: TrendingUp, title: "Track Progress", description: "Monitor your learning journey with detailed analytics", },
  ]

  const testimonials = [
    { name: "Sarah Johnson", role: "Software Developer", content: "Ryma Academy transformed my career. The courses are comprehensive and the instructors are amazing!", avatar: generateDefaultAvatar("Sarah Johnson", 60), rating: 5, },
    { name: "Michael Chen", role: "UX Designer", content: "The design courses here are top-notch. I landed my dream job after completing the UI/UX track.", avatar: generateDefaultAvatar("Michael Chen", 60), rating: 5, },
    { name: "Emily Davis", role: "Marketing Manager", content: "Flexible learning schedule and practical projects made all the difference in my learning journey.", avatar: generateDefaultAvatar("Emily Davis", 60), rating: 5, },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-8 text-white bg-gradient-to-br from-rose-600 via-rose-900 to-rose-900 sm:py-12 md:py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12"> 
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl"> 
                Learn Without
                <span className="text-rose-100"> Limits</span>
              </h1>
              <p className="mb-6 text-base leading-relaxed text-rose-100 sm:text-lg md:text-xl"> 
                Discover thousands of courses from expert instructors and advance your career with hands-on projects and
                real-world skills.
              </p>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Link
                  to="/courses"
                  className="flex items-center justify-center px-5 py-3 space-x-2 text-sm font-semibold text-white transition-colors rounded-lg bg-rose-700 sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-rose-600 sm:text-base"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button className="flex items-center justify-center px-5 py-3 space-x-2 text-sm font-semibold text-white transition-colors border-2 border-white rounded-lg sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-white hover:text-rose-900 sm:text-base">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-6 lg:mt-0" 
            >
              <div className="p-4 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl sm:p-6 md:p-8"> 
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"> 
                  <div className="text-center">
                    <div className="text-xl font-bold sm:text-2xl md:text-3xl text-rose-100">{stats.totalStudents.toLocaleString()}+</div> 
                    <div className="text-xs sm:text-sm md:text-base text-rose-100">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold sm:text-2xl md:text-3xl text-rose-100">{stats.totalCourses.toLocaleString()}+</div>
                    <div className="text-xs sm:text-sm md:text-base text-rose-100">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold sm:text-2xl md:text-3xl text-rose-100">{stats.totalInstructors}+</div>
                    <div className="text-xs sm:text-sm md:text-base text-rose-100">Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold sm:text-2xl md:text-3xl text-rose-100">{stats.completionRate}%</div>
                    <div className="text-xs sm:text-sm md:text-base text-rose-100">Success Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RYMA Academy Promotional Section */}
      <section className="py-8 bg-white sm:py-10 md:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid items-center grid-cols-1 gap-4 md:grid-cols-2 md:gap-8" 
          >
            <div className="md:pr-8">
              <h2 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl lg:text-4xl"> 
                Join <span className="text-red-600">RYMA ACADEMY</span>
                <span className="text-xs align-super">™</span>,{" "}
                <span className="text-gray-600">#1 Training Institute in</span>{" "}
                <span className="text-red-600">Marketing & Development</span>
              </h2>
            </div>

            <div className="pt-2 md:pt-0">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg"> 
                Learn Most Demanded Skills choose by our <span className="font-semibold">367+ Placement Partner</span>{" "}
                with <span className="font-semibold">1.9 Lakh Job Openings</span>, Join our{" "}
                <span className="font-semibold text-gray-800">Master in Digital Marketing Program</span> a way to
                getting fastest internship in the field of marketing and development
              </p>
                  </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Partners Logos Section */}
      <section className="py-6 bg-white sm:py-8 md:py-12"> 
        <div className="overflow-hidden">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `}</style>
          <div className="flex animate-scroll whitespace-nowrap min-w-[200vw]"> 
            {[
              { name: "Accenture", src: "/File_Accenture.svg -.png" },
              { name: "Google", src: "/Google logo - Wikipe.png" },
              { name: "Paytm", src: "/File_Paytm logo.png .png" },
              { name: "TCS", src: "/File_Tata Consultanc.png" },
              { name: "Sony", src: "/Sony Logo Vector on .png" },
              { name: "Upwork", src: "/File_Upwork-logo.svg.png" },
              { name: "Zoho", src: "/Official Zoho Logo -.png" },
              { name: "Freelancer", src: "/About Freelancer_ Co.png" },
            ].map((logo, index) => (
              <div key={index} className="flex-shrink-0 px-3 sm:px-4 md:px-6"> 
                <img
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.name}
                  className="object-contain w-auto h-10 p-1 bg-white border rounded-lg shadow-sm sm:h-12 md:h-16" 
                />
              </div>
            ))}
            {[
              { name: "Accenture", src: "/File_Accenture.svg -.png" },
              { name: "Google", src: "/Google logo - Wikipe.png" },
              { name: "Paytm", src: "/File_Paytm logo.png .png" },
              { name: "TCS", src: "/File_Tata Consultanc.png" },
              { name: "Sony", src: "/Sony Logo Vector on .png" },
              { name: "Upwork", src: "/File_Upwork-logo.svg.png" },
              { name: "Zoho", src: "/Official Zoho Logo -.png" },
              { name: "Freelancer", src: "/About Freelancer_ Co.png" },
            ].map((logo, index) => (
              <div key={`dup-${index}`} className="flex-shrink-0 px-3 sm:px-4 md:px-6">
                <img
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.name}
                  className="object-contain w-auto h-10 p-1 bg-white border rounded-lg shadow-sm sm:h-12 md:h-16"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section (Why Choose RYMA?) */}
      <section className="py-8 bg-white sm:py-10 md:py-12"> 
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-6 text-center sm:mb-8 md:mb-16" 
          >
            <h2 className="mb-2 text-xl font-bold text-black sm:text-2xl md:text-3xl lg:text-4xl">Why Choose RYMA?</h2> 
            <p className="max-w-3xl mx-auto text-sm text-gray-700 sm:text-base md:text-xl"> 
              We provide everything you need to succeed in your learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 md:gap-8"> 
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center p-4 text-center shadow-lg bg-rose-800 sm:p-6 md:p-8 rounded-xl"
              >
                <div className="flex items-center justify-center w-10 h-10 mb-2 bg-white rounded-lg sm:w-12 sm:h-12 md:w-16 md:h-16"> 
                  <feature.icon className="w-5 h-5 text-yellow-400 sm:w-6 sm:h-6 md:h-8 md:w-8" />
                </div>
                <h3 className="mb-1 text-sm font-semibold leading-tight text-white sm:text-base md:text-xl">{feature.title}</h3>
                <p className="text-xs text-white sm:text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-8 bg-white sm:py-10 md:py-12"> 
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8"> 
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-6 text-center sm:mb-8 md:mb-16"
          >
            <h2 className="mb-2 text-xl font-bold text-black sm:text-2xl md:text-3xl lg:text-4xl">Featured Courses</h2>
            <p className="max-w-3xl mx-auto text-sm text-gray-700 sm:text-base md:text-xl">
              Start your learning journey with our most popular courses
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex space-x-4 overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse flex-shrink-0 w-80 md:w-full h-[380px]">
                  <div className="bg-gray-300 h-1/2"></div>
                  <div className="p-4">
                    <div className="h-4 mb-2 bg-gray-300 rounded"></div>
                    <div className="w-3/4 h-4 mb-4 bg-gray-300 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex pb-4 space-x-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-x-0 snap-x scroll-p-4"> 
              {featuredCourses.map((course, index) => (
                <div 
                  key={course._id} 
                  className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-full lg:w-full snap-start"
                > 
                  <CourseCard course={course} index={index} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:mt-8 md:mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center px-5 py-3 space-x-2 text-sm font-semibold text-white transition-colors rounded-lg bg-rose-900 sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-rose-900 sm:text-base"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* 3 Steps to Success Section */}
      <section className="py-8 text-white sm:py-10 md:py-12 bg-rose-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-6 text-center sm:mb-8 md:mb-16"
          >
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">3 Steps to Success</h2>
            <p className="max-w-3xl mx-auto mb-6 text-sm md:text-base text-rose-100 sm:mb-8 md:mb-12 md:text-xl">
              Get enrolled in Ryma Academy as an Instructor and help others grow.
            </p>
          </motion.div>

          <div className="flex flex-col items-center justify-between space-y-6 sm:space-y-8 md:flex-row md:space-y-0 md:space-x-6 lg:space-x-8"> 
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center mx-auto mb-3 bg-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-opacity-20">
                <span className="text-lg font-bold text-white sm:text-xl md:text-2xl">1</span>
              </div>
              <h3 className="mb-1 text-lg font-semibold sm:text-xl md:text-2xl">Fill the Application Form</h3>
              <p className="px-4 text-xs sm:text-sm md:text-base text-rose-100">Fill out the application form to publish your courses.</p>
            </div>

            <div className="w-0 h-0 bg-white md:block md:w-12 lg:w-16 xl:w-24 md:h-1 bg-opacity-30"></div> 

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center mx-auto mb-3 bg-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-opacity-20">
                <span className="text-lg font-bold text-white sm:text-xl md:text-2xl">2</span>
                </div>
              <h3 className="mb-1 text-lg font-semibold sm:text-xl md:text-2xl">Get Shortlisted</h3>
              <p className="px-4 text-xs sm:text-sm md:text-base text-rose-100">You get shortlisted on your education profile</p>
            </div>

            <div className="w-0 h-0 bg-white md:block md:w-12 lg:w-16 xl:w-24 md:h-1 bg-opacity-30"></div>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center mx-auto mb-3 bg-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-opacity-20">
                <span className="text-lg font-bold text-white sm:text-xl md:text-2xl">3</span>
              </div>
              <h3 className="mb-1 text-lg font-semibold sm:text-xl md:text-2xl">Block Your Seat</h3>
              <p className="px-4 text-xs sm:text-sm md:text-base text-rose-100">Be the part of our journey as a instructor and spread your knowledge. </p>
            </div>
          </div>

          <div className="mt-6 text-center sm:mt-8 md:mt-12">
            <button
              onClick={() => setShowApplicationForm(true)}
              className="inline-flex items-center px-5 py-3 space-x-2 text-sm font-semibold transition-colors bg-white rounded-lg text-rose-900 sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-rose-50 sm:text-base"
            >
              <span>Get Application Form</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 bg-white sm:py-10 md:py-12 lg:py-20"> 
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-6 text-center sm:mb-8 md:mb-16"
          >
            <h2 className="mb-2 text-xl font-bold text-black sm:text-2xl md:text-3xl lg:text-4xl">What Our Students Say</h2>
            <p className="max-w-3xl mx-auto text-sm text-gray-700 sm:text-base md:text-xl">
              Join thousands of successful learners who transformed their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8"> 
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 bg-white border border-gray-100 shadow-lg sm:p-6 md:p-8 rounded-xl" 
              >
                <Quote className="w-6 h-6 mb-3 text-rose-900 sm:w-8 sm:h-8" />
                <p className="mb-4 text-sm italic text-gray-700 sm:text-base md:mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10 md:w-12 md:h-12"
                  />
                  <div>
                    <div className="text-xs font-semibold text-black sm:text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-xs text-gray-700 sm:text-sm">{testimonial.role}</div>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current sm:h-4 sm:w-4 text-rose-400" />
                      ))}
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-rose-900 sm:py-10 md:py-12 lg:py-20">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">Ready to Start Learning?</h2>
            <p className="max-w-2xl mx-auto mb-4 text-sm md:text-base text-rose-100 sm:mb-6 md:mb-8 md:text-xl">
              Join our community of learners and take the first step towards your goals
            </p>
            <div className="flex flex-col justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="px-5 py-3 text-sm font-semibold transition-colors bg-white rounded-lg text-rose-900 sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-rose-50 sm:text-base"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="px-5 py-3 text-sm font-semibold text-white transition-colors border-2 border-white rounded-lg sm:px-6 sm:py-3 md:px-8 md:py-4 hover:bg-white hover:text-rose-900 sm:text-base"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-lg sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 sm:scale-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">Instructor Application Form</h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600 sm:text-3xl"
                >
                  &times;
                </button>
              </div>
              <InstructorApplicationForm onClose={() => setShowApplicationForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage