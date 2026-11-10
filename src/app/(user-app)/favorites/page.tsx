"use client";
import React, { Suspense } from "react";
import { DashboardMonolith } from "@/components/dashboard/DashboardMonolith";

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#717171]">Loading Saved Homes...</div>}>
      <DashboardMonolith activeTabOverride="saved" />
    </Suspense>
  );
}
