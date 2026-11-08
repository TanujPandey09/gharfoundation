"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CITIES, PROPERTY_CATEGORIES } from "@/lib/constants";
import dynamic from "next/dynamic";
const PropertyMap = dynamic(() => import("@/components/property/PropertyMap"), { ssr: false });
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";
import Link from "next/link";
import { Property } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import Footer from "@/components/shared/Footer";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();


  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [hideMap, setHideMap] = useState(false);

  // Search input dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // BHK popover states
  const [showBhkPopover, setShowBhkPopover] = useState(false);
  const bhkRef = useRef<HTMLDivElement>(null);

  // Move-in date states
  const [moveInOption, setMoveInOption] = useState("Immediate");
  const [showMoveInDropdown, setShowMoveInDropdown] = useState(false);
  const moveInRef = useRef<HTMLDivElement>(null);

  // Favorites tracking
  const [favorites, setFavorites] = useState<string[]>([]);

  // Query states from URL
  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "";
  const initialType = searchParams.get("type") || "";

  // Core Filter States
  const [searchVal, setSearchVal] = useState(initialQuery);
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [maxRent, setMaxRent] = useState<number>(60000); // Slider default

  // Quick Toggle Filter States
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zeroBrokerageOnly, setZeroBrokerageOnly] = useState(false);
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);
  const [bachelorFriendlyOnly, setBachelorFriendlyOnly] = useState(false);

  // Sidebar Filter States
  const [selectedBhk, setSelectedBhk] = useState<number[]>([2, 3]);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [parking, setParking] = useState<boolean | null>(null);
  const [internet, setInternet] = useState<boolean | null>(null);
  const [furnishing, setFurnishing] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("relevance");

  // Track map selected property
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (bhkRef.current && !bhkRef.current.contains(event.target as Node)) {
        setShowBhkPopover(false);
      }
      if (moveInRef.current && !moveInRef.current.contains(event.target as Node)) {
        setShowMoveInDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if a property is zero-brokerage (simulated)
  const isZeroBrokerage = (prop: Property) => {
    return prop.rent < 25000 || prop.id === "prop-1" || prop.id === "prop-3";
  };

  // Toggle favorite property
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
      showToast("Removed from saved list", "info");
    } else {
      setFavorites([...favorites, id]);
      showToast("Saved to your favorites list", "success");
    }
  };

  // Filter Logic via API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', {
      searchVal, cityFilter, typeFilter, maxRent, selectedBhk, bathrooms,
      verifiedOnly, zeroBrokerageOnly, petFriendlyOnly, bachelorFriendlyOnly,
      parking, internet, furnishing, gender, sortOrder
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchVal) params.append("search", searchVal);
      if (cityFilter) params.append("city", cityFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (maxRent < 100000) params.append("maxRent", maxRent.toString());
      if (selectedBhk.length > 0) params.append("bedrooms", selectedBhk.join(","));
      if (bathrooms !== null) params.append("bathrooms", bathrooms.toString());
      if (verifiedOnly) params.append("verified", "true");
      
      // Zero Brokerage (Simulation: rent under 25k)
      if (zeroBrokerageOnly && maxRent > 25000) params.set("maxRent", "25000"); 
      
      // Pet friendly: simulate by adding pet to search text
      if (petFriendlyOnly) {
        params.set("search", searchVal ? `${searchVal} pet` : "pet");
      }
      
      if (bachelorFriendlyOnly) params.append("gender", "BACHELOR");
      else if (gender) params.append("gender", gender);
      
      if (parking !== null) params.append("parking", parking.toString());
      if (internet !== null) params.append("internet", internet.toString());
      if (furnishing) params.append("furnished", furnishing);
      if (sortOrder) params.append("sort", sortOrder);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    }
  });

  const filteredProperties = data?.properties || [];

  const handleUpdateSearch = () => {
    const params = new URLSearchParams();
    if (searchVal) params.append("q", searchVal);
    if (cityFilter) params.append("city", cityFilter);
    if (typeFilter) params.append("type", typeFilter);
    router.push(`/search?${params.toString()}`);
    showToast("Search updated", "success");
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchVal("");
    setCityFilter("");
    setTypeFilter("");
    setMaxRent(100000);
    setSelectedBhk([]);
    setBathrooms(null);
    setVerifiedOnly(false);
    setZeroBrokerageOnly(false);
    setPetFriendlyOnly(false);
    setBachelorFriendlyOnly(false);
    setParking(null);
    setInternet(null);
    setFurnishing("");
    setGender("");
    setSortOrder("relevance");
    showToast("Filters reset successfully", "info");
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#14100D] text-[#0A0A0A] dark:text-gray-100 flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-200">
      {/* 1. Secondary Sticky Search Bar & Filters */}
      <section className="sticky top-0 z-30 bg-white dark:bg-[#1F1A17] border-b border-gray-150 dark:border-slate-800/80 shadow-sm px-4 md:px-8 py-3.5 space-y-3.5 shrink-0 transition-colors">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-3">

          {/* Location Search Box */}
          <div ref={locationRef} className="flex-1 min-w-[240px] relative">
            <div className="flex items-center gap-2.5 border border-gray-200 dark:border-slate-750 rounded-xl px-3.5 py-2 bg-white dark:bg-[#1F1A17] focus-within:ring-2 focus-within:ring-[#C2522D]/25 focus-within:border-[#C2522D] transition-all">
              <Icon name="location_on" className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Where would you like to stay?"
                value={searchVal}
                onFocus={() => setShowLocationDropdown(true)}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowLocationDropdown(true);
                }}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-sans font-bold text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
              {searchVal && (
                <button onClick={() => setSearchVal("")} className="text-gray-400 hover:text-gray-600">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-white dark:bg-[#1F1A17] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-[#2E2824]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Recent Searches
                  </span>
                </div>
                <div className="p-1">
                  <div
                    onClick={() => {
                      setSearchVal("Mussoorie Road, Dehradun");
                      setCityFilter("Dehradun");
                      setShowLocationDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-[#2E2824] rounded-lg cursor-pointer transition-colors"
                  >
                    <Icon name="history" className="text-gray-400 text-[20px]" />
                    <span className="text-xs font-semibold">Mussoorie Road, Dehradun</span>
                  </div>
                  <div
                    onClick={() => {
                      setSearchVal("Jakhan, Dehradun");
                      setCityFilter("Dehradun");
                      setShowLocationDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-[#2E2824] rounded-lg cursor-pointer transition-colors"
                  >
                    <Icon name="history" className="text-gray-400 text-[20px]" />
                    <span className="text-xs font-semibold">Pacific Mall Area</span>
                  </div>
                </div>
                <div className="p-3 border-y border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-[#2E2824]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Popular Towns
                  </span>
                </div>
                <div className="p-1 max-h-48 overflow-y-auto">
                  {CITIES.map((c) => (
                    <div
                      key={c.name}
                      onClick={() => {
                        setCityFilter(c.name);
                        setSearchVal(c.name);
                        setShowLocationDropdown(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-[#2E2824] rounded-lg cursor-pointer transition-colors"
                    >
                      <Icon name="trending_up" className="text-[#C2522D]" />
                      <span className="text-xs font-semibold">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget Range Slider */}
          <div className="flex-1 min-w-[210px] border border-gray-200 dark:border-slate-750 rounded-xl px-3.5 py-1.5 bg-white dark:bg-[#1F1A17] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[9px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-slate-500">
                Budget Range
              </label>
              <span className="text-[11px] font-extrabold text-[#C2522D]">
                Under ₹{maxRent === 100000 ? "1L+" : maxRent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold text-gray-400 dark:text-slate-500">₹5k</span>
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full h-1 bg-gray-150 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-[#C2522D]"
              />
              <span className="text-[9px] font-extrabold text-gray-400 dark:text-slate-500">₹1L+</span>
            </div>
          </div>

          {/* BHK Selector Popover */}
          <div ref={bhkRef} className="relative min-w-[130px]">
            <div
              onClick={() => setShowBhkPopover(!showBhkPopover)}
              className="border border-gray-200 dark:border-slate-750 rounded-xl px-3.5 py-1.5 bg-white dark:bg-[#1F1A17] flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2E2824] transition-colors"
            >
              <div>
                <label className="block text-[9px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-slate-500">
                  BHK
                </label>
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {selectedBhk.length > 0
                    ? selectedBhk.map((n) => `${n} BHK`).join(", ")
                    : "All Rooms"}
                </span>
              </div>
              <Icon name="expand_more" className="text-gray-400 ml-1.5" />
            </div>

            {showBhkPopover && (
              <div className="absolute top-full right-0 w-[220px] mt-1.5 bg-white dark:bg-[#1F1A17] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 p-3.5 z-50 animate-fadeIn space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-xs font-bold">Select Bedrooms</span>
                  {selectedBhk.length > 0 && (
                    <button
                      onClick={() => setSelectedBhk([])}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((num) => {
                    const isSelected = selectedBhk.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBhk(selectedBhk.filter((n) => n !== num));
                          } else {
                            setSelectedBhk([...selectedBhk, num]);
                          }
                        }}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${isSelected
                          ? "bg-[#022c22] text-white border-[#022c22] dark:bg-[#C2522D] dark:border-[#C2522D]"
                          : "border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-350 hover:bg-slate-50 dark:hover:bg-[#2E2824]"
                          }`}
                      >
                        {num} BHK
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Move-in Date Selector */}
          <div ref={moveInRef} className="relative min-w-[150px]">
            <div
              onClick={() => setShowMoveInDropdown(!showMoveInDropdown)}
              className="border border-gray-200 dark:border-slate-750 rounded-xl px-3.5 py-1.5 bg-white dark:bg-[#1F1A17] flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2E2824] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="calendar_today" className="text-gray-400 text-[18px]" />
                <div>
                  <label className="block text-[9px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-slate-500">
                    Move-in Date
                  </label>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{moveInOption}</span>
                </div>
              </div>
              <Icon name="expand_more" className="text-gray-400 ml-1.5" />
            </div>

            {showMoveInDropdown && (
              <div className="absolute top-full right-0 w-full mt-1.5 bg-white dark:bg-[#1F1A17] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                {["Immediate", "Within 15 days", "Within 30 days"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setMoveInOption(option);
                      setShowMoveInDropdown(false);
                      showToast(`Move-in filter set to ${option}`, "info");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-[#2E2824] text-xs font-semibold transition-colors border-b last:border-b-0 border-gray-100 dark:border-slate-800"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Update Search Button */}
          <button
            onClick={handleUpdateSearch}
            className="bg-[#022c22] dark:bg-[#C2522D] text-white px-5 py-3 rounded-xl font-sans text-xs font-bold hover:bg-[#C2522D] dark:hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md shrink-0"
          >
            <Icon name="search" size={16} />
            <span>Update Search</span>
          </button>
        </div>

        {/* Quick Filters Row */}
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 pt-0.5 relative">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${verifiedOnly
              ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            <Icon name="verified" size={16} className={verifiedOnly ? "text-emerald-600" : "text-gray-400"} fill={verifiedOnly} />
            <span>Verified</span>
          </button>

          <button
            onClick={() => setZeroBrokerageOnly(!zeroBrokerageOnly)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${zeroBrokerageOnly
              ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            <span>Zero Brokerage</span>
          </button>

          <button
            onClick={() => {
              if (maxRent <= 20000) {
                setMaxRent(60000);
                showToast("Budget filter reset to default", "info");
              } else {
                setMaxRent(20000);
                showToast("Budget capped under ₹20,000", "info");
              }
            }}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${maxRent <= 20000
              ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            Under ₹20K
          </button>

          <button
            onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${petFriendlyOnly
              ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            <span>Pet Friendly</span>
          </button>

          <button
            onClick={() => setBachelorFriendlyOnly(!bachelorFriendlyOnly)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${bachelorFriendlyOnly
              ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            <span>Bachelor Friendly</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-850 mx-2 shrink-0"></div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1F1A17] text-gray-500 dark:text-gray-400 text-xs font-bold hover:border-primary whitespace-nowrap transition-all"
          >
            <Icon name="tune" size={16} />
            <span>More Filters</span>
          </button>
        </div>
      </section>

      {/* 2. Split Screen Content Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Interactive Map */}
        {!hideMap && (
          <aside className="hidden lg:block w-[42%] h-full relative bg-slate-100 dark:bg-[#14100D] shrink-0 border-r border-gray-250 dark:border-slate-800 animate-slideRight">
            <button
              onClick={() => setHideMap(true)}
              className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-[#1F1A17]/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-xs font-bold text-[#C2522D] dark:text-[#C2522D] hover:bg-white transition-all border border-gray-200 dark:border-slate-800"
            >
              <Icon name="map" size={18} />
              <span>Hide Map</span>
            </button>

            {/* Simulated Leaflet interactive map */}
            <div className="w-full h-full">
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </div>
          </aside>
        )}

        {/* Right: Property List Workspace */}
        <section className="flex-1 h-full overflow-y-auto bg-[#f8fafc] dark:bg-[#14100D] px-4 md:px-8 py-5 scroll-smooth flex flex-col">
          <div className="max-w-[1024px] mx-auto w-full flex-grow flex flex-col">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 shrink-0">
              <div>
                <h1 className="text-xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Properties for Rent in {cityFilter || "Uttarakhand"}</span>
                  {hideMap && (
                    <button
                      onClick={() => setHideMap(false)}
                      className="hidden lg:flex items-center gap-1 text-xs text-[#C2522D] dark:text-[#C2522D] font-bold hover:underline"
                    >
                      (Show Map)
                    </button>
                  )}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Found {filteredProperties.length} results matching your search criteria
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-[#1F1A17] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-850">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  Sort By:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border-none p-0 text-xs font-bold bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Popularity</option>
                </select>
              </div>
            </div>

            {/* List & Drawer Workspace */}
            <div className="flex gap-6 items-start flex-grow">
              {/* Filter Sidebar Drawer inside workspace (toggles on desktop) */}
              {showFilterDrawer && (
                <div className="hidden lg:block w-[280px] bg-white dark:bg-[#1F1A17] p-5 rounded-xl border border-gray-200 dark:border-slate-850 space-y-4 shrink-0 shadow-sm animate-slideLeft">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-sans font-bold text-xs text-[#C2522D] dark:text-[#C2522D] uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="filter_alt" size={16} />
                      <span>Refine Search</span>
                    </span>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Icon name="restart_alt" size={14} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* District / City Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                      District Area
                    </label>
                    <select
                      value={cityFilter}
                      onChange={(e) => {
                        setCityFilter(e.target.value);
                        if (e.target.value) setSearchVal(e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-[#1F1A17] border border-gray-200 dark:border-slate-750 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                      <option value="">All Uttarakhand</option>
                      {CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                      Category Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1F1A17] border border-gray-200 dark:border-slate-750 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                      <option value="">All Categories</option>
                      {PROPERTY_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                      Bathrooms
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBathrooms(bathrooms === num ? null : num)}
                          className={`flex-grow py-1.5 text-xs font-bold rounded-lg border transition-all ${bathrooms === num
                            ? "bg-[#C2522D] text-white border-[#C2522D]"
                            : "border-gray-250 dark:border-slate-700 text-gray-700 dark:text-gray-350 hover:bg-slate-50 dark:hover:bg-[#2E2824]"
                            }`}
                        >
                          {num} Bath
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Furnishing Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                      Furnished Status
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1F1A17] border border-gray-200 dark:border-slate-750 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Any furnishing</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                    </select>
                  </div>

                  {/* Tenant Preference */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                      Tenant Preference
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1F1A17] border border-gray-200 dark:border-slate-750 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Any tenant</option>
                      <option value="FAMILY">Family Preferred</option>
                      <option value="STUDENTS">Students welcome</option>
                      <option value="BACHELOR">Bachelors allowed</option>
                    </select>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2 pt-1 border-t border-gray-150 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={parking === true}
                        onChange={(e) => setParking(e.target.checked ? true : null)}
                        className="rounded border-gray-300 dark:border-slate-700 text-[#C2522D] focus:ring-[#C2522D] h-4 w-4"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                        Gated Parking Space
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={internet === true}
                        onChange={(e) => setInternet(e.target.checked ? true : null)}
                        className="rounded border-gray-300 dark:border-slate-700 text-[#C2522D] focus:ring-[#C2522D] h-4 w-4"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                        High-Speed Wi-Fi
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      setShowFilterDrawer(false);
                      handleUpdateSearch();
                    }}
                    className="w-full bg-[#C2522D] hover:bg-[#C2522D]/90 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-colors mt-2"
                  >
                    Apply Filter Set
                  </button>
                </div>
              )}

              {/* Grid of Property Cards */}
              <div className="flex-1">
                {isError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-12 text-center rounded-xl space-y-4 shadow-sm w-full transition-colors">
                    <Icon name="error_outline" className="mx-auto text-red-500" size={48} />
                    <h3 className="font-sans font-bold text-base text-red-800 dark:text-red-200">
                      Failed to fetch properties
                    </h3>
                    <p className="text-xs text-red-600 dark:text-red-400 max-w-sm mx-auto leading-relaxed">
                      We encountered an error loading the properties. Please try again or adjust your filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg shadow-sm transition-colors"
                    >
                      Clear Filters & Retry
                    </button>
                  </div>
                ) : isLoading ? (
                   <div className="flex justify-center items-center h-64">
                     <Icon name="sync" className="animate-spin text-primary" size={32} />
                   </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="bg-white dark:bg-[#1F1A17] border border-gray-200 dark:border-slate-850 p-12 text-center rounded-xl space-y-4 shadow-sm w-full transition-colors">
                    <Icon name="search_off" className="mx-auto text-gray-400 dark:text-slate-500" size={48} />
                    <h3 className="font-sans font-bold text-base text-gray-800 dark:text-gray-200">
                      No matching Uttarakhand properties found
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Try widening your budget, selecting another district region, or clearing current advanced refinements.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-[#C2522D] dark:bg-[#C2522D] hover:opacity-95 text-white font-bold text-xs py-2.5 px-5 rounded-lg shadow-sm transition-colors"
                    >
                      Clear All Filter Parameters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                    {filteredProperties.map((prop: any) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onFavoriteToggle={(id) => toggleFavorite(id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12 -mx-4 md:-mx-8 border-t border-gray-200 dark:border-slate-800">
            <Footer forceShow={true} />
          </div>
        </section>
      </div>

      {/* Mobile Toggle Map/List Button floating in viewport */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button
          onClick={() => {
            const nextView = mobileView === "list" ? "map" : "list";
            setMobileView(nextView);
            showToast(`Switched to ${nextView} view`, "info");
          }}
          className="bg-slate-900 dark:bg-slate-850 text-white font-bold text-xs py-3 px-5 rounded-full shadow-lg border border-slate-750 flex items-center space-x-2 backdrop-blur-md bg-opacity-95"
        >
          {mobileView === "list" ? (
            <>
              <Icon name="map" size={16} className="text-white" />
              <span>Show Map View</span>
            </>
          ) : (
            <>
              <Icon name="format_list_bulleted" size={16} className="text-white" />
              <span>Show List View</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Map Panel View overlay */}
      {mobileView === "map" && (
        <div className="lg:hidden absolute inset-0 z-20 pt-[124px] pb-[60px] bg-slate-100">
          <PropertyMap
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        </div>
      )}
    </div>
  );
}
