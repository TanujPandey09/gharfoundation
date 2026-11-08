"use client";

import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";

export default function SafetyTipsPage() {
  const renterTips = [
    {
      title: "Inspect properties in person",
      desc: "Never send money before visiting the property yourself. Walk around to check the building condition, water supply, electricity meter, and locks.",
      icon: "visibility",
    },
    {
      title: "Verify owner identification",
      desc: "Ask the owner for basic identity proof (Aadhaar or PAN) and proof of property ownership (recent electricity bill, registry photocopy, or tax receipt) before signing an agreement.",
      icon: "badge",
    },
    {
      title: "Insist on written agreements",
      desc: "Never rely on verbal promises. Always generate a legal rental agreement. You can use Ghar Foundation's digital e-stamping agreement builder for an easy solution.",
      icon: "description",
    },
    {
      title: "Beware of low pricing",
      desc: "If a luxury apartment is offered at an extremely low rent compared to local market rates, it could be a scam. Do research on average rents in that specific area.",
      icon: "report_problem",
    },
  ];

  const ownerTips = [
    {
      title: "Request identity verification",
      desc: "Always ask prospective tenants to share a valid government ID (Aadhaar/Voter ID) and employment details before giving them the house keys.",
      icon: "fingerprint",
    },
    {
      title: "Register the rental agreement",
      desc: "A registered agreement is legally binding and protects you in case of dispute. Make sure the security deposit and notice period are clearly written.",
      icon: "verified_user",
    },
    {
      title: "Perform periodic check-ins",
      desc: "Keep a healthy relationship with your tenants. Visit the property occasionally with prior notice to make sure it is well-maintained.",
      icon: "domain",
    },
  ];

  return (
    <div className="bg-white text-[#222222] min-h-screen font-sans py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-[#C13515] text-xs font-bold uppercase tracking-wider bg-[#FFF1F0] text-[#C13515] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1">
            <Icon name="gavel" size={14} />
            Safety center
          </span>
          <h1 className="mt-4 font-display font-extrabold text-[2.25rem] tracking-tight text-[#222222]">
            Safe renting guidelines
          </h1>
          <p className="mt-3 text-[#717171] text-sm sm:text-base leading-relaxed">
            Your safety and trust are our top priorities. Follow these simple tips to secure a happy and scam-free rental experience in Uttarakhand.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Renters */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="p-1.5 rounded-xl bg-rausch-100 text-[#FF385C] shrink-0">
                <Icon name="person" size={20} />
              </span>
              <h2 className="font-display text-lg font-bold text-[#222222]">
                Tips for renters
              </h2>
            </div>
            
            <div className="space-y-4">
              {renterTips.map((tip) => (
                <div
                  key={tip.title}
                  className="bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] text-[#717171] flex items-center justify-center shrink-0">
                      <Icon name={tip.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#222222]">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-[#717171] mt-1.5 leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Owners */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="p-1.5 rounded-xl bg-rausch-100 text-[#FF385C] shrink-0">
                <Icon name="home" size={20} />
              </span>
              <h2 className="font-display text-lg font-bold text-[#222222]">
                Tips for property owners
              </h2>
            </div>

            <div className="space-y-4">
              {ownerTips.map((tip) => (
                <div
                  key={tip.title}
                  className="bg-white p-6 rounded-3xl border border-[#EBEBEB] shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] text-[#717171] flex items-center justify-center shrink-0">
                      <Icon name={tip.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#222222]">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-[#717171] mt-1.5 leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-16 md:mt-24 bg-[#FFF1F0] border border-[#FEE2E2] p-8 rounded-3xl shadow-sm max-w-4xl mx-auto flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#C13515] flex items-center justify-center shrink-0">
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#C13515]">
              Crucial reminder: Never pay in advance!
            </h3>
            <p className="text-xs text-[#717171] mt-1.5 leading-relaxed">
              If any homeowner or broker requests an advance booking amount or 'security pass fee' over the phone before you have visited the property in person, please stop and report them immediately. Ghar Foundation does NOT support advance payments of any kind before property inspections.
            </p>
            <div className="mt-4">
              <Link
                href="/contact"
                className="text-[#C13515] text-xs font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Report a suspicious listing</span>
                <Icon name="arrow_forward" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
