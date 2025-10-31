// pages/ReferEarn.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, Award, UserPlus, CreditCard, Gift, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import axios from 'axios';

const ReferEarn = () => {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchReferralDetails = async () => {
      try {
        const [codeResponse, statsResponse, userResponse] = await Promise.all([
          axios.get('/api/referral/code'),
          axios.get('/api/referral/stats'),
          axios.get('/api/auth/me')
        ]);
        
        setReferralCode(codeResponse.data.referralCode);
        setReferralLink(codeResponse.data.referralLink);
        setStats(statsResponse.data);
        setUserEmail(userResponse.data.user.email);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch referral details');
        setLoading(false);
      }
    };

    fetchReferralDetails();
  }, []);
  const [openFAQ, setOpenFAQ] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const referralSteps = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create an account with Ryma Academy.",
      icon: <UserPlus className="w-8 h-8" />
    },
    {
      step: 2,
      title: "Refer a Friend",
      description: "Share your unique referral link or code.",
      icon: <Share2 className="w-8 h-8" />
    },
    {
      step: 3,
      title: "Your Friend Enrolls",
      description: "Once they join and complete their payment, you're eligible for rewards.",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: 4,
      title: "Earn Rewards",
      description: "Get cash bonuses, discounts, or exclusive perks for every successful referral.",
      icon: <Gift className="w-8 h-8" />
    }
  ];

  const programBenefits = [
    {
      program: "Full Stack Development",
      reward: "₹5,000 per referral",
      color: "bg-rose-500"
    },
    {
      program: "Data Science",
      reward: "₹6,000 per referral",
      color: "bg-rose-600"
    },
    {
      program: "AI & Machine Learning",
      reward: "₹7,000 per referral",
      color: "bg-rose-700"
    },
    {
      program: "Cyber Security",
      reward: "₹6,500 per referral",
      color: "bg-rose-800"
    },
    {
      program: "Cloud Computing",
      reward: "₹5,500 per referral",
      color: "bg-pink-500"
    },
    {
      program: "Digital Marketing",
      reward: "₹4,500 per referral",
      color: "bg-pink-600"
    }
  ];

  const faqItems = [
    {
      question: "What is the Refer & Earn program?",
      answer: "Sign up with Ryma Academy, get your personalized referral link, and refer it to your friends. When they sign up and pay, you earn!"
    },
    {
      question: "What are some rewards I can receive from this program?",
      answer: "You can earn cash bonuses up to ₹80,000, course discounts, exclusive access to premium content, and special recognition in our community."
    },
    {
      question: "Is there any limit on referring friends?",
      answer: "No! There's no limit to how many friends you can refer. The more you refer, the more you earn, with potential earnings up to ₹80,000."
    },
    {
      question: "How do I get my rewards?",
      answer: "Rewards are processed within 15-30 days after your referred friend completes their enrollment and makes the payment. You'll receive your rewards via your preferred payment method."
    },
    {
      question: "When will I receive my referral bonus?",
      answer: "You'll receive your bonus within 30 days after your friend's payment is confirmed and they complete the first month of their course."
    },
    {
      question: "Can I refer the same person multiple times?",
      answer: "No, each person can only be referred once using your referral code. However, you can refer as many different friends as you want!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-800 to-rose-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Refer a Friend and Win</h1>
            <div className="text-4xl font-bold bg-white text-rose-800 inline-block px-8 py-3 rounded-lg mb-8 shadow-lg">
               Upto ₹ 80,000!
            </div>
            <p className="text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Get your friends on board to join Ryma Academy and enjoy lucrative rewards. The more you refer, the more rewards!  
              Earn ₹80,000 at max by referring friends to our top-notch professional courses.
            </p>
            <button className="bg-white text-rose-800 px-10 py-4 rounded-lg font-bold text-lg hover:bg-rose-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
              Refer & Start Earning!
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">HOW IT WORKS</h2>
            <p className="text-xl text-gray-600">Simple Steps to Get Bigger Rewards</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {referralSteps.map((step, index) => (
              <div 
                key={step.step} 
                className="bg-white rounded-2xl p-8 border-2 border-rose-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
              >
                <div className="text-center">
                  {/* Step Number Badge */}
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-rose-600 to-rose-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
                        <div className="text-rose-600 group-hover:scale-110 transition-transform duration-300">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white text-rose-800 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg border-2 border-rose-200 group-hover:border-rose-300 group-hover:bg-rose-50 transition-colors">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-rose-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Code Section */}
      <section className="py-16 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-rose-200 hover:shadow-3xl transition-shadow duration-300">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Start Referring</h2>
              <p className="text-gray-600">Share your unique code and start earning today!</p>
            </div>
            
            {/* Referral Code Display */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-800 rounded-xl p-8 mb-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white text-lg block mb-4">Your Email (Use as Referral ID)</span>
              <div className="flex items-center justify-center gap-6">
                <code className="text-3xl font-bold text-white bg-rose-900 bg-opacity-30 px-8 py-4 rounded-lg tracking-wider border-2 border-rose-400 shadow-inner">
                  {userEmail}
                </code>
                <button
                  onClick={() => copyToClipboard(userEmail)}
                  className="bg-white text-rose-700 p-4 rounded-xl hover:bg-rose-50 transition-all duration-300 shadow-lg border-2 border-rose-200 hover:border-rose-300 hover:shadow-xl transform hover:scale-105"
                >
                  <Copy className="w-8 h-8" />
                </button>
              </div>
              {copied && (
                <div className="text-rose-200 mt-4 font-medium text-lg animate-pulse">✓ Copied to clipboard!</div>
              )}
            </div>

            {/* Referral Link */}
            <div className="bg-rose-50 rounded-xl p-8 border border-rose-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">Your Referral Link</h3>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-6 py-4 border-2 border-rose-200 rounded-xl text-gray-700 bg-white text-lg font-mono focus:border-rose-400 focus:outline-none shadow-inner"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="bg-gradient-to-r from-rose-700 to-rose-800 text-white px-8 py-4 rounded-xl hover:from-rose-800 hover:to-rose-900 transition-all duration-300 font-semibold shadow-lg border-2 border-rose-600 hover:shadow-xl transform hover:scale-105"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Wise Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Program Wise Benefit</h2>
            <p className="text-xl text-gray-600">Earn different rewards based on the program</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programBenefits.map((program, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-rose-50 to-white rounded-2xl p-6 shadow-lg border border-rose-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${program.color} w-12 h-12 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{program.program}</h3>
                </div>
                <div className="bg-rose-100 border border-rose-300 rounded-lg p-4 shadow-inner hover:shadow transition-shadow duration-300">
                  <p className="text-lg font-semibold text-rose-800 text-center">
                    {program.reward}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-12 h-12 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-2xl mb-6 shadow-lg">
              <HelpCircle className="w-10 h-10 text-rose-700" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Have Questions? We've Got Answers!</h2>
            <p className="text-xl text-rose-100 max-w-2xl mx-auto">
              Everything you need to know about our Refer & Earn program
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15 hover:border-white/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">?</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-rose-100 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </button>
                
                <div className={`px-8 pb-6 transition-all duration-300 ${
                  openFAQ === index ? 'block animate-fadeIn' : 'hidden'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">A</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-rose-100 text-lg leading-relaxed bg-white/5 rounded-xl p-4 border border-white/10">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Support */}
         
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white text-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of Ryma Academy students who are already earning rewards by referring their friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <div className="flex justify-end">
  <button className="bg-white text-rose-800 px-10 ml-16 py-4 rounded-lg font-bold text-lg hover:bg-rose-100 transition-all duration-300 shadow-lg border-2 border-white hover:shadow-xl transform hover:scale-105">
    Start Referring Now
  </button>
</div>
            <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-rose-800 transition-all duration-300 hover:shadow-xl transform hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReferEarn;