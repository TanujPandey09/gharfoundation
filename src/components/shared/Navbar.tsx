"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "./Icon";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSearchPage = pathname === "/search";
  const activeCity = searchParams.get("city") || searchParams.get("q") || "";
  const [propertiesCount, setPropertiesCount] = useState(0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSearchPage) return;
    const params = new URLSearchParams();
    if (activeCity) params.set("city", activeCity);
    fetch(`/api/properties?${params.toString()}&limit=1`)
      .then((res) => (res.ok ? res.json() : { pagination: { total: 0 } }))
      .then((data) => setPropertiesCount(data.pagination?.total || 0))
      .catch(() => setPropertiesCount(0));
  }, [activeCity, isSearchPage]);

  const displayCityName = activeCity
    ? activeCity.charAt(0).toUpperCase() + activeCity.slice(1)
    : "Uttarakhand";

  const clearCityFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");
    params.delete("q");
    router.push(`/search?${params.toString()}`);
    showToast("City filter cleared", "info");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] px-4 md:px-8 lg:px-12 py-3 transition-colors">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          
          {/* 1. Left: Brand Logo (Airbnb & Housing.com Inspired) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#FF385C] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Icon name="home_work" size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-extrabold text-xl md:text-[22px] tracking-tight text-[#222222] leading-none">
                  Ghar<span className="text-[#FF385C]">.</span>
                </span>
                <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider mt-0.5 hidden sm:inline">
                  Zero Brokerage
                </span>
              </div>
            </Link>

            {/* Dynamic Search Page Filter Pill */}
            {isSearchPage && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#F7F7F7] border border-[#EBEBEB] px-3 py-1 rounded-full text-xs font-semibold text-[#222222]">
                <span className="tabular-nums">
                  {propertiesCount.toLocaleString()} {propertiesCount === 1 ? "home" : "homes"} in {displayCityName}
                </span>
                <button
                  onClick={clearCityFilter}
                  className="hover:text-[#FF385C] transition-colors p-0.5 rounded-full hover:bg-[#EBEBEB]"
                  title="Clear filter"
                  aria-label="Clear filter"
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            )}
          </div>

          {/* 2. Center: Iconic Airbnb Floating Search Pill (Desktop) */}
          {!isSearchPage && (
            <Link
              href="/search"
              className="hidden md:flex items-center divide-x divide-[#EBEBEB] border border-[#DDDDDD] hover:shadow-md rounded-full py-1.5 pl-5 pr-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all group cursor-pointer bg-white"
            >
              <span className="text-xs font-bold text-[#222222] pr-3.5">
                Uttarakhand
              </span>
              <span className="text-xs font-bold text-[#222222] px-3.5">
                Any Budget
              </span>
              <span className="text-xs font-medium text-[#717171] pl-3.5 flex items-center gap-2.5">
                <span>Direct Owner</span>
                <span className="w-8 h-8 rounded-full bg-[#FF385C] group-hover:bg-[#E00B41] flex items-center justify-center text-white transition-colors shrink-0">
                  <Icon name="search" size={14} className="text-white" />
                </span>
              </span>
            </Link>
          )}

          {/* 3. Right: List Property & User Dropdown (Airbnb Pill Style) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/post-property"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition-colors"
            >
              <span>List your property</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                Free
              </span>
            </Link>

            {/* User Menu Pill */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 border border-[#DDDDDD] hover:shadow-md rounded-full py-1.5 px-3 transition-all bg-white"
                aria-label="User navigation"
              >
                <Icon name="menu" size={17} className="text-[#222222]" />
                {user && user.role !== "GUEST" ? (
                  <div className="w-7 h-7 rounded-full bg-[#222222] text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#717171] text-white flex items-center justify-center">
                    <Icon name="person" size={18} className="text-white" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] py-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                  {user && user.role !== "GUEST" ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#EBEBEB]">
                        <p className="font-bold text-sm text-[#222222] truncate">{user.name || "User"}</p>
                        <p className="text-[#717171] text-[11px] truncate">{user.email || user.phone}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                      >
                        <Icon name="dashboard" size={16} className="text-[#717171]" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                      >
                        <Icon name="favorite" size={16} className="text-[#FF385C]" />
                        <span>Saved Properties</span>
                      </Link>
                      <Link
                        href="/post-property"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                      >
                        <Icon name="add_home" size={16} className="text-forest-600" />
                        <span>Post a Property (Free)</span>
                      </Link>
                      <div className="my-1 border-t border-[#EBEBEB]" />
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          showToast("Logged out successfully", "info");
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 hover:bg-[#F7F7F7] text-[#717171]"
                      >
                        <Icon name="logout" size={16} />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#F7F7F7] font-bold text-[#222222]"
                      >
                        <span>Sign Up</span>
                        <span className="text-[10px] font-extrabold bg-[#FF385C] text-white px-2 py-0.5 rounded-full ml-auto">
                          New
                        </span>
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 hover:bg-[#F7F7F7] text-[#717171]"
                      >
                        Log In
                      </Link>
                      <div className="my-1 border-t border-[#EBEBEB]" />
                      <Link
                        href="/post-property"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 hover:bg-[#F7F7F7] text-[#222222]"
                      >
                        List your property
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 hover:bg-[#F7F7F7] text-[#717171]"
                      >
                        Help Centre &amp; FAQs
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Icon (Drawer Trigger) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#222222] hover:bg-[#F7F7F7] rounded-full transition-colors"
              aria-label="Open mobile menu"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-50">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#EBEBEB]">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF385C] flex items-center justify-center text-white">
                    <Icon name="home_work" size={18} className="text-white" />
                  </div>
                  <span className="font-sans font-extrabold text-xl text-[#222222]">
                    Ghar<span className="text-[#FF385C]">.</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5 flex flex-col text-sm font-semibold text-[#222222]">
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="search" size={18} className="text-[#FF385C]" />
                  <span>Find Rental Homes</span>
                </Link>
                <Link
                  href="/search?gender=FAMILY"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="family_restroom" size={18} className="text-[#717171]" />
                  <span>Family &amp; Couple Flats</span>
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="favorite" size={18} className="text-[#FF385C]" />
                  <span>Saved Properties</span>
                </Link>
                <Link
                  href="/post-property"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl bg-forest-50 text-forest-700 font-bold"
                >
                  <Icon name="add_home" size={18} className="text-forest-600" />
                  <span>List Property Free</span>
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="payments" size={18} className="text-[#717171]" />
                  <span>Pricing &amp; Services</span>
                </Link>
                <Link
                  href="/safety-tips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="verified_user" size={18} className="text-forest-600" />
                  <span>Aadhaar Verification</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:bg-[#F7F7F7]"
                >
                  <Icon name="support_agent" size={18} className="text-[#717171]" />
                  <span>Contact &amp; WhatsApp Support</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#EBEBEB]">
              {user && user.role !== "GUEST" ? (
                <div className="space-y-3">
                  <div className="text-xs">
                    <p className="font-bold text-[#222222]">{user.name}</p>
                    <p className="text-[#717171]">{user.email || user.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      showToast("Logged out successfully", "info");
                    }}
                    className="w-full py-2.5 text-center text-xs font-bold text-[#717171] bg-[#F7F7F7] rounded-xl"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-[#222222] border border-[#EBEBEB] rounded-xl hover:bg-[#F7F7F7]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-[#FF385C] rounded-xl shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
