"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";

/**
 * Mobile Bottom Navigation (design-system/MASTER.md)
 * 5 primary tabs in clear English:
 * 1. Home
 * 2. Search
 * 3. List Property (center primary action)
 * 4. Saved
 * 5. Profile / Login
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: "home",
      active: pathname === "/",
    },
    {
      label: "Search",
      href: "/search",
      icon: "search",
      active: pathname.startsWith("/search"),
    },
    {
      label: "List",
      href: "/post-property",
      icon: "add_home",
      isPrimary: true,
      active: pathname.startsWith("/post-property"),
    },
    {
      label: "Saved",
      href: user ? "/favorites" : "/login",
      icon: "favorite",
      active: pathname.startsWith("/favorites"),
    },
    {
      label: user ? "Profile" : "Sign In",
      href: user ? "/dashboard" : "/login",
      icon: "person",
      active: pathname.startsWith("/dashboard") || pathname.startsWith("/login"),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-nav bg-white/95 dark:bg-mitti-950/95 backdrop-blur-md border-t border-mitti-200/80 dark:border-mitti-800 pb-[env(safe-area-inset-bottom)] transition-colors"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          if (tab.isPrimary) {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-e2 flex items-center justify-center transition-transform active:scale-95">
                  <Icon name={tab.icon} size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold text-terracotta-700 dark:text-terracotta-400 mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors min-w-[56px] ${
                tab.active
                  ? "text-terracotta-600 dark:text-terracotta-400 font-semibold"
                  : "text-mitti-500 hover:text-mitti-800 dark:text-mitti-400 dark:hover:text-mitti-100"
              }`}
            >
              <Icon
                name={tab.icon}
                size={22}
                fill={tab.active}
                className={tab.active ? "text-terracotta-600 dark:text-terracotta-400" : "text-mitti-500 dark:text-mitti-400"}
              />
              <span className="text-[11px] leading-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
