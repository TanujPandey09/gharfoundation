"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

/**
 * Local Uttarakhand Monetization Model (design-system/MASTER.md §8.3)
 * No monthly SaaS paywalls for landlords.
 * Real revenue from high-demand one-time services:
 * 1. 100% Free Owner Listing
 * 2. Police Verification + 11-Month Agreement Bundle (₹399)
 * 3. 7-Day Listing Boost (₹99)
 */
export default function PricingPage() {
  const services = [
    {
      name: "Free Owner Listing",
      tag: "Direct Homeowners",
      price: "₹0",
      period: "forever free",
      desc: "List your rental room set or flat yourself. Receive 100% free direct calls and WhatsApp inquiries from verified renters.",
      features: [
        "Direct phone calls & WhatsApp inquiries",
        "Active until your property is rented",
        "Full address and landmark visibility",
        "Family & Couple friendly preference badge",
        "Zero broker commissions",
      ],
      cta: "List Your Property Free",
      href: "/post-property",
      popular: false,
    },
    {
      name: "Police Verification + Agreement",
      tag: "Most Popular & Legally Safe",
      price: "₹399",
      period: "per tenant / one-time",
      desc: "Mandatory Uttarakhand police tenant verification submission plus lawyer-drafted 11-month digital rental agreement.",
      features: [
        "Uttarakhand Police tenant verification form",
        "Lawyer-verified 11-month rent agreement",
        "Instant digital PDF download & WhatsApp copy",
        "Tenant identity & Aadhaar KYC check",
        "No notary or police station visits required",
      ],
      cta: "Get Verification & Agreement",
      href: "/contact?service=verification",
      popular: true,
    },
    {
      name: "7-Day Fast Boost",
      tag: "Urgent Occupancy",
      price: "₹99",
      period: "for 7 days",
      desc: "Need to fill an empty room quickly? Feature your property at the top of local search results and the homepage.",
      features: [
        "Top placement on Dehradun & Haldwani search",
        "Prominent 'New & Featured' badge",
        "3x more tenant inquiries on average",
        "Broadcasted to active tenant waitlists",
        "Instant activation within 15 minutes",
      ],
      cta: "Boost Your Listing",
      href: "/contact?service=boost",
      popular: false,
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-5 pb-7 sm:pt-8 sm:pb-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-10 text-center">
          <span className="text-[#FF385C] text-xs font-bold uppercase tracking-wider bg-white/90 border border-[#FFD1D8] px-3.5 py-1 rounded-full inline-block">
            Simple &amp; Honest Pricing
          </span>
          <h1 className="mt-3 font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Listing is always free,{" "}
            <span className="text-[#FF385C]">pay only when you need services</span>
          </h1>
          <p className="mt-2.5 text-[#717171] text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Searching and contacting owners is <strong className="text-[#008A05] font-bold">100% free</strong> for renters. Property owners list freely without monthly subscription barriers.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-10 py-8 sm:py-12">

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {services.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                tier.popular
                  ? "bg-white border-2 border-[#FF385C] shadow-sm scale-[1.02]"
                  : "bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF385C] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Most Recommended
                </span>
              )}

              <div>
                <span className="text-xs font-bold text-[#717171] uppercase tracking-wider">
                  {tier.tag}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#222222] mt-1">
                  {tier.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 min-h-[48px]">
                  {tier.desc}
                </p>

                <div className="my-6 pt-5 border-t border-[#EBEBEB]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans font-extrabold text-3xl sm:text-4xl text-[#222222] tabular-nums">
                      {tier.price}
                    </span>
                    <span className="text-xs text-[#717171] font-medium ml-1">
                      / {tier.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#717171]">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Icon
                        name="check_circle"
                        size={16}
                        fill
                        className="text-[#008A05] shrink-0 mt-0.5"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={tier.href}
                className={`w-full py-3 text-xs sm:text-sm text-center ${
                  tier.popular
                    ? "btn-cta-primary"
                    : "btn-cta-secondary"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Local Verification FAQ Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB]">
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#222222] mb-2">
            Why is Police Tenant Verification mandatory in Uttarakhand?
          </h2>
          <p className="text-xs sm:text-sm text-[#717171] leading-relaxed max-w-3xl">
            Under Uttarakhand Police safety regulations, all property owners are required to submit tenant verification records. Ghar Foundation provides landlords and tenants with certified verification documentation and legal 11-month agreement formats, protecting both parties without the hassle of courthouse visits.
          </p>
        </div>
      </div>
    </div>
  );
}
