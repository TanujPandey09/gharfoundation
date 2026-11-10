"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of terms",
      desc: "By accessing or using Ghar Foundation, you agree to comply with and be bound by these terms of service. If you do not agree to these terms, please do not use our platform or services.",
    },
    {
      title: "2. User roles & responsibilities",
      desc: "Users can register as Renters (Tenants) or Owners (Landlords/Brokers). Renters must search and communicate in good faith. Owners must guarantee that listing descriptions, photos, pricing, and ownership documentation are accurate and genuine.",
    },
    {
      title: "3. Direct dealing & zero brokerage",
      desc: "Ghar Foundation operates as a matching directory and listing platform. We do not participate in negotiations or agreements between renters and owners. Direct owner listings have zero brokerage. Any broker listings must state brokerage terms upfront.",
    },
    {
      title: "4. Verification and safety",
      desc: "We make reasonable efforts to verify listings based on uploaded documents. However, we cannot guarantee absolute accuracy. Users are solely responsible for inspecting properties, verifying details in person, and avoiding advance payments prior to inspections.",
    },
    {
      title: "5. Digital rental agreements",
      desc: "Digital e-stamped agreement creation is provided as a utility tool. Legal validity depends on accuracy of inputs provided by owners and renters. Users are responsible for paying any government stamp duty charges.",
    },
    {
      title: "6. Limitation of liability",
      desc: "Ghar Foundation, its directors, and team shall not be liable for any disputes, damage, loss of money, property damage, or rental agreement breaches between tenants and owners.",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-5 pb-7 sm:pt-8 sm:pb-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Terms of service
          </h1>
          <p className="mt-2 text-[#717171] text-xs sm:text-sm">
            Last updated: July 15, 2026
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Content Details */}
        <div className="bg-white border border-[#EBEBEB] p-8 md:p-10 rounded-3xl shadow-sm space-y-8">
          <p className="text-[13px] text-[#717171] leading-relaxed border-b border-[#EBEBEB] pb-6">
            Please read these terms of service carefully before using the website. By accessing or registering on Ghar Foundation, you acknowledge that you have read, understood, and agreed to be bound by these conditions.
          </p>

          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-[14px] sm:text-[15px] font-bold text-[#222222]">
                  {section.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#717171] leading-relaxed font-light">
                  {section.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#EBEBEB] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <span className="text-[#717171]">Questions about our terms?</span>
            <Link
              href="/contact"
              className="text-[#FF385C] hover:bg-[#FFF0F2] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Get in touch with support</span>
              <Icon name="arrow_forward" size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
