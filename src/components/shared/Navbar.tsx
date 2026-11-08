"use client";

import React, { useState, useEffect } from "react";
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

  const isSearchPage = pathname === "/search";
  const activeCity = searchParams.get("city") || searchParams.get("q") || "";
  const [propertiesCount, setPropertiesCount] = useState(0);

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

  const navLinks = [
    { label: "Find Homes", href: "/search" },
    { label: "Families & Couples", href: "/search?gender=FAMILY" },
    { label: "Pricing & Services", href: "/pricing" },
    { label: "Safety & Verification", href: "/safety-tips" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-nav bg-cream/90 dark:bg-mitti-950/90 backdrop-blur-md border-b border-mitti-200/80 dark:border-mitti-800 px-4 md:px-8 lg:px-12 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link href="/" className="flex items-baseline gap-2 group">
            <span className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-mitti-950 dark:text-cream group-hover:text-terracotta-600 transition-colors">
              Ghar<span className="text-terracotta-600">.</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium text-mitti-500 dark:text-mitti-400 border-l border-mitti-300 dark:border-mitti-700 pl-2">
              Direct Home Rentals
            </span>
          </Link>

          {/* Dynamic Search Page Pill */}
          {isSearchPage && (
            <div className="hidden sm:flex items-center gap-1.5 bg-mitti-100 dark:bg-mitti-800 px-3 py-1 rounded-full text-[11px] font-semibold text-mitti-700 dark:text-mitti-200">
              <span className="tabular-nums">
                {propertiesCount.toLocaleString()} {propertiesCount === 1 ? "listing" : "listings"} in {displayCityName}
              </span>
              <button
                onClick={clearCityFilter}
                className="hover:text-terracotta-600 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-mitti-200 dark:hover:bg-mitti-700 ml-0.5"
                title="Clear filter"
                aria-label="Clear filter"
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-semibold text-mitti-600 dark:text-mitti-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href.split("?")[0]));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-mitti-900 dark:hover:text-white transition-colors pb-0.5 ${
                  isActive ? "text-terracotta-700 dark:text-terracotta-400 border-b-2 border-terracotta-600 font-bold" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            href="/post-property"
            className="flex items-center gap-1.5 text-xs font-semibold text-mitti-800 dark:text-mitti-200 border border-mitti-300 dark:border-mitti-700 hover:bg-mitti-100 dark:hover:bg-mitti-800 px-3.5 py-2 rounded-btn transition-colors"
          >
            <Icon name="add_home" size={16} className="text-terracotta-600" />
            <span>List Property</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-100 text-forest-700 px-1.5 py-0.2 rounded-full">
              Free
            </span>
          </Link>

          {user && user.role !== "GUEST" ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-4 py-2 rounded-btn text-xs font-bold shadow-sm transition-all duration-200 active:scale-[0.98]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  showToast("Logged out successfully", "info");
                }}
                className="text-xs font-medium text-mitti-500 hover:text-mitti-900 dark:hover:text-white transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-mitti-700 dark:text-mitti-300 hover:text-mitti-900 dark:hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-4 py-2 rounded-btn text-xs font-bold shadow-sm transition-all duration-200 active:scale-[0.98]"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-mitti-800 dark:text-mitti-100 hover:bg-mitti-100 dark:hover:bg-mitti-800 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Icon name={mobileMenuOpen ? "close" : "menu"} size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-modal lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-mitti-950/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] h-full bg-cream dark:bg-mitti-900 p-6 shadow-e3 flex flex-col justify-between overflow-y-auto z-modal">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-mitti-200 dark:border-mitti-800">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-display font-extrabold text-xl text-mitti-950 dark:text-cream">
                    Ghar<span className="text-terracotta-600">.</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-mitti-600 hover:text-mitti-900 hover:bg-mitti-100 dark:hover:bg-mitti-800 transition-colors"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <nav className="mt-6 space-y-1 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-3.5 rounded-lg text-sm font-semibold transition-colors ${
                      pathname === link.href
                        ? "bg-mitti-200/70 dark:bg-mitti-800 text-terracotta-700 dark:text-terracotta-400 font-bold"
                        : "text-mitti-700 dark:text-mitti-200 hover:bg-mitti-100 dark:hover:bg-mitti-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-mitti-200 dark:border-mitti-800">
                <Link
                  href="/post-property"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white py-3 rounded-btn text-sm font-bold shadow-sm transition-all"
                >
                  <Icon name="add_home" size={18} className="text-white" />
                  <span>List Your Property — Free</span>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-mitti-200 dark:border-mitti-800 space-y-2">
              {user && user.role !== "GUEST" ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center bg-mitti-900 dark:bg-mitti-100 text-white dark:text-mitti-900 py-2.5 rounded-btn text-xs font-bold"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      showToast("Logged out successfully", "info");
                    }}
                    className="w-full text-center text-xs font-medium text-mitti-500 hover:text-mitti-900 py-2"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center text-xs font-semibold text-mitti-800 dark:text-mitti-200 py-2.5 rounded-btn border border-mitti-300 dark:border-mitti-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center bg-terracotta-600 text-white py-2.5 rounded-btn text-xs font-bold"
                  >
                    Join Free
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
