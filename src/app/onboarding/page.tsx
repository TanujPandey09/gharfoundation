"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setOnboardingOption } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // Start at Step 1 of 3

  // Step 1: How will you use Ghar Foundation?
  const [roleOption, setRoleOption] = useState<"FIND_HOME" | "LIST_PROPERTY" | "BOTH" | null>(null);

  // Step 2: Search Preferences
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState(50000);
  const [propertyType, setPropertyType] = useState<"Flat" | "Villa" | "Studio" | "Penthouse">("Villa");
  const [moveInDate, setMoveInDate] = useState("2026-08-05");

  // Step 3: Interactive elements
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  // Read query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const url = params.get("redirect_url") || "/dashboard";
      setRedirectUrl(url);
    }
  }, []);

  const handleNextStep = () => {
    if (step === 1) {
      if (!roleOption) {
        showToast("Please select how you want to use Ghar Foundation.", "warning");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!city) {
        showToast("Please select your preferred city", "warning");
        return;
      }
      // Apply the onboarding option state updates
      if (roleOption) setOnboardingOption(roleOption);
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalRedirect = (target: string) => {
    showToast("Profile onboarding completed successfully!", "success");
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans transition-colors">
      
      {/* HEADER BAR (Spans full width) */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-5 bg-white z-20">
        <Link href="/" className="font-sans font-black text-2xl text-[#222222] tracking-tight hover:opacity-90">
          Ghar Foundation
        </Link>
        <div className="flex items-center space-x-6">
          {step === 2 && (
            <span className="text-sm font-semibold text-[#717171]">
              Step 2 of 3
            </span>
          )}
          <Link
            href="/faq"
            className="text-sm font-semibold text-[#717171] hover:text-[#FF385C] transition-colors"
          >
            Help & FAQ
          </Link>
        </div>
      </header>
      
      {/* Separator for header in step 2 */}
      {step === 2 && <div className="w-full h-px bg-[#EBEBEB]" />}

      {/* STEP 1: Account Setup */}
      {step === 1 && (
        <div className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-6 max-w-5xl mx-auto w-full">
          
          {/* Progress Indicator */}
          <div className="w-full max-w-xl space-y-2 mb-6">
            <div className="flex justify-between text-[11px] font-bold text-[#717171] uppercase tracking-widest">
              <span>STEP 1 OF 3</span>
              <span className="text-[#222222] text-[#222222] capitalize tracking-normal">Account Setup</span>
            </div>
            <div className="h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF385C] bg-[#008A05] w-1/3 rounded-full transition-all duration-500" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 max-w-xl mb-8">
            <h2 className="text-3xl font-sans font-bold text-[#222222] tracking-tight">
              How will you use Ghar Foundation?
            </h2>
            <p className="text-[14px] text-[#717171] font-medium">
              Select the primary purpose for your account. You can always change these settings later in your profile.
            </p>
          </div>

          {/* Selection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-8">
            
            {/* Card 1: Find a Home */}
            <button
              onClick={() => setRoleOption("FIND_HOME")}
              className={`bg-[#F7F7F7] rounded-[16px] overflow-hidden text-center border p-5 space-y-4 transition-all duration-200 flex flex-col items-center justify-start h-[280px] ${
                roleOption === "FIND_HOME"
                  ? "border-[#FF385C] ring-1 ring-[#FF385C] shadow-md"
                  : "border-[#EBEBEB]/80 shadow-sm hover:border-[#B0B0B0]"
              }`}
            >
              <div className="w-full h-32 rounded-xl overflow-hidden bg-[#D1DFFA] flex items-center justify-center p-2">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80"
                  alt="Find a Home"
                  className="w-full h-full object-cover rounded-lg mix-blend-multiply opacity-90"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#222222]">
                  Find a Home
                </h3>
                <p className="text-sm text-[#717171] leading-relaxed font-medium px-2">
                  I'm looking to rent premium properties and sign agreements.
                </p>
              </div>
            </button>

            {/* Card 2: List Property */}
            <button
              onClick={() => setRoleOption("LIST_PROPERTY")}
              className={`bg-[#F7F7F7] rounded-[16px] overflow-hidden text-center border p-5 space-y-4 transition-all duration-200 flex flex-col items-center justify-start h-[280px] ${
                roleOption === "LIST_PROPERTY"
                  ? "border-[#FF385C] ring-1 ring-[#FF385C] shadow-md"
                  : "border-[#EBEBEB]/80 shadow-sm hover:border-[#B0B0B0]"
              }`}
            >
              <div className="w-full h-32 rounded-xl overflow-hidden bg-[#C9E2F5] flex items-center justify-center p-2">
                <img
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&auto=format&fit=crop&q=80"
                  alt="List Property"
                  className="w-full h-full object-cover rounded-lg mix-blend-multiply opacity-90"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#222222]">
                  List Property
                </h3>
                <p className="text-sm text-[#717171] leading-relaxed font-medium px-2">
                  I want to list properties and manage my rental portfolio.
                </p>
              </div>
            </button>

            {/* Card 3: Both */}
            <button
              onClick={() => setRoleOption("BOTH")}
              className={`bg-[#F7F7F7] rounded-[16px] overflow-hidden text-center border p-5 space-y-4 transition-all duration-200 flex flex-col items-center justify-start h-[280px] ${
                roleOption === "BOTH"
                  ? "border-[#FF385C] ring-1 ring-[#FF385C] shadow-md"
                  : "border-[#EBEBEB]/80 shadow-sm hover:border-[#B0B0B0]"
              }`}
            >
              <div className="w-full h-32 rounded-xl overflow-hidden bg-[#F1F3F5] flex items-center justify-center p-4">
                <Icon name="search" size={48} className="text-[#222222] opacity-80" />
                <Icon name="home" size={64} className="text-[#10b981] -ml-6 mt-4 opacity-90" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#222222]">
                  Both
                </h3>
                <p className="text-sm text-[#717171] leading-relaxed font-medium px-2">
                  I'm interested in both listing and renting on the platform.
                </p>
              </div>
            </button>

          </div>

          {/* Action buttons */}
          <div className="w-full max-w-sm space-y-4 text-center">
            <button
              onClick={handleNextStep}
              className="w-full bg-[#7988A4] hover:bg-[#687691] text-white font-semibold py-3.5 rounded-lg text-sm text-center transition-colors shadow-sm"
            >
              Continue to Profile Setup
            </button>
            <Link
              href="/login"
              className="block text-sm font-semibold text-[#7988A4] hover:text-[#222222] transition-colors"
            >
              Back to Login
            </Link>
          </div>

          {/* Footer Features Info */}
          <div className="w-full max-w-4xl mt-12 pt-6 border-t border-[#EBEBEB]/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-3">
                <div className="text-[#222222] text-[#008A05] mt-0.5">
                  <Icon name="verified" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#222222] mb-1">KYC Verified</h4>
                  <p className="text-xs text-[#717171] leading-relaxed font-medium pr-4">Verified profiles increase trust by 85% for both parties.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-[#222222] text-[#008A05] mt-0.5">
                  <Icon name="gavel" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#222222] mb-1">Smart Agreements</h4>
                  <p className="text-xs text-[#717171] leading-relaxed font-medium pr-4">Generate legally binding rental agreements in seconds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-[#222222] text-[#008A05] mt-0.5">
                  <Icon name="support_agent" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#222222] mb-1">24/7 Support</h4>
                  <p className="text-xs text-[#717171] leading-relaxed font-medium pr-4">Our premium support team is here to help at every step.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: Tailor Your Search (Split Layout) */}
      {step === 2 && (
        <div className="flex-grow flex flex-col lg:flex-row bg-white">
          
          {/* LEFT PANEL */}
          <div className="w-full lg:w-1/2 bg-[#DDE5FF] bg-[#F7F7F7] flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden min-h-[400px] lg:min-h-0">
            <div className="max-w-md text-center space-y-3 z-10 mb-8">
              <h1 className="text-3xl lg:text-4xl font-sans font-bold text-[#222222] text-[#222222] leading-tight">
                Find Your Next Home, Easily
              </h1>
              <p className="text-[15px] text-[#717171] leading-relaxed font-medium">
                Explore rentals and schedule viewings in one place.
              </p>
            </div>

            {/* Simulated Map Illustration */}
            <div className="relative w-full max-w-[400px] aspect-square bg-[#EAF0FF] bg-[#F7F7F7] rounded-[24px] shadow-xl p-8 border border-white/40 flex flex-col justify-between overflow-hidden">
              <div className="text-center mb-6">
                <h3 className="font-bold text-2xl text-[#222222] text-[#222222] tracking-tight">Find Your Next Home, Easily</h3>
                <p className="text-[13px] text-[#717171] mt-1">Explore rentals and schedule viewings in one place.</p>
              </div>

              <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                 <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop&q=80"
                  alt="Map"
                  className="w-full h-full object-cover mix-blend-overlay opacity-80"
                />
                
                {/* Floating Map Pin 1 */}
                <div className="absolute top-10 left-10 bg-white/90 backdrop-blur-sm border border-[#EBEBEB] rounded-full p-2 shadow-lg flex items-center justify-center text-[#717171]">
                  <Icon name="home" size={20} />
                </div>

                {/* Floating Map Pin 2 */}
                <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-sm border border-[#EBEBEB] rounded-full p-2 shadow-lg flex items-center justify-center text-[#717171]">
                  <Icon name="home" size={20} />
                </div>

                {/* Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-3 shadow-xl flex flex-col items-center">
                   <div className="bg-[#DDE5FF] text-[#10b981] p-2 rounded-lg mb-2">
                      <Icon name="today" size={24} />
                   </div>
                   <div className="text-[#E5B57A]">
                      <Icon name="check" size={28} className="font-bold" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL (Preferences wizard) */}
          <div className="w-full lg:w-1/2 bg-[#F7F7F7] flex flex-col justify-start p-10 lg:py-16 lg:px-20 relative">
            <div className="max-w-md w-full mx-auto flex flex-col h-full">
                <div className="flex gap-2 mb-10 w-20">
                  <div className="h-1.5 flex-1 rounded-full bg-[#EBEBEB]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#FF385C] bg-[#008A05]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#EBEBEB]" />
                </div>

                <div className="flex flex-col justify-start w-full space-y-6">
                  <div className="space-y-2 mb-2">
                    <h2 className="text-2xl font-bold tracking-tight text-[#222222] font-sans">
                      Tailor Your Search
                    </h2>
                    <p className="text-[15px] text-[#717171] leading-relaxed font-medium">
                      Help us curate the best premium listings based on your lifestyle and budget.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#717171]">Preferred City</label>
                      <div className="relative">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-lg px-4 py-3.5 appearance-none focus:outline-none focus:ring-1 focus:ring-[#FF385C] text-[#717171] text-sm font-medium pr-10"
                        >
                          <option value="">Select a city</option>
                          <option value="Dehradun">Dehradun</option>
                          <option value="Mussoorie">Mussoorie</option>
                          <option value="Haridwar">Haridwar</option>
                          <option value="Rishikesh">Rishikesh</option>
                          <option value="Nainital">Nainital</option>
                          <option value="Haldwani">Haldwani</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#717171]">
                          <Icon name="expand_more" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[13px] font-bold text-[#717171]">Monthly Budget (INR)</label>
                        <span className="bg-[#EEF2FF] text-[#222222] text-xs font-bold px-3 py-1 rounded-full">
                          ₹ {budget.toLocaleString()}+
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10000}
                        max={500000}
                        step={5000}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                      />
                      <div className="flex justify-between text-[11px] text-[#717171] font-bold">
                        <span>10K</span>
                        <span>500K</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#717171]">Property Type</label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: "Flat", icon: "apartment" },
                          { name: "Villa", icon: "home" },
                          { name: "Studio", icon: "meeting_room" },
                          { name: "Penthouse", icon: "domain" }
                        ].map((t) => (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => setPropertyType(t.name as any)}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                              propertyType === t.name
                                ? "border-[#FF385C] text-[#222222] text-[#008A05] font-bold shadow-sm"
                                : "border-[#EBEBEB]/80 text-[#717171] font-medium"
                            }`}
                          >
                            <Icon name={t.icon} size={20} />
                            <span className="text-[11px]">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#717171]">Move-in Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#FF385C] text-[#717171] text-sm font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-[#717171] italic pt-1">
                        You can always adjust this later in your profile settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-10">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-[#FF385C] hover:opacity-90 text-white font-semibold py-3.5 rounded-lg text-[15px] text-center transition-all shadow-md flex items-center justify-center gap-2 group"
                  >
                    <span>Continue</span>
                    <Icon
                      name="arrow_forward"
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS & DASHBOARD ACTION PANEL */}
      {step === 3 && (
        <div className="flex-grow flex flex-col lg:flex-row bg-white">
          
          {/* LEFT PANEL */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-start p-10 lg:p-20 relative overflow-hidden bg-gradient-to-br from-[#F5F8FF] to-[#FAFAFA] from-[#F7F7F7] to-[#F7F7F7]">
            
            <div className="w-full max-w-lg space-y-8 z-10">
              
              {/* Floating Image */}
              <div className="w-[110%] -ml-[5%] lg:w-[130%] lg:-ml-[15%] aspect-video rounded-r-3xl rounded-l-md overflow-hidden shadow-xl border border-[#EBEBEB] border-[#EBEBEB]/40 relative">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80"
                  alt="Home Keys"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Header */}
              <div className="space-y-4 max-w-md">
                <div className="inline-flex items-center gap-1.5 bg-[#E8F5E9] text-[#2E7D32] bg-[#F0FDF4] text-[#008A05] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#C8E6C9]">
                  <Icon name="check_circle" size={16} />
                  <span>Onboarding Complete</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-sans font-black text-[#222222] text-[#222222] tracking-tight leading-tight">
                  You're all set!
                </h1>

                <p className="text-[15px] text-[#717171] text-[#717171] font-medium leading-relaxed">
                  Welcome to the elite tier of property rentals. Your profile is ready, and your journey to find the perfect home starts now.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleFinalRedirect("/")}
                  className="bg-[#FF385C] hover:opacity-95 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-sm transition-all"
                >
                  Explore Properties
                </button>

                <button
                  onClick={() => handleFinalRedirect(redirectUrl)}
                  className="bg-[#F7F7F7] border border-[#EBEBEB]/80 hover:bg-[#F7F7F7] text-[#222222] font-semibold py-3 px-6 rounded-lg text-sm transition-all"
                >
                  Go to Dashboard
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 lg:p-20 relative">
            
            <div className="max-w-md w-full space-y-6">
              
              {/* Dashboard Panel 1: Browse Matches */}
              <div
                onClick={() => handleFinalRedirect("/search")}
                className="bg-[#F7F7F7] p-6 rounded-[16px] border border-[#EBEBEB] border-[#EBEBEB] shadow-sm flex flex-col gap-4 hover:border-[#FF385C] hover:shadow-md cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#008A05] text-white rounded-xl flex items-center justify-center">
                    <Icon name="search" size={24} />
                  </div>
                  <div className="text-[#717171] group-hover:text-[#FF385C] group-hover:translate-x-1 transition-all">
                    <Icon name="arrow_forward" size={20} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-[17px] text-[#222222] leading-tight">
                    Browse Matches
                  </h3>
                  <p className="text-[13px] text-[#717171] leading-relaxed font-medium">
                    Our AI has already curated 12 properties that match your search criteria and lifestyle preferences.
                  </p>
                </div>
                  
                <div className="flex items-center gap-1 pt-1">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" className="w-7 h-7 rounded-full border-2 border-white border-[#EBEBEB]" alt="face1" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" className="w-7 h-7 rounded-full border-2 border-white border-[#EBEBEB] -ml-2" alt="face2" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" className="w-7 h-7 rounded-full border-2 border-white border-[#EBEBEB] -ml-2" alt="face3" />
                  <div className="w-7 h-7 bg-[#FF385C] text-white text-[9px] font-bold rounded-full flex items-center justify-center -ml-2 border-2 border-white border-[#EBEBEB]">
                    +9
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dashboard Panel 2: KYC Verified Profile */}
                <div
                  onClick={() => {
                    setKycSubmitted(true);
                    showToast("Simulated KYC Documents Uploaded!", "info");
                  }}
                  className="bg-[#F7F7F7] p-6 rounded-[16px] border border-[#EBEBEB] border-[#EBEBEB] shadow-sm flex flex-col gap-4 hover:border-[#FF385C] hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 bg-[#FFF3E0] text-[#FF8F00] bg-[#FCF3DC] text-[#B45309] rounded-xl flex items-center justify-center">
                    <Icon name="verified_user" size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[15px] text-[#222222] leading-tight">
                      Verify Identity (KYC)
                    </h3>
                    <p className="text-[12px] text-[#717171] leading-relaxed font-medium">
                      Get the 'Elite Verified' badge to fast-track your applications.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <div className="h-1.5 w-full bg-[#EBEBEB] rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all duration-500 ${kycSubmitted ? "w-full bg-[#008A05]" : "w-1/3 bg-[#E0A526]"}`} />
                    </div>
                    <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                      {kycSubmitted ? "Verified" : "Step 1 of 3 Pending"}
                    </span>
                  </div>
                </div>

                {/* Dashboard Panel 3: Notifications Switch */}
                <div className="bg-[#F7F7F7] p-6 rounded-[16px] border border-[#EBEBEB] border-[#EBEBEB] shadow-sm flex flex-col gap-4 transition-all">
                  <div className="w-10 h-10 bg-[#E8EAF6] text-[#3F51B5] bg-[#EFF6FF] text-[#2563EB] rounded-xl flex items-center justify-center">
                    <Icon name="notifications" size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[15px] text-[#222222] leading-tight">
                      Enable Notifications
                    </h3>
                    <p className="text-[12px] text-[#717171] leading-relaxed font-medium">
                      Be the first to know when a listing matches your saved search.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setNotificationsEnabled(!notificationsEnabled);
                        showToast(
                          notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled!",
                          notificationsEnabled ? "info" : "success"
                        );
                      }}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                        notificationsEnabled ? "bg-[#EFF6FF]" : "bg-[#EBEBEB]"
                      }`}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${notificationsEnabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className="text-xs font-bold text-[#717171]">
                      {notificationsEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
