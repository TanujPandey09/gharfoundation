"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/shared/Icon";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/lib/types";

// Uttarakhand Localities with Hyperlocal Insights
const POPULAR_LOCALITIES = [
  {
    name: "Prem Nagar & Bidholi",
    city: "Dehradun",
    tag: "UPES & Colleges Hub",
    desc: "Walking distance to UPES shuttle stops, student PGs, room sets & independent flats",
    avgRent: "₹5,500 - ₹12,000",
    listingsCount: "60+ Direct Homes",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
    query: "Prem Nagar",
  },
  {
    name: "Clement Town",
    city: "Dehradun",
    tag: "Graphic Era Hub",
    desc: "Peaceful environment, walking distance to GEU / GEHU, bachelors & faculty homes",
    avgRent: "₹6,000 - ₹14,000",
    listingsCount: "50+ Direct Homes",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop&q=80",
    query: "Clement Town",
  },
  {
    name: "Rajpur Road & Jakhan",
    city: "Dehradun",
    tag: "Upscale & Families",
    desc: "Scenic foothills, Pacific Mall proximity, gated 2/3 BHK floors & modern apartments",
    avgRent: "₹14,000 - ₹30,000",
    listingsCount: "45+ Direct Homes",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    query: "Rajpur Road",
  },
  {
    name: "Mussoorie Diversion & DIT",
    city: "Dehradun",
    tag: "DIT & IMS Hub",
    desc: "Fresh mountain air, peaceful student studios, room sets & family cottages",
    avgRent: "₹7,000 - ₹16,000",
    listingsCount: "35+ Direct Homes",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
    query: "DIT",
  },
  {
    name: "Tapovan & Laxman Jhula",
    city: "Rishikesh",
    tag: "Yoga & River Views",
    desc: "Furnished studios, serene hill cottages, fast Wi-Fi & work-from-mountains stays",
    avgRent: "₹9,000 - ₹24,000",
    listingsCount: "40+ Direct Homes",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    query: "Tapovan",
  },
  {
    name: "Haldwani & Kathgodam",
    city: "Nainital",
    tag: "Kumaon Gateway",
    desc: "Affordable 1, 2 & 3 BHK independent floors, market proximity & family residences",
    avgRent: "₹5,000 - ₹15,000",
    listingsCount: "30+ Direct Homes",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    query: "Haldwani",
  },
];

const CATEGORY_TABS = [
  { id: "ROOM_SET_1", label: "Room Sets", icon: "bed", sub: "Kitchen + Bath (Budget Pick)" },
  { id: "BHK_1", label: "1 BHK Flats", icon: "apartment", sub: "Couples & Singles" },
  { id: "BHK_2", label: "2 BHK Floors", icon: "home", sub: "Family Favorite" },
  { id: "INDEPENDENT_HOUSE", label: "Full Houses", icon: "domain", sub: "Private Compound & Gated" },
  { id: "PG", label: "PG & Hostels", icon: "groups", sub: "Students & Co-living with Meals" },
  { id: "VILLA", label: "Hill Cottages", icon: "holiday_village", sub: "Panoramic Valley Views" },
];

const CURATED_COLLECTIONS = [
  {
    title: "Family Floors with Car Parking",
    subtitle: "2 & 3 BHK independent floors with broad car access, water tanks & gated entry",
    badge: "Family Pick",
    priceTag: "From ₹12,000/mo",
    href: "/search?gender=FAMILY&type=BHK_2",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Campus PGs Near UPES & Graphic Era",
    subtitle: "5–10 mins from college gates. High-speed Wi-Fi, home-cooked food & no broker fee",
    badge: "Students",
    priceTag: "From ₹5,500/mo",
    href: "/search?gender=BACHELOR&type=PG",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Budget 1 Room Sets Under ₹7,500",
    subtitle: "Private Room + Kitchen + Attached Washroom with zero bachelor restrictions",
    badge: "Best Value",
    priceTag: "₹4,500 – ₹7,500/mo",
    href: "/search?maxRent=7500",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&auto=format&fit=crop&q=80",
  },
  {
    title: "Furnished Work-from-Hills Stays",
    subtitle: "Balcony views, high-speed fiber internet & inverter backup in Tapovan & Rajpur",
    badge: "Remote Work",
    priceTag: "From ₹11,000/mo",
    href: "/search?q=Tapovan",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&auto=format&fit=crop&q=80",
  },
];

