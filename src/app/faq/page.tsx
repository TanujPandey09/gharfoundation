"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

type FaqItem = {
  q: string;
  a: string;
  category: "general" | "tenant" | "owner";
};

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState<"all" | "general" | "tenant" | "owner">("all");
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
    "0": true,
  });

  const toggleItem = (idx: string) => {
    setOpenItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const faqs: FaqItem[] = [
    {
      category: "general",
      q: "Is using this platform really free for renters?",
      a: "Yes. Searching, viewing listings, and contacting owners or brokers is completely free. We never charge renters a fee for finding or contacting a listing.",
    },
    {
      category: "general",
      q: "How do you verify listings?",
      a: "Our team checks ownership documents (Aadhaar, property tax receipts, rental agreement history) before a listing goes live. Verified listings show a green Verified badge. We also do random on-site checks.",
    },
    {
      category: "general",
      q: "Will I pay any brokerage?",
      a: "If you contact a listing marked 'Owner', there is zero brokerage. Some listings are posted by brokers — those are clearly labelled, and any brokerage is shown upfront in the listing details.",
    },
    {
      category: "tenant",
      q: "Can I get the rental agreement digitally?",
      a: "Yes. Once you and the owner agree on terms, you can generate a legally-binding e-stamped rental agreement online. It typically takes under 10 minutes and is valid across India.",
    },
    {
      category: "tenant",
      q: "How do I schedule a property tour?",
      a: "You can click the 'Schedule Tour' button on any property listing page. Select your preferred date and time, and the owner will confirm the appointment via SMS/WhatsApp or in-app dashboard.",
    },
    {
      category: "tenant",
      q: "What security deposits are typical in Uttarakhand?",
      a: "Security deposits generally range from 1 to 2 months' rent in cities like Dehradun and Rishikesh. For hill locations (Mussoorie, Nainital), this might vary slightly depending on seasonal rentals. Always clarify this directly with the owner before paying.",
    },
    {
      category: "owner",
      q: "How do I list my property?",
      a: "You can sign up and click 'List property' in the header. Choose your workspace, fill in details (amenities, location, photos, monthly rent), upload your ownership verification documents, and submit it for audit.",
    },
    {
      category: "owner",
      q: "Can I list multiple rooms or PG sets in one listing?",
      a: "Yes, you can specify if the property is a room, a PG unit, an independent BHK flat, or a villa. If you have multiple distinct rooms in a PG set, you can easily create separate units under your owner portal.",
    },
    {
      category: "owner",
      q: "How does tenant screening work?",
      a: "When a tenant contacts you, you can request their basic verification details via the app. If you are on the Pro plan, we fast-track basic profile validations (employment, identity) so you have peace of mind.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) => activeTab === "all" || faq.category === activeTab
  );

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-display font-extrabold text-[2.25rem] tracking-tight text-[#222222]">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-[#717171] text-sm sm:text-base">
            Everything you need to know about renting or listing properties in Uttarakhand.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex justify-center gap-1.5 p-1 bg-[#F7F7F7]/50 rounded-2xl mb-10">
          {(["all", "general", "tenant", "owner"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setOpenItems({});
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-[#222222] shadow-sm"
                  : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              {tab === "all" ? "show all" : tab}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openItems[idx.toString()] || false;
            return (
              <div
                key={faq.q}
                className={`bg-white rounded-3xl border border-[#EBEBEB] transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#FF385C]/40 shadow-sm"
                    : "border-[#EBEBEB] hover:border-[#B0B0B0]"
                }`}
              >
                <button
                  onClick={() => toggleItem(idx.toString())}
                  className="w-full flex items-center justify-between p-6 text-left gap-4"
                >
                  <span className="text-[14px] sm:text-[15px] font-semibold text-[#222222]">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? "bg-[#FF385C] text-white rotate-180"
                        : "bg-[#F7F7F7] text-[#717171]"
                    }`}
                  >
                    <Icon name="expand_more" size={18} />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[13px] sm:text-[14px] text-[#717171] leading-[1.7] px-6 pb-6 border-t border-[#EBEBEB] pt-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center">
          <p className="text-xs text-[#717171]">
            Have a different question not listed here?
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 bg-[#FF385C] hover:bg-[#E00B41] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm shadow-[#FF385C]/10 transition-all active:scale-[0.98]"
            >
              <Icon name="email" size={16} />
              <span>Contact support team</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
