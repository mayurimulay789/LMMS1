"use client";

import { useEffect } from "react";
import {
  FileText,
  UserCheck,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Copyright,
  ShieldAlert,
  Ban,
  RefreshCcw,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F8F9FB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 lg:p-12">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              Terms & Conditions
            </h1>
            {/* <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Effective Date: <span className="font-medium">[Insert Date]</span>
            </p> */}
          </div>

          {/* Intro */}
          <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700 mb-6 sm:mb-8">
            Welcome to <strong className="font-medium text-gray-900">Ryma Academy</strong>.
            By accessing our website, courses, and services, you agree to comply with
            these Terms & Conditions. Please read them carefully.
          </p>

          {/* 1 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              By enrolling in our courses or using our services, you confirm that you
              have read, understood, and agreed to these Terms & Conditions. If you do
              not agree, please discontinue use of our services.
            </p>
          </section>

          {/* 2 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              2. Eligibility
            </h2>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              <li>You must be at least 18 years old or have parental consent.</li>
              <li>You must provide accurate and complete registration details.</li>
              <li>Ryma Academy reserves the right to refuse service at its discretion.</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              3. Course Enrollment & Access
            </h2>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              <li>Enrollment grants a limited, non-transferable license.</li>
              <li>Sharing or reselling course content is strictly prohibited.</li>
              <li>Access duration depends on course-specific guidelines.</li>
            </ul>
          </section>

          {/* 4 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              4. Payments & Fees
            </h2>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              <li>Full payment is required before accessing course materials.</li>
              <li>Payments are non-transferable.</li>
              <li>Refunds are subject to our Refund & Cancellation Policy.</li>
              <li>Course fees may change without prior notice.</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              5. Code of Conduct
            </h2>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              <li>Respect instructors, staff, and fellow students.</li>
              <li>No harassment, discrimination, or abusive behavior.</li>
              <li>Plagiarism or unauthorized sharing is prohibited.</li>
            </ul>
          </section>

          {/* 6 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <Copyright className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              6. Intellectual Property
            </h2>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              All course materials, website content, and branding belong to
              Ryma Academy. Unauthorized use or distribution is prohibited.
            </p>
          </section>

          {/* 7 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              7. Limitation of Liability
            </h2>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              Ryma Academy is not liable for any direct or indirect damages arising
              from the use of our services. We do not guarantee job placement or
              specific outcomes.
            </p>
          </section>

          {/* 8 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              8. Termination
            </h2>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              Ryma Academy may suspend or terminate access if these Terms are violated.
            </p>
          </section>

          {/* 9 */}
          <section className="mb-6 sm:mb-8 md:mb-10">
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              9. Changes to Terms
            </h2>
            <p className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-700">
              These Terms may be updated periodically. Continued use implies acceptance
              of the revised terms.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#500E1B]" />
              10. Contact Us
            </h2>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5 xs:mt-0" />
                <span>services@rymaacademy.com</span>
              </li>
              <li className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5 xs:mt-0" />
                <span>+91-9873336133</span>
              </li>
              <li className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5 xs:mt-0" />
                <span>D-7/32, 1st Floor, Main Vishram Chowk, Sec-6 Rohini, Delhi-110085</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </section>
  );
}