const FAQS = [
  {
    q: "Why is Uttarakhand Police verification mandatory for tenants?",
    a: "Under the Uttarakhand Police Act, every landlord is legally obligated to register their tenant's identity with the local police station (Thana). Non-compliance attracts fines of ₹5,000 to ₹10,000 or police inspection. Ghar Foundation solves this by automatically preparing the official pre-filled Uttarakhand Police Verification PDF from your dashboard.",
  },
  {
    q: "How is Ghar Foundation 100% free of brokerage?",
    a: "We connect tenants directly with verified homeowners and building caretakers. There are no middlemen, no dealers taking 15 to 30 days of your rent, and zero visiting charges. You talk directly with the owner on phone or WhatsApp.",
  },
  {
    q: "Can UPES, Graphic Era, and DIT students rent without hassle?",
    a: "Yes! Dehradun hosts over 100,000 university students. We have dedicated collections of verified PGs, studio flats, and independent room sets near UPES (Bidholi/Kandoli), Graphic Era (Clement Town), and DIT (Mussoorie Diversion) with transparent meal plans and study-friendly environments.",
  },
  {
    q: "What makes your hill listings different from national portals?",
    a: "National portals like MagicBricks or 99acres don't understand Uttarakhand realities. We show critical hill amenities: municipal water supply hours vs 24/7 tanks, 4-wheeler motorable road slope vs steep stairs, winter power backup/inverters, and college shuttle access.",
  },
  {
    q: "I am a homeowner. What do I get during the early launch?",
    a: "During our early launch, listing your home is 100% free with lifetime basic visibility. You also get free access to our automated 11-month rental agreement generator and instant pre-filled Uttarakhand Police verification dossiers for every tenant who moves in.",
  },
];

