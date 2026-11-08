"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

export default function AboutPage() {
  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 text-[#222222]">
        <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <h1 className="font-display font-extrabold text-[2rem] sm:text-[3rem] tracking-tight text-[#222222]">
            Uttarakhand's direct rental network
          </h1>
          <p className="mt-4 text-[#717171] max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            Connecting tenants, homeowners, and local verified brokers across all 13 districts. Direct, transparent, and completely free of hidden brokerage.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 md:py-24 space-y-20">
        
        {/* Our Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-[22px] md:text-[28px] font-bold tracking-tight text-[#222222]">
              Our mission
            </h2>
            <p className="mt-4 text-[#717171] text-sm sm:text-base leading-relaxed">
              We started Ghar Foundation to solve a persistent issue in Uttarakhand: the difficulty of finding verified rentals without paying exorbitant brokerage fees. 
              By providing an open platform, we facilitate direct communication between renters and owners. Whether it is a cozy student room set in Dehradun, a PG near ashrams in Rishikesh, or a commercial space in Haldwani, we make finding a home simple.
            </p>
            <p className="mt-4 text-[#717171] text-sm sm:text-base leading-relaxed">
              We are committed to verifying listings and creating digital rental agreements to guarantee safety, convenience, and transparency for every user on our platform.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#EBEBEB] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-rausch-50 rounded-full blur-xl pointer-events-none" />
            <h3 className="font-display text-lg font-bold text-[#222222] mb-6">
              Our core principles
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="p-1 rounded-lg bg-forest-50 text-forest-700 shrink-0">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <h4 className="text-[14px] font-bold text-[#222222] mb-1">Zero hidden brokerage</h4>
                  <p className="text-xs text-[#717171] mt-0.5">Direct landlord contact means no middlemen taking commissions.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-1 rounded-lg bg-forest-50 text-forest-700 shrink-0">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <h4 className="text-[14px] font-bold text-[#222222] mb-1">100% verified listings</h4>
                  <p className="text-xs text-[#717171] mt-0.5">Documents verified before listings go public to ensure reliability.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-1 rounded-lg bg-forest-50 text-forest-700 shrink-0">
                  <Icon name="check" size={16} />
                </span>
                <div>
                  <h4 className="text-[14px] font-bold text-[#222222] mb-1">Local community first</h4>
                  <p className="text-xs text-[#717171] mt-0.5">Supporting local homeowners, students, and professionals in Uttarakhand.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Coverage Section */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] p-8 md:p-12 shadow-sm">
          <div className="max-w-2xl mb-8 md:mb-12">
            <h2 className="font-display text-[22px] md:text-[28px] font-bold tracking-tight text-[#222222]">
              Wide coverage across Uttarakhand
            </h2>
            <p className="mt-2 text-[#717171] text-sm">
              We cover all 13 districts from plains to the high hills, making it convenient to locate rentals anywhere in the state.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie", "Haldwani", "Roorkee", "Almora", "Pauri", "Tehri", "Pithoragarh", "Chamoli"].map((city) => (
              <Link 
                key={city}
                href={`/search?city=${city}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#FF385C] hover:text-[#FF385C] transition-all duration-300 group"
              >
                <span className="text-[13px] font-semibold text-[#222222] group-hover:text-[#FF385C] transition-colors">
                  {city}
                </span>
                <span className="text-[#B0B0B0] group-hover:text-[#FF385C] translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <Icon name="arrow_outward" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-8">
          <h3 className="font-display text-[20px] md:text-[24px] font-bold tracking-tight text-[#222222]">
            Ready to find your next home?
          </h3>
          <p className="mt-2 text-[#717171] text-sm max-w-md mx-auto">
            Browse through hundreds of verified rooms, flats, PGs, and commercial spaces.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link 
              href="/search"
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              Browse homes
            </Link>
            <Link 
              href="/post-property"
              className="bg-[#222222] hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            >
              List your property
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
