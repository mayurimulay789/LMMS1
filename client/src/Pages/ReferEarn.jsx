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
      icon: <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
    },
    {
      step: 2,
      title: "Refer a Friend",
      description: "Share your unique referral link or code.",
      icon: <Share2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
    },
    {
      step: 3,
      title: "Your Friend Enrolls",
      description: "Once they join and complete their payment, you're eligible for rewards.",
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
    },
    {
      step: 4,
      title: "Earn Rewards",
      description: "Get cash bonuses, discounts, or exclusive perks for every successful referral.",
      icon: <Gift className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
    }
  ];

  const programBenefits = [
    {
      program: "Full Stack Development",
      reward: "₹5,000 per referral",
      color: "bg-primary-700"
    },
    {
      program: "Data Science",
      reward: "₹6,000 per referral",
      color: "bg-primary-700"
    },
    {
      program: "AI & Machine Learning",
      reward: "₹7,000 per referral",
     color: "bg-primary-700"
    },
    {
      program: "Cyber Security",
      reward: "₹6,500 per referral",
      color: "bg-primary-700"
    },
    {
      program: "Cloud Computing",
      reward: "₹5,500 per referral",
      color: "bg-primary-700"
    },
    {
      program: "Digital Marketing",
      reward: "₹4,500 per referral",
      color: "bg-primary-700"
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

  // Add fadeIn animation for FAQ
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-800 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6">Refer a Friend and Win</h1>
            <div className="text-xl sm:text-2xl md:text-4xl font-bold bg-white text-rose-800 inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 lg:mb-8 shadow-lg">
               Upto ₹ 80,000!
            </div>
            <p className="text-sm sm:text-base lg:text-lg max-w-2xl sm:max-w-3xl mx-auto mb-5 sm:mb-6 lg:mb-8 leading-relaxed px-2">
              Get your friends on board to join Ryma Academy and enjoy lucrative rewards. The more you refer, the more rewards!  
              Earn ₹80,000 at max by referring friends to our top-notch professional courses.
            </p>
            <button className="bg-white text-rose-800 px-5 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-rose-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
              Refer & Start Earning!
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 sm:py-14 lg:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">HOW IT WORKS</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Simple Steps to Get Bigger Rewards</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {referralSteps.map((step, index) => (
              <div 
                key={step.step} 
                className="bg-white rounded-2xl p-4 sm:p-5 lg:p-8 border-2 border-rose-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
              >
                <div className="text-center">
                  {/* Step Number Badge */}
                  <div className="relative mb-3 sm:mb-4 lg:mb-6">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="bg-white w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-inner">
                        <div className="text-rose-600 group-hover:scale-110 transition-transform duration-300">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white text-rose-800 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold shadow-lg border-2 border-rose-200 group-hover:border-rose-300 group-hover:bg-rose-50 transition-colors">
                      {step.step}
                    </div>
                  </div>
                  {/* Content */}
                  <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-3 text-gray-800 group-hover:text-primary-800 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Program Wise Benefits */}
      <section className="py-10 sm:py-14 lg:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4">Program Wise Benefit</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Earn different rewards based on the program</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {programBenefits.map((program, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-rose-50 to-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-rose-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] lg:min-h-[180px]"
              >
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                  <div className={`${program.color} w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-800">{program.program}</h3>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-full bg-primary-800 border border-primary-700 rounded-lg p-2 sm:p-3 lg:p-4 shadow-inner hover:shadow transition-shadow duration-300 flex items-center justify-center">
                    <p className="text-xs sm:text-sm lg:text-lg font-semibold text-white text-center">
                      {program.reward}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section className="py-10 sm:py-14 lg:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-800 relative overflow-hidden">
        <div className="max-w-2xl sm:max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 bg-rose-100 rounded-2xl mb-3 sm:mb-4 lg:mb-6 shadow-lg">
              <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-rose-700" />
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">Have Questions? We've Got Answers!</h2>
            <p className="text-sm sm:text-base lg:text-xl text-rose-100 max-w-xl sm:max-w-2xl mx-auto">
              Everything you need to know about our Refer & Earn program
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/1 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15 hover:border-white/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-left flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs sm:text-sm lg:text-lg">?</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white group-hover:text-rose-100 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2 sm:ml-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      {openFAQ === index ? (
                        <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                      )}
                    </div>
                  </div>
                </button>
                <div className={`px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 lg:pb-6 transition-all duration-300 ${
                  openFAQ === index ? 'block animate-fadeIn' : 'hidden'
                }`}>
                  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xs sm:text-xs lg:text-sm">A</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-rose-100 text-xs sm:text-sm lg:text-base leading-relaxed bg-white/5 rounded-xl p-2 sm:p-3 lg:p-4 border border-white/10">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      
    </div>
  );
};

export default ReferEarn;