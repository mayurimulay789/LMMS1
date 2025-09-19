import { Users, Target, Heart, BookOpen, Globe } from "lucide-react"

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
      name: "Sarah",
      role: "CEO",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About LearnHub</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
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
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2020, LearnHub started with a simple belief: everyone deserves access to quality education,
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
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-lg">
                <Globe className="h-8 w-8 mb-2" />
                <div className="text-sm font-medium">Serving learners in</div>
                <div className="text-2xl font-bold">50+ Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the learning experience we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind LearnHub who are dedicated to your learning success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get answers to the most common questions about LearnHub and our learning platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: "How do I get started with LearnHub?",
                  answer:
                    "Getting started is easy! Simply create a free account, browse our course catalog, and enroll in courses that interest you. You can start learning immediately after enrollment.",
                },
                {
                  question: "Are the courses self-paced or do they have fixed schedules?",
                  answer:
                    "Most of our courses are self-paced, allowing you to learn at your own speed. However, some specialized courses may have live sessions or deadlines. Check the course details for specific information.",
                },
                {
                  question: "Do I receive a certificate upon course completion?",
                  answer:
                    "Yes! You'll receive a verified certificate of completion for each course you finish. These certificates can be shared on LinkedIn, added to your resume, or used for professional development.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards, PayPal, and bank transfers. We also offer installment plans for premium courses and have corporate billing options for businesses.",
                },
                {
                  question: "Can I access courses on mobile devices?",
                  answer:
                    "Absolutely! Our platform is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. You can learn anywhere, anytime.",
                },
                {
                  question: "Is there a refund policy?",
                  answer:
                    "Yes, we offer a 30-day money-back guarantee for all paid courses. If you're not satisfied with a course, you can request a full refund within 30 days of purchase.",
                },
                {
                  question: "How do I contact support if I need help?",
                  answer:
                    "Our support team is available 24/7 through live chat, email, or phone. You can also browse our comprehensive help center for instant answers to common questions.",
                },
                {
                  question: "Are there any prerequisites for courses?",
                  answer:
                    "Prerequisites vary by course. Some beginner courses have no requirements, while advanced courses may require prior knowledge or experience. Check each course description for specific prerequisites.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Contact Our Support Team
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8">
            To democratize education by providing accessible, high-quality learning experiences that empower individuals
            to unlock their potential and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Join Our Community
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Start Learning Today
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage
