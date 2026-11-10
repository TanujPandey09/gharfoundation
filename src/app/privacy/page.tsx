"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      desc: "We collect information you provide directly, including your name, email address, phone number, role preference (Tenant, Owner, Broker), and property listing details. When you undergo voluntary KYC verification, we process masked Aadhaar numbers (showing only the last 4 digits) strictly in accordance with UIDAI and Indian DPDP guidelines.",
    },
    {
      title: "2. How We Use Your Information",
      desc: "Your data is used to facilitate direct connections between verified tenants and property owners in Uttarakhand, power regional searches across the 13 districts, verify listing authenticity, prevent fraudulent submissions, and deliver transaction updates (such as tour bookings and inquiry alerts).",
    },
    {
      title: "3. Direct Contact & Telephone Privacy",
      desc: "Ghar Foundation operates as a direct-connection directory. When an owner posts a listing, their contact telephone or WhatsApp handle is made visible to registered users to eliminate broker fees. Tenants can initiate direct calls or WhatsApp messages. We never sell or lease your personal contact information to third-party telemarketers.",
    },
    {
      title: "4. Aadhaar and Identity Verification Privacy",
      desc: "In compliance with Indian regulations, full 12-digit Aadhaar numbers are never stored in plain text on our servers. Uploaded verification documents are stored in encrypted object storage and are solely accessible to authorized platform moderators to grant 'Verified Owner' or 'Verified Tenant' badges.",
    },
    {
      title: "5. Cookies & Local Data Storage",
      desc: "We use essential cookies and browser local storage to preserve your theme preference, your saved favorite properties, and your active session credentials. We do not use third-party tracking pixels to track your activity across unrelated websites.",
    },
    {
      title: "6. Data Retention & Deletion",
      desc: "You have the right to request deletion of your account and personal listings at any time through your dashboard settings or by contacting our support desk. Upon request, your account and associated listings will be permanently expunged within 30 business days.",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-5 pb-7 sm:pt-8 sm:pb-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/90 border border-[#C8E6C9] text-[#008A05] text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Icon name="verified_user" size={14} className="text-[#008A05]" />
            <span>Digital Personal Data Protection (DPDP) Aligned</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-[#717171] text-xs sm:text-sm">
            Last updated: November 2026 · Ghar Foundation (Uttarakhand, India)
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Content Details */}
        <div className="bg-white border border-[#EBEBEB] p-8 md:p-10 rounded-3xl shadow-sm space-y-8">
          <p className="text-[13px] text-[#717171] leading-relaxed border-b border-[#EBEBEB] pb-6">
            Ghar Foundation (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy, safety, and personal data of renters and homeowners across Uttarakhand. This Privacy Policy outlines our transparent data practices.
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
            <span className="text-[#717171]">Questions or data privacy requests?</span>
            <Link
              href="/contact"
              className="text-[#2E7D32] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Contact Privacy Officer</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

