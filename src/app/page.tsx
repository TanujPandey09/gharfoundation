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
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
  },
  {
    name: "Prem Nagar",
    city: "Dehradun",
    tag: "Colleges & UPES Hub",
    desc: "Student PGs, independent room sets & studio flats",
    avgRent: "₹5,000 - ₹12,000",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
  },
  {
    name: "Jakhan",
    city: "Dehradun",
    tag: "Central & Lively",
    desc: "Pacific Mall proximity, modern flats & family floors",
    avgRent: "₹12,000 - ₹24,000",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
  },
  {
    name: "Clement Town",
    city: "Dehradun",
    tag: "Graphic Era Hub",
    desc: "Peaceful environment, bachelors & faculty homes",
    avgRent: "₹6,000 - ₹14,000",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",
  },
  {
    name: "Tapovan",
    city: "Rishikesh",
    tag: "Yoga & River Views",
    desc: "Furnished studios, serene cottages & long-stay suites",
    avgRent: "₹8,000 - ₹22,000",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
  },
  {
    name: "Haldwani",
    city: "Nainital",
    tag: "Gateway Commercial",
    desc: "Affordable 1 & 2 BHK independent floors & markets",
    avgRent: "₹5,000 - ₹15,000",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
  },
];

const CATEGORY_TABS = [
  { id: "ROOM_SET_1", label: "Room Sets", icon: "bed", sub: "Kitchen + Bath" },
  { id: "BHK_1", label: "1 BHK Flats", icon: "apartment", sub: "Couples & Singles" },
  { id: "BHK_2", label: "2 BHK Homes", icon: "home", sub: "Family Favorite" },
  { id: "INDEPENDENT_HOUSE", label: "Floors & Houses", icon: "domain", sub: "Private Compound" },
  { id: "PG", label: "PG & Hostels", icon: "groups", sub: "Students & Co-live" },
  { id: "VILLA", label: "Cottages", icon: "holiday_village", sub: "Hill View Retreats" },
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
    if (selectedTenant) params.append("gender", selectedTenant);
    if (budgetMax) params.append("maxRent", budgetMax);
    router.push(`/search?${params.toString()}`);
  };

  const handleAreaClick = (area: string, city: string) => {
    router.push(`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(area)}`);
  };

  return (
    <div className="bg-white min-h-screen text-[#222222] antialiased">
      
      {/* ===================================================================== */}
      {/* 1. HERO SECTION — AIRBNB MINIMAL CANVAS + HOUSING.COM SEARCH BAR      */}
      {/* ===================================================================== */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 border-b border-[#EBEBEB] bg-gradient-to-b from-[#F7F7F7]/50 to-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          {/* Trust Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              <Icon name="verified" size={15} fill className="text-forest-600" />
              <span>Uttarakhand's Direct Owner Rental Network · ₹0 Brokerage Always</span>
            </div>

            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#717171]">
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={15} className="text-forest-600" fill />
                Aadhaar KYC Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={15} className="text-forest-600" fill />
                Direct Owner Contact
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check_circle" size={15} className="text-forest-600" fill />
                Police Verification Ready
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="max-w-3xl mb-8">
            <h1 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-[54px] tracking-tight leading-[1.12] text-[#222222]">
              Rent directly from homeowners in Uttarakhand,{" "}
              <span className="text-[#FF385C]">without broker fees.</span>
            </h1>
            <p className="mt-3.5 text-base sm:text-lg text-[#717171] leading-relaxed max-w-2xl font-normal">
              Skip middlemen commission and fake listings. Browse verified 1 RK, room sets, 1/2 BHK flats, and cottages in Dehradun, Rishikesh, and Haldwani.
            </p>
          </div>

          {/* ================================================================= */}
          {/* AIRBNB-STYLE FLOATING MULTI-SEGMENT SEARCH CARD                   */}
          {/* ================================================================= */}
          <div className="bg-white rounded-3xl shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-[#EBEBEB] p-4 sm:p-6 transition-all hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <form onSubmit={handleSearchSubmit}>
              
              {/* Tenant Preferences Filter Strip */}
              <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-[#EBEBEB] text-xs font-bold">
                <span className="text-[#717171] mr-1.5 font-semibold">Tenant preference:</span>
                {[
                  { id: "FAMILY", label: "Family", icon: "family_restroom" },
                  { id: "COUPLE", label: "Couples / Married", icon: "favorite" },
                  { id: "BACHELOR", label: "Working Professionals", icon: "person" },
                  { id: "FEMALE", label: "Female Only", icon: "shield" },
                  { id: "ANY", label: "All Welcome", icon: "all_inclusive" },
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

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                
                {/* Location Search Input */}
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    City or Locality
                  </label>
                  <div className="flex items-center gap-3 bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#222222] focus-within:ring-2 focus-within:ring-[#222222]/10 transition-all">
                    <Icon name="search" size={20} className="text-[#FF385C] shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Rajpur Road, Prem Nagar, Tapovan..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none placeholder:text-[#B0B0B0] text-[#222222]"
                    />
                  </div>
                </div>

                {/* Configuration Dropdown */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Configuration
                  </label>
                  <div className="relative bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold focus:outline-none text-[#222222] appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Any room or flat</option>
                      <option value="ROOM_SET_1">1 Room Set (Kitchen+Bath)</option>
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

                {/* Max Budget Dropdown */}
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
                      <option value="">Any budget</option>
                      <option value="6000">Up to ₹6,000</option>
                      <option value="10000">Up to ₹10,000</option>
                      <option value="15000">Up to ₹15,000</option>
                      <option value="25000">Up to ₹25,000</option>
                      <option value="40000">Up to ₹40,000</option>
                    </select>
                    <Icon
                      name="expand_more"
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Search CTA (Airbnb Rausch #FF385C) */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-[48px] bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Icon name="search" size={18} className="text-white" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Locality Quick-Picks Strip */}
              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#717171] font-bold flex items-center gap-1">
                  <Icon name="place" size={14} className="text-[#FF385C]" />
                  Popular Localities:
                </span>
                {POPULAR_LOCALITIES.slice(0, 5).map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleAreaClick(loc.name, loc.city)}
                    className="text-[#222222] bg-[#F7F7F7] hover:bg-[#EBEBEB] px-3 py-1 rounded-full transition-colors font-semibold border border-[#EBEBEB]"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#EBEBEB]">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222] tabular-nums">₹0</div>
              <div className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Brokerage Fees</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222] tabular-nums">100%</div>
              <div className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Direct Homeowners</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222] tabular-nums">13</div>
              <div className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Uttarakhand Districts</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-forest-700 tabular-nums">UIDAI</div>
              <div className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">Aadhaar Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. AIRBNB HORIZONTAL CATEGORY BAR                                     */}
      {/* ===================================================================== */}
      <section className="py-10 border-b border-[#EBEBEB] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">Explore Options</span>
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#222222] mt-0.5">
                Popular Rental Setups
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-bold text-[#FF385C] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <Icon name="arrow_forward" size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/search?type=${cat.id}`)}
                className="text-left p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] hover:bg-white hover:border-[#222222] hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-[#222222] group-hover:bg-[#FF385C] group-hover:text-white flex items-center justify-center mb-3 shadow-sm transition-colors">
                  <Icon name={cat.icon} size={22} />
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
      {/* 3. MAGICBRICKS DEHRADUN & UTTARAKHAND LOCALITY INTELLIGENCE           */}
      {/* ===================================================================== */}
      <section className="py-14 sm:py-20 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">Locality Guide</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Explore Top Localities in Uttarakhand
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-xl">
                Compare typical rents, tenant profiles, and nearby amenities across Dehradun, Rishikesh, and Nainital.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_LOCALITIES.map((loc) => (
              <div
                key={loc.name}
                onClick={() => handleAreaClick(loc.name, loc.city)}
                className="bg-white rounded-2xl overflow-hidden border border-[#EBEBEB] hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-[#EBEBEB]">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#222222] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {loc.city}
                  </span>

                  <span className="absolute bottom-3 left-3 text-white font-bold text-lg leading-tight drop-shadow-sm">
                    {loc.name}
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-md mb-2">
                      {loc.tag}
                    </span>
                    <p className="text-xs text-[#717171] leading-relaxed line-clamp-2">
                      {loc.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">Avg. Rent</p>
                      <p className="text-xs font-bold text-[#222222] tabular-nums">{loc.avgRent}/mo</p>
                    </div>
                    <span className="text-xs font-bold text-[#FF385C] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      View Homes <Icon name="chevron_right" size={15} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. VERIFIED LISTINGS SECTION — REAL PROPERTYCARD COMPONENTS           */}
      {/* ===================================================================== */}
      <section className="py-14 sm:py-20 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold text-forest-700 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="verified" size={14} fill className="text-forest-600" />
                Verified by Local Team
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Fresh Direct Owner Homes
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Aadhaar verified landlords, inspected premises, zero middleman fees.
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
                <div key={i} className="h-80 rounded-2xl bg-[#F7F7F7] animate-pulse border border-[#EBEBEB]" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.slice(0, 8).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <Icon name="home_work" size={44} className="text-[#B0B0B0] mx-auto mb-3" />
              <h3 className="font-bold text-lg text-[#222222]">
                New verified rooms being onboarded this week
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] max-w-sm mx-auto mt-1 mb-5">
                Explore listings across Dehradun, Rishikesh, and Haldwani, or list your own property today for free.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. HOUSING.COM INTERACTIVE SAVINGS CALCULATOR & TRUST MATRIX          */}
      {/* ===================================================================== */}
      <section className="py-14 sm:py-20 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBEBEB] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-rausch-100 px-3 py-1 rounded-full">
                Brokerage Calculator
              </span>
              <h3 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-3">
                How much do you save by skipping brokers?
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] mt-1.5 leading-relaxed">
                Traditional brokers in Dehradun charge between 15 days to 1 full month's rent as non-refundable commission. With Ghar Foundation, that money stays with you.
              </p>
              
              <div className="mt-6 space-y-3 bg-[#F7F7F7] p-4 rounded-2xl border border-[#EBEBEB]">
                <div className="flex justify-between items-center text-xs font-bold text-[#222222]">
                  <span>Your Monthly Rent: ₹{rentSavingsCalc.toLocaleString()}</span>
                  <span className="text-[#FF385C]">1 Month Commission Saved</span>
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
                  <span>₹5,000/mo</span>
                  <span>₹40,000/mo</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 rounded-3xl text-center shrink-0 w-full sm:w-auto sm:min-w-[300px]">
              <p className="text-xs text-[#717171] font-extrabold uppercase tracking-wider">Day-1 Savings in Your Pocket</p>
              <p className="text-4xl sm:text-5xl font-extrabold text-forest-700 mt-2 tabular-nums">
                ₹{rentSavingsCalc.toLocaleString()}
              </p>
              <p className="text-xs text-[#717171] mt-1 font-semibold">Zero brokerage guaranteed</p>
              <Link
                href="/search"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <span>Find Zero-Fee Homes</span>
                <Icon name="arrow_forward" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. OWNER LISTING CALLOUT — AIRBNB HOST INSPIRATION                    */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="relative rounded-3xl overflow-hidden bg-[#222222] text-white p-8 sm:p-14 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF385C]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full mb-4">
              For Property Owners in Uttarakhand
            </span>

            <h2 className="font-sans font-extrabold text-3xl sm:text-5xl leading-tight">
              Rent out your property.{" "}
              <span className="text-[#FF385C]">100% Free forever.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#B0B0B0] leading-relaxed">
              No subscription charges. No broker commissions. List your room, flat, or floor online in 2 minutes, or simply send your photos on WhatsApp — our local team handles verification and publishing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/post-property"
                className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm px-7 py-4 rounded-xl transition-transform active:scale-95 shadow-md"
              >
                <Icon name="add_home" size={18} className="text-white" />
                <span>List Property Online</span>
              </Link>

              <a
                href="https://wa.me/919999999999?text=Hello,%20I%20want%20to%20list%20my%20rental%20property%20on%20Ghar%20Foundation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-7 py-4 rounded-xl transition-transform active:scale-95 shadow-md"
              >
                <Icon name="chat" size={18} className="text-white" />
                <span>Send Photos via WhatsApp</span>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-[#B0B0B0]">
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-forest-400" /> Aadhaar-verified renters only</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-forest-400" /> Uttarakhand Police verification support</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-forest-400" /> 100% direct contact with tenants</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
