"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/shared/Icon";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/lib/types";

// Local Uttarakhand localities
const POPULAR_AREAS = [
  { name: "Prem Nagar", city: "Dehradun", tag: "Colleges & PGs" },
  { name: "Rajpur Road", city: "Dehradun", tag: "Families & Couples" },
  { name: "Clement Town", city: "Dehradun", tag: "Quiet Flats" },
  { name: "Karanpur / Dalanwala", city: "Dehradun", tag: "Central Room Sets" },
  { name: "Haldwani", city: "Nainital", tag: "Budget 1 & 2 BHK" },
  { name: "Tapovan / AIIMS", city: "Rishikesh", tag: "Working Professionals" },
];

const CATEGORY_TABS = [
  { id: "ROOM_SET_1", label: "Room Sets", icon: "bed", count: "120+ rooms" },
  { id: "BHK_1", label: "1 BHK Flats", icon: "apartment", count: "85+ flats" },
  { id: "BHK_2", label: "2 BHK Homes", icon: "home", count: "140+ homes" },
  { id: "INDEPENDENT_HOUSE", label: "Houses & Floors", icon: "domain", count: "45+ houses" },
  { id: "PG", label: "PG & Co-living", icon: "groups", count: "90+ rooms" },
];

export default function HomePage() {
  const router = useRouter();

  const [locationQuery, setLocationQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("FAMILY");
  const [budgetMax, setBudgetMax] = useState("");
  const [rentSavingsCalc, setRentSavingsCalc] = useState(12000);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties?limit=8");
      if (!res.ok) throw new Error("Failed to load properties");
      return res.json();
    },
  });

  const properties: Property[] = propertiesData?.properties || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationQuery.trim()) params.append("q", locationQuery.trim());
    if (selectedType) params.append("type", selectedType);
    if (selectedTenant) params.append("gender", selectedTenant);
    if (budgetMax) params.append("maxRent", budgetMax);
    router.push(`/search?${params.toString()}`);
  };

  const handleAreaClick = (area: string, city: string) => {
    router.push(`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(area)}`);
  };

  return (
    <div className="bg-white min-h-screen text-[#222222] transition-colors antialiased">
      {/* ===================================================================== */}
      {/* HERO SECTION — AIRBNB MINIMALIST CANVAS WITH PILL SEARCH              */}
      {/* ===================================================================== */}
      <section className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          
          {/* Top USP Banner Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
              <Icon name="verified_user" size={15} fill className="text-forest-600" />
              <span>100% Direct Owner Network · Uttarakhand's #1 Zero Brokerage Platform</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-[#717171]">
              <span className="flex items-center gap-1">
                <Icon name="check_circle" size={14} className="text-forest-600" fill />
                Aadhaar KYC Verified
              </span>
              <span className="flex items-center gap-1">
                <Icon name="check_circle" size={14} className="text-forest-600" fill />
                Couples &amp; Family Friendly
              </span>
              <span className="flex items-center gap-1">
                <Icon name="check_circle" size={14} className="text-forest-600" fill />
                Zero Broker Fees
              </span>
            </div>
          </div>

          {/* Trust Stats Strip */}
          <div className="flex items-center justify-between gap-4 mt-6 sm:mt-8 border-t border-[#EBEBEB] pt-6 sm:pt-8">
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222]">50k+</div>
              <div className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Verified Homes</div>
            </div>
            <div className="w-px h-6 bg-[#EBEBEB] hidden sm:block" />
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222]">₹0</div>
              <div className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Brokerage Fees</div>
            </div>
            <div className="w-px h-6 bg-[#EBEBEB] hidden sm:block" />
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222]">100%</div>
              <div className="text-xs text-[#717171] font-semibold uppercase tracking-wider">Aadhaar Verified</div>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-3xl mb-8">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[3.5rem] tracking-tight leading-[1.1] text-[#222222] text-balance">
              Find rental homes,{" "}
              <span className="text-[#FF385C]">directly from owners.</span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-[#717171] leading-relaxed max-w-2xl font-normal">
              Skip greedy middlemen and fake broker listings. Connect directly with verified homeowners for clean room sets, flats, and independent floors in Dehradun, Haldwani, and Rishikesh.
            </p>
          </div>

          {/* ================================================================= */}
          {/* AIRBNB-INSPIRED FLOATING SEARCH CARD                              */}
          {/* ================================================================= */}
          <div className="bg-white rounded-3xl shadow-airbnb border border-[#EBEBEB] p-4 sm:p-6 transition-all hover:shadow-airbnbHover">
            <form onSubmit={handleSearchSubmit}>
              {/* Who is moving selector */}
              <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-[#EBEBEB] text-xs font-semibold">
                <span className="text-[#717171] mr-1">Who is moving in?</span>
                {[
                  { id: "FAMILY", label: "Family", icon: "family_restroom" },
                  { id: "COUPLE", label: "Couples / Married", icon: "favorite" },
                  { id: "BACHELOR", label: "Working Professionals", icon: "person" },
                  { id: "FEMALE", label: "Female only", icon: "shield" },
                  { id: "ANY", label: "All welcome", icon: "all_inclusive" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTenant(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 ${
                      selectedTenant === item.id
                        ? "bg-[#222222] text-white shadow-sm"
                        : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EBEBEB]"
                    }`}
                  >
                    <Icon name={item.icon} size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Search Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Location Input */}
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Where in Uttarakhand?
                  </label>
                  <div className="flex items-center gap-2.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <Icon name="search" size={20} className="text-[#FF385C] shrink-0" />
                    <input
                      type="text"
                      placeholder="Prem Nagar, Rajpur Rd, Haldwani, Tapovan..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none placeholder:text-[#B0B0B0] text-[#222222]"
                    />
                  </div>
                </div>

                {/* Property Type Dropdown */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Property Configuration
                  </label>
                  <div className="relative bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none text-[#222222] appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Any room or flat</option>
                      <option value="ROOM_SET_1">1 Room Set (Kitchen + Bath)</option>
                      <option value="ROOM_SET_2">2 Room Set</option>
                      <option value="BHK_1">1 BHK Flat</option>
                      <option value="BHK_2">2 BHK Flat</option>
                      <option value="RK_1">1 RK / Studio</option>
                      <option value="INDEPENDENT_HOUSE">Independent Floor</option>
                      <option value="PG">PG / Student Hostel</option>
                    </select>
                    <Icon
                      name="expand_more"
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Max Budget */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Max Budget
                  </label>
                  <div className="relative bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <select
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none text-[#222222] appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Any rent</option>
                      <option value="6000">Up to ₹6,000</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="25000">Up to ₹25,000</option>
                    </select>
                    <Icon
                      name="expand_more"
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Search CTA */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-[48px] bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Icon name="search" size={18} className="text-white" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Locality Shortcuts */}
              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#717171] font-semibold flex items-center gap-1">
                  <Icon name="place" size={14} className="text-[#FF385C]" />
                  Popular Localities:
                </span>
                {POPULAR_AREAS.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => handleAreaClick(a.name, a.city)}
                    className="text-[#222222] bg-[#F7F7F7] hover:bg-[#EBEBEB] px-3 py-1 rounded-full transition-colors font-medium border border-[#EBEBEB]"
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CORE UNIQUE SELLING PROPOSITIONS (USPs) — THE TRUST GRID              */}
      {/* ===================================================================== */}
      <section className="py-14 sm:py-20 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[#FF385C] text-xs font-extrabold uppercase tracking-widest bg-rausch-100 px-3.5 py-1 rounded-full">
              Why Ghar Foundation
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#222222] tracking-tight mt-3">
              Built to fix everything broken with rental portals
            </h2>
            <p className="text-sm sm:text-base text-[#717171] mt-2">
              Unlike traditional listing sites crowded with brokers, Ghar Foundation is built 100% for direct tenant-owner trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* USP 1: Zero Brokerage Always */}
            <div className="bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-sm hover:shadow-airbnbHover transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rausch-100 text-[#FF385C] flex items-center justify-center mb-4">
                  <Icon name="money_off" size={26} />
                </div>
                <h3 className="font-bold text-lg text-[#222222] leading-snug">
                  Zero Brokerage Guarantee
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                  Traditional brokers charge 1-to-2 months' rent as fees. On Ghar Foundation, connect directly with owners and save ₹10,000 to ₹35,000 on day one.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EBEBEB] text-[11px] font-bold text-forest-700 flex items-center gap-1">
                <Icon name="check" size={14} /> ₹0 Broker commission
              </div>
            </div>

            {/* USP 2: Aadhaar e-KYC Verified */}
            <div className="bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-sm hover:shadow-airbnbHover transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mb-4">
                  <Icon name="verified_user" size={26} fill />
                </div>
                <h3 className="font-bold text-lg text-[#222222] leading-snug">
                  UIDAI Aadhaar Verified
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                  Both landlords and renters verify their identity through official UIDAI Aadhaar e-KYC. Zero spam, zero fake listings, and complete security.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EBEBEB] text-[11px] font-bold text-forest-700 flex items-center gap-1">
                <Icon name="check" size={14} /> Government ID verified
              </div>
            </div>

            {/* USP 3: Couples & Family Friendly */}
            <div className="bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-sm hover:shadow-airbnbHover transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Icon name="favorite" size={26} />
                </div>
                <h3 className="font-bold text-lg text-[#222222] leading-snug">
                  Family &amp; Couple Friendly
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                  No more awkward questions or moral policing at house visits. Every property card displays verified tenant policies beforehand.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EBEBEB] text-[11px] font-bold text-forest-700 flex items-center gap-1">
                <Icon name="check" size={14} /> Respectful guidelines
              </div>
            </div>

            {/* USP 4: Legal Lease & Police Form */}
            <div className="bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-sm hover:shadow-airbnbHover transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                  <Icon name="local_police" size={26} />
                </div>
                <h3 className="font-bold text-lg text-[#222222] leading-snug">
                  Police Verification &amp; Leases
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                  Instant generation of official Uttarakhand Police tenant verification forms and lawyer-drafted 11-month rental agreements without court visits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EBEBEB] text-[11px] font-bold text-forest-700 flex items-center gap-1">
                <Icon name="check" size={14} /> Legal compliance handled
              </div>
            </div>
          </div>

          {/* Interactive Brokerage Savings Calculator */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-[#EBEBEB] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-rausch-100 px-3 py-1 rounded-full">
                Savings Calculator
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#222222] mt-2">
                How much do you save by skipping brokers?
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Move the slider to your expected monthly rent to calculate your instant day-1 savings.
              </p>
              
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#222222]">
                  <span>Monthly Rent: ₹{rentSavingsCalc.toLocaleString()}</span>
                  <span className="text-[#FF385C]">1 Month Broker Fee Avoided</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="40000"
                  step="1000"
                  value={rentSavingsCalc}
                  onChange={(e) => setRentSavingsCalc(Number(e.target.value))}
                  className="w-full h-2 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                />
                <div className="flex justify-between text-[10px] text-[#717171] font-semibold">
                  <span>₹5,000/mo</span>
                  <span>₹40,000/mo</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-6 rounded-2xl text-center shrink-0 w-full sm:w-auto sm:min-w-[260px]">
              <p className="text-xs text-[#717171] font-bold uppercase tracking-wider">Your Immediate Savings</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-forest-700 mt-1 tabular-nums">
                ₹{rentSavingsCalc.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#717171] mt-1 font-medium">100% saved in your pocket</p>
              <Link
                href="/search"
                className="mt-4 inline-flex items-center justify-center gap-1.5 w-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-transform active:scale-95"
              >
                <span>Find Zero-Fee Homes</span>
                <Icon name="arrow_forward" size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* POPULAR CATEGORIES (AIRBNB HORIZONTAL PICKER)                          */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[#FF385C] text-xs font-bold uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#222222] mt-1">
              Popular Rental Setups
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-[#FF385C] hover:underline flex items-center gap-1"
          >
            <span>Explore all categories</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/search?type=${cat.id}`)}
              className="text-left p-4 rounded-2xl bg-white border border-[#EBEBEB] hover:border-[#222222] hover:shadow-airbnb transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] text-[#222222] group-hover:bg-rausch-100 group-hover:text-[#FF385C] flex items-center justify-center mb-3 transition-colors">
                <Icon name={cat.icon} size={22} />
              </div>
              <p className="font-bold text-sm text-[#222222] leading-tight">
                {cat.label}
              </p>
              <p className="text-xs text-[#717171] mt-0.5">{cat.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* TRUST & SAFETY — DOCUMENT VERIFICATION & LEGAL COMPLIANCE             */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[#FF385C] text-xs font-extrabold uppercase tracking-widest bg-rausch-100 px-3.5 py-1 rounded-full">
              Safety First
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#222222] tracking-tight mt-3">
              Every rental is backed by verified identity &amp; legal compliance
            </h2>
            <p className="text-sm sm:text-base text-[#717171] mt-2">
              From UIDAI Aadhaar e-KYC to Uttarakhand Police tenant verification and lawyer-drafted agreements — we handle the legal heavy lifting so you can move in with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trust Card 1: Aadhaar e-KYC */}
            <div className="bg-[#F7F7F7] rounded-2xl p-6 sm:p-8 border border-[#EBEBEB] hover:border-[#FF385C] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon name="verified_user" size={30} fill />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">UIDAI Aadhaar e-KYC</h3>
              <p className="text-xs sm:text-sm text-[#717171] leading-relaxed mb-4">
                Both landlords and renters verify identity through official Aadhaar. Full 12-digit numbers are never shared — only masked verification badges are visible.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-forest-700">
                <Icon name="check" size={12} fill />
                <span>Government ID verified</span>
              </div>
            </div>

            {/* Trust Card 2: Police Verification */}
            <div className="bg-[#F7F7F7] rounded-2xl p-6 sm:p-8 border border-[#EBEBEB] hover:border-[#FF385C] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#EBEBEB]">
                <Icon name="local_police" size={30} />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">Uttarakhand Police Verification</h3>
              <p className="text-xs sm:text-sm text-[#717171] leading-relaxed mb-4">
                Pre-filled police tenant verification forms submitted to your local Thana. State-compliant documentation for every tenancy agreement.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-forest-700">
                <Icon name="check" size={12} fill />
                <span>State law compliant</span>
              </div>
            </div>

            {/* Trust Card 3: Legal Lease */}
            <div className="bg-[#F7F7F7] rounded-2xl p-6 sm:p-8 border border-[#EBEBEB] hover:border-[#FF385C] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon name="description" size={30} />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">11-Month Digital Lease</h3>
              <p className="text-xs sm:text-sm text-[#717171] leading-relaxed mb-4">
                Lawyer-drafted, e-stamped rental agreements compliant with the Indian Registration Act. Generate and sign in minutes — no court visits needed.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-forest-700">
                <Icon name="check" size={12} fill />
                <span>Legally binding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* VERIFIED LISTINGS SECTION — REAL PROPERTYCARD COMPONENTS               */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 bg-[#F7F7F7]/60 border-y border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-forest-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Icon name="verified" size={14} fill className="text-forest-600" />
                Verified &amp; Inspected
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#222222] mt-1">
                Fresh verified homes
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Direct owner listings with Aadhaar verified ownership, ready for immediate move-in.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF385C] hover:underline self-start sm:self-auto"
            >
              <span>View all available listings</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-[#EBEBEB] animate-pulse" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.slice(0, 8).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white border border-[#EBEBEB]">
              <Icon name="home_work" size={40} className="text-[#B0B0B0] mx-auto mb-2" />
              <h3 className="font-bold text-base text-[#222222]">
                New verified rooms are being added this week
              </h3>
              <p className="text-xs text-[#717171] max-w-sm mx-auto mt-1 mb-4">
                Explore all listings across Uttarakhand or list your own property today for free.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 bg-[#FF385C] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* OWNER LISTING CALLOUT — AIRBNB HOST INSPIRATION                      */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="relative rounded-3xl overflow-hidden bg-[#222222] text-white p-8 sm:p-12 md:p-16 shadow-airbnbHover">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF385C]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4">
              For Property Owners
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight">
              Rent out your home.{" "}
              <span className="text-[#FF385C]">100% Free forever.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#B0B0B0] leading-relaxed">
              No subscription charges. No broker commissions. List your room, flat, or floor in 2 minutes, or simply send your photos on WhatsApp — our local team will publish it for you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/post-property"
                className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-transform active:scale-95 shadow-sm"
              >
                <Icon name="add_home" size={18} className="text-white" />
                <span>List Property Online</span>
              </Link>

              <a
                href="https://wa.me/919999999999?text=Hello,%20I%20want%20to%20list%20my%20rental%20property%20on%20Ghar%20Foundation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp hover:brightness-105 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-transform active:scale-95"
              >
                <Icon name="chat" size={18} className="text-white" />
                <span>Send Photos via WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#B0B0B0]">
              <span>✓ Aadhaar-verified renters only</span>
              <span>✓ Free police verification assistance</span>
              <span>✓ 100% direct contact</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
