"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";

type RoleOption = "RENTER" | "OWNER" | "BOTH" | null;

const UTTARAKHAND_CITIES = [
  "Dehradun",
  "Rishikesh",
  "Nainital",
  "Mussoorie",
  "Haridwar",
  "Haldwani",
];

const PROPERTY_TYPES = [
  { id: "APARTMENT", label: "Flat / Apartment", icon: "apartment" },
  { id: "INDEPENDENT", label: "Independent Floor", icon: "home" },
  { id: "ROOM_SET", label: "1 / 2 Room Set", icon: "meeting_room" },
  { id: "PG", label: "PG / Co-Living", icon: "groups" },
  { id: "VILLA", label: "Hill Cottage / Villa", icon: "villa" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleOption>("RENTER");
  const [city, setCity] = useState("Dehradun");
  const [locality, setLocality] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["APARTMENT", "INDEPENDENT"]);
  const [budget, setBudget] = useState("15000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { updateUserRole, user } = useAuth();
  const { showToast } = useToast();

  const togglePropertyType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((item) => item !== id) : prev) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = async (destination: "/dashboard" | "/search" | "/post-property") => {
    setIsSubmitting(true);
    const targetRole = selectedRole === "OWNER" ? "OWNER" : "RENTER";

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: targetRole,
          preferredCity: city,
          preferredArea: locality || "Rajpur Road",
          budgetMax: Number(budget) || 15000,
          propertyTypes: selectedTypes,
        }),
      });
    } catch {
      // Non-blocking fallback so navigation always succeeds
    }

    try {
      await updateUserRole(targetRole);
    } catch {
      // Ignore if guest or already updated
    }

    showToast("Workspace personalized! Welcome to Ghar Foundation.", "success");
    router.push(destination);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-white font-sans text-[#222222] select-none">
      {/* ===================================================================== */}
      {/* LOCKED 64PX HEADER                                                    */}
      {/* ===================================================================== */}
      <header className="h-16 px-4 sm:px-8 border-b border-[#EBEBEB] bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="font-display font-extrabold text-2xl tracking-tight text-[#222222] group-hover:text-[#FF385C] transition-colors">
            Ghar<span className="text-[#FF385C]">.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-[#717171] ml-1.5 bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 rounded-full">
            Uttarakhand Direct
          </span>
        </Link>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F7F7F7] border border-[#EBEBEB] p-1 rounded-full">
          {[
            { num: 1, label: "1. Your Role" },
            { num: 2, label: "2. Preferences" },
            { num: 3, label: "3. Ready" },
          ].map((item) => {
            const active = step === item.num;
            const completed = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  if (item.num < step || selectedRole) setStep(item.num as 1 | 2 | 3);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  active
                    ? "bg-[#222222] text-white shadow-sm"
                    : completed
                    ? "bg-[#E8F5E9] text-[#008A05]"
                    : "text-[#717171] hover:text-[#222222]"
                }`}
              >
                {completed && <Icon name="check_circle" size={13} fill className="text-[#008A05]" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleCompleteOnboarding("/dashboard")}
          className="text-xs font-bold text-[#717171] hover:text-[#222222] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] transition-colors flex items-center gap-1"
        >
          <span>Skip Setup</span>
          <Icon name="arrow_forward" size={14} />
        </button>
      </header>

      {/* ===================================================================== */}
      {/* STEP 1: ROLE SELECTION (100% LOCKED DESKTOP VIEWPORT — NO SCROLL)     */}
      {/* ===================================================================== */}
      {step === 1 && (
        <main className="flex-1 lg:overflow-hidden flex flex-col justify-between max-w-[1160px] w-full mx-auto px-4 sm:px-8 py-5 sm:py-6">
          {/* Top Heading */}
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF0F3] border border-[#FFD1D8] text-[#FF385C] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2.5">
              <Icon name="verified" size={13} fill />
              <span>Welcome {user?.name ? user.name.split(" ")[0] : "to Ghar Foundation"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[#222222] leading-tight">
              How would you like to use Ghar?
            </h1>
            <p className="text-xs sm:text-sm text-[#717171] mt-1.5">
              Select your primary goal so we can configure your zero-brokerage Uttarakhand workspace. You can switch modes anytime.
            </p>
          </div>

          {/* 3 Interactive Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 my-4">
            {[
              {
                id: "RENTER" as const,
                badge: "Tenant Mode",
                title: "Find a Rental Home",
                desc: "Browse verified flats, room sets & hill cottages across Dehradun, Rishikesh & Nainital with ₹0 brokerage.",
                icon: "home",
                perks: ["Direct Owner Phone & Chat", "11-Month Digital Agreement"],
              },
              {
                id: "OWNER" as const,
                badge: "Homeowner Mode",
                title: "List My Property",
                desc: "Post your rental property for free, receive Aadhaar-verified tenant inquiries, and manage leases.",
                icon: "real_estate_agent",
                perks: ["Free Property Listing", "Aadhaar KYC Verified Tenants"],
              },
              {
                id: "BOTH" as const,
                badge: "Dual Workspace",
                title: "Both Rent & Host",
                desc: "Looking for a place to stay while also managing or listing residential properties in Uttarakhand.",
                icon: "swap_horiz",
                perks: ["1-Click Role Switcher", "Full CRM & Saved Shortlists"],
              },
            ].map((card) => {
              const isSelected = selectedRole === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedRole(card.id)}
                  className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between border-2 ${
                    isSelected
                      ? "hero-mesh-bg border-[#FF385C] shadow-md -translate-y-0.5"
                      : "bg-white border-[#EBEBEB] hover:border-[#222222]/40 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-[#FF385C] text-white"
                            : "bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]"
                        }`}
                      >
                        {card.badge}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#FF385C] text-white"
                            : "border border-[#DDDDDD] bg-white text-transparent group-hover:border-[#222222]"
                        }`}
                      >
                        <Icon name="check" size={14} />
                      </div>
                    </div>

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        isSelected
                          ? "bg-[#222222] text-white"
                          : "bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB]"
                      }`}
                    >
                      <Icon name={card.icon} size={22} />
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-[#222222]">{card.title}</h3>
                    <p className="text-xs text-[#717171] leading-relaxed mt-1">{card.desc}</p>
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-[#EBEBEB] space-y-1.5">
                    {card.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-1.5 text-[11px] font-bold text-[#222222]">
                        <Icon name="check_circle" size={14} className="text-[#008A05] shrink-0" fill />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action & Trust Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#EBEBEB]">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-[#717171]">
              <span className="flex items-center gap-1.5">
                <Icon name="verified_user" size={16} className="text-[#008A05]" fill />
                100% Aadhaar KYC Verified Network
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="savings" size={16} className="text-[#FF385C]" />
                Zero Brokerage Guarantee
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <Icon name="local_police" size={16} className="text-[#222222]" />
                Uttarakhand Police Form Ready
              </span>
            </div>

            <button
              type="button"
              disabled={!selectedRole}
              onClick={() => setStep(2)}
              className="btn-cta-primary px-8 py-3 text-sm w-full sm:w-auto disabled:opacity-50"
            >
              <span>Continue to Preferences</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          </div>
        </main>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: PREFERENCES (LOCKED SPLIT SCREEN — ZERO DESKTOP SCROLL)       */}
      {/* ===================================================================== */}
      {step === 2 && (
        <main className="flex-1 lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left 5 Cols: Visual Showcase */}
          <div className="hidden lg:flex lg:col-span-5 hero-mesh-bg border-r border-[#EBEBEB] p-8 flex-col justify-between relative overflow-hidden">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/90 border border-[#EBEBEB] text-[#222222] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Icon name="location_on" size={13} className="text-[#FF385C]" />
                Uttarakhand Rental Radar
              </span>
              <h2 className="text-2xl font-extrabold text-[#222222] tracking-tight mt-3 leading-snug">
                {selectedRole === "OWNER"
                  ? "Connect directly with verified tenants in your city."
                  : "Curating direct-owner homes in your favorite locality."}
              </h2>
              <p className="text-xs text-[#717171] mt-1.5 leading-relaxed">
                We match your city and budget preferences with physical &amp; Aadhaar-verified listings across Uttarakhand.
              </p>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 shadow-md space-y-3 my-auto">
              <div className="relative h-36 rounded-xl overflow-hidden bg-[#F7F7F7]">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                  alt="Uttarakhand Home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#008A05] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Icon name="verified" size={11} fill /> DIRECT OWNER
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-[#222222]/90 backdrop-blur-sm text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  ₹{Number(budget || 15000).toLocaleString("en-IN")}/mo
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#222222]">
                    Verified Homes in {city}
                  </p>
                  <p className="text-[11px] text-[#717171]">
                    {locality ? `${locality}, ${city}` : `Rajpur Road, Tapovan & Prime Corridors`}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#FF385C] bg-[#FFF0F3] border border-[#FFD1D8] px-2.5 py-1 rounded-full">
                  ₹0 Brokerage
                </span>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EBEBEB]/80">
              <div>
                <p className="text-base font-extrabold text-[#222222]">2,400+</p>
                <p className="text-[11px] text-[#717171]">Verified Homes</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-[#008A05]">₹0</p>
                <p className="text-[11px] text-[#717171]">Broker Commission</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-[#222222]">6 Cities</p>
                <p className="text-[11px] text-[#717171]">Across Uttarakhand</p>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Compact Preferences Form */}
          <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-8 lg:px-12 lg:py-7 bg-white">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">
                Step 2 of 3 · Personalize Feed
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">
                {selectedRole === "OWNER"
                  ? "Where is your rental property located?"
                  : "Set your rental search preferences"}
              </h2>
              <p className="text-xs text-[#717171] mt-1">
                We use this to prioritize listings and alerts on your dashboard.
              </p>
            </div>

            <div className="space-y-4 my-4">
              {/* 1. City Selector Pills */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-2">
                  Primary Uttarakhand City
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {UTTARAKHAND_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        city === c
                          ? "bg-[#222222] text-white border-[#222222] shadow-sm"
                          : "bg-[#F7F7F7] text-[#717171] border-[#EBEBEB] hover:border-[#222222] hover:text-[#222222]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Locality & Monthly Budget Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-1.5">
                    Preferred Locality / Area
                  </label>
                  <div className="relative">
                    <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder={`e.g. Rajpur Road, ${city}`}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#222222] placeholder-[#717171] focus:outline-none focus:bg-white focus:border-[#222222] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-1.5">
                    {selectedRole === "OWNER" ? "Expected Monthly Rent (₹)" : "Max Monthly Budget (₹)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#717171]">₹</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl pl-8 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Property Configuration Chips */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#222222] mb-2">
                  Property Types of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => {
                    const active = selectedTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => togglePropertyType(type.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                          active
                            ? "bg-[#FFF0F3] border-[#FF385C] text-[#FF385C]"
                            : "bg-[#F7F7F7] border-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                        }`}
                      >
                        <Icon name={type.icon} size={15} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-cta-secondary px-5 py-2.5 text-xs"
              >
                <Icon name="arrow_back" size={15} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-cta-primary px-7 py-2.5 text-xs sm:text-sm"
              >
                <span>Save &amp; Continue</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ===================================================================== */}
      {/* STEP 3: ALL SET / LAUNCH WORKSPACE (ZERO DESKTOP SCROLL)              */}
      {/* ===================================================================== */}
      {step === 3 && (
        <main className="flex-1 lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left 6 Cols: Launch Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:px-12 lg:py-8 bg-white">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#E8F5E9] border border-[#C8E6C9] text-[#008A05] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Icon name="check_circle" size={14} fill />
                <span>Setup Complete</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 leading-tight">
                Your {selectedRole === "OWNER" ? "Homeowner" : "Tenant"} Workspace is Ready!
              </h1>
              <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                We have tailored your dashboard for{" "}
                <strong className="text-[#222222]">{city}</strong>{" "}
                {locality ? `(${locality})` : ""} with zero-brokerage protection enabled.
              </p>
            </div>

            {/* Summary Checklist Card */}
            <div className="bg-[#F7F7F7] rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 space-y-3 my-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#717171] font-medium">Selected Mode</span>
                <span className="font-bold text-[#222222] bg-white px-2.5 py-1 rounded-lg border border-[#EBEBEB]">
                  {selectedRole === "OWNER" ? "Property Owner / Host" : selectedRole === "BOTH" ? "Tenant + Owner Mode" : "Verified Renter"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#717171] font-medium">Primary Location</span>
                <span className="font-bold text-[#222222]">
                  {locality ? `${locality}, ${city}` : `${city}, Uttarakhand`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#717171] font-medium">
                  {selectedRole === "OWNER" ? "Target Monthly Rent" : "Monthly Budget"}
                </span>
                <span className="font-extrabold text-[#008A05]">
                  ₹{Number(budget || 15000).toLocaleString("en-IN")}/mo
                </span>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCompleteOnboarding("/dashboard")}
                  className="btn-cta-primary flex-1 py-3 px-6 text-xs sm:text-sm disabled:opacity-50"
                >
                  <Icon name="grid_view" size={17} />
                  <span>{isSubmitting ? "Opening Workspace..." : "Go to My Dashboard"}</span>
                </button>

                {selectedRole === "OWNER" ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCompleteOnboarding("/post-property")}
                    className="btn-cta-secondary flex-1 py-3 px-6 text-xs sm:text-sm"
                  >
                    <Icon name="add_home" size={17} className="text-[#FF385C]" />
                    <span>Post First Property</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCompleteOnboarding("/search")}
                    className="btn-cta-secondary flex-1 py-3 px-6 text-xs sm:text-sm"
                  >
                    <Icon name="search" size={17} className="text-[#FF385C]" />
                    <span>Explore {city} Homes</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#717171] hover:text-[#222222] transition-colors flex items-center gap-1"
              >
                <Icon name="arrow_back" size={14} />
                <span>Modify preferences</span>
              </button>
            </div>
          </div>

          {/* Right 6 Cols: Workspace Preview */}
          <div className="hidden lg:flex lg:col-span-6 hero-mesh-bg border-l border-[#EBEBEB] p-8 flex-col justify-center items-center relative overflow-hidden">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#EBEBEB] shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF385C] text-white flex items-center justify-center font-extrabold text-sm">
                    G.
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#222222]">Ghar Foundation Studio</p>
                    <p className="text-[10px] text-[#717171]">{city} Direct Network</p>
                  </div>
                </div>
                <span className="bg-[#E8F5E9] text-[#008A05] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                  <Icon name="verified_user" size={18} className="text-[#008A05] mb-1" fill />
                  <p className="text-xs font-bold text-[#222222]">Aadhaar e-KYC</p>
                  <p className="text-[10px] text-[#717171]">Instant Trust Badge</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                  <Icon name="description" size={18} className="text-[#FF385C] mb-1" />
                  <p className="text-xs font-bold text-[#222222]">11-Month Lease</p>
                  <p className="text-[10px] text-[#717171]">Digital Stamp Ready</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                  <Icon name="chat_bubble_outline" size={18} className="text-[#222222] mb-1" />
                  <p className="text-xs font-bold text-[#222222]">Direct Inbox</p>
                  <p className="text-[10px] text-[#717171]">Owner-to-Tenant Chat</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                  <Icon name="local_police" size={18} className="text-[#008A05] mb-1" />
                  <p className="text-xs font-bold text-[#222222]">Police Form</p>
                  <p className="text-[10px] text-[#717171]">Auto-Filled PDF</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
