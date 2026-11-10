"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/shared/Icon";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/lib/types";

// Uttarakhand Localities with MagicBricks / Housing.com intelligence
const POPULAR_LOCALITIES = [
  {
    name: "Rajpur Road",
    city: "Dehradun",
    tag: "Upscale & Families",
    desc: "Scenic foothills, premium 2/3 BHK flats & cafes",
    avgRent: "₹14,000 - ₹28,000",
    listingsCount: "45+ Verified Homes",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
  },
  {
    name: "Prem Nagar",
    city: "Dehradun",
    tag: "Colleges & UPES Hub",
    desc: "Student PGs, independent room sets & studio flats",
    avgRent: "₹5,000 - ₹12,000",
    listingsCount: "60+ Verified Homes",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
  },
  {
    name: "Jakhan",
    city: "Dehradun",
    tag: "Central & Lively",
    desc: "Pacific Mall proximity, modern flats & family floors",
    avgRent: "₹12,000 - ₹24,000",
    listingsCount: "32+ Verified Homes",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
  },
  {
    name: "Clement Town",
    city: "Dehradun",
    tag: "Graphic Era Hub",
    desc: "Peaceful environment, bachelors & faculty homes",
    avgRent: "₹6,000 - ₹14,000",
    listingsCount: "50+ Verified Homes",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",
  },
  {
    name: "Tapovan",
    city: "Rishikesh",
    tag: "Yoga & River Views",
    desc: "Furnished studios, serene cottages & long-stay suites",
    avgRent: "₹8,000 - ₹22,000",
    listingsCount: "38+ Verified Homes",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
  },
  {
    name: "Haldwani",
    city: "Nainital",
    tag: "Kumaon Gateway",
    desc: "Affordable 1 & 2 BHK independent floors & markets",
    avgRent: "₹5,000 - ₹15,000",
    listingsCount: "29+ Verified Homes",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
  },
];

const CATEGORY_TABS = [
  { id: "ROOM_SET_1", label: "Room Sets", icon: "bed", sub: "Kitchen + Bath" },
  { id: "BHK_1", label: "1 BHK Flats", icon: "apartment", sub: "Couples & Singles" },
  { id: "BHK_2", label: "2 BHK Homes", icon: "home", sub: "Family Favorite" },
  { id: "INDEPENDENT_HOUSE", label: "Floors & Houses", icon: "domain", sub: "Private Compound" },
  { id: "PG", label: "PG & Hostels", icon: "groups", sub: "Students & Co-live" },
  { id: "VILLA", label: "Hill Cottages", icon: "holiday_village", sub: "Mountain View" },
];

// Housing.com / MagicBricks Style Curated Collections
const CURATED_COLLECTIONS = [
  {
    title: "Ready-to-Move Family Floors",
    subtitle: "2 & 3 BHK independent floors with car parking & gated entry",
    badge: "Most Popular",
    priceTag: "From ₹11,500/mo",
    href: "/search?gender=FAMILY&type=BHK_2",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Budget Room Sets Under ₹8,000",
    subtitle: "1 Room + Kitchen + Attached Bath with zero restrictions",
    badge: "Value Picks",
    priceTag: "₹4,500 – ₹8,000/mo",
    href: "/search?maxRent=8000",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Campus & Student Hubs",
    subtitle: "Near UPES Bidholi, Graphic Era, DIT & Doon University",
    badge: "Student Friendly",
    priceTag: "From ₹5,000/mo",
    href: "/search?gender=BACHELOR",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Furnished Work-from-Hills Stays",
    subtitle: "High-speed Wi-Fi studios & balconies in Tapovan & Rajpur Rd",
    badge: "Fully Furnished",
    priceTag: "From ₹12,000/mo",
    href: "/search?q=Tapovan",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&auto=format&fit=crop&q=80",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: "travel_explore",
    title: "Shortlist Verified Owner Homes",
    desc: "Filter by locality, budget, and tenant preference (Family, Working Professionals, Students). Every listing has genuine photos and transparent rent + deposit details.",
    pill: "Zero Fake Listings",
  },
  {
    step: "02",
    icon: "chat",
    title: "Connect Directly or Book a Free Visit",
    desc: "Message or WhatsApp the homeowner directly, or schedule a physical property visit online. Pay ₹0 visiting charges and ₹0 middleman commission.",
    pill: "100% Direct Owner Contact",
  },
  {
    step: "03",
    icon: "verified_user",
    title: "Move In with Digital Lease & KYC",
    desc: "Complete Aadhaar KYC, generate your 11-month rental agreement, and download Uttarakhand Police verification forms directly from your dashboard.",
    pill: "Instant Paperwork",
  },
];

