"use client";

import {
  ShieldCheck,
  FileText,
  User,
  Lock,
  Cookie,
  ExternalLink,
  RefreshCcw,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { useEffect } from "react";

export default function PrivacyPolicy() {
    useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  return (
    <section className="py-12 bg-[#F8F9FB] md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Effective Date: <span className="font-medium">[Insert Date]</span>
            </p>
          </div>

          {/* Intro */}
          <p className="text-[16px] leading-7 text-gray-700 mb-8">
            <strong className="font-medium text-gray-900">At Ryma Academy</strong>, your trust is our priority.
            This Privacy Policy outlines how we collect, use, and protect your personal data
            when you interact with our services.
          </p>

          {/* 1 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <User className="w-5 h-5 text-[#500E1B]" />
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[17px] leading-7 text-gray-700">
              <li><strong>Personal Information:</strong> Name, email, phone number, and address.</li>
              <li><strong>Payment Information:</strong> Billing details for enrollment.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, cookies.</li>
              <li><strong>Course Interaction:</strong> Enrollment, progress, feedback.</li>
            </ul>
          </section>

          {/* 2 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <FileText className="w-5 h-5 text-[#500E1B]" />
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[17px] leading-7 text-gray-700">
              <li>Provide and improve our services.</li>
              <li>Communicate updates, admissions, promotions.</li>
              <li>Process payments securely.</li>
              <li>Personalize learning experience.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <ExternalLink className="w-5 h-5 text-[#500E1B]" />
              3. Data Sharing
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              We never sell or rent your data. Data is shared only with trusted partners
              for service delivery or when required by law.
            </p>
          </section>

          {/* 4 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <Lock className="w-5 h-5 text-[#500E1B]" />
              4. Data Security
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              We use encryption, secure servers, and restricted access. However,
              no method of internet transmission is completely secure.
            </p>
          </section>

          {/* 5 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#500E1B]" />
              5. Your Rights
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[17px] leading-7 text-gray-700">
              <li>Access and review your data.</li>
              <li>Request corrections or deletion.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
          </section>

          {/* 6 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <Cookie className="w-5 h-5 text-[#500E1B]" />
              6. Cookies and Tracking
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              Cookies help improve your experience. You may disable them via browser settings.
            </p>
          </section>

          {/* 7 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <ExternalLink className="w-5 h-5 text-[#500E1B]" />
              7. Third-Party Links
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              We are not responsible for external websites’ privacy practices.
            </p>
          </section>

          {/* 8 */}
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <RefreshCcw className="w-5 h-5 text-[#500E1B]" />
              8. Changes to This Policy
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              This policy may be updated periodically. Please review it regularly.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <Mail className="w-5 h-5 text-[#500E1B]" />
              9. Contact Us
            </h2>
            <ul className="space-y-2 text-[17px] text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                services@rymaacademy.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                +91-9873336133
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                D-7/32, 1st Floor, Main Vishram Chowk, Sec-6 Rohini, Delhi-110085
              </li>
            </ul>
          </section>

        </div>
      </div>
    </section>
  );
}
