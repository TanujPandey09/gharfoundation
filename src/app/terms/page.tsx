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
      title: "3. Direct dealing & zero brokerage guarantee",
      desc: "Ghar Foundation operates as a direct-owner rental network. We strictly prohibit third-party broker syndicates and unauthorized middleman fees. Every listing is intended to connect renters directly with verified homeowners or caretakers with ₹0 brokerage.",
    },
    {
      title: "4. Verification and safety",
      desc: "We make reasonable efforts to verify listings based on uploaded Aadhaar KYC and property documents. However, users are advised to inspect properties in person and verify all physical amenities before signing leases. Never pay cash advance before visiting.",
    },
    {
      title: "5. Digital rental agreements & police verification",
      desc: "Our automated 11-month lease drafts and Uttarakhand Police verification forms are provided as legal self-service compliance tools. Users are responsible for procuring statutory non-judicial e-Stamp papers.",
    },
    {
      title: "6. Limitation of liability",
      desc: "Ghar Foundation operates as an intermediary platform connecting landlords and tenants. Users agree to abide by the Uttarakhand Police Act and state tenancy regulations.",
    },
    {
      title: "7. Grievance Officer (IT Rules, 2021)",
      desc: "Grievance Officer: Tanuj Pandey, Email: grievance@gharfoundation.com / support@gharfoundation.com, Address: Plot No. 12, IT Park, Sahastradhara Road, Dehradun, Uttarakhand 248013. Acknowledged within 24 hours and resolved within 15 days.",
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