const RESIDENT_STORIES = [
  {
    quote: "Brokers in Jakhan were asking ₹9,000 just to show flats and 15 days rent as commission. On Ghar Foundation, I spoke directly to the uncle who owns the 2 BHK floor and saved ₹18,000 on Day 1.",
    name: "Ankit Rawat",
    role: "Software Engineer • Rented 2 BHK on Sahastradhara Road",
    saved: "Saved ₹18,000 Brokerage",
  },
  {
    quote: "As a retired army officer living in Vasant Vihar, I only wanted verified family tenants without dealing with pushy local agents. My ground floor was rented within 4 days to a wonderful bank manager's family.",
    name: "Col. R.S. Negi (Retd.)",
    role: "Homeowner • Listed 2 BHK Independent Floor in Dehradun",
    saved: "Aadhaar KYC Verified Tenant",
  },
  {
    quote: "Moving from Delhi to Rishikesh for remote work was stressful until I found a furnished studio in Tapovan here. Exact photos, direct WhatsApp with the owner, and digital lease signing.",
    name: "Megha Joshi",
    role: "Product Designer • Rented Studio in Tapovan, Rishikesh",
    saved: "Saved ₹12,500 Brokerage",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [locationQuery, setLocationQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("FAMILY");
  const [budgetMax, setBudgetMax] = useState("");
  const [rentSavingsCalc, setRentSavingsCalc] = useState(14000);

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
    if (selectedTenant && selectedTenant !== "ANY") params.append("gender", selectedTenant);
    if (budgetMax) params.append("maxRent", budgetMax);
    router.push(`/search?${params.toString()}`);
  };

  const handleAreaClick = (area: string, city: string) => {
    router.push(`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(area)}`);
  };

  return (
    <div className="bg-white min-h-screen text-[#222222] antialiased">
      
      {/* ===================================================================== */}
      {/* 1. HERO SECTION — AMBIENT COLOR BLOB MESH + HOUSING.COM SEARCH BAR    */}
      {/* ===================================================================== */}
      <section className="hero-mesh-bg relative overflow-hidden pt-3.5 sm:pt-6 pb-7 sm:pb-11 border-b border-[#EBEBEB]">
        {/* Ambient Color Blobs & Subtle Dot Grid */}
        <div className="pointer-events-none absolute inset-0 hero-dot-grid opacity-55" />
        <div className="pointer-events-none absolute -top-24 -left-20 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#FF385C]/22 via-[#FF6B81]/12 to-transparent blur-[85px]" />
        <div className="pointer-events-none absolute -top-16 right-[-8%] w-[300px] sm:w-[440px] h-[300px] sm:h-[440px] rounded-full bg-gradient-to-bl from-amber-300/22 via-rose-200/12 to-transparent blur-[85px]" />
        <div className="pointer-events-none absolute -bottom-24 right-[15%] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#008A05]/14 via-emerald-200/10 to-transparent blur-[85px]" />

        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          {/* Top Trust Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#C8E6C9] text-[#008A05] text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              <Icon name="verified" size={14} fill className="text-[#008A05] shrink-0" />
              <span className="truncate">Uttarakhand&apos;s Direct Owner Network · ₹0 Brokerage</span>
            </div>

            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#222222]/80 bg-white/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#EBEBEB]">
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={14} className="text-[#008A05]" fill />
                UIDAI Aadhaar Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={14} className="text-[#008A05]" fill />
                100% Direct Landlords
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={14} className="text-[#008A05]" fill />
                Digital 11-Month Lease
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="max-w-3xl mb-4 sm:mb-6">
            <h1 className="font-sans font-extrabold text-[27px] sm:text-5xl lg:text-[50px] tracking-tight leading-[1.12] text-[#222222]">
              Rent directly from homeowners in Uttarakhand,{" "}
              <span className="bg-gradient-to-r from-[#FF385C] to-[#E00B41] bg-clip-text text-transparent">
                without broker fees.
              </span>
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#717171] leading-relaxed max-w-2xl font-normal">
              Skip middlemen commission and visiting charges. Browse verified room sets, 1/2/3 BHK flats, independent floors, and hill cottages across Dehradun, Rishikesh, and Nainital.
            </p>
          </div>

          {/* ================================================================= */}
          {/* FLOATING MULTI-SEGMENT SEARCH CARD (MOBILE & DESKTOP OPTIMIZED)   */}
          {/* ================================================================= */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_14px_40px_-10px_rgba(255,56,92,0.14),0_4px_20px_-4px_rgba(34,34,34,0.07)] border border-white ring-1 ring-[#EBEBEB] p-3.5 sm:p-5 transition-shadow hover:shadow-[0_18px_48px_-10px_rgba(255,56,92,0.18)]">
            <form onSubmit={handleSearchSubmit}>
              
              {/* Tenant Preferences Filter Strip — Horizontal Scroll on Mobile */}
              <div className="flex items-center gap-2 pb-3.5 mb-3.5 sm:pb-4 sm:mb-4 border-b border-[#EBEBEB] text-xs font-bold overflow-x-auto no-scrollbar -mx-1 px-1">
                <span className="text-[#717171] mr-1 font-semibold whitespace-nowrap hidden sm:inline">
                  Tenant preference:
                </span>
                {[
                  { id: "FAMILY", label: "Family", icon: "family_restroom" },
                  { id: "COUPLE", label: "Couples", icon: "favorite" },
                  { id: "BACHELOR", label: "Working / Students", icon: "person" },
                  { id: "FEMALE", label: "Female Only", icon: "shield" },
                  { id: "ANY", label: "All Welcome", icon: "done_all" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTenant(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.98] ${
                      selectedTenant === item.id
                        ? "bg-[#222222] text-white shadow-sm"
                        : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EBEBEB] border border-transparent"
                    }`}
                  >
                    <Icon name={item.icon} size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-end">
                
                {/* Location Search Input */}
                <div className="sm:col-span-2 lg:col-span-5">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    City, Locality or Landmark
                  </label>
                  <div className="flex items-center gap-2.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 h-12 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <Icon name="search" size={19} className="text-[#FF385C] shrink-0" />
                    <input
                      type="text"
                      placeholder="Rajpur Road, Prem Nagar, Tapovan, Haldwani..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none placeholder:text-[#717171]/70 text-[#222222] min-w-0"
                    />
                    {locationQuery && (
                      <button
                        type="button"
                        onClick={() => setLocationQuery("")}
                        className="text-[#717171] hover:text-[#222222]"
                      >
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuration Dropdown */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Home Type
                  </label>
                  <div className="relative bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 h-12 flex items-center focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none text-[#222222] appearance-none cursor-pointer pr-6"
                    >
                      <option value="">All Property Types</option>
                      <option value="ROOM_SET_1">1 Room Set (Kitchen+Bath)</option>
                      <option value="ROOM_SET_2">2 Room Set</option>
                      <option value="BHK_1">1 BHK Flat</option>
                      <option value="BHK_2">2 BHK Flat / Floor</option>
                      <option value="BHK_3">3 BHK Flat / Floor</option>
                      <option value="RK_1">1 RK / Studio</option>
                      <option value="INDEPENDENT_HOUSE">Independent House</option>
                      <option value="PG">PG / Student Hostel</option>
                    </select>
                    <Icon
                      name="expand_more"
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Max Budget Dropdown */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Max Rent
                  </label>
                  <div className="relative bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 h-12 flex items-center focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <select
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none text-[#222222] appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Any Budget</option>
                      <option value="6000">Under ₹6,000</option>
                      <option value="10000">Under ₹10,000</option>
                      <option value="15000">Under ₹15,000</option>
                      <option value="25000">Under ₹25,000</option>
                      <option value="40000">Under ₹40,000</option>
                    </select>
                    <Icon
                      name="expand_more"
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Search CTA */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <button
                    type="submit"
                    className="btn-cta-primary w-full h-12 text-sm"
                  >
                    <Icon name="search" size={18} className="text-white" />
                    <span>Search Homes</span>
                  </button>
                </div>
              </div>

              {/* Locality Quick-Picks Strip — Horizontal Scroll on Mobile */}
              <div className="mt-3 pt-3 border-t border-[#EBEBEB]/60 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
                <span className="text-[#717171] font-bold flex items-center gap-1 shrink-0">
                  <Icon name="trending_up" size={14} className="text-[#FF385C]" />
                  <span>Hot Searches:</span>
                </span>
                {POPULAR_LOCALITIES.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleAreaClick(loc.name, loc.city)}
                    className="text-[#222222] bg-[#F7F7F7] hover:bg-[#EBEBEB] px-3 py-1 rounded-full transition-colors font-semibold border border-[#EBEBEB] whitespace-nowrap shrink-0 active:scale-[0.98]"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-5 sm:mt-6 pt-5 border-t border-[#EBEBEB]/80">
            <div className="bg-white/85 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#EBEBEB] sm:border-0">
              <div className="text-xl sm:text-2xl font-extrabold text-[#222222] tabular-nums">₹0</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Brokerage &amp; Visit Fees</div>
            </div>
            <div className="bg-white/85 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#EBEBEB] sm:border-0">
              <div className="text-xl sm:text-2xl font-extrabold text-[#222222] tabular-nums">100%</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Direct Homeowners</div>
            </div>
            <div className="bg-white/85 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#EBEBEB] sm:border-0">
              <div className="text-xl sm:text-2xl font-extrabold text-[#222222] tabular-nums">13 Districts</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Dehradun to Nainital</div>
            </div>
            <div className="bg-white/85 backdrop-blur-sm sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#EBEBEB] sm:border-0">
              <div className="text-xl sm:text-2xl font-extrabold text-[#008A05] tabular-nums">UIDAI KYC</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Police Verification Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. AIRBNB HORIZONTAL CATEGORY BAR (SWIPEABLE ON MOBILE)               */}
      {/* ===================================================================== */}
      <section className="py-7 sm:py-9 border-b border-[#EBEBEB] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Browse by Configuration</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-2xl text-[#222222] mt-0.5">
                What kind of home are you looking for?
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-bold text-[#222222] hover:text-[#FF385C] flex items-center gap-1 transition-colors shrink-0"
            >
              <span>All configurations</span>
              <Icon name="arrow_forward" size={15} />
            </Link>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/search?type=${cat.id}`)}
                className="min-w-[148px] sm:min-w-0 shrink-0 text-left p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] hover:bg-white hover:border-[#222222] hover:shadow-sm transition-all duration-150 active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EBEBEB] text-[#222222] group-hover:bg-[#FF385C] group-hover:border-[#FF385C] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                  <Icon name={cat.icon} size={20} />
                </div>
                <p className="font-bold text-sm text-[#222222] leading-tight">
                  {cat.label}
                </p>
                <p className="text-[11px] text-[#717171] mt-0.5 font-medium">{cat.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. VERIFIED LISTINGS SECTION — REAL PROPERTYCARD COMPONENTS           */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#008A05] uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="verified" size={14} fill className="text-[#008A05]" />
                Direct Owner Inventory
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Recently Verified Homes
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Aadhaar-verified homeowners, transparent security deposits, zero brokerage fees.
              </p>
            </div>
            <Link
              href="/search"
              className="btn-cta-secondary text-xs sm:text-sm px-4 py-2.5 self-start sm:self-auto"
            >
              <span>View all listings</span>
              <Icon name="arrow_forward" size={15} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-[#F7F7F7] animate-pulse border border-[#EBEBEB]" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {properties.slice(0, 8).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <Icon name="home_work" size={40} className="text-[#717171] mx-auto mb-3" />
              <h3 className="font-bold text-base sm:text-lg text-[#222222]">
                New verified homes being onboarded today
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] max-w-sm mx-auto mt-1 mb-5">
                Explore listings across Dehradun, Rishikesh, and Haldwani, or list your own property for free.
              </p>
              <Link
                href="/search"
                className="btn-cta-primary text-xs px-6 py-3"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. HOUSING.COM / MAGICBRICKS CURATED COLLECTIONS FOR UTTARAKHAND      */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-12 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Handpicked Collections</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Curated Homes for Every Need
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-xl">
                Tailored collections modeled around how families, students, and remote professionals rent in Uttarakhand.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CURATED_COLLECTIONS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-white rounded-2xl overflow-hidden border border-[#EBEBEB] hover:border-[#222222] hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-[#EBEBEB]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/95 text-[#222222] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-[#222222]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {item.priceTag}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#222222] group-hover:text-[#FF385C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-bold text-[#222222]">
                    <span>Explore Collection</span>
                    <Icon name="arrow_forward" size={15} className="text-[#FF385C] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. MAGICBRICKS DEHRADUN & UTTARAKHAND LOCALITY INTELLIGENCE           */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Locality Price &amp; Demand Guide</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Top Rental Neighborhoods in Uttarakhand
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-xl">
                Compare average monthly rents, tenant profiles, and verified inventory across Dehradun, Rishikesh, and Nainital.
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-bold text-[#FF385C] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore all localities</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {POPULAR_LOCALITIES.map((loc) => (
              <div
                key={loc.name}
                onClick={() => handleAreaClick(loc.name, loc.city)}
                className="bg-white rounded-2xl overflow-hidden border border-[#EBEBEB] hover:border-[#222222] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col active:scale-[0.99]"
              >
                <div className="relative h-44 overflow-hidden bg-[#EBEBEB]">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#222222] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {loc.city}
                  </span>

                  <span className="absolute top-3 right-3 bg-[#222222]/85 backdrop-blur-sm text-white font-bold text-[10px] px-2.5 py-1 rounded-full">
                    {loc.listingsCount}
                  </span>

                  <span className="absolute bottom-3 left-3 text-white font-bold text-lg leading-tight drop-shadow-sm">
                    {loc.name}
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-[#008A05] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 rounded-md mb-2">
                      {loc.tag}
                    </span>
                    <p className="text-xs text-[#717171] leading-relaxed line-clamp-2">
                      {loc.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">Typical Rent</p>
                      <p className="text-xs font-extrabold text-[#222222] tabular-nums">{loc.avgRent}/mo</p>
                    </div>
                    <span className="text-xs font-bold text-[#FF385C] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      See Homes <Icon name="chevron_right" size={15} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. SELLING USP: HOW ZERO-BROKERAGE WORKS + BROKER COMPARISON MATRIX   */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-14 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
          
          {/* 3-Step Direct Renting Workflow */}
          <div>
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Why Renters &amp; Landlords Switch</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                How Direct Renting Works on Ghar Foundation
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Designed specifically for Uttarakhand&apos;s rental market—transparent, legal, and 100% middleman-free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-6 border border-[#EBEBEB] flex flex-col justify-between relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center">
                        <Icon name={item.icon} size={22} />
                      </div>
                      <span className="text-xs font-extrabold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                        STEP {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-[#222222]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-[#EBEBEB] flex items-center gap-1.5 text-xs font-bold text-[#008A05]">
                    <Icon name="check_circle" size={15} fill className="text-[#008A05]" />
                    <span>{item.pill}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Savings Calculator + Comparison Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Interactive Brokerage Calculator */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-8 border border-[#EBEBEB] flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3 py-1 rounded-full">
                  Savings Calculator
                </span>
                <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-[#222222] mt-3">
                  Calculate how much you save by skipping local brokers
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-1.5 leading-relaxed">
                  Local property dealers in Dehradun and Rishikesh charge ₹300–₹500 just to show rooms, plus 15 to 30 days rent as non-refundable brokerage.
                </p>

                <div className="mt-6 space-y-3 bg-[#F7F7F7] p-4 sm:p-5 rounded-xl border border-[#EBEBEB]">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-[#222222]">
                    <span>Monthly Rent: ₹{rentSavingsCalc.toLocaleString("en-IN")}</span>
                    <span className="text-[#008A05]">Save ₹{rentSavingsCalc.toLocaleString("en-IN")} instantly</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="40000"
                    step="1000"
                    value={rentSavingsCalc}
                    onChange={(e) => setRentSavingsCalc(Number(e.target.value))}
                    className="w-full h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#717171] font-semibold">
                    <span>₹5,000/mo (Room Set)</span>
                    <span>₹20,000/mo (2 BHK)</span>
                    <span>₹40,000/mo (Villa)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#EBEBEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#717171]">Direct-to-Owner Savings</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#008A05] tabular-nums mt-0.5">
                    ₹{(rentSavingsCalc + 500).toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-semibold text-[#717171]">(incl. ₹500 visiting fee saved)</span>
                  </p>
                </div>
                <Link
                  href="/search"
                  className="btn-cta-primary text-xs sm:text-sm px-6 py-3.5 shrink-0"
                >
                  <span>Browse ₹0 Fee Homes</span>
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Ghar Foundation vs Local Brokers Table */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-8 border border-[#EBEBEB] flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#008A05] bg-[#E8F5E9] px-3 py-1 rounded-full">
                  Transparent Comparison
                </span>
                <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-[#222222] mt-3">
                  Ghar Foundation vs. Brokers
                </h3>

                <div className="mt-5 divide-y divide-[#EBEBEB] text-xs sm:text-sm">
                  {[
                    { label: "Brokerage Commission", us: "₹0 Always", them: "15–30 Days Rent" },
                    { label: "Property Visiting Charge", us: "₹0 Free Visits", them: "₹300–₹500 Registration" },
                    { label: "Homeowner Contact", us: "Direct Call & WhatsApp", them: "Hidden by Middleman" },
                    { label: "Identity & KYC Check", us: "UIDAI Aadhaar Verified", them: "Unverified Verbal Deal" },
                    { label: "Rental Agreement & Police KYC", us: "1-Click Digital Ready", them: "Manual & Extra Fees" },
                  ].map((row) => (
                    <div key={row.label} className="py-3 flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#222222]">{row.label}</span>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="hidden sm:inline text-[11px] text-[#717171] line-through">{row.them}</span>
                        <span className="bg-[#E8F5E9] text-[#008A05] font-bold text-[11px] px-2.5 py-1 rounded-md">
                          {row.us}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#EBEBEB] flex items-center justify-between text-xs text-[#717171]">
                <span>Verified under Uttarakhand Tenancy Guidelines</span>
                <Link href="/post-property" className="font-bold text-[#FF385C] hover:underline">
                  List Property Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. RESIDENT & HOMEOWNER STORIES (SOCIAL PROOF)                        */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl mb-6">
            <span className="text-[11px] font-bold text-[#008A05] uppercase tracking-wider">Trusted Across Uttarakhand</span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
              Loved by Tenants &amp; Homeowners in Dehradun &amp; Rishikesh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RESIDENT_STORIES.map((story) => (
              <div
                key={story.name}
                className="bg-[#F7F7F7] rounded-2xl p-6 border border-[#EBEBEB] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-0.5 text-[#FF385C]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Icon key={s} name="star" size={15} fill className="text-[#FF385C]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-[#008A05] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 rounded-full">
                      {story.saved}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#222222] leading-relaxed font-medium">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EBEBEB] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#222222] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {story.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#222222] truncate">{story.name}</p>
                    <p className="text-[11px] text-[#717171] truncate">{story.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. OWNER LISTING CALLOUT — AIRBNB HOST INSPIRATION                    */}
      {/* ===================================================================== */}
      <section className="py-9 sm:py-14 max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#222222] text-white p-6 sm:p-10 md:p-12 border border-[#222222]">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF385C]/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#008A05]/15 blur-[90px]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/15 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                <Icon name="verified" size={14} className="text-[#008A05]" fill />
                For Homeowners in Uttarakhand
              </span>

              <h2 className="font-sans font-extrabold text-2xl sm:text-4xl lg:text-[40px] leading-tight">
                Have a vacant room, flat, or floor?{" "}
                <span className="text-[#FF385C]">List it 100% Free.</span>
              </h2>

              <p className="mt-3 text-xs sm:text-base text-[#B0B0B0] leading-relaxed">
                Get inquiries exclusively from Aadhaar-verified families, working professionals, and students. Post online in 2 minutes or send your property photos on WhatsApp.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#EBEBEB]">
                <span className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={15} className="text-[#008A05]" fill />
                  Aadhaar-verified tenants
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={15} className="text-[#008A05]" fill />
                  Police KYC &amp; 11-Month Lease
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check_circle" size={15} className="text-[#008A05]" fill />
                  Zero commission forever
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:min-w-[260px]">
              <Link
                href="/post-property"
                className="btn-cta-primary text-sm px-6 py-3.5"
              >
                <Icon name="add_home" size={18} className="text-white" />
                <span>Post Property Online</span>
              </Link>

              <a
                href="https://wa.me/919999999999?text=Hello,%20I%20want%20to%20list%20my%20rental%20property%20on%20Ghar%20Foundation."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta-whatsapp text-sm px-6 py-3.5"
              >
                <Icon name="chat" size={18} className="text-white" />
                <span>List via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
