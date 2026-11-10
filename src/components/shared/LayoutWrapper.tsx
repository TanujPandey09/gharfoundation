"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const HIDE_LAYOUT_ROUTES = [
  "/login",
  "/signup",
  "/onboarding",
  "/sso-callback",
  "/post-property",
  "/dashboard",
  "/documents",
  "/favorites",
  "/leads",
  "/messages",
  "/payments",
  "/properties",
  "/schedule",
  "/settings",
  "/analytics"
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route starts with any of the hidden routes
  const shouldHideLayout = HIDE_LAYOUT_ROUTES.some(route => 
    pathname === route || pathname?.startsWith(`${route}/`)
  );

  // Property detail pages have their own sticky mobile call/whatsapp/schedule visit drawer
  const isPropertyDetailPage = pathname?.startsWith("/property/");
  const showBottomNav = !shouldHideLayout && !isPropertyDetailPage;

  return (
    <>
      {!shouldHideLayout && (
        <Suspense fallback={<div className="h-16 bg-cream dark:bg-mitti-950" />}>
          <Navbar />
        </Suspense>
      )}
      <main className={`flex-grow ${showBottomNav ? "pb-20 md:pb-0" : ""}`}>
        {children}
      </main>
      {!shouldHideLayout && <Footer />}
      {showBottomNav && <BottomNav />}
    </>
  );
}
