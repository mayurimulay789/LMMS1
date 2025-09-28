"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Users, Award, TrendingUp, Play, Star, ArrowRight, Quote } from "lucide-react"
import CourseCard from "../Components/CourseCard"

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 50000,
    totalCourses: 1200,
    totalInstructors: 150,
    completionRate: 94,
  })
  const [isLoading, setIsLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchFeaturedCourses()
      fetchedRef.current = true
    }
  }, [])

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch("http://localhost:2000/api/courses/meta/featured-five")
      if (response.ok) {
        const data = await response.json()
        setFeaturedCourses(data)
      }
    } catch (error) {
      console.error("Error fetching featured courses:", error)
      // Mock data for demonstration
      setFeaturedCourses([
        {
          _id: "1",
          title: "Complete JavaScript Course",
          description: "Master JavaScript from basics to advanced concepts",
          instructor: "John Doe",
          price: 99,
          thumbnail: "/placeholder.svg?height=200&width=400",
          category: "Programming",
          avgRating: 4.8,
          reviewCount: 1250,
          enrollmentCount: 15000,
          lessons: Array(24).fill({}),
        },
        {
          _id: "2",
          title: "React Development Bootcamp",
          description: "Build modern web applications with React",
          instructor: "Jane Smith",
          price: 149,
          thumbnail: "/placeholder.svg?height=200&width=400",
          category: "Programming",
          avgRating: 4.9,
          reviewCount: 890,
          enrollmentCount: 8500,
          lessons: Array(32).fill({}),
        },
        {
          _id: "3",
          title: "UI/UX Design Masterclass",
          description: "Learn design principles and create stunning interfaces",
          instructor: "Mike Johnson",
          price: 79,
          thumbnail: "/placeholder.svg?height=200&width=400",
          category: "Design",
          avgRating: 4.7,
          reviewCount: 650,
          enrollmentCount: 5200,
          lessons: Array(18).fill({}),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with years of experience",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Join a vibrant community of learners and share knowledge",
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn recognized certificates upon course completion",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      content: "LearnHub transformed my career. The courses are comprehensive and the instructors are amazing!",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "UX Designer",
      content: "The design courses here are top-notch. I landed my dream job after completing the UI/UX track.",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Marketing Manager",
      content: "Flexible learning schedule and practical projects made all the difference in my learning journey.",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-600 via-rose-900 to-rose-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Learn Without
                <span className="text-rose-100"> Limits</span>
              </h1>
              <p className="text-xl mb-8 text-rose-100 leading-relaxed">
                Discover thousands of courses from expert instructors and advance your career with hands-on projects and
                real-world skills.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/courses"
                  className="bg-rose-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-900 transition-colors flex items-center justify-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-100">{stats.totalStudents.toLocaleString()}+</div>
                    <div className="text-rose-100">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-100">{stats.totalCourses.toLocaleString()}+</div>
                    <div className="text-rose-100">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-100">{stats.totalInstructors}+</div>
                    <div className="text-rose-100">Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-rose-100">{stats.completionRate}%</div>
                    <div className="text-rose-100">Success Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RYMA Academy Promotional Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left section with main heading */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Join <span className="text-red-600">RYMA ACADEMY</span>
                <span className="text-sm align-super">™</span>,{" "}
                <span className="text-gray-600">#1 Training Institute in</span>{" "}
                <span className="text-red-600">Marketing & Development</span>
              </h2>
            </div>

            {/* Right section with detailed description */}
            <div>
              <p className="text-lg text-gray-700 leading-relaxed">
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
      <section className="py-12 bg-white">
        <div className="overflow-hidden">
          <div className="flex animate-scroll whitespace-nowrap w-screen">
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
              <div key={index} className="flex-shrink-0 px-6">
                <img
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.name}
                  className="h-16 w-auto object-contain bg-white p-2 rounded-lg shadow-sm border"
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
              <div key={`dup-${index}`} className="flex-shrink-0 px-6">
                <img
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.name}
                  className="h-16 w-auto object-contain bg-white p-2 rounded-lg shadow-sm border"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Why Choose LearnHub?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-rose-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-rose-900" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Start your learning journey with our most popular courses
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-scroll gap-6 pb-4 scrollbar-red">
              {featuredCourses.map((course, index) => (
                <div key={course._id} className="flex-none w-80">
                  <CourseCard course={course} index={index} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="bg-rose-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-rose-900 transition-colors inline-flex items-center space-x-2"
            >
              <span>View All Courses</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Steps to Success Section */}
      <section className="py-12 bg-rose-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">3 Steps to Success</h2>
            <p className="text-xl text-rose-100 max-w-3xl mx-auto mb-12">
              Get enrolled in LearnHub as a Instructor and help to grow others also.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Fill the Application Form</h3>
              <p className="text-rose-100">Fill out the application form to publish your courses.</p>
            </div>

            {/* Line */}
            <div className="hidden md:block w-24 h-1 bg-white bg-opacity-30"></div>

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Get Shortlisted</h3>
              <p className="text-rose-100">You get shortlisted on your education profile</p>
            </div>

            {/* Line */}
            <div className="hidden md:block w-24 h-1 bg-white bg-opacity-30"></div>

            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Block Your Seat</h3>
              <p className="text-rose-100">Be the part of our journey as a instructor and spread your knowledge. </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="bg-white text-rose-900 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors inline-flex items-center space-x-2"
            >
              <span>Get Application Form</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Join thousands of successful learners who transformed their careers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <Quote className="h-8 w-8 text-rose-900 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-700">{testimonial.role}</div>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-rose-400 fill-current" />
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
      <section className="py-20 bg-rose-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              Join our community of learners and take the first step towards your goals
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-rose-900 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/courses"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-900 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