export default function HomePage() {
  const router = useRouter();

  // Search form states
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("FAMILY");
  const [budgetMax, setBudgetMax] = useState("");
  const [activePersonaTab, setActivePersonaTab] = useState<"ALL" | "STUDENTS" | "FAMILIES" | "REMOTE">("ALL");

  // Interactive savings calculator
  const [rentSavingsCalc, setRentSavingsCalc] = useState(14000);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Live properties query
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

  const handleLocalityClick = (query: string, city: string) => {
    router.push(`/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(query)}`);
  };

  const handlePersonaSelect = (persona: "ALL" | "STUDENTS" | "FAMILIES" | "REMOTE") => {
    setActivePersonaTab(persona);
    if (persona === "STUDENTS") {
      setSelectedTenant("BACHELOR");
      setLocationQuery("Prem Nagar");
    } else if (persona === "FAMILIES") {
      setSelectedTenant("FAMILY");
      setSelectedType("BHK_2");
    } else if (persona === "REMOTE") {
      setSelectedTenant("ANY");
      setLocationQuery("Tapovan");
    } else {
      setSelectedTenant("FAMILY");
      setLocationQuery("");
      setSelectedType("");
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#222222] antialiased">

      {/* ===================================================================== */}
      {/* 1. HERO SECTION — HIGH IMPACT USP & ELEVATED SEARCH ENGINE            */}
      {/* ===================================================================== */}
      <section className="hero-mesh-bg relative overflow-hidden pt-4 sm:pt-7 pb-8 sm:pb-12 border-b border-[#EBEBEB]">
        {/* Ambient Subtle Gradients */}
        <div className="pointer-events-none absolute inset-0 hero-dot-grid opacity-40" />
        <div className="pointer-events-none absolute -top-24 -left-20 w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-gradient-to-br from-[#FF385C]/18 via-[#FF6B81]/10 to-transparent blur-[90px]" />
        <div className="pointer-events-none absolute -top-16 right-[-8%] w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full bg-gradient-to-bl from-amber-300/18 via-rose-200/10 to-transparent blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 right-[15%] w-[300px] sm:w-[440px] h-[300px] sm:h-[440px] rounded-full bg-gradient-to-tr from-[#008A05]/12 via-emerald-200/8 to-transparent blur-[90px]" />

        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">

          {/* Top Trust & Compliance Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#C8E6C9] text-[#008A05] text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#008A05] animate-ping shrink-0" />
              <span>Uttarakhand&apos;s 1st Legal &amp; Direct Rental Network</span>
              <span className="text-[#222222]/40 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-[#222222]/80 font-semibold">Zero Brokerage</span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-[#222222]/80 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EBEBEB] shadow-sm">
              <span className="flex items-center gap-1.5">
                <Icon name="local_police" size={15} className="text-[#008A05]" />
                <span className="text-[#008A05] font-bold">Police Verification Ready</span>
              </span>
              <span className="text-[#DDDDDD]">•</span>
              <span className="flex items-center gap-1.5">
                <Icon name="verified_user" size={15} className="text-[#FF385C]" />
                <span>100% Direct Landlords</span>
              </span>
              <span className="text-[#DDDDDD]">•</span>
              <span className="flex items-center gap-1.5">
                <Icon name="description" size={15} className="text-blue-600" />
                <span>Instant 11-Month Lease</span>
              </span>
            </div>
          </div>

          {/* Main Headline & Selling Proposition */}
          <div className="max-w-3xl mb-5 sm:mb-7">
            <h1 className="font-sans font-extrabold text-[30px] sm:text-5xl lg:text-[52px] tracking-tight leading-[1.12] text-[#222222]">
              Rent legally &amp; directly in Uttarakhand.{" "}
              <span className="bg-gradient-to-r from-[#FF385C] via-[#F22952] to-[#E00B41] bg-clip-text text-transparent">
                Zero broker fees. Police verified.
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#717171] leading-relaxed max-w-2xl font-normal">
              Connect directly with verified homeowners across Dehradun, Rishikesh, and Nainital. Pre-filled Uttarakhand Police tenant verification forms &amp; digital 11-month rent agreements generated automatically.
            </p>
          </div>

          {/* Quick Persona Filter Tabs */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-[#717171] uppercase tracking-wider hidden sm:inline mr-1">
              Looking for:
            </span>
            {[
              { id: "ALL", label: "All Properties", icon: "explore" },
              { id: "STUDENTS", label: "🎓 Students & Colleges (UPES / GEU)", icon: "school" },
              { id: "FAMILIES", label: "👨‍👩‍👧 Family Floors & 2/3 BHK", icon: "family_restroom" },
              { id: "REMOTE", label: "💻 Work-from-Hills & Studios", icon: "laptop_chromebook" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePersonaSelect(tab.id as any)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
                  activePersonaTab === tab.id
                    ? "bg-[#222222] text-white shadow-sm"
                    : "bg-white/85 text-[#717171] hover:text-[#222222] hover:bg-white border border-[#EBEBEB]"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ================================================================= */}
          {/* FLOATING MULTI-SEGMENT SEARCH CARD                                */}
          {/* ================================================================= */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_16px_40px_-10px_rgba(255,56,92,0.14),0_6px_24px_-4px_rgba(34,34,34,0.06)] border border-white ring-1 ring-[#EBEBEB] p-4 sm:p-5 transition-shadow hover:shadow-[0_20px_48px_-10px_rgba(255,56,92,0.18)]">
            <form onSubmit={handleSearchSubmit}>

              {/* Tenant Preferences Filter Strip */}
              <div className="flex items-center gap-2 pb-3.5 mb-3.5 border-b border-[#EBEBEB] text-xs font-bold overflow-x-auto no-scrollbar -mx-1 px-1">
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
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-150 active:scale-[0.98] ${selectedTenant === item.id
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
                    City, College, or Locality
                  </label>
                  <div className="flex items-center gap-2.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 h-12 focus-within:bg-white focus-within:border-[#222222] transition-all">
                    <Icon name="search" size={19} className="text-[#FF385C] shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. UPES Bidholi, Graphic Era, Rajpur Rd, Tapovan..."
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
                      <option value="">All Configurations</option>
                      <option value="ROOM_SET_1">1 Room Set (Kitchen+Bath)</option>
                      <option value="ROOM_SET_2">2 Room Set</option>
                      <option value="BHK_1">1 BHK Flat</option>
                      <option value="BHK_2">2 BHK Flat / Floor</option>
                      <option value="BHK_3">3 BHK Flat / Floor</option>
                      <option value="RK_1">1 RK Studio</option>
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

              {/* Campus & Hot Spots Quick-Picks Strip */}
              <div className="mt-3.5 pt-3 border-t border-[#EBEBEB]/70 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
                <span className="text-[#717171] font-bold flex items-center gap-1 shrink-0">
                  <Icon name="local_fire_department" size={15} className="text-[#FF385C]" />
                  <span>Popular:</span>
                </span>
                {[
                  { label: "UPES Bidholi", query: "Bidholi", city: "Dehradun" },
                  { label: "Graphic Era (Clement Town)", query: "Clement Town", city: "Dehradun" },
                  { label: "DIT Mussoorie Diversion", query: "DIT", city: "Dehradun" },
                  { label: "Rajpur Road", query: "Rajpur Road", city: "Dehradun" },
                  { label: "Tapovan Rishikesh", query: "Tapovan", city: "Rishikesh" },
                  { label: "Jakhan / Pacific Mall", query: "Jakhan", city: "Dehradun" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleLocalityClick(chip.query, chip.city)}
                    className="text-[#222222] bg-[#F7F7F7] hover:bg-[#EBEBEB] px-3 py-1 rounded-full transition-colors font-semibold border border-[#EBEBEB] whitespace-nowrap shrink-0 active:scale-[0.98]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Value Proof Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#EBEBEB]/80">
            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-[#EBEBEB] shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222] tabular-nums">₹0</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">
                Brokerage Commission
              </div>
              <p className="text-[10px] text-[#008A05] font-semibold mt-1">Save ₹10,000–₹25,000 per deal</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-[#EBEBEB] shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#008A05] tabular-nums flex items-center gap-1">
                <span>Thana Ready</span>
              </div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">
                Police Verification Form
              </div>
              <p className="text-[10px] text-[#717171] font-semibold mt-1">Avoid ₹10,000 state penalty</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-[#EBEBEB] shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#222222] tabular-nums">100%</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">
                Direct Homeowners
              </div>
              <p className="text-[10px] text-[#717171] font-semibold mt-1">Direct owner calls &amp; WhatsApp</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-[#EBEBEB] shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FF385C] tabular-nums">11-Month</div>
              <div className="text-[11px] sm:text-xs text-[#717171] font-bold uppercase tracking-wider mt-0.5">
                Digital Rent Lease
              </div>
              <p className="text-[10px] text-[#717171] font-semibold mt-1">Instant lawyer-drafted PDF</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. OUR KILLER USP: 3 PILLARS THAT NATIONAL APPS DON'T TOUCH            */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="max-w-3xl mb-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3 py-1 rounded-full mb-2">
              <Icon name="stars" size={14} />
              The Uttarakhand Advantage
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-[#222222] tracking-tight">
              Why national rental portals fail in Uttarakhand.
            </h2>
            <p className="text-sm sm:text-base text-[#717171] mt-2 leading-relaxed">
              MagicBricks and 99acres are filled with broker syndicates. OLX and Facebook groups are full of advance-fee scams. Ghar Foundation is custom-built for Uttarakhand&apos;s legal mandates and hill living realities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1: Mandatory Legal Compliance */}
            <div className="rounded-2xl p-6 sm:p-7 bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#008A05] hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-200 text-[#008A05] flex items-center justify-center">
                    <Icon name="local_police" size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-forest-100 text-forest-800 px-2.5 py-1 rounded-full">
                    Legal Mandate
                  </span>
                </div>
                <h3 className="font-sans font-extrabold text-lg sm:text-xl text-[#222222] mb-2">
                  Uttarakhand Police Verification &amp; 11-Month Lease
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                  State police actively fine landlords up to ₹10,000 for unverified tenants. We automatically prepare your official pre-filled Police Verification Dossier and standard 11-month rent agreement right from your dashboard.
                </p>

                {/* Visual Mock Badge */}
                <div className="mt-4 p-3 bg-white rounded-xl border border-[#EBEBEB] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#222222] truncate">UK_Police_Verification_Form.pdf</p>
                    <p className="text-[10px] text-[#008A05] font-semibold">Pre-filled with tenant Aadhaar &amp; photo</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-bold text-[#008A05]">
                <span>Zero Police Thana Hassle</span>
                <Icon name="check_circle" size={16} fill />
              </div>
            </div>

            {/* Pillar 2: Hill-Aware Infrastructure Intelligence */}
            <div className="rounded-2xl p-6 sm:p-7 bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#FF385C] hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-[#FF385C] flex items-center justify-center">
                    <Icon name="terrain" size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                    Hill Infrastructure
                  </span>
                </div>
                <h3 className="font-sans font-extrabold text-lg sm:text-xl text-[#222222] mb-2">
                  Foothill Amenities National Apps Ignore
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                  In Uttarakhand, renting isn&apos;t just about square feet. Every verified listing details municipal water supply hours, 4-wheeler vehicle slope access, power backup inverters, and exact campus gate distances.
                </p>

                {/* Foothill spec pills */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <div className="p-2 bg-white rounded-lg border border-[#EBEBEB] flex items-center gap-1.5 text-[#222222]">
                    <Icon name="water_drop" size={14} className="text-blue-500" />
                    <span>Water Hours</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EBEBEB] flex items-center gap-1.5 text-[#222222]">
                    <Icon name="directions_car" size={14} className="text-amber-600" />
                    <span>Car Slope Access</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EBEBEB] flex items-center gap-1.5 text-[#222222]">
                    <Icon name="bolt" size={14} className="text-yellow-500" />
                    <span>Inverter Backup</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EBEBEB] flex items-center gap-1.5 text-[#222222]">
                    <Icon name="school" size={14} className="text-[#FF385C]" />
                    <span>Campus Proximity</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-bold text-[#FF385C]">
                <span>No Mountain Surprises</span>
                <Icon name="check_circle" size={16} fill />
              </div>
            </div>

            {/* Pillar 3: Direct Owner Network & No Broker Scams */}
            <div className="rounded-2xl p-6 sm:p-7 bg-[#F7F7F7] border border-[#EBEBEB] hover:border-blue-600 hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Icon name="handshake" size={26} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                    Zero Brokerage
                  </span>
                </div>
                <h3 className="font-sans font-extrabold text-lg sm:text-xl text-[#222222] mb-2">
                  100% Direct Owners · Zero Middlemen Fees
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                  Local property dealers charge ₹300–₹500 just to show rooms and a full month&apos;s rent as commission. On Ghar Foundation, you deal directly with homeowners via phone or WhatsApp with transparent deposits.
                </p>

                {/* Direct Connect Mock Card */}
                <div className="mt-4 p-3 bg-white rounded-xl border border-[#EBEBEB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#008A05] flex items-center justify-center">
                      <Icon name="phone" size={14} />
                    </div>
                    <span className="text-xs font-bold text-[#222222]">Direct Call &amp; WhatsApp</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#008A05] bg-emerald-50 px-2 py-0.5 rounded-md">₹0 Fee</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Save 1 Month&apos;s Rent</span>
                <Icon name="check_circle" size={16} fill />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. AIRBNB HORIZONTAL CATEGORY BAR                                     */}
      {/* ===================================================================== */}
      <section className="py-8 sm:py-10 border-b border-[#EBEBEB] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Browse Configurations</span>
              <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-[#222222] mt-0.5">
                Explore by Property Type
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-bold text-[#222222] hover:text-[#FF385C] flex items-center gap-1 transition-colors shrink-0"
            >
              <span>View all</span>
              <Icon name="arrow_forward" size={15} />
            </Link>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/search?type=${cat.id}`)}
                className="min-w-[155px] sm:min-w-0 shrink-0 text-left p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] hover:bg-white hover:border-[#222222] hover:shadow-md transition-all duration-150 active:scale-[0.98] group"
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
      {/* 4. VERIFIED DIRECT LISTINGS (LIVE DB INVENTORY)                       */}
      {/* ===================================================================== */}
      <section className="py-10 sm:py-14 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#008A05] uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="verified" size={14} fill className="text-[#008A05]" />
                Direct Owner Inventory
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Verified Homes in Uttarakhand
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1">
                Aadhaar-verified homeowners, genuine photographs, transparent security deposits, and zero middleman fee.
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
                New verified homes being added daily
              </h3>
              <p className="text-xs sm:text-sm text-[#717171] max-w-sm mx-auto mt-1 mb-5">
                Explore homes across Dehradun, Rishikesh, and Haldwani, or list your property free.
              </p>
              <Link
                href="/post-property"
                className="btn-cta-primary text-xs px-6 py-3"
              >
                List Your Property Free
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. CURATED COLLECTIONS FOR UTTARAKHAND                                */}
      {/* ===================================================================== */}
      <section className="py-10 sm:py-14 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Handpicked Collections</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Curated for How Uttarakhand Lives &amp; Studies
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-xl">
                Tailored collections designed specifically around families, college students, and remote professionals.
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
                  <span className="absolute top-3 left-3 bg-white/95 text-[#222222] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
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
                    <span>Browse Collection</span>
                    <Icon name="arrow_forward" size={15} className="text-[#FF385C] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. TOP RENTAL LOCALITIES & PRICE GUIDE                                */}
      {/* ===================================================================== */}
      <section className="py-10 sm:py-14 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider">Locality &amp; Campus Guide</span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#222222] mt-1">
                Top Foothill Hubs in Dehradun &amp; Rishikesh
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-xl">
                Compare typical monthly rents, tenant profiles, and verified direct inventory across key educational and residential clusters.
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
                onClick={() => handleLocalityClick(loc.query, loc.city)}
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
                      Browse Homes <Icon name="chevron_right" size={15} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. INTERACTIVE SAVINGS CALCULATOR + COMPARISON MATRIX                  */}
      {/* ===================================================================== */}
      <section className="py-10 sm:py-16 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left: Interactive Brokerage Calculator */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#EBEBEB] shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3 py-1 rounded-full">
                  Savings Calculator
                </span>
                <h3 className="font-sans font-extrabold text-xl sm:text-3xl text-[#222222] mt-3">
                  How much do you save by skipping brokers?
                </h3>
                <p className="text-xs sm:text-sm text-[#717171] mt-2 leading-relaxed">
                  Local property dealers in Dehradun and Rishikesh demand ₹300–₹500 just for room visits, plus a full month&apos;s rent (15–30 days) as brokerage. Here is your direct savings:
                </p>

                {/* Slider Box */}
                <div className="mt-6 space-y-3 bg-[#F7F7F7] p-4 sm:p-6 rounded-2xl border border-[#EBEBEB]">
                  <div className="flex justify-between items-center text-sm font-bold text-[#222222]">
                    <span>Monthly Rent: ₹{rentSavingsCalc.toLocaleString("en-IN")}</span>
                    <span className="text-[#008A05]">Commission Saved: ₹{rentSavingsCalc.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="40000"
                    step="1000"
                    value={rentSavingsCalc}
                    onChange={(e) => setRentSavingsCalc(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#717171] font-semibold">
                    <span>₹5,000/mo (Student PG / Room Set)</span>
                    <span>₹20,000/mo (2 BHK)</span>
                    <span>₹40,000/mo (Villa)</span>
                  </div>
                </div>

                {/* Savings Breakdown */}
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="p-3 bg-white rounded-xl border border-[#EBEBEB]">
                    <p className="text-[10px] font-bold text-[#717171] uppercase">Brokerage Fee</p>
                    <p className="text-sm font-extrabold text-[#222222] mt-0.5">₹{rentSavingsCalc.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EBEBEB]">
                    <p className="text-[10px] font-bold text-[#717171] uppercase">Visiting Fees (3-4)</p>
                    <p className="text-sm font-extrabold text-[#222222] mt-0.5">₹1,200</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#EBEBEB]">
                    <p className="text-[10px] font-bold text-[#717171] uppercase">Agreement Drafting</p>
                    <p className="text-sm font-extrabold text-[#222222] mt-0.5">₹1,000</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#EBEBEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#717171]">Total In-Pocket Savings</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#008A05] tabular-nums mt-0.5">
                    ₹{(rentSavingsCalc + 2200).toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-semibold text-[#717171]">saved instantly</span>
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

            {/* Right: Ghar Foundation vs Local Dealers Comparison Matrix */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-[#EBEBEB] shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#008A05] bg-[#E8F5E9] px-3 py-1 rounded-full">
                  Fair Comparison
                </span>
                <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-[#222222] mt-3">
                  Ghar Foundation vs. Local Dealers
                </h3>

                <div className="mt-5 divide-y divide-[#EBEBEB] text-xs sm:text-sm">
                  {[
                    { label: "Brokerage Commission", us: "₹0 Always", them: "15–30 Days Rent" },
                    { label: "Visiting & Registration Fee", us: "₹0 Unlimited", them: "₹300–₹500 per visit" },
                    { label: "Owner Contact Access", us: "Direct Call & WhatsApp", them: "Hidden by Middleman" },
                    { label: "UK Police Verification", us: "Automated Pre-Filled PDF", them: "You must run to Thana" },
                    { label: "11-Month Digital Lease", us: "Generated in 60s Free", them: "Manual (₹1,000+ fee)" },
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
                <span>Compliant with Uttarakhand Tenancy Rules</span>
                <Link href="/post-property" className="font-bold text-[#FF385C] hover:underline">
                  List Property Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. OWNER CALLOUT: EARLY LAUNCH SPECIAL OFFER                          */}
      {/* ===================================================================== */}
      <section className="py-10 sm:py-16 max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#222222] text-white p-7 sm:p-11 md:p-14 border border-[#222222] shadow-2xl">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF385C]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#008A05]/20 blur-[90px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/15 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                <Icon name="verified" size={14} className="text-[#008A05]" fill />
                For Property Owners in Uttarakhand
              </span>

              <h2 className="font-sans font-extrabold text-2xl sm:text-4xl lg:text-[42px] leading-tight">
                Own a room, flat, or floor in Uttarakhand?{" "}
                <span className="text-[#FF385C]">List 100% Free.</span>
              </h2>

              <p className="mt-3 text-sm sm:text-base text-[#B0B0B0] leading-relaxed">
                Connect exclusively with verified families, students, and working professionals. Get pre-filled Uttarakhand Police verification dossiers and 11-month rental agreements completely free for your first listings.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-[#EBEBEB]">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-[#008A05] font-extrabold block text-sm mb-0.5">₹0 Commission</span>
                  <span>Never pay broker cuts</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-white font-extrabold block text-sm mb-0.5">Police Form Ready</span>
                  <span>Pre-filled tenant dossier</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-[#FF385C] font-extrabold block text-sm mb-0.5">WhatsApp Inquiries</span>
                  <span>Direct tenant contact</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:min-w-[270px]">
              <Link
                href="/post-property"
                className="btn-cta-primary text-sm px-6 py-4 shadow-lg text-center"
              >
                <Icon name="add_home" size={18} className="text-white" />
                <span>Post Property Online (2 Mins)</span>
              </Link>

              <a
                href="https://wa.me/919999999999?text=Hello,%20I%20want%20to%20list%20my%20rental%20property%20on%20Ghar%20Foundation."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta-whatsapp text-sm px-6 py-4 text-center"
              >
                <Icon name="chat" size={18} className="text-white" />
                <span>List via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION)                             */}
      {/* ===================================================================== */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#EBEBEB]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF385C] bg-[#FFF0F3] px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-[#222222] mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#717171] mt-1.5">
              Everything you need to know about renting safely and legally in Uttarakhand.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-[#EBEBEB] overflow-hidden bg-[#F7F7F7] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#222222]"
                  >
                    <span>{faq.q}</span>
                    <Icon
                      name={isOpen ? "expand_less" : "expand_more"}
                      size={20}
                      className="text-[#717171] shrink-0"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#717171] leading-relaxed border-t border-[#EBEBEB]/60 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#717171]">
              Need help finding a place or listing a room?{" "}
              <Link href="/contact" className="text-[#FF385C] font-bold hover:underline">
                Contact our local support team
              </Link>
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
