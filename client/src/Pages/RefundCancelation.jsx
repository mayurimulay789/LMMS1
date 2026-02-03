"use client";

import { useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function RefundCancelation() {
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
              Refund & Cancellation Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Effective Date: <span className="font-medium">2026</span>
            </p>
          </div>

          {/* Intro */}
          <p className="text-[16px] leading-7 text-gray-700 mb-8">
            At <strong className="font-medium text-gray-900">Ryma Academy</strong>, we
            strive to provide the best learning experience. This policy explains how
            cancellations and refunds are handled.
          </p>

          {/* 1 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <CreditCard className="w-5 h-5 text-[#500E1B]" />
              1. Payment Methods
            </h2>
            <p className="text-[17px] leading-7 text-gray-700 mb-3">
              Ryma Academy accepts Visa, MasterCard, American Express, and select
              Debit Cards. By making a payment, you agree to provide accurate
              payment details to our authorized payment gateways.
            </p>
            <p className="text-[17px] leading-7 text-gray-700">
              Payment details are processed securely and are not shared with third
              parties except for fraud prevention or legal compliance. You are
              responsible for maintaining the security of your payment information.
            </p>
          </section>

          {/* 2 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <CheckCircle className="w-5 h-5 text-[#500E1B]" />
              2. Order Confirmation
            </h2>
            <p className="text-[17px] leading-7 text-gray-700">
              If you do not receive an order confirmation email or experience an
              issue during payment, it is your responsibility to verify the
              transaction with our support team. Ryma Academy is not liable for
              losses due to unverified orders.
            </p>
          </section>

          {/* 3 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <XCircle className="w-5 h-5 text-[#500E1B]" />
              3. Cancellation Policy
            </h2>

            <p className="font-medium text-gray-900 mb-2">
              Cancellation by Ryma Academy
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[17px] leading-7 text-gray-700 mb-4">
              <li>Unavailability of the course or service.</li>
              <li>Errors in pricing or course details.</li>
              <li>Issues identified by fraud prevention systems.</li>
            </ul>
            <p className="text-[17px] leading-7 text-gray-700 mb-4">
              If Ryma Academy cancels an enrollment after payment, the full amount
              will be refunded.
            </p>

            <p className="font-medium text-gray-900 mb-2">
              Cancellation by the User
            </p>
            <p className="text-[17px] leading-7 text-gray-700">
              Cancellation requests are reviewed on a case-by-case basis. Orders
              that have already been processed may not be eligible for cancellation.
              Ryma Academy’s decision is final.
            </p>
          </section>

          {/* 4 */}
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <RotateCcw className="w-5 h-5 text-[#500E1B]" />
              4. Refund Policy
            </h2>
            <p className="text-[17px] leading-7 text-gray-700 mb-3">
              If a cancellation request is approved before course commencement, a
              full refund will be issued. Refund requests after the course has
              started will be evaluated individually and may include deductions.
            </p>
            <p className="text-[17px] leading-7 text-gray-700">
              Promotional discounts or coupon codes used during enrollment are
              non-refundable.
            </p>
          </section>

          {/* Non-refundable */}
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#500E1B]" />
              Non-Refundable Cases
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[17px] leading-7 text-gray-700">
              <li>Services purchased for commercial resale.</li>
              <li>Multiple enrollments for the same course at the same address.</li>
              <li>Bulk enrollments failing internal verification checks.</li>
              <li>Incorrect, misleading, or fraudulent registration information.</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-3">
              <Mail className="w-5 h-5 text-[#500E1B]" />
              5. Contact Us
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
