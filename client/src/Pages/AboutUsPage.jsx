import { Users, Target, Heart, BookOpen, Globe, Award, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { generateDefaultAvatar } from "../utils/imageUtils"

const AboutUsPage = () => {
  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "1000+", label: "Courses Available" },
    { number: "100+", label: "Expert Instructors" },
    { number: "95%", label: "Success Rate" },
  ]

  const values = [
    {
      icon: BookOpen,
      title: "Quality Education",
      description:
        "We believe in providing high-quality, accessible education that empowers learners to achieve their goals.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Our vibrant learning community supports each other through every step of the educational journey.",
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Every course is designed with clear learning objectives and practical outcomes in mind.",
    },
    {
      icon: Heart,
      title: "Passion for Learning",
      description: "We are passionate about making learning enjoyable, engaging, and effective for everyone.",
    },
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: generateDefaultAvatar("Sarah Johnson", 300),
      bio: "Former tech executive with 15+ years in education technology.",
    },
    {
      name: "Michael Chen",
      role: "Head of Curriculum",
      image: generateDefaultAvatar("Michael Chen", 300),
      bio: "Educational expert with PhD in Learning Sciences from Stanford.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Technology",
      image: generateDefaultAvatar("Emily Rodriguez", 300),
      bio: "Full-stack developer and former Google engineer.",
    },
    {
      name: "David Kim",
      role: "Head of Marketing",
      image: generateDefaultAvatar("David Kim", 300),
      bio: "Growth marketing specialist with experience at top EdTech companies.",
    },
  ]

  const achievements = [
    {
      icon: Award,
      title: "Best EdTech Platform 2024",
      description: "Recognized as the leading educational technology platform"
    },
    {
      icon: Users,
      title: "50K+ Students Empowered",
      description: "Helped thousands of students achieve their career goals"
    },
    {
      icon: TrendingUp,
      title: "95% Success Rate",
      description: "Consistent high success rate in student outcomes"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving students across 50+ countries worldwide"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-800 to-rose-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              About Ryma Academy
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-rose-100 max-w-3xl mx-auto px-4 sm:px-0">
              We're on a mission to make quality education accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-rose-600 mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h2>
              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                <p>
                  Founded in 2020, Ryma Academy started with a simple belief: everyone deserves access to quality education,
                  regardless of their location, background, or circumstances.
                </p>
                <p>
                  What began as a small team of educators and technologists has grown into a thriving platform that
                  serves thousands of learners worldwide. We've partnered with industry experts and leading institutions
                  to create courses that are not just educational, but transformational.
                </p>
                <p>
                  Today, we continue to innovate and expand our offerings, always keeping our learners at the center of
                  everything we do. Our success is measured not just in numbers, but in the success stories of our
                  students who have achieved their dreams through learning.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-rose-100 to-rose-200 rounded-lg sm:rounded-xl shadow-lg border-2 border-rose-200 flex items-center justify-center">
                <Users className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-rose-600" />
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-gradient-to-r from-rose-700 to-rose-800 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-xl">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm font-medium">Serving learners in</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">50+ Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Achievements</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Celebrating milestones and successes that define our journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-rose-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                <div className="bg-gradient-to-r from-rose-600 to-rose-800 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <achievement.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{achievement.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Values</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              These core values guide everything we do and shape the learning experience we create.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                <div className="bg-gradient-to-r from-rose-600 to-rose-800 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <value.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Meet Our Team</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              The passionate individuals behind Ryma Academy who are dedicated to your learning success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-rose-50 to-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-rose-200"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover" 
                  onError={(e) => {
                    e.target.src = generateDefaultAvatar(member.name, 300);
                  }} 
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-rose-600 font-medium text-sm sm:text-base mb-2 sm:mb-3">{member.role}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      
    </div>
  )
}

export default AboutUsPage