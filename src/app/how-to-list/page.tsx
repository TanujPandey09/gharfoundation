"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

export default function HowToListPage() {
  const steps = [
    {
      step: "01",
      title: "Create your account",
      desc: "Sign up as an Owner or Broker on Ghar Foundation. Complete your basic profile verification settings in under 2 minutes.",
      icon: "person_add",
    },
    {
      step: "02",
      title: "Provide property details",
      desc: "Fill in information about your space: category (flat, room set, PG), dimensions, rent details, available amenities, and location landmarks.",
      icon: "maps_home_work",
    },
    {
      step: "03",
      title: "Add high-quality photos",
      desc: "Take clear photos of the bedrooms, bathrooms, and kitchen in daylight. Listings with good photos get up to 5x more inquiries.",
      icon: "photo_camera",
    },
    {
      step: "04",
      title: "Verify ownership & publish",
      desc: "Upload proof of property ownership (electricity bill or registration copy). Our team will audit the details and publish the listing live.",
      icon: "verified",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-[1000px] mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-[#FF385C] text-xs font-bold uppercase tracking-wider bg-[#FFF0F2] px-3.5 py-1.5 rounded-full">
            List your space
          </span>
          <h1 className="mt-4 font-display font-extrabold text-[2.25rem] tracking-tight text-[#222222]">
            How to list your property
          </h1>
          <p className="mt-3 text-[#717171] text-sm sm:text-base leading-relaxed">
            Follow our simple step-by-step guide to list your properties and connect directly with verified renters in Uttarakhand.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-8 md:space-y-12 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#EBEBEB] before:hidden md:before:block">
          {steps.map((item, idx) => (
            <div key={item.step} className="flex flex-col md:flex-row gap-6 md:gap-10 relative">
              {/* Step circle indicator */}
              <div className="hidden md:flex w-12 h-12 rounded-full bg-white border-2 border-[#FF385C]/40 text-[#FF385C] font-bold text-[14px] items-center justify-center shrink-0 z-10 shadow-sm">
                {item.step}
              </div>

              {/* Step Card */}
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-[#EBEBEB] shadow-sm flex gap-4 md:gap-6">
                <div className="w-12 h-12 rounded-2xl bg-rausch-100 text-[#FF385C] flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="md:hidden text-xs font-bold text-[#FF385C]">{item.step}.</span>
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-[#222222]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action CTA Box */}
        <div className="mt-20 bg-white border border-[#EBEBEB] rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <h2 className="font-display text-[20px] md:text-[24px] font-bold tracking-tight text-[#222222]">
            Ready to reach thousands of tenants?
          </h2>
          <p className="mt-2 text-[#717171] text-sm max-w-md mx-auto">
            Get started by creating your listing today. Verification usually takes less than 12 hours.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/post-property"
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-6 py-3.5 rounded-xl text-xs font-bold shadow-sm shadow-[#FF385C]/10 transition-all active:scale-[0.98]"
            >
              List your property now
            </Link>
            <Link
              href="/pricing"
              className="bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] px-6 py-3.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            >
              View pricing details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
