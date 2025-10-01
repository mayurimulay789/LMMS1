import { Users, Target, Heart, BookOpen, Globe, Award, TrendingUp } from "lucide-react"

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
      image: "/placeholder.svg?height=300&width=300",
      bio: "Former tech executive with 15+ years in education technology.",
    },
    {
      name: "Michael Chen",
      role: "Head of Curriculum",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Educational expert with PhD in Learning Sciences from Stanford.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Technology",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Full-stack developer and former Google engineer.",
    },
    {
      name: "David Kim",
      role: "Head of Marketing",
      image: "/placeholder.svg?height=300&width=300",
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
      <section className="bg-gradient-to-r from-rose-800 to-rose-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Ryma Academy</h1>
            <p className="text-xl md:text-2xl text-rose-100 max-w-3xl mx-auto">
              We're on a mission to make quality education accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rose-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
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
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Our team working together"
                className="rounded-lg shadow-lg border-2 border-rose-200"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-rose-700 to-rose-800 text-white p-6 rounded-lg shadow-xl">
                <Globe className="h-8 w-8 mb-2" />
                <div className="text-sm font-medium">Serving learners in</div>
                <div className="text-2xl font-bold">50+ Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Celebrating milestones and successes that define our journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-rose-50 to-white rounded-2xl p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                <div className="bg-gradient-to-r from-rose-600 to-rose-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the learning experience we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                <div className="bg-gradient-to-r from-rose-600 to-rose-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind Ryma Academy who are dedicated to your learning success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-rose-50 to-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-rose-200"
              >
                <img 
                  src={member.image || "/placeholder.svg"} 
                  alt={member.name} 
                  className="w-full h-64 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-rose-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of students who have transformed their careers with Ryma Academy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-8 py-4 rounded-lg font-semibold hover:from-rose-800 hover:to-rose-900 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Explore Courses
            </button>
            <button className="border-2 border-rose-700 text-rose-700 px-8 py-4 rounded-lg font-semibold hover:bg-rose-700 hover:text-white transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage