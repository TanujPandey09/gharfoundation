"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Icon from "@/components/shared/Icon";
import { SavedPropertyItem } from "@/components/dashboard/DashboardShared";
import { Property } from "@/lib/types";

export default function FavoritesPage() {
    const { data: favorites, isLoading } = useQuery({
        queryKey: ["user-favorites"],
        queryFn: async () => {
            const res = await fetch("/api/favorites");
            if (!res.ok) throw new Error("Failed to fetch favorites");
            return res.json();
        },
    });

    if (isLoading) {
        return <div className="p-8 text-slate-500">Loading favorites...</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            <div className="w-full space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Listings</h2>
                        <p className="text-[13px] text-slate-500 mt-1 font-medium">{favorites?.length || 0} Properties Shortlisted</p>
                    </div>
                </div>

                {favorites?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((fav: any) => (
                            <SavedPropertyItem
                                key={fav.id}
                                title={fav.property?.title || "Property"}
                                price={`₹${fav.property?.rent?.toLocaleString() || 0}`}
                                image={fav.property?.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="favorite_border" size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-800 mb-1">No saved properties yet</h3>
                        <p className="text-[14px] text-slate-500 max-w-[300px] mx-auto">
                            When you see a property you like, click the heart icon to save it here for quick access.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
