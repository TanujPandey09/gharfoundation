"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "./Icon";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("ghar_cookie_consent");
      if (!consent) {
        // Show after a brief delay so it doesn't block initial page load
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ghar_cookie_consent", type);
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-[#EBEBEB] p-5 rounded-2xl shadow-2xl text-[#222222] space-y-3 ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center shrink-0">
              <Icon name="cookie" size={18} />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-[#222222]">
              Privacy &amp; Cookie Preferences
            </h4>
          </div>
          <button
            onClick={() => handleAccept("essential")}
            className="text-[#717171] hover:text-[#222222] text-xs p-1"
            title="Dismiss"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-[#717171] leading-relaxed">
          Ghar Foundation uses essential cookies to keep you signed in, protect against fraud, and comply with the Digital Personal Data Protection (DPDP) Act, 2023. Read our{" "}
          <Link href="/privacy" className="text-[#FF385C] underline font-semibold">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAccept("all")}
            className="flex-1 py-2 px-3 bg-[#222222] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 text-center"
          >
            Accept All
          </button>
          <button
            onClick={() => handleAccept("essential")}
            className="py-2 px-3 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222] text-xs font-bold rounded-xl border border-[#EBEBEB] transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}

