import { Users, Target, Heart, BookOpen, Globe, Award, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { generateDefaultAvatar } from "../utils/imageUtils"
import ourStoryImage from "../assets/ourstories.jpg" // Import the image
import raviSharma from "../assets/ravi-sharma.webp";
import praveenJain from "../assets/mr.parveen.webp";
import vijayBhardwaj from "../assets/vijay.webp";

import React, { useState,useEffect } from "react";

const AboutUsPage = () => {
  const [showFullStory, setShowFullStory] = useState(false);
  const handleShowMore = () => setShowFullStory((prev) => !prev);

  useEffect(() => {
        window.scrollTo(0, 0);
      }, []);


  const stats = [
    { number: "15K+", label: "Active Students" },
    { number: "10+", label: "Courses Available" },
    { number: "15+", label: "Expert Instructors" },
    { number: "95%", label: "Success Rate" },
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Access for All",
      description:
        " Access for All Education is not a privilege — it is a right we defend daily.",
    },
    {
      icon: Users,
      title: "Learn Anywhere",
      description: "Learn Anywhere Online or in-person, the classroom comes to you — not the other way around..",
    },
    {
      icon: Target,
      title: "Real Skills",
      description: " Curricula forged with industry, not for academia — because the real world demands more.",
    },
    {
      icon: Heart,
      title: "Your Success",
      description: " Your Success We do not measure enrollments. We measure transformations.",
    },
  ]

  const team = [
    {
      name: "Mr. Praveen Jain",
      role: "Founder & Chief Executive Officer",
      image: praveenJain,
      bio: "The vision behind Ryma Academy — a leader who turned a belief in accessible education into a thriving institution, online and offline.",
    },
    {
      name: "Mr. Ravi Sharma",
      role: "Chief Training Officer",
      image: raviSharma,
      bio: "The architect of learning — ensuring every course at Ryma is not just taught, but truly understood and applied.",
    },
    {
      name: "Mr. Vijay Bhardwaj",
      role: "Chief Placement Officer",
      image: vijayBhardwaj,
      bio: "The bridge between talent and opportunity — connecting RYMA's learners with the careers they have worked hard to deserve.",
    },
  ]

  const achievements = [
    {
      icon: Award,
      title: "Awarded EdTech Platform ",
      description: "Recognized as the leading educational technology platform"
    },
    {
      icon: Users,
      title: "15K+ Students Empowered",
      description: "Learn Anywhere Online or in-person, the classroom comes to you — not the other way around."
    },
    {
      icon: TrendingUp,
      title: "95% Success Rate",
      description: "Consistent high success rate in student outcomes"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving students across 3+ countries worldwide"
    }
  ]



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              About RYMA ACADEMY
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-rose-100 max-w-3xl mx-auto px-4 sm:px-0">
              We do not just build careers. We build people who change the world.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 sm:p-6 bg-white rounded-lg shadow-sm border border-rose-600">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold text-primary-800 mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Our Story</h2>
              <div className="space-y-3 sm:space-y-4 text-primary-100 text-sm sm:text-base">
                {/* Mobile/Tablet: Collapsible story with Show More button */}
                <div className="block lg:hidden">
                  <p>
                    Born in <strong className="text-white">2020</strong>  — online, with one bold idea: quality education for everyone, everywhere — no excuses, no barriers.
What started as a small gang of teachers and tech folks on a screen has turned into a thriving learning platform serving thousands of students worldwide.
                  </p>
                  <p>
                    We teamed up with industry experts and top institutions to build courses that don't just teach — they transform.
Then in <strong className="text-white">October 2023</strong>, we took it to the next level — opened our very own <strong className="text-white">offline center</strong>, bringing the Ryma experience face-to-face.
                  </p>
                  {showFullStory && (
                    <>
                      <p>
                        Real classrooms, real mentors, real energy.
We don't measure success in clicks or signups. We measure it in your wins.</p>

                    </>
                  )}
                  <button
                    className="mt-2 text-primary-200 font-semibold underline focus:outline-none hover:text-white transition-colors"
                    onClick={handleShowMore}
                  >
                    {showFullStory ? 'Show Less' : 'Show More'}
                  </button>
                </div>
                {/* Desktop: Always show full story, no button */}
                <div className="hidden lg:block space-y-3 sm:space-y-4">
                  <p>
                    Founded in <strong className="text-white">2020</strong>, <strong className="text-white">Ryma Academy</strong> started with a simple belief: everyone deserves access to quality education,
                    regardless of their location, background, or circumstances.
                  </p>
                  <p>
                    What began as a small team of educators and technologists has grown into a thriving platform that
                    serves thousands of learners worldwide. We've partnered with industry experts and leading institutions
                    to create courses that are not just educational, but transformational. In <strong className="text-white">October 2023</strong>, we opened our first <strong className="text-white">offline center</strong>bringing the Ryma experience face-to-face.
                  </p>
                  <p> Real classrooms, real mentors, real energy.
We don't measure success in clicks or signups. We measure it in your wins.</p>
                  <p>
<strong className="text-white">RYMA ACADEMY</strong> — because great education shouldn't be a privilege.
                      </p>
                 
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={ourStoryImage} 
                alt="Our Story" 
                className="w-full h-auto object-cover rounded-lg sm:rounded-xl shadow-lg border-2 border-primary-700"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-primary-700 text-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-xl">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
                <div className="text-xs sm:text-sm font-medium">Serving learners in</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">3+ Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 mb-3 sm:mb-4">Our Achievements</h2>
            <p className="text-base sm:text-lg lg:text-xl text-primary-800 max-w-2xl mx-auto px-4 sm:px-0">
              Celebrating milestones and successes that define our journey
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="bg-primary-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center flex flex-col justify-between min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]"
              >
                <div className="bg-white w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <achievement.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-800" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-white mb-1 sm:mb-3">{achievement.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-white">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Our Values</h2>
            <p className="text-base sm:text-lg lg:text-xl text-white max-w-2xl mx-auto px-4 sm:px-0">
              These core values guide everything we do and shape the learning experience we create.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center flex flex-col justify-between min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]"
              >
                <div className="bg-primary-800 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <value.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-3">{value.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 mb-3 sm:mb-4">Meet Our Founders</h2>
            <p className="text-base sm:text-lg lg:text-xl text-primary-800 max-w-2xl mx-auto px-4 sm:px-0">
              The passionate individuals behind Ryma Academy who are dedicated to your learning success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-primary-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-primary-700 flex flex-col"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-48 object-cover" 
                  onError={(e) => {
                    e.target.src = generateDefaultAvatar(member.name, 300);
                  }} 
                />
                <div className="p-3 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between">
                  <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-primary-200 font-medium text-xs sm:text-sm lg:text-base mb-1 sm:mb-3">{member.role}</p>
                  <p className="text-primary-100 text-xs sm:text-sm lg:text-base">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* (If you had a CTA, it would go here, but it's commented out in original) */}
    </div>
  )
}

export default AboutUsPage