"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CITIES, PROPERTY_CATEGORIES } from "@/lib/constants";
import dynamic from "next/dynamic";
const PropertyMap = dynamic(() => import("@/components/property/PropertyMap"), { ssr: false });
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";
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
  const [maxRent, setMaxRent] = useState<number>(60000);

  // Quick Toggle Filter States
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zeroBrokerageOnly, setZeroBrokerageOnly] = useState(false);
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);
  const [bachelorFriendlyOnly, setBachelorFriendlyOnly] = useState(false);

  // Sidebar Filter States
  const [selectedBhk, setSelectedBhk] = useState<number[]>([]);
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
      
      if (zeroBrokerageOnly && maxRent > 25000) params.set("maxRent", "25000"); 
      
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
    <div className="bg-white text-[#222222] flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden">
      
      {/* ===================================================================== */}
      {/* 1. TOP STICKY SEARCH & FILTER BAR (AIRBNB + HOUSING.COM HYBRID)       */}
      {/* ===================================================================== */}
      <section className="sticky top-0 z-30 bg-white border-b border-[#EBEBEB] px-4 md:px-8 py-3 space-y-3 shrink-0 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-3">

          {/* Location Search Box */}
          <div ref={locationRef} className="flex-1 min-w-[240px] relative">
            <div className="flex items-center gap-2.5 border border-[#DDDDDD] rounded-full px-4 py-2 bg-white hover:border-[#222222] focus-within:ring-2 focus-within:ring-[#222222]/10 focus-within:border-[#222222] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <Icon name="search" className="text-[#FF385C] shrink-0" size={18} />
              <input
                type="text"
                placeholder="Search area, locality, or landmark in Uttarakhand..."
                value={searchVal}
                onFocus={() => setShowLocationDropdown(true)}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowLocationDropdown(true);
                }}
                className="w-full bg-transparent border-none p-0 focus:outline-none text-xs font-bold text-[#222222] placeholder:text-[#B0B0B0]"
              />
              {searchVal && (
                <button onClick={() => setSearchVal("")} className="text-[#717171] hover:text-[#222222]">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] overflow-hidden z-50">
                <div className="p-3 border-b border-[#EBEBEB] bg-[#F7F7F7]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#717171]">
                    Popular Uttarakhand Hubs
                  </span>
                </div>
                <div className="p-1 max-h-56 overflow-y-auto">
                  {CITIES.map((c) => (
                    <div
                      key={c.name}
                      onClick={() => {
                        setCityFilter(c.name);
                        setSearchVal(c.name);
                        setShowLocationDropdown(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#F7F7F7] rounded-xl cursor-pointer transition-colors"
                    >
                      <Icon name="place" className="text-[#FF385C]" size={18} />
                      <span className="text-xs font-bold text-[#222222]">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget Range Slider */}
          <div className="flex-1 min-w-[200px] border border-[#DDDDDD] rounded-2xl px-4 py-1.5 bg-white flex flex-col justify-between">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[9px] uppercase font-extrabold tracking-wider text-[#717171]">
                Max Rent
              </label>
              <span className="text-[11px] font-extrabold text-[#222222] tabular-nums">
                Under ₹{maxRent === 100000 ? "1L+" : maxRent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#717171]">₹5k</span>
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
              />
              <span className="text-[9px] font-bold text-[#717171]">₹1L+</span>
            </div>
          </div>

          {/* BHK Selector Popover */}
          <div ref={bhkRef} className="relative min-w-[130px]">
            <div
              onClick={() => setShowBhkPopover(!showBhkPopover)}
              className="border border-[#DDDDDD] hover:border-[#222222] rounded-2xl px-3.5 py-2 bg-white flex items-center justify-between cursor-pointer transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <div>
                <label className="block text-[9px] uppercase font-extrabold tracking-wider text-[#717171]">
                  BHK
                </label>
                <span className="text-xs font-bold text-[#222222]">
                  {selectedBhk.length > 0
                    ? selectedBhk.map((n) => `${n} BHK`).join(", ")
                    : "All Rooms"}
                </span>
              </div>
              <Icon name="expand_more" className="text-[#717171] ml-1.5" size={18} />
            </div>

            {showBhkPopover && (
              <div className="absolute top-full right-0 w-[220px] mt-2 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] p-3.5 z-50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#EBEBEB]">
                  <span className="text-xs font-bold text-[#222222]">Bedrooms</span>
                  {selectedBhk.length > 0 && (
                    <button
                      onClick={() => setSelectedBhk([])}
                      className="text-[10px] font-bold text-[#FF385C] hover:underline"
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
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#222222] text-white border-[#222222]"
                            : "border-[#EBEBEB] text-[#222222] hover:bg-[#F7F7F7]"
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
          <div ref={moveInRef} className="relative min-w-[140px]">
            <div
              onClick={() => setShowMoveInDropdown(!showMoveInDropdown)}
              className="border border-[#DDDDDD] hover:border-[#222222] rounded-2xl px-3.5 py-2 bg-white flex items-center justify-between cursor-pointer transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-2">
                <Icon name="calendar_today" className="text-[#FF385C] text-[16px]" />
                <div>
                  <label className="block text-[9px] uppercase font-extrabold tracking-wider text-[#717171]">
                    Move-in
                  </label>
                  <span className="text-xs font-bold text-[#222222]">{moveInOption}</span>
                </div>
              </div>
              <Icon name="expand_more" className="text-[#717171] ml-1" size={18} />
            </div>

            {showMoveInDropdown && (
              <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] overflow-hidden z-50">
                {["Immediate", "Within 15 days", "Within 30 days"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setMoveInOption(option);
                      setShowMoveInDropdown(false);
                      showToast(`Move-in filter set to ${option}`, "info");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F7F7F7] text-xs font-semibold text-[#222222] transition-colors border-b last:border-b-0 border-[#EBEBEB]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button (Airbnb Rausch) */}
          <button
            onClick={handleUpdateSearch}
            className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-5 py-2.5 rounded-full font-sans text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95"
          >
            <Icon name="search" size={16} className="text-white" />
            <span>Search</span>
          </button>
        </div>

        {/* Quick Filters Pill Strip (Airbnb Category / Filter Chips) */}
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 pt-0.5">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
              verifiedOnly
                ? "border-forest-300 bg-forest-50 text-forest-700"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            <Icon name="verified" size={15} className={verifiedOnly ? "text-forest-600" : "text-[#717171]"} fill={verifiedOnly} />
            <span>Verified Owner</span>
          </button>

          <button
            onClick={() => setZeroBrokerageOnly(!zeroBrokerageOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
              zeroBrokerageOnly
                ? "border-forest-300 bg-forest-50 text-forest-700"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            <span>₹0 Brokerage</span>
          </button>

          <button
            onClick={() => {
              if (maxRent <= 15000) {
                setMaxRent(60000);
                showToast("Budget filter reset", "info");
              } else {
                setMaxRent(15000);
                showToast("Budget set under ₹15,000", "info");
              }
            }}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
              maxRent <= 15000
                ? "border-[#222222] bg-[#222222] text-white"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            Under ₹15K
          </button>

          <button
            onClick={() => setBachelorFriendlyOnly(!bachelorFriendlyOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
              bachelorFriendlyOnly
                ? "border-[#222222] bg-[#222222] text-white"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            <span>Bachelors Welcome</span>
          </button>

          <button
            onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
              petFriendlyOnly
                ? "border-[#222222] bg-[#222222] text-white"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            <span>Pet Friendly</span>
          </button>

          <div className="h-4 w-px bg-[#EBEBEB] mx-1 shrink-0" />

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DDDDDD] bg-white text-[#222222] text-xs font-bold hover:border-[#222222] whitespace-nowrap transition-all"
          >
            <Icon name="tune" size={15} />
            <span>All Filters</span>
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SPLIT SCREEN WORKSPACE (MAP + LISTING GRID)                        */}
      {/* ===================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Map (Airbnb Split Screen) */}
        {!hideMap && (
          <aside className="hidden lg:block w-[42%] h-full relative bg-[#F7F7F7] shrink-0 border-r border-[#EBEBEB]">
            <button
              onClick={() => setHideMap(true)}
              className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold text-[#222222] hover:bg-white transition-all border border-[#EBEBEB]"
            >
              <Icon name="map" size={16} />
              <span>Hide Map</span>
            </button>

            <div className="w-full h-full">
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </div>
          </aside>
        )}

        {/* Right: Property Listings Grid */}
        <section className="flex-1 h-full overflow-y-auto bg-white px-4 md:px-8 py-5 flex flex-col">
          <div className="max-w-[1100px] mx-auto w-full flex-grow flex flex-col">
            
            {/* Header Result Counter & Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 shrink-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold font-sans text-[#222222] flex items-center gap-2">
                  <span>Rental Homes in {cityFilter || "Uttarakhand"}</span>
                  {hideMap && (
                    <button
                      onClick={() => setHideMap(false)}
                      className="hidden lg:inline-flex text-xs text-[#FF385C] font-bold hover:underline"
                    >
                      (Show Map)
                    </button>
                  )}
                </h1>
                <p className="text-xs text-[#717171] mt-0.5 font-medium">
                  {filteredProperties.length} verified direct owner listings found
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#F7F7F7] px-3 py-1.5 rounded-xl border border-[#EBEBEB]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717171]">
                  Sort By:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border-none p-0 text-xs font-bold bg-transparent text-[#222222] focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* List & Drawer Workspace */}
            <div className="flex gap-6 items-start flex-grow">
              
              {/* Filter Sidebar Drawer */}
              {showFilterDrawer && (
                <div className="hidden lg:block w-[280px] bg-white p-5 rounded-2xl border border-[#EBEBEB] space-y-4 shrink-0 shadow-sm animate-in fade-in">
                  <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB]">
                    <span className="font-sans font-bold text-xs text-[#222222] uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="tune" size={16} />
                      <span>Refine Search</span>
                    </span>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] text-[#717171] hover:text-[#FF385C] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Icon name="restart_alt" size={13} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* District / City Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">
                      District Area
                    </label>
                    <select
                      value={cityFilter}
                      onChange={(e) => {
                        setCityFilter(e.target.value);
                        if (e.target.value) setSearchVal(e.target.value);
                      }}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:border-[#222222] text-[#222222]"
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
                    <label className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">
                      Configuration
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:border-[#222222] text-[#222222]"
                    >
                      <option value="">All Types</option>
                      {PROPERTY_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">
                      Bathrooms
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBathrooms(bathrooms === num ? null : num)}
                          className={`flex-grow py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            bathrooms === num
                              ? "bg-[#222222] text-white border-[#222222]"
                              : "border-[#EBEBEB] text-[#222222] hover:bg-[#F7F7F7]"
                          }`}
                        >
                          {num} Bath
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Furnishing Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">
                      Furnishing
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:border-[#222222] text-[#222222]"
                    >
                      <option value="">Any furnishing</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                    </select>
                  </div>

                  {/* Tenant Preference */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#717171] tracking-wider">
                      Tenant Preference
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:border-[#222222] text-[#222222]"
                    >
                      <option value="">Any tenant</option>
                      <option value="FAMILY">Family Preferred</option>
                      <option value="STUDENTS">Students Welcome</option>
                      <option value="BACHELOR">Bachelors Allowed</option>
                    </select>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2 pt-2 border-t border-[#EBEBEB]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={parking === true}
                        onChange={(e) => setParking(e.target.checked ? true : null)}
                        className="rounded border-[#DDDDDD] text-[#FF385C] focus:ring-[#FF385C] h-4 w-4"
                      />
                      <span className="text-xs text-[#222222] font-semibold">
                        Gated Parking
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={internet === true}
                        onChange={(e) => setInternet(e.target.checked ? true : null)}
                        className="rounded border-[#DDDDDD] text-[#FF385C] focus:ring-[#FF385C] h-4 w-4"
                      />
                      <span className="text-xs text-[#222222] font-semibold">
                        High-Speed Wi-Fi
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      setShowFilterDrawer(false);
                      handleUpdateSearch();
                    }}
                    className="w-full bg-[#222222] hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all mt-2 active:scale-95"
                  >
                    Apply Filters
                  </button>
                </div>
              )}

              {/* Grid of Property Cards */}
              <div className="flex-1">
                {isError ? (
                  <div className="bg-red-50 border border-red-200 p-12 text-center rounded-2xl space-y-4 shadow-sm w-full">
                    <Icon name="error_outline" className="mx-auto text-red-500" size={44} />
                    <h3 className="font-sans font-bold text-base text-red-800">
                      Failed to fetch properties
                    </h3>
                    <p className="text-xs text-red-600 max-w-sm mx-auto leading-relaxed">
                      Error communicating with listings API. Please refresh or reset filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-colors"
                    >
                      Clear Filters &amp; Retry
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Icon name="sync" className="animate-spin text-[#FF385C]" size={36} />
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-12 text-center rounded-3xl space-y-4 shadow-sm w-full">
                    <Icon name="search_off" className="mx-auto text-[#B0B0B0]" size={48} />
                    <h3 className="font-sans font-bold text-lg text-[#222222]">
                      No matching rental homes found
                    </h3>
                    <p className="text-xs text-[#717171] max-w-sm mx-auto leading-relaxed">
                      Try widening your budget range, clearing filters, or searching an adjacent locality.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="bg-[#222222] hover:bg-black text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all"
                    >
                      Clear All Filter Parameters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-20">
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

          <div className="mt-12 -mx-4 md:-mx-8 border-t border-[#EBEBEB]">
            <Footer forceShow={true} />
          </div>
        </section>
      </div>

      {/* Mobile Floating Map/List Toggle (Airbnb style) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button
          onClick={() => {
            const nextView = mobileView === "list" ? "map" : "list";
            setMobileView(nextView);
            showToast(`Switched to ${nextView} view`, "info");
          }}
          className="bg-[#222222] hover:bg-black text-white font-bold text-xs py-3 px-5 rounded-full shadow-xl flex items-center space-x-2 active:scale-95 transition-all"
        >
          {mobileView === "list" ? (
            <>
              <Icon name="map" size={16} className="text-white" />
              <span>Map View</span>
            </>
          ) : (
            <>
              <Icon name="format_list_bulleted" size={16} className="text-white" />
              <span>List View</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Map Panel */}
      {mobileView === "map" && (
        <div className="lg:hidden absolute inset-0 z-20 pt-[124px] pb-[60px] bg-[#F7F7F7]">
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
