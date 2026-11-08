"use client";

import React, { useState, Suspense } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";
import { HeaderProfileDropdown } from "@/components/dashboard/HeaderProfileDropdown";
import { TourScheduleTab } from "@/components/dashboard/TourScheduleTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { MessagesTab } from "@/components/dashboard/MessagesTab";
import DocumentsTab from "@/components/dashboard/DocumentsTab";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

import { OnboardingFlows } from "@/components/dashboard/OnboardingFlows";

export function DashboardMonolith({ activeTabOverride }: { activeTabOverride?: string }) {
    const router = useRouter();
    const { user, logout, updateUserRole } = useAuth();
    const { showToast } = useToast();

    const hasOwnerProfile = !!user?.ownerProfile;
    const forceOwnerOnboarding = user?.activeWorkspace === "HOSTING" && !hasOwnerProfile;

    const handleCloseOwnerOnboarding = async () => {
        try {
            await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activeWorkspace: "SEARCH" }),
            });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            router.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    const role = user?.role || "RENTER";
    const displayRole = user?.role === "ADMIN"
        ? "ADMIN"
        : user?.role === "BROKER"
            ? "BROKER"
            : (user?.activeWorkspace === "HOSTING" ? "OWNER" : "RENTER");
    const activeTab = activeTabOverride || "dashboard";

    const queryClient = useQueryClient();
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    // Leads & Agreements states
    const [showNewLeaseModal, setShowNewLeaseModal] = useState(false);
    const [showNewLeadModal, setShowNewLeadModal] = useState(false);
    const [leadFilter, setLeadFilter] = useState<"ALL" | "NEW" | "CONTACTED" | "ARCHIVED">("ALL");

    // Lease query states
    const [leaseSearch, setLeaseSearch] = useState("");
    const [leaseFilter, setLeaseFilter] = useState<"ALL" | "ACTIVE" | "PENDING_SIGN" | "EXPIRING" | "EXPIRED">("ALL");
    const [leaseSort, setLeaseSort] = useState("recently_added");
    const [leasePage, setLeasePage] = useState(1);
    const [analyticsSearch, setAnalyticsSearch] = useState("");
    const [propertySearch, setPropertySearch] = useState("");
    const [listingStatusFilter, setListingStatusFilter] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
    const [propertiesViewMode, setPropertiesViewMode] = useState<"GRID" | "LIST">("GRID");
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"7" | "30" | "90">("30");
    const leaseLimit = 5; // Page size of 5 for nice look

    const [leaseForm, setLeaseForm] = useState({
        tenantName: "",
        tenantEmail: "",
        propertyName: "",
        propertyCity: "",
        startDate: "",
        endDate: "",
        rent: "",
        status: "ACTIVE",
    });

    const [leadForm, setLeadForm] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
        propertyName: "",
        rentAmount: "",
        status: "NEW",
    });

    // Queries
    const { data: leasesData = { data: [], total: 0 } } = useQuery({
        queryKey: ["leases", leaseSearch, leaseFilter, leaseSort, leasePage],
        queryFn: async () => {
            const res = await fetch(`/api/leases?search=${encodeURIComponent(leaseSearch)}&status=${leaseFilter}&sort=${leaseSort}&page=${leasePage}&limit=${leaseLimit}`);
            if (!res.ok) throw new Error("Failed to fetch leases");
            return res.json();
        },
        enabled: displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN",
    });

    const leases = leasesData.data || [];
    const leasesTotal = leasesData.total || 0;

    const { data: leads = [] } = useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const res = await fetch("/api/leads");
            if (!res.ok) throw new Error("Failed to fetch leads");
            return res.json();
        },
        enabled: displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN",
    });

    // Client-side text lease file generation and download
    const handleDownloadLease = (lease: any) => {
        const content = `======================================================================
                  RESIDENTIAL LEASE AGREEMENT
======================================================================
Date Generated: ${new Date().toLocaleDateString()}
Agreement Status: ${lease.status}

1. PARTIES:
This agreement is entered into by the Landlord and Tenant listed:
Landlord (Owner ID): ${lease.ownerId}
Tenant Name: ${lease.tenantName}
Tenant Email: ${lease.tenantEmail}

2. PROPERTY DETAILS:
Property Name: ${lease.propertyName}
City: ${lease.propertyCity}

3. TERM:
Start Date: ${new Date(lease.startDate).toLocaleDateString()}
End Date: ${new Date(lease.endDate).toLocaleDateString()}

4. MONTHLY RENT:
The monthly rent due is INR ${lease.rent?.toLocaleString()} payable in
advance on or before the 5th day of every calendar month.

5. GENERAL COVENANTS:
- The Tenant agrees to maintain the premises in a clean and safe state.
- No structural alterations or painting of walls shall be conducted
  without the Landlord's written consent.
- The property is for residential usage only.

Landlord Signature: _________________________

Tenant Signature: ___________________________
======================================================================
`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Lease_Agreement_${lease.tenantName.replace(/\s+/g, "_")}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        showToast("Lease agreement downloaded successfully", "success");
    };

    // Mutations
    const createLeaseMutation = useMutation({
        mutationFn: async (payload: typeof leaseForm) => {
            const res = await fetch("/api/leases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to create lease agreement");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leases"] });
            showToast("Lease agreement created successfully", "success");
            setShowNewLeaseModal(false);
            setLeaseForm({
                tenantName: "",
                tenantEmail: "",
                propertyName: "",
                propertyCity: "",
                startDate: "",
                endDate: "",
                rent: "",
                status: "ACTIVE",
            });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to create lease", "error");
        }
    });

    const updateLeaseMutation = useMutation({
        mutationFn: async (payload: { id: string; status: string }) => {
            const res = await fetch(`/api/leases/${payload.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: payload.status }),
            });
            if (!res.ok) throw new Error("Failed to update lease");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leases"] });
            showToast("Lease updated successfully", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update lease", "error");
        }
    });

    const deleteLeaseMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/leases/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete lease");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leases"] });
            showToast("Lease agreement deleted", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to delete lease", "error");
        }
    });

    const createLeadMutation = useMutation({
        mutationFn: async (payload: typeof leadForm) => {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to create lead");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            showToast("Lead added successfully", "success");
            setShowNewLeadModal(false);
            setLeadForm({
                name: "",
                email: "",
                phone: "",
                notes: "",
                propertyName: "",
                rentAmount: "",
                status: "NEW",
            });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to create lead", "error");
        }
    });

    const updateLeadMutation = useMutation({
        mutationFn: async (payload: { id: string; status: string }) => {
            const res = await fetch(`/api/leads/${payload.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: payload.status }),
            });
            if (!res.ok) throw new Error("Failed to update lead");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            showToast("Lead status updated", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update lead", "error");
        }
    });

    const deleteLeadMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/leads/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete lead");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            showToast("Lead deleted", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to delete lead", "error");
        }
    });

    const deleteFavoriteMutation = useMutation({
        mutationFn: async (favId: string) => {
            const res = await fetch(`/api/favorites/${favId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove favorite");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
            showToast("Removed from favorites", "info");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to remove favorite", "error");
        }
    });

    const deletePropertyMutation = useMutation({
        mutationFn: async (propId: string) => {
            const res = await fetch(`/api/properties/${propId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete property");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-properties"] });
            showToast("Property deleted successfully", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to delete property", "error");
        }
    });

    const handleCompareCheckboxChange = (propertyId: string) => {
        if (compareIds.includes(propertyId)) {
            setCompareIds(compareIds.filter(id => id !== propertyId));
        } else {
            if (compareIds.length >= 3) {
                showToast("You can compare up to 3 properties maximum", "warning");
                return;
            }
            setCompareIds([...compareIds, propertyId]);
        }
    };

    // Fetch API Data
    const { data: stats } = useQuery({
        queryKey: ["user-stats", analyticsTimeframe],
        queryFn: async () => {
            const res = await fetch(`/api/user/stats?timeframe=${analyticsTimeframe}`);
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
        enabled: displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN",
    });

    const { data: properties } = useQuery({
        queryKey: ["user-properties"],
        queryFn: async () => {
            const res = await fetch("/api/user/properties");
            if (!res.ok) throw new Error("Failed to fetch properties");
            return res.json();
        },
        enabled: displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN",
    });

    const { data: tours } = useQuery({
        queryKey: ["user-tours"],
        queryFn: async () => {
            const res = await fetch("/api/tours");
            if (!res.ok) throw new Error("Failed to fetch tours");
            return res.json();
        },
    });

    const { data: favorites } = useQuery({
        queryKey: ["user-favorites"],
        queryFn: async () => {
            const res = await fetch("/api/favorites");
            if (!res.ok) throw new Error("Failed to fetch favorites");
            return res.json();
        },
        enabled: displayRole === "RENTER",
    });

    const { data: recommendationsData } = useQuery({
        queryKey: ["recommendations"],
        queryFn: async () => {
            const res = await fetch("/api/properties?limit=3");
            if (!res.ok) throw new Error("Failed to fetch recommendations");
            return res.json();
        },
        enabled: displayRole === "RENTER",
    });

    const { data: analyticsData } = useQuery({
        queryKey: ["user-analytics", analyticsTimeframe],
        queryFn: async () => {
            const res = await fetch(`/api/user/analytics?timeframe=${analyticsTimeframe}`);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            return res.json();
        },
        enabled: displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN",
    });

    const mappedTours = tours?.map((t: any) => {
        const isOwner = t.property.ownerId === user?.id;
        const partnerName = isOwner ? (t.user?.name || "Renter") : (t.property.owner?.name || "Owner");
        const partnerImage = isOwner ? (t.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100") : (t.property.owner?.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100");
        const partnerRole = isOwner ? "Renter" : (t.property.owner?.role || "Owner");

        let uiStatus: "SCHEDULED" | "PENDING" | "PAST" = "PENDING";
        if (t.status === "APPROVED" || t.status === "SCHEDULED") uiStatus = "SCHEDULED";
        else if (t.status === "REJECTED" || t.status === "PAST" || t.status === "COMPLETED" || t.tourCompleted) uiStatus = "PAST";

        return {
            id: t.id,
            propertyId: t.propertyId,
            propertyTitle: t.property.title,
            propertyLocation: `${t.property.areaName}, ${t.property.city}`,
            propertyImage: t.property.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80",
            date: t.date,
            time: t.time,
            partnerName,
            partnerImage,
            partnerRole,
            status: uiStatus,
        };
    }) || [];

    const upcomingTours = mappedTours.filter((t: any) => t.status === "SCHEDULED" || t.status === "PENDING");

    const filteredPerformingProperties = analyticsData?.topPerforming?.filter((p: any) =>
        p.title.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
        p.location.toLowerCase().includes(analyticsSearch.toLowerCase())
    ) || [];

    const filteredProperties = properties?.filter((prop: any) => {
        const matchesSearch = prop.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
            prop.city.toLowerCase().includes(propertySearch.toLowerCase()) ||
            (prop.areaName && prop.areaName.toLowerCase().includes(propertySearch.toLowerCase()));

        if (listingStatusFilter === "VERIFIED") return matchesSearch && prop.isVerified;
        if (listingStatusFilter === "PENDING") return matchesSearch && !prop.isVerified;
        return matchesSearch;
    }) || [];

    // RENTER DASHBOARD (Image 1, 2, 3)
    if (displayRole === "RENTER") {
        return (
            <>
                <div className="w-full h-full flex flex-col">

                    {/* DASHBOARD TAB (IMAGE 1) */}
                    {activeTab === "dashboard" && (
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="w-full flex flex-col xl:flex-row gap-4 sm:p-6 md:p-8">
                                {/* LEFT COLUMN */}
                                <div className="flex-1 min-w-0 space-y-8">
                                    <div>
                                        <h2 className="text-[22px] text-slate-800 font-medium">Welcome back, {user?.name || "Guest"}!</h2>
                                        <p className="text-[15px] text-slate-500 mt-1">You have <span className="font-bold text-ink">{upcomingTours.length} scheduled {upcomingTours.length === 1 ? "visit" : "visits"}</span> this week in {upcomingTours.map((t: any) => t.propertyLocation.split(",").pop().trim()).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i).join(", ") || "Uttarakhand"}.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-800 text-[15px]">Upcoming Visits</h3>
                                            <button onClick={() => router.push("/dashboard?tab=schedule")} className="text-rausch text-[13px] font-medium hover:underline">View All Schedule</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {upcomingTours.length > 0 ? (
                                                upcomingTours.slice(0, 2).map((tour: any) => (
                                                    <VisitCard
                                                        key={tour.id}
                                                        time={`${new Date(tour.date).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}, ${tour.time}`}
                                                        title={tour.propertyTitle}
                                                        person={`${tour.partnerRole}: ${tour.partnerName}`}
                                                        image={tour.propertyImage}
                                                        onClick={() => router.push("/dashboard?tab=schedule")}
                                                    />
                                                ))
                                            ) : (
                                                <div className="col-span-2 bg-white rounded-xl border border-dashed border-gray-200 p-4 sm:p-6 md:p-8 text-center text-slate-500">
                                                    <Icon name="event" size={32} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="font-semibold text-sm">No upcoming visits</p>
                                                    <p className="text-xs mt-0.5">Schedule a physical tour on any listing details page.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 text-[15px]">Recommended for You</h3>
                                                <p className="text-[13px] text-slate-500">Based on your "Flat/House" preference</p>
                                            </div>
                                            <button onClick={() => router.push("/search")} className="bg-white border border-gray-200 text-slate-700 text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 shadow-sm">
                                                <Icon name="tune" size={16} /> Filter
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {recommendationsData?.properties && recommendationsData.properties.length > 0 ? (
                                                recommendationsData.properties.map((prop: any) => (
                                                    <PropertyMiniCard
                                                        key={prop.id}
                                                        id={prop.id}
                                                        image={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"}
                                                        badge={prop.isPremium ? "Premium" : prop.isVerified ? "Verified" : "Featured"}
                                                        title={prop.title}
                                                        price={`₹${prop.rent.toLocaleString()}`}
                                                        location={`${prop.areaName}, ${prop.city}`}
                                                        specs={`${prop.bedrooms} BHK • ${prop.bathrooms} Bath • ${prop.area} sqft`}
                                                    />
                                                ))
                                            ) : (
                                                <div className="col-span-3 text-center py-10 text-slate-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    No recommended properties available.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="w-full xl:w-[340px] shrink-0 space-y-6">
                                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[14px] font-medium text-slate-800">Profile Completion</span>
                                            <span className="text-[14px] font-bold text-ink">85%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-ink w-[85%] rounded-full" />
                                        </div>
                                        <p className="text-[12px] text-slate-500 leading-relaxed">
                                            Complete your KYC to unlock direct messaging with owners.
                                        </p>
                                        <button className="w-full bg-[#F8FAFC] text-ink hover:bg-slate-100 text-[13px] font-semibold py-2.5 rounded-lg transition-colors border border-gray-100 active:scale-[0.98] transition-all">
                                            Finish Setup
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-medium text-slate-800 text-[14px]">Recent Searches</h3>
                                        <div className="space-y-2">
                                            <SearchHistoryItem title="3 BHK Flats in Tapovan, Rishikesh" subtitle="Applied: Filter > ₹60k" />
                                            <SearchHistoryItem title="Gated Communities Rajpur Road, Dehradun" subtitle="Applied: House only" />
                                        </div>
                                    </div>

                                    <div className="bg-[#1C3A8E] rounded-xl p-5 shadow-md">
                                        <h3 className="text-white font-medium text-[14px] mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <QuickActionCard icon="description" label="E-Sign" />
                                            <QuickActionCard icon="payments" label="Rent Pay" />
                                            <QuickActionCard icon="verified_user" label="KYC Status" />
                                            <QuickActionCard icon="support_agent" label="Support" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium text-slate-800 text-[14px]">Messages</h3>
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <MessageItem avatar="RK" name="Rajesh Kumar (Owner)" snippet="Is tomorrow 10:30 AM still o..." isUnread={true} color="bg-indigo-100 text-indigo-700" />
                                            <MessageItem avatar="SA" name="Samir Anand (Agent)" snippet="I've shared the contract draft." isUnread={false} color="bg-orange-100 text-orange-700" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <h3 className="font-medium text-slate-800 text-[14px]">Saved Properties</h3>
                                        <div className="space-y-3">
                                            <SavedPropertyItem title="Prestige Lake Ridge" price="₹48,000" image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=150&q=80" />
                                            <SavedPropertyItem title="Brigade Meadows" price="₹62,000" image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=150&q=80" />
                                        </div>
                                        <button className="w-full text-center text-[13px] text-slate-500 pt-2 hover:text-slate-800 active:scale-[0.98] transition-all">See All (12)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEARCH TAB (IMAGE 2) */}
                    {activeTab === "search" && (
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Filters Sidebar */}
                            <div className="w-[300px] bg-white border-r border-gray-100 p-6 overflow-y-auto shrink-0 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">Filters</h2>
                                    <button className="text-ink text-[13px] font-bold hover:underline active:scale-[0.98] transition-all">Reset All</button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="space-y-3">
                                        <label className="text-[13px] font-bold text-slate-800">Monthly Budget (₹)</label>
                                        <div className="flex gap-3">
                                            <input type="text" placeholder="Min" className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-ink" />
                                            <input type="text" placeholder="Max" className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-ink" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[13px] font-bold text-slate-800">Configuration</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="border border-gray-200 rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-slate-50 text-[12.5px] font-medium text-slate-700">
                                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-ink" /> 1 BHK
                                            </label>
                                            <label className="border border-ink bg-[#F4F6FB] rounded-lg p-2.5 flex items-center gap-2 cursor-pointer text-[12.5px] font-bold text-slate-800">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-ink text-ink accent-rausch" /> 2 BHK
                                            </label>
                                            <label className="border border-ink bg-[#F4F6FB] rounded-lg p-2.5 flex items-center gap-2 cursor-pointer text-[12.5px] font-bold text-slate-800">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-ink text-ink accent-rausch" /> 3 BHK
                                            </label>
                                            <label className="border border-gray-200 rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-slate-50 text-[12.5px] font-medium text-slate-700">
                                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-ink" /> 4+ BHK
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[13px] font-bold text-slate-800">Must-have Amenities</label>
                                        <div className="space-y-2.5">
                                            <label className="flex items-center gap-3 text-[13px] text-slate-700 font-medium cursor-pointer">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-ink accent-rausch" /> Gated Community
                                            </label>
                                            <label className="flex items-center gap-3 text-[13px] text-slate-700 font-medium cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded text-ink accent-rausch" /> Swimming Pool
                                            </label>
                                            <label className="flex items-center gap-3 text-[13px] text-slate-700 font-medium cursor-pointer">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-ink accent-rausch" /> Power Backup
                                            </label>
                                            <label className="flex items-center gap-3 text-[13px] text-slate-700 font-medium cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded text-ink accent-rausch" /> Gymnasium
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[13px] font-bold text-slate-800">Preferred Localities</label>
                                        <div className="relative">
                                            <Icon name="location_on" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder="Add more..." className="w-full border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-ink" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <span className="bg-[#F1F5F9] text-ink text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">Rajpur Road, Dehradun <Icon name="close" size={12} /></span>
                                            <span className="bg-[#F1F5F9] text-ink text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">Tapovan, Rishikesh <Icon name="close" size={12} /></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button className="w-full bg-rausch hover:bg-rausch-dark text-white font-medium py-3 rounded-lg text-[14px] transition-colors shadow-sm active:scale-[0.98] transition-all">
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* Right Content Grid */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
                                <div className="w-full">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Properties in Bangalore</h2>
                                            <p className="text-[14.5px] text-slate-500 mt-1.5 font-medium">Showing 124 verified premium listings matching your preferences</p>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                                            <button className="flex items-center gap-2 px-4 py-1.5 bg-[#F8FAFC] rounded shadow-sm text-slate-800 text-[13px] font-semibold active:scale-[0.98] transition-all"><Icon name="grid_view" size={16} /> Grid</button>
                                            <button className="flex items-center gap-2 px-4 py-1.5 text-slate-500 text-[13px] font-semibold hover:text-slate-800 active:scale-[0.98] transition-all"><Icon name="map" size={16} /> Map</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <LargePropertyCard
                                            image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80"
                                            isPremium={true}
                                            isVerified={true}
                                            title="Prestige Lakeside Habitat"
                                            price="₹85,000/mo"
                                            location="Varthur, Rajpur Road, Dehradun"
                                            specs="3 BHK • 3 Bath • 1850 sqft"
                                        />
                                        <LargePropertyCard
                                            image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"
                                            isPremium={false}
                                            isVerified={true}
                                            title="Brigade Orchards Luxury"
                                            price="₹62,000/mo"
                                            location="Devanahalli, Bangalore"
                                            specs="2 BHK • 2 Bath • 1240 sqft"
                                            isNew={true}
                                        />
                                        <LargePropertyCard
                                            image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
                                            isPremium={true}
                                            isVerified={true}
                                            title="Total Environment Windmills"
                                            price="₹1,45,000/mo"
                                            location="EPIP Zone, Rajpur Road, Dehradun"
                                            specs="4 BHK • 4 Bath • 3600 sqft"
                                            readyToMove={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SAVED TAB (IMAGE 3) */}
                    {activeTab === "saved" && (
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
                            <div className="w-full space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Listings</h2>
                                        <p className="text-[13px] text-slate-500 mt-1 font-medium">{favorites?.length || 0} Properties Shortlisted</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (favorites && favorites.length > 0) {
                                                setCompareIds(favorites.slice(0, 3).map((f: any) => f.property.id));
                                                setShowCompareModal(true);
                                            } else {
                                                showToast("No saved properties to compare", "warning");
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#10b981] text-rausch rounded-full text-[13px] font-bold hover:bg-emerald-50 shadow-sm"
                                    >
                                        <Icon name="compare_arrows" size={16} /> Compare All
                                    </button>
                                </div>

                                {/* Blue Banner */}
                                <div className="bg-[#2D4293] rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
                                    <div className="relative z-10 max-w-md space-y-4">
                                        <h3 className="text-2xl font-bold">Listing Comparison Tool</h3>
                                        <p className="text-[14px] text-emerald-100/90 leading-relaxed font-medium">
                                            Not sure which one to pick? Compare amenities, security features, and locality ratings side-by-side to make the elite choice for your next home.
                                        </p>
                                        <div className="flex gap-4 pt-2">
                                            <button
                                                onClick={() => {
                                                    if (compareIds.length > 0) {
                                                        setShowCompareModal(true);
                                                    } else {
                                                        showToast("Please select at least one property by checking its checkbox", "warning");
                                                    }
                                                }}
                                                className="bg-white text-[#2D4293] px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50"
                                            >
                                                Compare Selected ({compareIds.length})
                                            </button>
                                            <button
                                                onClick={() => showToast("Select up to 3 listings using checkboxes to view side-by-side specs.", "info")}
                                                className="bg-[#1A2E77] border border-[#3D52A3] px-5 py-2.5 rounded-lg text-[13px] font-medium shadow-sm hover:bg-[#1A2E77]/80"
                                            >
                                                How it works
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20">
                                        <Icon name="bar_chart" size={120} />
                                    </div>
                                </div>

                                {/* Favorites Grid */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-slate-800">Recent Favorites</h3>
                                        <button className="text-[13px] text-slate-500 font-medium flex items-center gap-1 hover:text-slate-800 active:scale-[0.98] transition-all"><Icon name="sort" size={16} /> Date Added</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {favorites && favorites.length > 0 ? (
                                            favorites.map((fav: any) => (
                                                <div key={fav.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden relative">
                                                    {fav.property.isVerified && <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">VERIFIED</div>}
                                                    <button
                                                        onClick={() => deleteFavoriteMutation.mutate(fav.id)}
                                                        className="absolute top-3 right-3 bg-white text-red-500 p-1.5 rounded-full shadow-sm z-10 hover:bg-red-50 transition-colors"
                                                        title="Remove from Saved"
                                                    >
                                                        <Icon name="favorite" size={16} />
                                                    </button>
                                                    <img src={fav.property.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80"} className="w-full h-40 object-cover" alt="saved" />
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-[20px] font-bold text-ink">₹{fav.property.rent.toLocaleString()} <span className="text-[11px] text-slate-400 font-medium">/mo</span></h4>
                                                                <p className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1"><Icon name="location_on" size={14} /> {fav.property.areaName}, {fav.property.city}</p>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={compareIds.includes(fav.property.id)}
                                                                onChange={() => handleCompareCheckboxChange(fav.property.id)}
                                                                className="w-4 h-4 rounded text-rausch accent-[#10b981] border-gray-300 mt-1 cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                                                            <span className="flex items-center gap-1"><Icon name="bed" size={14} /> {fav.property.bedrooms} BHK</span>
                                                            <span className="flex items-center gap-1"><Icon name="square_foot" size={14} /> {fav.property.area} sqft</span>
                                                            {fav.property.isFeatured && <span className="flex items-center gap-1 text-rausch"><Icon name="star" size={14} /> Elite</span>}
                                                        </div>
                                                        <button
                                                            onClick={() => router.push(`/property/${fav.property.id}`)}
                                                            className="w-full bg-[#059669] hover:bg-[#0830a8] text-white text-[13px] font-medium py-2 rounded-lg mt-2 transition-colors"
                                                        >
                                                            View Full Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-10 text-slate-500">
                                                No saved properties yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Highlights */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-bold text-slate-800">Locality Comparison Highlights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">SAFETY SCORE</p>
                                                <h4 className="text-[18px] font-bold text-slate-900">Worli Sea Face Leads</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div className="bg-green-500 h-full w-[90%] rounded-full"></div>
                                                </div>
                                                <div className="h-2 w-[85%] bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div className="bg-amber-500 h-full w-[70%] rounded-full"></div>
                                                </div>
                                            </div>
                                            <p className="text-[12px] text-slate-500 font-medium">Based on community feedback and police reporting data.</p>
                                        </div>

                                        <div className="bg-[#3D71FF] rounded-xl p-6 shadow-sm text-white flex flex-col justify-between">
                                            <Icon name="directions_car" size={24} className="opacity-80" />
                                            <div>
                                                <p className="text-[12px] font-bold opacity-90 mb-1">Avg. Commute</p>
                                                <h4 className="text-2xl font-bold mb-1">15 mins</h4>
                                                <p className="text-[11px] opacity-80 leading-relaxed">To major tech hubs from Tapovan, Rishikesh.</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Sticky Compare bar */}
                            {compareIds.length > 0 && (
                                <div className="fixed bottom-8 left-[300px] right-[50px] md:left-[400px] md:right-[100px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-200 p-4 flex items-center justify-between z-50">
                                    <div className="flex gap-4 items-center">
                                        <div className="flex gap-2">
                                            {favorites?.filter((f: any) => compareIds.includes(f.property.id)).map((fav: any) => (
                                                <img key={fav.id} src={fav.property.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=50&q=80"} className="w-10 h-10 rounded border border-gray-200 object-cover" alt="thumb" />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-800">{compareIds.length} {compareIds.length === 1 ? "Property" : "Properties"} Selected</p>
                                            <p className="text-[12px] text-slate-500 font-medium">Compare rent, specifications, and details.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setCompareIds([])} className="text-[13px] text-slate-500 font-medium hover:text-slate-800">Clear All</button>
                                        <button onClick={() => setShowCompareModal(true)} className="bg-ink text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-slate-800 shadow-sm transition-colors">Compare Now</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MESSAGES TAB */}
                    {activeTab === "messages" && <MessagesTab />}

                    {/* DOCUMENTS & KYC TAB */}
                    {activeTab === "documents" && <DocumentsTab />}

                    {/* TOUR SCHEDULE TAB */}
                    {activeTab === "schedule" && <TourScheduleTab />}

                    {/* DOCUMENTS & KYC TAB */}
                    {activeTab === "documents" && <DocumentsTab />}

                    {/* SETTINGS / PRIVACY TABS */}
                    {activeTab === "settings" && <SettingsTab user={user} role={role} updateUserRole={updateUserRole} showToast={showToast} />}
                </div>

                {/* Compare Modal */}
                {showCompareModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-800">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-ink text-white">
                                <div>
                                    <h3 className="text-xl font-bold">Listing Comparison</h3>
                                    <p className="text-xs text-emerald-200 mt-1">Side-by-side comparison of selected properties</p>
                                </div>
                                <button
                                    onClick={() => setShowCompareModal(false)}
                                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <Icon name="close" size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-auto p-6">
                                {compareIds.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Icon name="compare_arrows" size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="font-semibold text-lg">No properties selected for comparison</p>
                                        <p className="text-sm mt-1">Check the boxes on saved properties first.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-4 min-w-[700px]">
                                        {/* Attributes Labels Column */}
                                        <div className="space-y-4 font-semibold text-slate-500 text-sm pt-[180px]">
                                            <div className="h-12 flex items-center border-b border-gray-100">Monthly Rent</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Location</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Config</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Area</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Furnishing</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Verification</div>
                                            <div className="h-12 flex items-center border-b border-gray-100">Listed By</div>
                                        </div>

                                        {/* Property Columns */}
                                        {favorites?.filter((f: any) => compareIds.includes(f.property.id)).map((fav: any) => {
                                            const prop = fav.property;
                                            return (
                                                <div key={prop.id} className="space-y-4 border border-gray-100 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                                                    {/* Property Header Card */}
                                                    <div className="h-[160px] flex flex-col justify-between">
                                                        <img
                                                            src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80"}
                                                            alt={prop.title}
                                                            className="h-24 w-full object-cover rounded-lg"
                                                        />
                                                        <h4 className="font-bold text-slate-800 text-sm truncate mt-2">{prop.title}</h4>
                                                    </div>

                                                    {/* Rent */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 font-bold text-lg text-ink">
                                                        ₹{prop.rent?.toLocaleString()}<span className="text-xs text-slate-400 font-medium ml-1">/mo</span>
                                                    </div>

                                                    {/* Location */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 text-xs text-slate-600 truncate" title={`${prop.areaName}, ${prop.city}`}>
                                                        {prop.areaName}, {prop.city}
                                                    </div>

                                                    {/* Config */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 text-sm text-slate-700">
                                                        {prop.bedrooms} BHK, {prop.bathrooms} Bath
                                                    </div>

                                                    {/* Area */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 text-sm text-slate-700">
                                                        {prop.area} sqft
                                                    </div>

                                                    {/* Furnishing */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 text-sm text-slate-700">
                                                        {prop.furnishing || "Semi-Furnished"}
                                                    </div>

                                                    {/* Verification */}
                                                    <div className="h-12 flex items-center border-b border-gray-100">
                                                        {prop.isVerified ? (
                                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">VERIFIED</span>
                                                        ) : (
                                                            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded">PENDING</span>
                                                        )}
                                                    </div>

                                                    {/* Listed By */}
                                                    <div className="h-12 flex items-center border-b border-gray-100 text-xs text-slate-600">
                                                        {prop.owner?.name || "Premium Host"}
                                                    </div>

                                                    {/* Action */}
                                                    <button
                                                        onClick={() => {
                                                            setShowCompareModal(false);
                                                            router.push(`/property/${prop.id}`);
                                                        }}
                                                        className="w-full bg-[#10b981] hover:bg-[#1d4ed8] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors text-center shadow-sm"
                                                    >
                                                        View Listing
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Fill remaining empty columns if comparing less than 3 */}
                                        {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-400 h-[530px]">
                                                <Icon name="add" size={24} className="mb-2" />
                                                <p className="text-xs font-medium">Add property<br />to compare</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <OnboardingFlows
                    user={user}
                    onRefresh={() => {
                        queryClient.invalidateQueries({ queryKey: ["user"] });
                        router.refresh();
                    }}
                    showToast={showToast}
                />
            </>
        );
    }

    // OWNER DASHBOARD (Rental Manager)
    if (displayRole === "OWNER" || displayRole === "BROKER" || displayRole === "ADMIN") {
        return (
            <>
                <div className="w-full h-full flex flex-col">

                    {/* === DASHBOARD TAB === */}
                    {activeTab === "dashboard" && (
                        <div className="w-full p-6 md:p-8 space-y-6">
                            {/* Stats Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Featured: Active Listings */}
                                <div className="md:col-span-2 bg-emerald-500 dark:bg-emerald-600 rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 active:scale-[0.99] transition-all duration-300">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-50 uppercase tracking-widest mb-2">ACTIVE LISTINGS</h4>
                                            <div className="flex items-end gap-3 mb-6">
                                                <span className="text-4xl md:text-5xl sm:text-6xl font-display font-extrabold text-white leading-none tracking-tight">{stats?.activeListings || 0}</span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <Icon name="home" size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-emerald-950/20 h-2.5 rounded-full mt-auto relative z-10 overflow-hidden">
                                        <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats?.totalListings ? (stats.activeListings / stats.totalListings) * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <StatCard 
                                    title="PENDING VERIFICATION" 
                                    value={stats?.pendingVerification || "0"} 
                                    trend={stats?.pendingVerification > 0 ? "Action Required" : "All clear"} 
                                    trendColor={stats?.pendingVerification > 0 ? "text-amber-500" : "text-slate-400"} 
                                />
                                
                                <StatCard 
                                    title="TOTAL LISTINGS" 
                                    value={stats?.totalListings?.toString() || "0"} 
                                    trend="Updated live" 
                                    trendColor="text-emerald-500" 
                                />
                                
                                <div className="md:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 flex flex-col justify-between">
                                     <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">PROPERTY VIEWS</h4>
                                     <div className="flex items-end gap-4">
                                         <span className="text-4xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">{stats?.totalViews?.toString() || "0"}</span>
                                         <span className="text-sm font-bold text-emerald-500 mb-1.5 flex items-center gap-1">
                                            <Icon name="trending_up" size={16} />
                                            Across all properties
                                         </span>
                                     </div>
                                </div>
                            </div>

                            {/* Main Content Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column (Chart) */}
                                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-bold text-ink">Monthly Performance</h3>
                                        <button className="text-[13px] text-slate-500 font-medium flex items-center gap-1 hover:text-slate-800 active:scale-[0.98] transition-all">Last 6 Months <Icon name="expand_more" size={16} /></button>
                                    </div>

                                    {/* Fake Bar Chart */}
                                    <div className="h-[250px] flex items-end justify-between px-2 pb-6 border-b border-gray-100">
                                        <ChartBar month="JAN" val1={40} val2={60} />
                                        <ChartBar month="FEB" val1={50} val2={70} />
                                        <ChartBar month="MAR" val1={80} val2={90} />
                                        <ChartBar month="APR" val1={45} val2={55} />
                                        <ChartBar month="MAY" val1={95} val2={100} />
                                        <ChartBar month="JUN" val1={75} val2={85} />
                                    </div>
                                    <div className="flex gap-6 mt-4 px-2">
                                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500"><div className="w-3 h-3 rounded-sm bg-ink"></div> Views</div>
                                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500"><div className="w-3 h-3 rounded-sm bg-[#CBD5E1]"></div> Leads</div>
                                    </div>
                                </div>

                                {/* Right Column (Clicks & Quick Actions) */}
                                <div className="space-y-6">
                                    {/* Quick Management */}
                                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                        <h3 className="font-bold text-ink text-[15px] mb-4">Quick Management</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <ManagementCard icon="edit" label="Edit" />
                                            <ManagementCard icon="upgrade" label="Upgrade" />
                                            <ManagementCard icon="sync" label="Renew" />
                                            <ManagementCard icon="analytics" label="Analytics" />
                                        </div>
                                    </div>
                                    <button onClick={() => window.location.href = "/post-property"} className="w-full bg-ink text-white px-6 py-4 rounded-xl text-[14px] font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-[#15345a] transition-colors">
                                        <Icon name="add" size={20} /> List New Property
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === LISTINGS TAB === */}
                    {activeTab === "listings" && (
                        <div className="w-full p-6 md:p-8 space-y-6">
                            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-2">
                                <div>
                                    <h2 className="text-[26px] font-bold text-ink tracking-tight">My Properties</h2>
                                    <p className="text-[14px] text-slate-500 font-medium mt-1">Manage your portfolio, update listings, and track performance.</p>
                                </div>
                                <button onClick={() => window.location.href = "/post-property"} className="bg-ink text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-sm flex items-center gap-2 hover:bg-[#15345a] transition-colors">
                                    <Icon name="add" size={18} /> Add New Property
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="relative w-full md:w-[320px]">
                                            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by title, city or neighborhood..."
                                                value={propertySearch}
                                                onChange={(e) => setPropertySearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-ink transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-slate-100 p-1 rounded-xl mr-2">
                                            <button 
                                                onClick={() => setPropertiesViewMode("GRID")}
                                                className={`p-1.5 rounded-lg transition-all ${propertiesViewMode === "GRID" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                                                title="Grid View"
                                            >
                                                <Icon name="grid_view" size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setPropertiesViewMode("LIST")}
                                                className={`p-1.5 rounded-lg transition-all ${propertiesViewMode === "LIST" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
                                                title="List View"
                                            >
                                                <Icon name="view_list" size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setListingStatusFilter("ALL")}
                                            className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all ${listingStatusFilter === "ALL" ? "bg-ink text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            All ({properties?.length || 0})
                                        </button>
                                        <button
                                            onClick={() => setListingStatusFilter("VERIFIED")}
                                            className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all ${listingStatusFilter === "VERIFIED" ? "bg-ink text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            Active ({stats?.activeListings || 0})
                                        </button>
                                        <button
                                            onClick={() => setListingStatusFilter("PENDING")}
                                            className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all ${listingStatusFilter === "PENDING" ? "bg-ink text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                                        >
                                            Pending ({stats?.pendingVerification || 0})
                                        </button>
                                    </div>
                                </div>

                                <div className={`grid gap-6 p-6 ${propertiesViewMode === "GRID" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                                    {filteredProperties && filteredProperties.length > 0 ? (
                                        filteredProperties.map((prop: Property) => (
                                            <LargePropertyCard
                                                key={prop.id}
                                                id={prop.id}
                                                image={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"}
                                                title={prop.title}
                                                location={`${prop.areaName}, ${prop.city}`}
                                                price={`₹${prop.rent.toLocaleString()}/mo`}
                                                specs={`${prop.bedrooms} BHK • ${prop.bathrooms} Baths • ${prop.area} sq.ft`}
                                                isPremium={prop.isFeatured}
                                                isVerified={prop.isVerified}
                                                onDelete={(id: string) => {
                                                    if (confirm("Are you sure you want to delete this property? This cannot be undone.")) {
                                                        deletePropertyMutation.mutate(id);
                                                    }
                                                }}
                                                onEdit={(id: string) => router.push(`/post-property?edit=${id}`)}
                                                onClick={() => router.push(`/property/${prop.id}`)}
                                            />
                                        ))
                                    ) : (
                                        properties && properties.length > 0 ? (
                                            <div className="col-span-3 text-center py-10 text-slate-500 font-medium">
                                                No properties found matching your selection.
                                            </div>
                                        ) : (
                                            <div className="col-span-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
                                                <div className="w-14 h-14 bg-emerald-50 text-ink rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                                    <Icon name="real_estate_agent" size={28} />
                                                </div>
                                                <h3 className="font-extrabold text-[15px] text-slate-900 mb-1">Hosting Workspace Setup</h3>
                                                <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-6">
                                                    You haven't listed any properties yet. Estimated setup time is 3 minutes.
                                                </p>
                                                <div className="w-full text-left space-y-2 mb-6 max-w-xs mx-auto">
                                                    <div className="flex items-center gap-2 text-[12px] text-green-600 font-semibold">
                                                        <Icon name="check_circle" size={16} /> <span>Verify Phone Contact</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[12px] text-green-600 font-semibold">
                                                        <Icon name="check_circle" size={16} /> <span>Complete Hosting Profile</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[12px] text-slate-400 font-semibold">
                                                        <Icon name="radio_button_unchecked" size={16} /> <span>List Your First Property</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[12px] text-slate-400 font-semibold">
                                                        <Icon name="radio_button_unchecked" size={16} /> <span>Upload Exterior Photos</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push("/post-property")} className="bg-ink text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-sm hover:bg-[#15345a] transition-all">
                                                    List Your First Property
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === LEADS TAB === */}
                    {activeTab === "leads" && (
                        <div className="w-full p-6 md:p-8 space-y-6">
                            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-2">
                                <div>
                                    <h2 className="text-[26px] font-bold text-ink tracking-tight">Lead Management</h2>
                                    <p className="text-[14px] text-slate-500 font-medium mt-1">Review and manage potential tenant inquiries and applications.</p>
                                </div>
                                <button onClick={() => setShowNewLeadModal(true)} className="bg-ink text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-sm flex items-center gap-2 hover:bg-[#15345a] transition-colors">
                                    <Icon name="add" size={18} /> New Lead
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 flex p-4 gap-4 bg-slate-50 overflow-x-auto">
                                    <button
                                        onClick={() => setLeadFilter("ALL")}
                                        className={`px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-colors ${leadFilter === "ALL" ? "bg-white border border-gray-200 text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
                                    >
                                        All Leads ({leads.length})
                                    </button>
                                    <button
                                        onClick={() => setLeadFilter("NEW")}
                                        className={`px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-colors ${leadFilter === "NEW" ? "bg-white border border-gray-200 text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
                                    >
                                        New ({leads.filter((l: any) => l.status === "NEW").length})
                                    </button>
                                    <button
                                        onClick={() => setLeadFilter("CONTACTED")}
                                        className={`px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-colors ${leadFilter === "CONTACTED" ? "bg-white border border-gray-200 text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
                                    >
                                        Contacted ({leads.filter((l: any) => l.status === "CONTACTED").length})
                                    </button>
                                    <button
                                        onClick={() => setLeadFilter("ARCHIVED")}
                                        className={`px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-colors ${leadFilter === "ARCHIVED" ? "bg-white border border-gray-200 text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}
                                    >
                                        Archived ({leads.filter((l: any) => l.status === "ARCHIVED").length})
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {leases && leases.length > 0 ? (
                                        leases.map((lease: any) => (
                                            <div key={lease.id} className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                                
                                                {/* Left Side: Icon & Info */}
                                                <div className="flex items-center gap-4 w-full lg:w-1/3">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                        <Icon name="description" size={24} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-[15px] font-bold text-slate-800 leading-tight mb-1 truncate">{lease.tenantName}</h4>
                                                        <p className="text-[13px] text-slate-500 font-medium truncate">{lease.propertyName}</p>
                                                    </div>
                                                </div>

                                                {/* Middle: Details & Status */}
                                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 w-full lg:w-auto">
                                                    <div>
                                                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Term</div>
                                                        <div className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">{new Date(lease.startDate).toLocaleDateString('en-GB')} - {new Date(lease.endDate).toLocaleDateString('en-GB')}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rent</div>
                                                        <div className="text-[13px] font-extrabold text-ink">₹{(Number(lease.rent) || 0).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Status</div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                                            lease.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                            lease.status === 'PENDING_SIGN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            lease.status === 'EXPIRING' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {lease.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:border-l lg:pl-6 shrink-0">
                                                    <button
                                                        onClick={() => handleDownloadLease(lease)}
                                                        className="bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 w-full sm:w-auto px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <Icon name="download" size={16} /> Download
                                                    </button>
                                                    
                                                    {lease.status === "PENDING_SIGN" && (
                                                        <button
                                                            onClick={() => updateLeaseMutation.mutate({ id: lease.id, status: "ACTIVE" })}
                                                            className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto px-4 py-2 rounded-xl text-[12px] font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                                        >
                                                            <Icon name="edit_document" size={16} /> Sign
                                                        </button>
                                                    )}
                                                    {lease.status === "EXPIRING" && (
                                                        <button
                                                            onClick={() => {
                                                                const nextYear = new Date(lease.endDate);
                                                                nextYear.setFullYear(nextYear.getFullYear() + 1);
                                                                updateLeaseMutation.mutate({ id: lease.id, status: "ACTIVE" });
                                                            }}
                                                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto px-4 py-2 rounded-xl text-[12px] font-bold shadow-sm transition-all active:scale-[0.98]"
                                                        >
                                                            Renew
                                                        </button>
                                                    )}
                                                    {lease.status === "ACTIVE" && (
                                                        <button
                                                            onClick={() => updateLeaseMutation.mutate({ id: lease.id, status: "EXPIRED" })}
                                                            className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 w-full sm:w-auto px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] shadow-sm"
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { if (confirm("Are you sure you want to delete this agreement?")) deleteLeaseMutation.mutate(lease.id); }}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 flex-none"
                                                        title="Delete Agreement"
                                                    >
                                                        <Icon name="delete" size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
                                            <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                                <Icon name="description" size={28} />
                                            </div>
                                            <h3 className="font-extrabold text-[15px] text-slate-900 mb-1">No Rental Agreements</h3>
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                                                You haven't generated any lease agreements yet.
                                            </p>
                                            <button onClick={() => setShowNewLeaseModal(true)} className="bg-ink text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#15345a] transition-all active:scale-[0.98] flex items-center gap-2">
                                                <Icon name="add" size={16} /> Create First Agreement
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Real Pagination Controls */}
                                {leasesTotal > leaseLimit && (
                                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-slate-500 font-medium bg-slate-50/50">
                                        <p>Showing {((leasePage - 1) * leaseLimit) + 1} to {Math.min(leasePage * leaseLimit, leasesTotal)} of {leasesTotal} agreements</p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={leasePage === 1}
                                                onClick={() => setLeasePage((p) => Math.max(p - 1, 1))}
                                                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                            >
                                                <Icon name="chevron_left" size={18} />
                                            </button>
                                            {Array.from({ length: Math.ceil(leasesTotal / leaseLimit) }).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setLeasePage(idx + 1)}
                                                    className={`w-8 h-8 rounded flex items-center justify-center font-bold transition-colors ${leasePage === idx + 1 ? "bg-ink text-white" : "hover:bg-slate-100 text-slate-700 bg-white"}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                            <button
                                                disabled={leasePage >= Math.ceil(leasesTotal / leaseLimit)}
                                                onClick={() => setLeasePage((p) => p + 1)}
                                                className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                            >
                                                <Icon name="chevron_right" size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === ANALYTICS TAB === */}
                    {activeTab === "analytics" && (
                        <div className="w-full p-6 md:p-8 space-y-6">

                            {/* Header & Controls */}
                            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-2">
                                <h2 className="text-[26px] font-bold text-ink tracking-tight">Analytics & Performance</h2>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                        <button
                                            onClick={() => setAnalyticsTimeframe("7")}
                                            className={`px-4 py-1.5 text-[12.5px] font-bold rounded-md transition-all ${analyticsTimeframe === "7" ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                        >
                                            Last 7 days
                                        </button>
                                        <button
                                            onClick={() => setAnalyticsTimeframe("30")}
                                            className={`px-4 py-1.5 text-[12.5px] font-bold rounded-md transition-all ${analyticsTimeframe === "30" ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                        >
                                            Last 30 days
                                        </button>
                                        <button
                                            onClick={() => setAnalyticsTimeframe("90")}
                                            className={`px-4 py-1.5 text-[12.5px] font-bold rounded-md transition-all flex items-center gap-2 ${analyticsTimeframe === "90" ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                        >
                                            Last 90 days <Icon name="calendar_today" size={14} />
                                        </button>
                                    </div>
                                    <button className="bg-ink text-white px-5 py-2 rounded-lg text-[13px] font-bold shadow-sm flex items-center gap-2 hover:bg-[#15345a] transition-colors h-full active:scale-[0.98] transition-all">
                                        <Icon name="download" size={18} /> Export Report
                                    </button>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                            <Icon name="payments" size={22} />
                                        </div>
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[11px] font-bold">Live</span>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL REVENUE (INR)</h4>
                                    <span className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                                </div>

                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                                            <Icon name="bed" size={22} />
                                        </div>
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[11px] font-bold">Active</span>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AVG. OCCUPANCY</h4>
                                    <span className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">{(stats?.avgOccupancy || 0)}%</span>
                                </div>

                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <Icon name="groups" size={22} />
                                        </div>
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[11px] font-bold">Current</span>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">LEADS GENERATED</h4>
                                    <span className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">{stats?.leadsCount || 0}</span>
                                </div>

                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                            <Icon name="visibility" size={22} />
                                        </div>
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[11px] font-bold">Views</span>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PROPERTY VIEWS</h4>
                                    <span className="text-[28px] font-bold text-slate-900 leading-none tracking-tight">{(stats?.totalViews || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Revenue Trends */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-[15px] text-slate-900">Revenue Trends</h3>
                                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Gross earnings over selected period</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-ink"></div> This Month</span>
                                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Last Month</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-[200px] flex items-end justify-between px-2 gap-2 relative">
                                        <div className="absolute inset-0 border-b border-slate-100 top-1/2 -translate-y-1/2"></div>
                                        <div className="flex items-end justify-between w-full h-[180px] z-10 px-4">
                                            {(analyticsData?.revenueTrend || [0, 0, 0, 0]).map((rev: number, idx: number) => {
                                                const maxVal = Math.max(...(analyticsData?.revenueTrend || [1]), 1);
                                                const heightPercent = Math.max(10, Math.round((rev / maxVal) * 100));
                                                return (
                                                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                                        <div className="w-8 rounded-t-lg bg-ink hover:bg-[#134074] transition-all" style={{ height: `${heightPercent}%` }}></div>
                                                        <div className="absolute -top-9 hidden group-hover:flex bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                                            ₹{rev.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-4 px-4">
                                        <span>Week 1</span>
                                        <span>Week 2</span>
                                        <span>Week 3</span>
                                        <span>Week 4</span>
                                    </div>
                                </div>

                                {/* Lead Conversion */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-[15px] text-slate-900">Lead Conversion</h3>
                                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Inquiries vs. Confirmed Bookings</p>
                                        </div>
                                        <button className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all">
                                            All Channels <Icon name="expand_more" size={14} />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-h-[200px] flex items-end justify-between px-6">
                                        {(analyticsData?.leadConversion || []).map((conv: any, idx: number) => {
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-3 flex-grow">
                                                    <div className="w-8 h-[160px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden group">
                                                        <div className="w-full bg-[#10b981] group-hover:bg-[#1d4ed8] transition-colors" style={{ height: `${conv.rate}%` }}></div>
                                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                                            {conv.rate}% ({conv.conversions}/{conv.leads} leads)
                                                        </div>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500">{conv.day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Top Performing Properties Table */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA] flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <h3 className="font-bold text-[14px] text-slate-900">Top Performing Properties</h3>
                                        <div className="relative w-full sm:w-60">
                                            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search performing properties..."
                                                value={analyticsSearch}
                                                onChange={(e) => setAnalyticsSearch(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[11.5px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-ink transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => router.push("/dashboard?tab=listings")} className="text-[12px] font-bold text-ink hover:underline">View All Properties</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">PROPERTY NAME</th>
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">LOCALITY</th>
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">VIEWS</th>
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CONVERSIONS</th>
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CONVERSION RATE</th>
                                                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">REVENUE</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredPerformingProperties.length > 0 ? (
                                                filteredPerformingProperties.map((prop: any) => (
                                                    <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <img src={prop.image} className="w-10 h-10 rounded object-cover border border-slate-100" alt="prop" />
                                                                <span className="text-[13px] font-bold text-slate-900">{prop.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-[13px] text-slate-500 font-medium">{prop.location}</td>
                                                        <td className="py-4 px-6 text-[13px] font-medium text-slate-800">{prop.views.toLocaleString()}</td>
                                                        <td className="py-4 px-6 text-[13px] font-medium text-slate-800">{prop.conversions}</td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                                                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${prop.conversionRate}%` }}></div>
                                                                </div>
                                                                <span className="text-[12px] font-bold text-slate-700">{prop.conversionRate}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-[13px] font-bold text-slate-900">₹{prop.revenue.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">No matching properties found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Banners Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                <div className="md:col-span-2 bg-[#064e3b] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-center text-white relative overflow-hidden shadow-sm">
                                    <div className="relative z-10">
                                        <h3 className="text-[22px] font-bold mb-2">Performance Insight</h3>
                                        <p className="text-[14px] text-emerald-100 leading-relaxed font-medium mb-6 max-w-[450px]">
                                            Your property listings in Gurgaon have seen a 25% surge in inquiries over the last 48 hours. We recommend prioritizing these leads to maximize conversion.
                                        </p>
                                        <button className="bg-white text-[#064e3b] px-6 py-2.5 rounded-lg font-bold text-[13px] hover:bg-emerald-50 transition-colors shadow-sm inline-block w-max active:scale-[0.98] transition-all">Action Leads</button>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col items-center text-center justify-center">
                                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-[#064e3b] mb-4 shadow-sm border border-slate-100">
                                        <Icon name="psychology" size={28} />
                                    </div>
                                    <h4 className="font-bold text-[14px] text-slate-900 mb-2">AI Recommendation</h4>
                                    <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed mb-6">
                                        Users searching for "3BHK" are dropping off at the pricing section. Consider a 5% seasonal discount.
                                    </p>
                                    <button className="text-[#064e3b] font-bold text-[12.5px] hover:underline active:scale-[0.98] transition-all">Apply Recommendation</button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* === PAYMENTS (BILLING & PLANS) TAB === */}
                    {activeTab === "payments" && (
                        <div className="w-full p-6 md:p-8 space-y-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-[28px] font-bold text-ink tracking-tight">Billing & Plans</h2>
                                    <p className="text-[14px] text-slate-500 font-medium mt-1">Manage your subscription, payment methods, and billing history.</p>
                                </div>
                                <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Icon name="event" size={20} className="text-ink" />
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase">Next Billing Date</p>
                                        <p className="text-[14px] font-bold text-ink">October 24, 2023</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Current Plan */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <div className="bg-ink text-white text-[10px] font-bold px-3 py-1 rounded inline-block uppercase tracking-wider mb-4">ACTIVE PLAN</div>
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="text-[24px] font-bold text-slate-900 leading-none">Pro Tier</h3>
                                        <div className="text-right">
                                            <span className="text-[28px] font-bold text-ink leading-none">₹4,999</span>
                                            <span className="text-[13px] text-slate-500 font-medium">/mo</span>
                                        </div>
                                    </div>
                                    <p className="text-[14px] text-slate-500 font-medium mb-8">For growing real estate portfolios</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-[13px] font-bold">
                                            <span className="text-slate-700">Listing Usage</span>
                                            <span className="text-ink">18 / 25 Listings</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-ink h-full rounded-full" style={{ width: '72%' }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                                        <span className="text-[12px] font-bold text-green-600 flex items-center gap-1.5"><Icon name="check_circle" size={16} /> Priority Support</span>
                                        <span className="text-[12px] font-bold text-green-600 flex items-center gap-1.5"><Icon name="check_circle" size={16} /> Advanced Insights</span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">PAYMENT METHOD</h3>
                                            <button className="text-[13px] font-bold text-slate-600 hover:text-ink active:scale-[0.98] transition-all">Edit</button>
                                        </div>

                                        {/* Mock Credit Card */}
                                        <div className="bg-gradient-to-tr from-[#064e3b] to-[#3B82F6] rounded-2xl p-6 text-white shadow-md relative overflow-hidden mb-6">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                                            <div className="flex justify-between items-center mb-8">
                                                <Icon name="contactless" size={28} className="opacity-80" />
                                                <div className="w-12 h-7 bg-white/20 rounded-md backdrop-blur-sm"></div>
                                            </div>
                                            <div className="text-[20px] font-mono tracking-[0.2em] mb-6 opacity-90">
                                                •••• •••• •••• 4242
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">CARD HOLDER</p>
                                                    <p className="text-[14px] font-bold uppercase tracking-widest">ADITYA SHARMA</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 text-right">EXPIRES</p>
                                                    <p className="text-[14px] font-bold tracking-widest">08/26</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                                        <Icon name="lock" size={14} className="text-slate-400" /> Secure encrypted payment
                                    </div>
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div className="pt-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-[24px] font-bold text-slate-900">Choose the right plan for you</h2>
                                    <p className="text-[14px] text-slate-500 font-medium mt-1">All plans include basic maintenance tracking and legal templates.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Free */}
                                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col">
                                        <h3 className="text-[18px] font-bold text-slate-900 mb-2">Free</h3>
                                        <p className="text-[13px] text-slate-500 font-medium mb-6 min-h-[40px]">For individual landlords starting out.</p>
                                        <div className="mb-8">
                                            <span className="text-[36px] font-bold text-slate-900">₹0</span>
                                            <p className="text-[11px] font-bold text-slate-400">Free forever</p>
                                        </div>
                                        <div className="space-y-4 mb-8 flex-1">
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Up to 2 active listings
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Basic Lead CRM
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-400 opacity-60">
                                                <Icon name="close" size={18} className="text-slate-300 shrink-0" /> Premium Insights
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl border border-gray-200 text-slate-700 font-bold text-[14px] hover:bg-slate-50 transition-colors active:scale-[0.98] transition-all">Downgrade</button>
                                    </div>

                                    {/* Pro Tier (Current) */}
                                    <div className="bg-white rounded-3xl border-2 border-ink p-4 sm:p-6 md:p-8 shadow-lg flex flex-col relative transform -translate-y-2">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">MOST POPULAR</div>
                                        <h3 className="text-[18px] font-bold text-slate-900 mb-2">Pro Tier</h3>
                                        <p className="text-[13px] text-slate-500 font-medium mb-6 min-h-[40px]">Scale your portfolio with ease.</p>
                                        <div className="mb-8">
                                            <span className="text-[36px] font-bold text-ink">₹4,999</span>
                                            <p className="text-[11px] font-bold text-slate-500">Per month, billed monthly</p>
                                        </div>
                                        <div className="space-y-4 mb-8 flex-1">
                                            <div className="flex gap-3 text-[13px] font-bold text-slate-900">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Up to 25 active listings
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Advanced CRM & Analytics
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Priority 24/7 Support
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Verified Owner Badge
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl bg-[#8DA5CF] text-white font-bold text-[14px] cursor-not-allowed active:scale-[0.98] transition-all">Current Plan</button>
                                    </div>

                                    {/* Enterprise */}
                                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col">
                                        <h3 className="text-[18px] font-bold text-slate-900 mb-2">Enterprise</h3>
                                        <p className="text-[13px] text-slate-500 font-medium mb-6 min-h-[40px]">For large scale rental agencies.</p>
                                        <div className="mb-8">
                                            <span className="text-[36px] font-bold text-slate-900">Custom</span>
                                            <p className="text-[11px] font-bold text-slate-500">Contact sales for pricing</p>
                                        </div>
                                        <div className="space-y-4 mb-8 flex-1">
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Unlimited active listings
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Dedicated Account Manager
                                            </div>
                                            <div className="flex gap-3 text-[13px] font-medium text-slate-700">
                                                <Icon name="check" size={18} className="text-green-500 shrink-0" /> Custom API Access
                                            </div>
                                        </div>
                                        <button className="w-full py-3 rounded-xl border border-gray-200 text-ink font-bold text-[14px] hover:bg-slate-50 transition-colors active:scale-[0.98] transition-all">Upgrade Now</button>
                                    </div>
                                </div>
                            </div>

                            {/* Billing History */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <h3 className="text-[18px] font-bold text-slate-900">Billing History</h3>
                                    <button className="text-[12px] font-bold text-slate-500 flex items-center gap-1 hover:text-slate-800 active:scale-[0.98] transition-all"><Icon name="filter_list" size={16} /> Filter</button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8FAFC] border-b border-gray-100">
                                        <tr>
                                            <th className="py-3 px-6 text-[12px] font-bold text-slate-500 w-1/4">Date</th>
                                            <th className="py-3 px-6 text-[12px] font-bold text-slate-500 w-1/4">Amount</th>
                                            <th className="py-3 px-6 text-[12px] font-bold text-slate-500 w-1/4">Status</th>
                                            <th className="py-3 px-6 text-[12px] font-bold text-slate-500 w-1/4 text-right">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-[13px] text-slate-700 font-medium">Sep 24, 2023</td>
                                            <td className="py-4 px-6 text-[13px] font-bold text-slate-900">₹4,999.00</td>
                                            <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">PAID</span></td>
                                            <td className="py-4 px-6 text-right"><button className="text-rausch hover:text-[#1D4ED8] active:scale-[0.98] transition-all"><Icon name="download" size={20} /></button></td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-[13px] text-slate-700 font-medium">Aug 24, 2023</td>
                                            <td className="py-4 px-6 text-[13px] font-bold text-slate-900">₹4,999.00</td>
                                            <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">PAID</span></td>
                                            <td className="py-4 px-6 text-right"><button className="text-rausch hover:text-[#1D4ED8] active:scale-[0.98] transition-all"><Icon name="download" size={20} /></button></td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-[13px] text-slate-700 font-medium">Jul 24, 2023</td>
                                            <td className="py-4 px-6 text-[13px] font-bold text-slate-900">₹4,999.00</td>
                                            <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold">PAID</span></td>
                                            <td className="py-4 px-6 text-right"><button className="text-rausch hover:text-[#1D4ED8] active:scale-[0.98] transition-all"><Icon name="download" size={20} /></button></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="p-4 bg-[#F8FAFC] text-center border-t border-gray-100">
                                    <button className="text-[13px] font-bold text-ink hover:underline active:scale-[0.98] transition-all">View older invoices</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PRIVACY & SECURITY TAB === */}
                    {activeTab === "privacy" && (
                        <div className="w-full p-6 md:p-8 space-y-6">
                            <div className="mb-6">
                                <h2 className="text-[28px] font-bold text-ink tracking-tight">Privacy & Security</h2>
                                <p className="text-[14px] text-slate-500 font-medium mt-1">Manage your account security, authentication methods, and data privacy settings.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 2FA Card */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                                <Icon name="shield" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-[16px] font-bold text-slate-900">2FA Authentication</h3>
                                                <p className="text-[11px] font-bold text-green-600 mt-0.5">Currently Enabled</p>
                                            </div>
                                        </div>
                                        {/* Toggle Switch Mock */}
                                        <div className="w-10 h-6 bg-ink rounded-full relative cursor-pointer flex items-center pr-1 justify-end">
                                            <div className="w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Add an extra layer of security to your account by requiring more than just a password to log in.
                                    </p>
                                    <button className="text-ink font-bold text-[13px] flex items-center gap-1 hover:underline active:scale-[0.98] transition-all">
                                        Configure Methods <Icon name="chevron_right" size={16} />
                                    </button>
                                </div>

                                {/* Password Management */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Icon name="key" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-bold text-slate-900">Password Management</h3>
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Last changed: April 12, 2024</p>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Ensure your account is secure by using a strong, unique password that you don't use elsewhere.
                                    </p>
                                    <button className="w-full py-2.5 rounded-xl border border-gray-200 text-ink font-bold text-[13px] hover:bg-slate-50 transition-colors active:scale-[0.98] transition-all">
                                        Change Password
                                    </button>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-[16px] font-bold text-slate-900">Active Sessions</h3>
                                        <p className="text-[13px] text-slate-500 font-medium mt-1">Review devices currently signed into your account.</p>
                                    </div>
                                    <button className="text-red-500 text-[13px] font-bold hover:underline active:scale-[0.98] transition-all">Logout other devices</button>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {/* Current Session */}
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-ink">
                                                <Icon name="laptop_mac" size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[14px] font-bold text-slate-900">MacBook Pro 16"</p>
                                                    <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">CURRENT DEVICE</span>
                                                </div>
                                                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Mumbai, India • Chrome Browser</p>
                                            </div>
                                        </div>
                                        <span className="text-[12px] text-slate-400 font-medium">Active now</span>
                                    </div>

                                    {/* Mobile Session */}
                                    <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                <Icon name="smartphone" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-900">iPhone 15 Pro</p>
                                                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Bangalore, India • iOS App</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-red-500 transition-colors active:scale-[0.98] transition-all"><Icon name="logout" size={20} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Login History */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-[16px] font-bold text-slate-900">Login History</h3>
                                    <p className="text-[13px] text-slate-500 font-medium mt-1">Recent activity from the last 30 days.</p>
                                </div>
                                <table className="w-full text-left text-[13px]">
                                    <thead className="bg-[#F8FAFC] border-b border-gray-100">
                                        <tr>
                                            <th className="py-3 px-6 font-bold text-slate-500 w-1/4">DATE & TIME</th>
                                            <th className="py-3 px-6 font-bold text-slate-500 w-1/4">STATUS</th>
                                            <th className="py-3 px-6 font-bold text-slate-500 w-1/4">IP ADDRESS</th>
                                            <th className="py-3 px-6 font-bold text-slate-500 w-1/4">LOCATION</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium">
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-slate-800">Today, 09:42 AM</td>
                                            <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">SUCCESS</span></td>
                                            <td className="py-4 px-6 text-slate-500 font-mono">192.168.1.104</td>
                                            <td className="py-4 px-6 text-slate-800">Mumbai, IN</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-slate-800">Yesterday, 11:15 PM</td>
                                            <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">SUCCESS</span></td>
                                            <td className="py-4 px-6 text-slate-500 font-mono">103.44.21.12</td>
                                            <td className="py-4 px-6 text-slate-800">Bangalore, IN</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="py-4 px-6 text-slate-800">Oct 24, 02:30 PM</td>
                                            <td className="py-4 px-6"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">FAILED</span></td>
                                            <td className="py-4 px-6 text-slate-500 font-mono">112.56.2.98</td>
                                            <td className="py-4 px-6 text-slate-800">Delhi, IN</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Data Privacy */}
                            <div className="mt-8 pt-6">
                                <h3 className="text-[18px] font-bold text-ink mb-4">Data Privacy</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            <Icon name="download" size={22} className="text-slate-500" />
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800">Download my data</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Get a copy of your personal archives</p>
                                            </div>
                                        </div>
                                        <Icon name="chevron_right" size={20} className="text-slate-400" />
                                    </div>

                                    <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors">
                                        <div className="text-red-500 flex shrink-0">
                                            <Icon name="delete_forever" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-red-700">Delete Account</p>
                                            <p className="text-[11px] text-red-600/80 font-medium">Permanently remove your account and data</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MESSAGES TAB */}
                    {activeTab === "messages" && <MessagesTab />}

                    {/* DOCUMENTS & KYC TAB */}
                    {activeTab === "documents" && <DocumentsTab />}

                    {activeTab === "settings" && (
                        <SettingsTab user={user} role={role} updateUserRole={updateUserRole} showToast={showToast} />
                    )}
                    <OnboardingFlows
                        user={user}
                        onRefresh={() => {
                            queryClient.invalidateQueries({ queryKey: ["user"] });
                            router.refresh();
                        }}
                        showToast={showToast}
                    />
                </div>

                {/* New Lease Modal */}
                {showNewLeaseModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-ink text-white">
                                <div>
                                    <h3 className="text-lg font-bold">New Lease Agreement</h3>
                                    <p className="text-[12px] text-slate-300 font-medium mt-0.5">Draft a new tenancy contract for your property</p>
                                </div>
                                <button onClick={() => setShowNewLeaseModal(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Icon name="close" size={20} /></button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={(e) => { e.preventDefault(); createLeaseMutation.mutate(leaseForm); }}>
                                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenant Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={leaseForm.tenantName}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, tenantName: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. Rahul Verma"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenant Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={leaseForm.tenantEmail}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, tenantEmail: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. rahul.v@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={leaseForm.propertyName}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, propertyName: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. Skyline Heights, 402"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property City</label>
                                            <input
                                                type="text"
                                                required
                                                value={leaseForm.propertyCity}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, propertyCity: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. Mumbai, MH"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaseForm.startDate}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all text-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaseForm.endDate}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all text-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Rent (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                value={leaseForm.rent}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, rent: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. 85000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                            <select
                                                value={leaseForm.status}
                                                onChange={(e) => setLeaseForm({ ...leaseForm, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all text-slate-800 bg-white"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="PENDING_SIGN">Pending Signature</option>
                                                <option value="EXPIRING">Expiring Soon</option>
                                                <option value="EXPIRED">Expired</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewLeaseModal(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLeaseMutation.isPending}
                                        className="px-5 py-2 bg-rausch hover:bg-rausch-dark text-white text-[13px] font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 active:scale-[0.98] transition-all"
                                    >
                                        {createLeaseMutation.isPending ? "Creating..." : "Create Agreement"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* New Lead Modal */}
                {showNewLeadModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-ink text-white">
                                <div>
                                    <h3 className="text-lg font-bold">Add New Lead</h3>
                                    <p className="text-[12px] text-slate-300 font-medium mt-0.5">Record details for a new tenant inquiry or lead</p>
                                </div>
                                <button onClick={() => setShowNewLeadModal(false)} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Icon name="close" size={20} /></button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={(e) => { e.preventDefault(); createLeadMutation.mutate(leadForm); }}>
                                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={leadForm.name}
                                                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. Sneha Patel"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lead Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={leadForm.email}
                                                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. sneha.p@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={leadForm.phone}
                                                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. +91 98765 43210"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Inquiry</label>
                                            <input
                                                type="text"
                                                required
                                                value={leadForm.propertyName}
                                                onChange={(e) => setLeadForm({ ...leadForm, propertyName: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. Cozy 2BHK Vasant Vihar"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rent Amount Offered (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                value={leadForm.rentAmount}
                                                onChange={(e) => setLeadForm({ ...leadForm, rentAmount: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all"
                                                placeholder="e.g. 45000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                            <select
                                                value={leadForm.status}
                                                onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all text-slate-800 bg-white"
                                            >
                                                <option value="NEW">New</option>
                                                <option value="CONTACTED">Contacted</option>
                                                <option value="ARCHIVED">Archived</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Profile</label>
                                            <textarea
                                                rows={3}
                                                value={leadForm.notes}
                                                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] font-medium focus:ring-2 focus:ring-rausch/20 focus:border-rausch outline-none transition-all resize-none"
                                                placeholder="e.g. Single • Doctor • Moving next month"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewLeadModal(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLeadMutation.isPending}
                                        className="px-5 py-2 bg-rausch hover:bg-rausch-dark text-white text-[13px] font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 active:scale-[0.98] transition-all"
                                    >
                                        {createLeadMutation.isPending ? "Adding..." : "Add Lead"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                <OnboardingFlows
                    user={user}
                    onRefresh={() => {
                        queryClient.invalidateQueries({ queryKey: ["user"] });
                        router.refresh();
                    }}
                    showToast={showToast}
                    forceOwnerOnboardingOpen={forceOwnerOnboarding}
                    onCloseOwnerOnboarding={handleCloseOwnerOnboarding}
                />
            </>
        );
    }

    return null;
}

// Subcomponents

const SidebarItem = ({ icon, label, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${isActive
            ? "bg-[#253974] text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
    >
        <Icon name={icon} size={20} className={isActive ? "text-white" : "text-slate-400"} />
        <span>{label}</span>
    </button>
);

const VisitCard = ({ time, title, person, image, onClick }: any) => (
    <div onClick={onClick} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 shadow-sm items-center hover:shadow-md transition-shadow cursor-pointer">
        <img src={image} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" alt="visit" />
        <div className="min-w-0">
            <p className="text-ink font-semibold text-[13px]">{time}</p>
            <p className="text-slate-800 font-medium text-[14px] truncate">{title}</p>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-0.5">
                <Icon name="person_outline" size={14} />
                <span className="truncate">{person}</span>
            </div>
        </div>
    </div>
);

const PropertyMiniCard = ({ id, image, badge, title, price, location, specs }: any) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const favorites: any = queryClient.getQueryData(["user-favorites"]) || [];
    const isFavorited = favorites.some((f: any) => f.propertyId === id || f.property?.id === id);

    const toggleFavoriteMutation = useMutation({
        mutationFn: async () => {
            if (isFavorited) {
                const record = favorites.find((f: any) => f.propertyId === id || f.property?.id === id);
                const targetId = record?.id || id;
                const res = await fetch(`/api/favorites/${targetId}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to remove favorite");
                return { action: "removed" };
            } else {
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ propertyId: id }),
                });
                if (!res.ok) throw new Error("Failed to add favorite");
                return { action: "added" };
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
            showToast(data.action === "added" ? "Added to favorites" : "Removed from favorites", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update favorite", "error");
        }
    });

    return (
        <div
            onClick={() => router.push(`/property/${id}`)}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative"
        >
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-ink shadow-sm z-10 uppercase">
                {badge}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteMutation.mutate();
                }}
                disabled={toggleFavoriteMutation.isPending}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10 shadow-sm"
            >
                <Icon
                    name={isFavorited ? "favorite" : "favorite_border"}
                    size={18}
                    className={isFavorited ? "text-red-500" : "text-slate-400 hover:text-red-500"}
                />
            </button>
            <div className="h-40 overflow-hidden">
                <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="prop" />
            </div>
            <div className="p-4 space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-[15px] truncate pr-2">{title}</h4>
                    <span className="text-ink font-bold text-[14px] shrink-0">{price}</span>
                </div>
                <p className="text-[12.5px] text-slate-500 truncate">{location}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 font-medium border-t border-gray-50 mt-2">
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="bed" size={14} /> {specs.split('•')[0].trim()}</div>
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="shower" size={14} /> {specs.split('•')[1].trim()}</div>
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="square_foot" size={14} /> {specs.split('•')[2].trim()}</div>
                </div>
            </div>
        </div>
    );
};

const LargePropertyCard = ({ id, image, isPremium, isVerified, title, price, location, specs, isNew, readyToMove, onDelete, onEdit }: any) => (
    <div
        onClick={() => window.location.href = `/property/${id}`}
        className="bg-white rounded-xl border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer relative flex flex-col h-full"
    >
        <div className="relative h-[200px] overflow-hidden bg-slate-50 shrink-0">
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {isPremium && (
                    <div className="bg-ink text-white px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase shadow-sm">PREMIUM</div>
                )}
                {isVerified && (
                    <div className="bg-green-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase shadow-sm flex items-center gap-1"><Icon name="check_circle" size={10} /> VERIFIED</div>
                )}
            </div>
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                        className="w-7 h-7 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-600 hover:text-ink transition-colors shadow-sm"
                        title="Edit Property"
                    >
                        <Icon name="edit" size={14} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        className="w-7 h-7 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-600 hover:text-red-600 transition-colors shadow-sm"
                        title="Delete Property"
                    >
                        <Icon name="delete" size={14} />
                    </button>
                )}
            </div>
            <img src={image} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt="prop" />
        </div>

        <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-bold text-[15px] text-slate-800 leading-snug flex-1 pr-2 truncate">{title}</h3>
                <span className="font-bold text-[15px] text-ink shrink-0">₹{price.toLocaleString()}</span>
            </div>
            <p className="text-[12px] text-slate-500 font-semibold flex items-center gap-1 mb-4"><Icon name="location_on" size={14} className="text-slate-400" /> {location}</p>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold mb-4 pb-4 border-b border-slate-100 mt-auto">
                <span className="flex items-center gap-1"><Icon name="bed" size={16} className="text-slate-400" /> {specs.split('•')[0].trim()}</span>
                <span className="flex items-center gap-1"><Icon name="shower" size={16} className="text-slate-400" /> {specs.split('•')[1].trim()}</span>
                <span className="flex items-center gap-1"><Icon name="square_foot" size={16} className="text-slate-400" /> {specs.split('•')[2].trim()}</span>
            </div>

            <div className="flex items-center justify-between">
                {isNew && <span className="bg-orange-50 text-orange-700 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">New Listing</span>}
                {readyToMove && <span className="text-green-600 font-extrabold text-[10px] flex items-center gap-1 uppercase tracking-wider"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Ready</span>}
                {!isNew && !readyToMove && (
                    <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[8px] font-bold border border-white">JD</div>
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[8px] font-bold border border-white">MK</div>
                    </div>
                )}

                <button onClick={() => window.location.href = `/property/${id}`} className="text-ink font-bold text-[11.5px] flex items-center gap-1 hover:underline ml-auto">Details <Icon name="arrow_forward" size={12} /></button>
            </div>
        </div>
    </div>
);

const SearchHistoryItem = ({ title, subtitle }: any) => (
    <div className="bg-white border border-slate-200/50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all duration-150 shadow-sm">
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <Icon name="history" size={14} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-slate-800 truncate">{title}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>
        </div>
    </div>
);

const QuickActionCard = ({ icon, label }: any) => (
    <button className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/40 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.97] shadow-sm select-none">
        <Icon name={icon} size={20} className="text-ink" />
        <span className="text-slate-600 text-[11px] font-bold">{label}</span>
    </button>
);

const MessageItem = ({ avatar, name, snippet, color, isUnread }: any) => (
    <div className="bg-white border border-slate-200/50 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-all duration-150 shadow-sm relative">
        {isUnread && <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm ${color}`}>
            {avatar}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
            <p className={`text-[12.5px] truncate pr-4 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{name}</p>
            <p className={`text-[11.5px] truncate pr-2 ${isUnread ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>{snippet}</p>
        </div>
    </div>
);

const SavedPropertyItem = ({ title, price, image }: any) => (
    <div className="bg-white border border-slate-200/50 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all duration-150 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
            <img src={image} className="w-10 h-8 rounded object-cover shrink-0 border border-slate-100" alt="saved prop" />
            <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-slate-800 truncate">{title}</p>
                <p className="text-[12px] font-bold text-ink mt-0.5">{price}</p>
            </div>
        </div>
        <Icon name="chevron_right" size={16} className="text-slate-400 shrink-0 ml-2" />
    </div>
);

const StatCard = ({ title, value, trend, trendColor }: any) => (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all duration-300">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</h4>
        <div className="flex flex-col gap-1">
            <span className="text-4xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">{value}</span>
            <span className={`text-[12px] font-bold ${trendColor} mt-3`}>{trend}</span>
        </div>
    </div>
);

const ChartBar = ({ month, val1, val2 }: any) => (
    <div className="flex flex-col items-center gap-2.5">
        <div className="w-10 h-[180px] flex items-end justify-center gap-1 group relative">
            <div className="w-3 bg-slate-200 rounded-t-full group-hover:bg-slate-300 transition-colors" style={{ height: `${val1}%` }}></div>
            <div className="w-3 bg-ink rounded-t-full group-hover:bg-[#134074] transition-colors" style={{ height: `${val2}%` }}></div>
            <div className="absolute -top-9 hidden group-hover:flex bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                {val2}% views, {val1}% leads
            </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{month}</span>
    </div>
);

const ManagementCard = ({ icon, label }: any) => (
    <button className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/40 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.97] shadow-sm select-none">
        <Icon name={icon} size={20} className="text-ink" />
        <span className="text-slate-600 text-[11px] font-bold">{label}</span>
    </button>
);

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500">Loading Dashboard...</div>}>
            <DashboardMonolith />
        </Suspense>
    );
}

