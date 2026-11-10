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
import { PaymentsTab } from "@/components/dashboard/PaymentsTab";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

import { OnboardingFlows } from "@/components/dashboard/OnboardingFlows";
import {
    VisitCard,
    PropertyMiniCard,
    LargePropertyCard,
    SearchHistoryItem,
    QuickActionCard,
    MessageItem,
    SavedPropertyItem,
    StatCard,
    ChartBar,
    ManagementCard,
} from "@/components/dashboard/DashboardShared";

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

    // RENTER DASHBOARD
    if (displayRole === "RENTER") {
        return (
            <>
                <div className="w-full flex-1 flex flex-col text-[#222222]">

                    {/* RENTER OVERVIEW TAB */}
                    {activeTab === "dashboard" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5">
                            <div className="w-full flex flex-col xl:flex-row gap-5">
                                {/* LEFT COLUMN */}
                                <div className="flex-1 min-w-0 space-y-5">
                                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#008A05] bg-white/90 border border-[#C8E6C9] px-2.5 py-0.5 rounded-full mb-2">
                                                <Icon name="verified" size={13} fill /> Zero-Brokerage Tenant Workspace
                                            </span>
                                            <h2 className="text-xl sm:text-2xl text-[#222222] font-extrabold tracking-tight">
                                                Welcome back, {user?.name || "Resident"}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-[#717171] mt-1">
                                                You have{" "}
                                                <span className="font-bold text-[#222222]">
                                                    {upcomingTours.length} scheduled {upcomingTours.length === 1 ? "visit" : "visits"}
                                                </span>{" "}
                                                and{" "}
                                                <span className="font-bold text-[#222222]">
                                                    {favorites?.length || 0} saved {favorites?.length === 1 ? "home" : "homes"}
                                                </span>.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/search")}
                                            className="btn-cta-primary text-xs px-5 py-3 shrink-0"
                                        >
                                            <Icon name="search" size={16} />
                                            <span>Explore Homes</span>
                                        </button>
                                    </div>

                                    {/* Upcoming Visits */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-[#222222] text-base">Upcoming Property Visits</h3>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/schedule")}
                                                className="text-[#FF385C] text-xs font-bold hover:underline flex items-center gap-1"
                                            >
                                                <span>Manage Schedule</span>
                                                <Icon name="arrow_forward" size={14} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {upcomingTours.length > 0 ? (
                                                upcomingTours.slice(0, 2).map((tour: any) => (
                                                    <VisitCard
                                                        key={tour.id}
                                                        time={`${new Date(tour.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} · ${tour.time}`}
                                                        title={tour.propertyTitle}
                                                        person={`${tour.partnerRole}: ${tour.partnerName}`}
                                                        image={tour.propertyImage}
                                                        onClick={() => router.push("/schedule")}
                                                    />
                                                ))
                                            ) : (
                                                <div className="col-span-2 bg-white rounded-2xl border border-[#EBEBEB] p-6 text-center">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center mx-auto mb-2.5 text-[#717171]">
                                                        <Icon name="event" size={20} />
                                                    </div>
                                                    <p className="font-bold text-sm text-[#222222]">No upcoming visits scheduled</p>
                                                    <p className="text-xs text-[#717171] mt-1">
                                                        Book a free physical or video visit directly with any homeowner.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recommended Homes */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-[#222222] text-base">Recommended Direct Owner Homes</h3>
                                                <p className="text-xs text-[#717171]">Verified listings across Dehradun, Rishikesh &amp; Nainital</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/search")}
                                                className="bg-white border border-[#EBEBEB] hover:border-[#222222] text-[#222222] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.98]"
                                            >
                                                <Icon name="tune" size={15} /> All Filters
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {recommendationsData?.properties && recommendationsData.properties.length > 0 ? (
                                                recommendationsData.properties.map((prop: any) => (
                                                    <PropertyMiniCard
                                                        key={prop.id}
                                                        id={prop.id}
                                                        image={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"}
                                                        badge={prop.isVerified ? "Verified" : "Direct Owner"}
                                                        title={prop.title}
                                                        price={`₹${Number(prop.rent || 0).toLocaleString("en-IN")}/mo`}
                                                        location={`${prop.areaName}, ${prop.city}`}
                                                        specs={`${prop.bedrooms} BHK • ${prop.bathrooms} Bath • ${prop.area} sqft`}
                                                    />
                                                ))
                                            ) : (
                                                <div className="col-span-full text-center py-10 text-xs font-semibold text-[#717171] bg-white rounded-2xl border border-[#EBEBEB]">
                                                    No recommended properties found right now.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="w-full xl:w-[330px] shrink-0 space-y-5">
                                    {/* KYC & Profile Completion */}
                                    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 space-y-3.5">
                                        {(() => {
                                            const stepsDone = [
                                                Boolean(user?.name),
                                                Boolean(user?.email),
                                                Boolean(user?.phone),
                                                Boolean((user as any)?.aadhaarVerified || (user as any)?.documentsVerified),
                                            ].filter(Boolean).length;
                                            const completionPct = Math.max(25, Math.round((stepsDone / 4) * 100));
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[#717171]">Tenant Trust Score</span>
                                                        <span className="text-sm font-extrabold text-[#008A05] tabular-nums">{completionPct}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#008A05] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        <p className="text-xs text-[#717171] leading-relaxed">
                                            Homeowners in Uttarakhand prefer Aadhaar-KYC verified tenants for instant 11-month agreements.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/documents")}
                                            className="w-full bg-[#222222] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-[0.98]"
                                        >
                                            Complete Aadhaar KYC
                                        </button>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5">
                                        <h3 className="text-[#222222] font-bold text-xs uppercase tracking-wider mb-3">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div onClick={() => router.push("/documents")} className="cursor-pointer"><QuickActionCard icon="description" label="Agreements" /></div>
                                            <div onClick={() => router.push("/payments")} className="cursor-pointer"><QuickActionCard icon="receipt_long" label="Payments" /></div>
                                            <div onClick={() => router.push("/documents")} className="cursor-pointer"><QuickActionCard icon="verified_user" label="Police KYC" /></div>
                                            <div onClick={() => router.push("/messages")} className="cursor-pointer"><QuickActionCard icon="chat_bubble_outline" label="Messages" /></div>
                                        </div>
                                    </div>

                                    {/* Saved Homes */}
                                    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-[#222222] text-sm">Saved Homes ({favorites?.length || 0})</h3>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/favorites")}
                                                className="text-xs font-bold text-[#FF385C] hover:underline"
                                            >
                                                See All
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {favorites && favorites.length > 0 ? (
                                                favorites.slice(0, 3).map((fav: any) => (
                                                    <div key={fav.id} onClick={() => router.push(`/property/${fav.property?.id || fav.propertyId}`)}>
                                                        <SavedPropertyItem
                                                            title={fav.property?.title || "Saved Rental"}
                                                            price={`₹${Number(fav.property?.rent || 0).toLocaleString("en-IN")}/mo`}
                                                            image={fav.property?.images?.[0]?.url || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&auto=format&fit=crop&q=80"}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-4 text-center">
                                                    No shortlisted homes yet. Tap the heart icon on any property to save it here.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Popular Searches */}
                                    <div className="space-y-2.5">
                                        <h3 className="font-bold text-[#717171] text-xs uppercase tracking-wider px-1">Quick Locality Search</h3>
                                        <div className="space-y-2">
                                            <div onClick={() => router.push("/search?city=Rishikesh&q=Tapovan")}>
                                                <SearchHistoryItem title="1 & 2 BHK Flats in Tapovan, Rishikesh" subtitle="Direct Owner Listings · ₹0 Brokerage" />
                                            </div>
                                            <div onClick={() => router.push("/search?city=Dehradun&q=Rajpur Road")}>
                                                <SearchHistoryItem title="Family Floors on Rajpur Road, Dehradun" subtitle="Verified Landlords · Ready to Move" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SAVED HOMES TAB */}
                    {activeTab === "saved" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
                            <div className="hero-mesh-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#EBEBEB] p-4 sm:p-5">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Shortlisted Rentals</span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">
                                        Saved Homes ({favorites?.length || 0})
                                    </h2>
                                    <p className="text-xs sm:text-sm text-[#717171] mt-1">
                                        Select up to 3 shortlisted homes using the checkbox on each card to compare rent, deposit, and specs side-by-side.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    {compareIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCompareModal(true)}
                                            className="btn-cta-dark px-4 py-2.5 text-xs"
                                        >
                                            <Icon name="compare_arrows" size={16} />
                                            <span>Compare Selected ({compareIds.length})</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (favorites && favorites.length > 0) {
                                                setCompareIds(favorites.slice(0, 3).map((f: any) => f.property.id));
                                                setShowCompareModal(true);
                                            } else {
                                                showToast("Save at least 2 properties to compare them", "warning");
                                            }
                                        }}
                                        className="btn-cta-secondary px-4 py-2.5 text-xs"
                                    >
                                        <Icon name="compare_arrows" size={16} className="text-[#FF385C]" />
                                        <span>Compare Top 3</span>
                                    </button>
                                </div>
                            </div>

                            {/* Favorites Grid */}
                            {favorites && favorites.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {favorites.map((fav: any) => (
                                        <div
                                            key={fav.id}
                                            className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#222222] hover:shadow-md transition-all overflow-hidden relative flex flex-col"
                                        >
                                            <div className="relative h-44 bg-[#F7F7F7]">
                                                {fav.property.isVerified && (
                                                    <div className="absolute top-3 left-3 bg-[#008A05] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                                                        <Icon name="verified" size={12} fill /> VERIFIED
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteFavoriteMutation.mutate(fav.id)}
                                                    className="absolute top-3 right-3 w-8 h-8 bg-white/95 text-[#FF385C] rounded-full shadow-sm z-10 flex items-center justify-center hover:scale-105 transition-transform"
                                                    title="Remove from Saved"
                                                >
                                                    <Icon name="favorite" size={17} />
                                                </button>
                                                <img
                                                    src={fav.property.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80"}
                                                    className="w-full h-full object-cover"
                                                    alt={fav.property.title || "Saved property"}
                                                />
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="min-w-0">
                                                            <h4 className="text-base font-bold text-[#222222] truncate">{fav.property.title}</h4>
                                                            <p className="text-xs text-[#717171] font-medium mt-0.5 flex items-center gap-1 truncate">
                                                                <Icon name="location_on" size={13} className="text-[#FF385C] shrink-0" />
                                                                <span className="truncate">{fav.property.areaName}, {fav.property.city}</span>
                                                            </p>
                                                        </div>
                                                        <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#717171] cursor-pointer shrink-0 bg-[#F7F7F7] px-2 py-1 rounded-lg border border-[#EBEBEB]">
                                                            <input
                                                                type="checkbox"
                                                                checked={compareIds.includes(fav.property.id)}
                                                                onChange={() => handleCompareCheckboxChange(fav.property.id)}
                                                                className="w-3.5 h-3.5 rounded accent-[#FF385C] cursor-pointer"
                                                            />
                                                            <span>Compare</span>
                                                        </label>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-[#EBEBEB] flex items-center justify-between">
                                                        <span className="text-lg font-extrabold text-[#222222] tabular-nums">
                                                            ₹{Number(fav.property.rent || 0).toLocaleString("en-IN")}
                                                            <span className="text-xs text-[#717171] font-medium">/mo</span>
                                                        </span>
                                                        <div className="flex items-center gap-2.5 text-xs text-[#717171] font-semibold">
                                                            <span className="flex items-center gap-1"><Icon name="bed" size={14} /> {fav.property.bedrooms} BHK</span>
                                                            <span className="flex items-center gap-1"><Icon name="square_foot" size={14} /> {fav.property.area} sqft</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/property/${fav.property.id}`)}
                                                    className="w-full bg-[#222222] hover:bg-[#FF385C] text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-[0.98]"
                                                >
                                                    View Property Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full bg-white rounded-2xl border border-[#EBEBEB] p-12 text-center shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center mx-auto mb-3">
                                        <Icon name="favorite_border" size={26} />
                                    </div>
                                    <h3 className="font-bold text-base text-[#222222]">Your wishlist is empty</h3>
                                    <p className="text-xs sm:text-sm text-[#717171] max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                                        Tap the heart icon on any verified room set, flat, or cottage to save and compare your favorite options.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/search")}
                                        className="btn-cta-primary text-xs px-6 py-3"
                                    >
                                        <Icon name="search" size={16} />
                                        <span>Browse Verified Homes</span>
                                    </button>
                                </div>
                            )}

                            {/* Sticky Compare Bar */}
                            {compareIds.length > 0 && (
                                <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-[290px] md:right-8 bg-[#222222] text-white rounded-2xl shadow-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 z-40">
                                    <div className="flex gap-3 items-center">
                                        <div className="flex -space-x-2">
                                            {favorites?.filter((f: any) => compareIds.includes(f.property.id)).map((fav: any) => (
                                                <img
                                                    key={fav.id}
                                                    src={fav.property.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=50&q=80"}
                                                    className="w-9 h-9 rounded-lg border-2 border-[#222222] object-cover"
                                                    alt="thumb"
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-white">
                                                {compareIds.length} {compareIds.length === 1 ? "Home" : "Homes"} Selected
                                            </p>
                                            <p className="text-[11px] text-[#B0B0B0] hidden sm:block">Compare monthly rent, deposit, and configuration</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCompareIds([])}
                                            className="text-xs text-[#B0B0B0] font-bold hover:text-white"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCompareModal(true)}
                                            className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                                        >
                                            Compare Side-by-Side
                                        </button>
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

                    {/* PAYMENTS TAB */}
                    {activeTab === "payments" && <PaymentsTab />}

                    {/* SETTINGS TAB */}
                    {activeTab === "settings" && <SettingsTab user={user} role={role} updateUserRole={updateUserRole} showToast={showToast} />}
                </div>

                {/* Compare Modal */}
                {showCompareModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-[#222222] border border-[#EBEBEB]">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-[#EBEBEB] flex justify-between items-center bg-[#222222] text-white">
                                <div>
                                    <h3 className="text-lg font-extrabold">Side-by-Side Home Comparison</h3>
                                    <p className="text-xs text-[#B0B0B0] mt-0.5">Compare rent, locality, and configuration across shortlisted homes</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCompareModal(false)}
                                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <Icon name="close" size={18} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-auto p-5">
                                {compareIds.length === 0 ? (
                                    <div className="text-center py-12 text-[#717171]">
                                        <Icon name="compare_arrows" size={40} className="mx-auto text-[#B0B0B0] mb-3" />
                                        <p className="font-bold text-base text-[#222222]">No properties selected</p>
                                        <p className="text-xs mt-1">Select up to 3 saved properties to compare.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-4 min-w-[680px]">
                                        <div className="space-y-3 font-bold text-[#717171] text-xs pt-[152px]">
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Monthly Rent</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Locality</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Configuration</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Carpet Area</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Furnishing</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Verification</div>
                                            <div className="h-11 flex items-center border-b border-[#EBEBEB]">Homeowner</div>
                                        </div>

                                        {favorites?.filter((f: any) => compareIds.includes(f.property.id)).map((fav: any) => {
                                            const prop = fav.property;
                                            return (
                                                <div key={prop.id} className="space-y-3 border border-[#EBEBEB] rounded-2xl p-3.5 bg-[#F7F7F7]/60">
                                                    <div className="h-[140px] flex flex-col justify-between">
                                                        <img
                                                            src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80"}
                                                            alt={prop.title}
                                                            className="h-24 w-full object-cover rounded-xl"
                                                        />
                                                        <h4 className="font-bold text-[#222222] text-xs truncate mt-2">{prop.title}</h4>
                                                    </div>

                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] font-extrabold text-sm text-[#222222] tabular-nums">
                                                        ₹{Number(prop.rent || 0).toLocaleString("en-IN")}/mo
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] text-xs text-[#717171] truncate">
                                                        {prop.areaName}, {prop.city}
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] text-xs font-semibold text-[#222222]">
                                                        {prop.bedrooms} BHK · {prop.bathrooms} Bath
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] text-xs font-semibold text-[#222222]">
                                                        {prop.area} sqft
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] text-xs text-[#717171]">
                                                        {prop.furnishing || "Semi-Furnished"}
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB]">
                                                        {prop.isVerified ? (
                                                            <span className="bg-[#E8F5E9] text-[#008A05] text-[10px] font-bold px-2 py-0.5 rounded-full">VERIFIED</span>
                                                        ) : (
                                                            <span className="bg-[#EBEBEB] text-[#717171] text-[10px] font-bold px-2 py-0.5 rounded-full">DIRECT OWNER</span>
                                                        )}
                                                    </div>
                                                    <div className="h-11 flex items-center border-b border-[#EBEBEB] text-xs text-[#717171] truncate">
                                                        {prop.owner?.name || "Verified Homeowner"}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCompareModal(false);
                                                            router.push(`/property/${prop.id}`);
                                                        }}
                                                        className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-[0.98]"
                                                    >
                                                        View Home
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {Array.from({ length: Math.max(0, 3 - compareIds.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="border border-dashed border-[#EBEBEB] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-[#717171] h-[510px]">
                                                <Icon name="add" size={22} className="mb-1.5" />
                                                <p className="text-xs font-semibold">Select another saved home to compare</p>
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
                <div className="w-full flex-1 flex flex-col text-[#222222]">

                    {/* === OWNER OVERVIEW TAB === */}
                    {activeTab === "dashboard" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
                            {/* Top Welcome & CTA Bar */}
                            <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#008A05] bg-white/90 border border-[#C8E6C9] px-2.5 py-0.5 rounded-full mb-2">
                                        <Icon name="verified" size={13} fill /> Direct Homeowner Studio
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
                                        Welcome back, {user?.name || "Homeowner"}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-[#717171] mt-0.5">
                                        Manage your Uttarakhand rental properties, tenant inquiries, and digital 11-month agreements.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push("/post-property")}
                                    className="btn-cta-primary px-5 py-3 text-xs sm:text-sm shrink-0"
                                >
                                    <Icon name="add_home" size={18} />
                                    <span>List New Property</span>
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#222222] text-white rounded-2xl p-5 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0B0B0]">Active Listings</span>
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Icon name="home" size={18} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-3xl font-extrabold text-white leading-none tabular-nums block">
                                            {stats?.activeListings || 0}
                                        </span>
                                        <span className="text-xs font-bold text-[#008A05] bg-[#E8F5E9] px-2 py-0.5 rounded-md mt-2 inline-block">
                                            Live on Search
                                        </span>
                                    </div>
                                </div>

                                <StatCard
                                    title="Total Properties"
                                    value={stats?.totalListings?.toString() || "0"}
                                    trend="₹0 Commission Forever"
                                    trendColor="text-[#008A05]"
                                />

                                <StatCard
                                    title="Pending Verification"
                                    value={stats?.pendingVerification || "0"}
                                    trend={stats?.pendingVerification > 0 ? "Under Review" : "All Verified"}
                                    trendColor={stats?.pendingVerification > 0 ? "text-amber-600" : "text-[#717171]"}
                                />

                                <StatCard
                                    title="Total Property Views"
                                    value={(stats?.totalViews || 0).toLocaleString("en-IN")}
                                    trend={`${leads.length} Direct Inquiries`}
                                    trendColor="text-[#FF385C]"
                                />
                            </div>

                            {/* Main Content Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column (Performance Chart) */}
                                <div className="lg:col-span-2 bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-[#222222]">Listing Views &amp; Tenant Inquiries</h3>
                                            <p className="text-xs text-[#717171] mt-0.5">6-month engagement across your properties</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-[#717171]">
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#222222]" /> Views</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#EBEBEB]" /> Inquiries</span>
                                        </div>
                                    </div>

                                    <div className="h-[220px] flex items-end justify-between px-2 pb-4 border-b border-[#EBEBEB]">
                                        <ChartBar month="JAN" val1={40} val2={60} />
                                        <ChartBar month="FEB" val1={50} val2={70} />
                                        <ChartBar month="MAR" val1={80} val2={90} />
                                        <ChartBar month="APR" val1={45} val2={55} />
                                        <ChartBar month="MAY" val1={95} val2={100} />
                                        <ChartBar month="JUN" val1={75} val2={85} />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-[#717171]">
                                        <span>Tip: Listings with 4+ clear room photos get 3x more tenant inquiries.</span>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/analytics")}
                                            className="font-bold text-[#FF385C] hover:underline shrink-0 ml-2"
                                        >
                                            Full Analytics →
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column (Quick Management & Recent Leads) */}
                                <div className="space-y-5">
                                    <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                                        <h3 className="font-bold text-[#222222] text-xs uppercase tracking-wider mb-3">Quick Management</h3>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div onClick={() => router.push("/properties")} className="cursor-pointer"><ManagementCard icon="maps_home_work" label="My Properties" /></div>
                                            <div onClick={() => router.push("/leads")} className="cursor-pointer"><ManagementCard icon="group" label="Leads & Leases" /></div>
                                            <div onClick={() => router.push("/documents")} className="cursor-pointer"><ManagementCard icon="verified_user" label="Police KYC" /></div>
                                            <div onClick={() => router.push("/payments")} className="cursor-pointer"><ManagementCard icon="receipt_long" label="Billing & Plans" /></div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-[#222222] text-sm">Recent Tenant Leads ({leads.length})</h3>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/leads")}
                                                className="text-xs font-bold text-[#FF385C] hover:underline"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        {leads.length > 0 ? (
                                            <div className="space-y-2">
                                                {leads.slice(0, 3).map((lead: any) => (
                                                    <div
                                                        key={lead.id}
                                                        onClick={() => router.push("/leads")}
                                                        className="p-3 rounded-xl bg-[#F7F7F7] hover:bg-[#EBEBEB]/60 border border-[#EBEBEB] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-[#222222] truncate">{lead.name}</p>
                                                            <p className="text-[11px] text-[#717171] truncate">{lead.propertyName}</p>
                                                        </div>
                                                        <span className="text-xs font-extrabold text-[#008A05] shrink-0 tabular-nums">
                                                            ₹{Number(lead.rentAmount || 0).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-4 text-center">
                                                New tenant inquiries from your listings will appear here.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === LISTINGS TAB === */}
                    {activeTab === "listings" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
                            <div className="hero-mesh-bg flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 rounded-2xl border border-[#EBEBEB] p-4 sm:p-5">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Portfolio Manager</span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">My Properties</h2>
                                    <p className="text-xs sm:text-sm text-[#717171] mt-1">Manage your rental listings, update rent or photos, and track verification status.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push("/post-property")}
                                    className="btn-cta-primary px-5 py-3 text-xs sm:text-sm shrink-0"
                                >
                                    <Icon name="add_home" size={18} /> Add New Property
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-[#EBEBEB] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                                    <div className="relative w-full md:w-[320px]">
                                        <Icon name="search" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                                        <input
                                            type="text"
                                            placeholder="Search by title, city or locality..."
                                            value={propertySearch}
                                            onChange={(e) => setPropertySearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl text-xs sm:text-sm font-medium text-[#222222] placeholder:text-[#717171] focus:outline-none focus:bg-white focus:border-[#222222] transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center bg-[#F7F7F7] border border-[#EBEBEB] p-1 rounded-xl mr-1">
                                            <button
                                                type="button"
                                                onClick={() => setPropertiesViewMode("GRID")}
                                                className={`p-1.5 rounded-lg transition-all ${propertiesViewMode === "GRID" ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"}`}
                                                title="Grid View"
                                            >
                                                <Icon name="grid_view" size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPropertiesViewMode("LIST")}
                                                className={`p-1.5 rounded-lg transition-all ${propertiesViewMode === "LIST" ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"}`}
                                                title="List View"
                                            >
                                                <Icon name="view_list" size={17} />
                                            </button>
                                        </div>
                                        {[
                                            { id: "ALL", label: `All (${properties?.length || 0})` },
                                            { id: "VERIFIED", label: `Verified (${stats?.activeListings || 0})` },
                                            { id: "PENDING", label: `Pending (${stats?.pendingVerification || 0})` },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setListingStatusFilter(tab.id as any)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                    listingStatusFilter === tab.id
                                                        ? "bg-[#222222] text-white"
                                                        : "bg-[#F7F7F7] text-[#717171] hover:text-[#222222] border border-[#EBEBEB]"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={`grid gap-5 p-4 sm:p-6 ${propertiesViewMode === "GRID" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                                    {filteredProperties && filteredProperties.length > 0 ? (
                                        filteredProperties.map((prop: Property) => (
                                            <LargePropertyCard
                                                key={prop.id}
                                                id={prop.id}
                                                image={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"}
                                                title={prop.title}
                                                location={`${prop.areaName}, ${prop.city}`}
                                                price={`₹${Number(prop.rent || 0).toLocaleString("en-IN")}/mo`}
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
                                    ) : properties && properties.length > 0 ? (
                                        <div className="col-span-full text-center py-12 text-xs font-semibold text-[#717171]">
                                            No properties match your current filter.
                                        </div>
                                    ) : (
                                        <div className="col-span-full w-full bg-[#F7F7F7] border border-dashed border-[#EBEBEB] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-white text-[#FF385C] rounded-2xl flex items-center justify-center mb-3 border border-[#EBEBEB]">
                                                <Icon name="add_home" size={24} />
                                            </div>
                                            <h3 className="font-bold text-base text-[#222222]">List your first property</h3>
                                            <p className="text-xs text-[#717171] leading-relaxed max-w-md mx-auto mt-1 mb-5">
                                                Post your room set, flat, or independent floor in 2 minutes and connect directly with verified tenants.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/post-property")}
                                                className="btn-cta-primary px-5 py-2.5 text-xs"
                                            >
                                                <Icon name="add_home" size={16} />
                                                <span>Post Property Free</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === LEADS & LEASES TAB === */}
                    {activeTab === "leads" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
                            <div className="hero-mesh-bg flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 rounded-2xl border border-[#EBEBEB] p-4 sm:p-5">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Tenant CRM &amp; Contracts</span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Leads &amp; Lease Agreements</h2>
                                    <p className="text-xs sm:text-sm text-[#717171] mt-1">Track prospective tenant inquiries and generate digital 11-month rental agreements.</p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewLeaseModal(true)}
                                        className="btn-cta-secondary px-4 py-2.5 text-xs"
                                    >
                                        <Icon name="description" size={16} /> New Lease
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewLeadModal(true)}
                                        className="btn-cta-primary px-4 py-2.5 text-xs"
                                    >
                                        <Icon name="add" size={16} /> Add Lead
                                    </button>
                                </div>
                            </div>

                            {/* Leads Box */}
                            <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
                                <div className="border-b border-[#EBEBEB] flex p-3.5 gap-2 bg-[#F7F7F7] overflow-x-auto no-scrollbar">
                                    {[
                                        { id: "ALL", label: `All Leads (${leads.length})` },
                                        { id: "NEW", label: `New (${leads.filter((l: any) => l.status === "NEW").length})` },
                                        { id: "CONTACTED", label: `Contacted (${leads.filter((l: any) => l.status === "CONTACTED").length})` },
                                        { id: "ARCHIVED", label: `Archived (${leads.filter((l: any) => l.status === "ARCHIVED").length})` },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setLeadFilter(tab.id as any)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                leadFilter === tab.id
                                                    ? "bg-[#222222] text-white shadow-sm"
                                                    : "bg-white border border-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4 sm:p-5 flex flex-col gap-3">
                                    {leads.filter((l: any) => leadFilter === "ALL" ? true : l.status === leadFilter).length > 0 ? (
                                        leads
                                            .filter((l: any) => leadFilter === "ALL" ? true : l.status === leadFilter)
                                            .map((lead: any) => (
                                                <div key={lead.id} className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#222222] p-4 transition-all flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                                    <div className="flex items-center gap-3.5 w-full lg:w-1/3">
                                                        <div className="w-10 h-10 rounded-full bg-[#FFF0F3] text-[#FF385C] flex items-center justify-center shrink-0 font-bold text-sm">
                                                            {(lead.name || "L").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-[#222222] truncate">{lead.name}</h4>
                                                            <p className="text-xs text-[#717171] truncate">{lead.propertyName}</p>
                                                            {lead.notes && <p className="text-[11px] text-[#717171] truncate mt-0.5">{lead.notes}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#F7F7F7] p-3 rounded-xl border border-[#EBEBEB] w-full lg:w-auto">
                                                        <div>
                                                            <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Contact</div>
                                                            <div className="text-xs font-bold text-[#222222] mt-0.5">{lead.phone || lead.email}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Offered Rent</div>
                                                            <div className="text-xs font-extrabold text-[#008A05] tabular-nums mt-0.5">₹{(Number(lead.rentAmount) || 0).toLocaleString("en-IN")}/mo</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Status</div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                                                                lead.status === "NEW" ? "bg-[#E8F5E9] text-[#008A05]" :
                                                                lead.status === "CONTACTED" ? "bg-[#222222] text-white" :
                                                                "bg-[#EBEBEB] text-[#717171]"
                                                            }`}>
                                                                {lead.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
                                                        {lead.status === "NEW" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLeadMutation.mutate({ id: lead.id, status: "CONTACTED" })}
                                                                className="bg-[#008A05] text-white hover:bg-[#006e04] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                                                            >
                                                                Mark Contacted
                                                            </button>
                                                        )}
                                                        {lead.status !== "ARCHIVED" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLeadMutation.mutate({ id: lead.id, status: "ARCHIVED" })}
                                                                className="bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] hover:bg-[#EBEBEB] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                                                            >
                                                                Archive
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => { if (confirm("Delete this lead?")) deleteLeadMutation.mutate(lead.id); }}
                                                            className="text-[#717171] hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                            title="Delete Lead"
                                                        >
                                                            <Icon name="delete" size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="w-full bg-[#F7F7F7] border border-dashed border-[#EBEBEB] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                            <div className="w-11 h-11 bg-white text-[#717171] rounded-xl flex items-center justify-center mb-2.5 border border-[#EBEBEB]">
                                                <Icon name="group" size={22} />
                                            </div>
                                            <h3 className="font-bold text-sm text-[#222222]">No tenant leads in this view</h3>
                                            <p className="text-xs text-[#717171] max-w-md mx-auto mt-1 mb-4">
                                                Record prospective tenant details or wait for direct inquiries from your listings.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewLeadModal(true)}
                                                className="btn-cta-dark px-4 py-2 text-xs"
                                            >
                                                <Icon name="add" size={15} /> Add Lead Manually
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lease Agreements Section */}
                            <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden p-5 sm:p-6 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-[#222222]">11-Month Rental &amp; Lease Agreements</h3>
                                        <p className="text-xs text-[#717171]">Generate, sign, and download printable tenancy contracts.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewLeaseModal(true)}
                                        className="bg-[#222222] hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto active:scale-[0.98]"
                                    >
                                        <Icon name="add" size={16} /> Draft Agreement
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {leases && leases.length > 0 ? (
                                        leases.map((lease: any) => (
                                            <div key={lease.id} className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#222222] p-4 transition-all flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                                <div className="flex items-center gap-3.5 w-full lg:w-1/3">
                                                    <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#008A05] flex items-center justify-center shrink-0">
                                                        <Icon name="description" size={22} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-[#222222] truncate">{lease.tenantName}</h4>
                                                        <p className="text-xs text-[#717171] truncate">{lease.propertyName}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#F7F7F7] p-3 rounded-xl border border-[#EBEBEB] w-full lg:w-auto">
                                                    <div>
                                                        <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Duration</div>
                                                        <div className="text-xs font-semibold text-[#222222] whitespace-nowrap mt-0.5">
                                                            {new Date(lease.startDate).toLocaleDateString("en-IN")} – {new Date(lease.endDate).toLocaleDateString("en-IN")}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Monthly Rent</div>
                                                        <div className="text-xs font-extrabold text-[#222222] tabular-nums mt-0.5">₹{(Number(lease.rent) || 0).toLocaleString("en-IN")}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-[#717171] font-bold uppercase tracking-wider">Status</div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                                                            lease.status === "ACTIVE" ? "bg-[#E8F5E9] text-[#008A05]" :
                                                            lease.status === "PENDING_SIGN" ? "bg-amber-50 text-amber-700" :
                                                            "bg-[#EBEBEB] text-[#717171]"
                                                        }`}>
                                                            {lease.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadLease(lease)}
                                                        className="bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#EBEBEB] text-[#222222] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
                                                    >
                                                        <Icon name="download" size={15} /> Download
                                                    </button>

                                                    {lease.status === "PENDING_SIGN" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateLeaseMutation.mutate({ id: lease.id, status: "ACTIVE" })}
                                                            className="bg-[#008A05] text-white hover:bg-[#006e04] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
                                                        >
                                                            <Icon name="edit_document" size={15} /> Activate
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (confirm("Are you sure you want to delete this agreement?")) deleteLeaseMutation.mutate(lease.id); }}
                                                        className="text-[#717171] hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                        title="Delete Agreement"
                                                    >
                                                        <Icon name="delete" size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full bg-[#F7F7F7] border border-dashed border-[#EBEBEB] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                            <div className="w-11 h-11 bg-white text-[#717171] rounded-xl flex items-center justify-center mb-2.5 border border-[#EBEBEB]">
                                                <Icon name="description" size={22} />
                                            </div>
                                            <h3 className="font-bold text-sm text-[#222222]">No digital lease agreements yet</h3>
                                            <p className="text-xs text-[#717171] max-w-md mx-auto mt-1 mb-4">
                                                Draft a standardized 11-month Uttarakhand tenancy agreement in seconds.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewLeaseModal(true)}
                                                className="btn-cta-primary px-4 py-2 text-xs"
                                            >
                                                <Icon name="add" size={15} /> Create First Agreement
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === ANALYTICS TAB === */}
                    {activeTab === "analytics" && (
                        <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
                            {/* Header & Controls */}
                            <div className="hero-mesh-bg flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 rounded-2xl border border-[#EBEBEB] p-4 sm:p-5">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Host Insights</span>
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Analytics &amp; Performance</h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="flex items-center bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-1">
                                        {([
                                            { id: "7", label: "7 Days" },
                                            { id: "30", label: "30 Days" },
                                            { id: "90", label: "90 Days" },
                                        ] as const).map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setAnalyticsTimeframe(t.id)}
                                                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    analyticsTimeframe === t.id
                                                        ? "bg-[#222222] text-white shadow-sm"
                                                        : "text-[#717171] hover:text-[#222222]"
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Monthly Rent Value"
                                    value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`}
                                    trend="Active Portfolio"
                                    trendColor="text-[#008A05]"
                                />
                                <StatCard
                                    title="Avg. Occupancy"
                                    value={`${stats?.avgOccupancy || 0}%`}
                                    trend="Across Verified Units"
                                    trendColor="text-[#222222]"
                                />
                                <StatCard
                                    title="Tenant Leads"
                                    value={`${stats?.leadsCount || leads.length || 0}`}
                                    trend="Direct Inquiries"
                                    trendColor="text-[#FF385C]"
                                />
                                <StatCard
                                    title="Property Views"
                                    value={(stats?.totalViews || 0).toLocaleString("en-IN")}
                                    trend="Organic Search"
                                    trendColor="text-[#008A05]"
                                />
                            </div>

                            {/* Top Performing Properties Table */}
                            <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-[#EBEBEB] flex justify-between items-center flex-col sm:flex-row gap-3">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <h3 className="font-bold text-sm sm:text-base text-[#222222]">Property Performance Breakdown</h3>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]" />
                                        <input
                                            type="text"
                                            placeholder="Filter properties..."
                                            value={analyticsSearch}
                                            onChange={(e) => setAnalyticsSearch(e.target.value)}
                                            className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-[#222222] placeholder-[#717171] focus:outline-none focus:bg-white focus:border-[#222222]"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-[#EBEBEB] bg-[#F7F7F7]">
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Property</th>
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Locality</th>
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Views</th>
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Inquiries</th>
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Conversion</th>
                                                <th className="py-3.5 px-5 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Monthly Rent</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EBEBEB]">
                                            {filteredPerformingProperties.length > 0 ? (
                                                filteredPerformingProperties.map((prop: any) => (
                                                    <tr key={prop.id} className="hover:bg-[#F7F7F7]/60 transition-colors">
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <img src={prop.image} className="w-10 h-10 rounded-lg object-cover border border-[#EBEBEB]" alt="prop" />
                                                                <span className="text-xs font-bold text-[#222222]">{prop.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-5 text-xs text-[#717171] font-medium">{prop.location}</td>
                                                        <td className="py-3.5 px-5 text-xs font-bold text-[#222222] tabular-nums">{prop.views.toLocaleString("en-IN")}</td>
                                                        <td className="py-3.5 px-5 text-xs font-bold text-[#222222] tabular-nums">{prop.conversions}</td>
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-20 bg-[#F7F7F7] border border-[#EBEBEB] h-2 rounded-full overflow-hidden flex">
                                                                    <div className="bg-[#008A05] h-full rounded-full" style={{ width: `${prop.conversionRate}%` }} />
                                                                </div>
                                                                <span className="text-xs font-bold text-[#222222] tabular-nums">{prop.conversionRate}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-5 text-xs font-extrabold text-[#222222] tabular-nums">₹{Number(prop.revenue || 0).toLocaleString("en-IN")}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="py-10 text-center text-[#717171] text-xs font-semibold">
                                                        No properties match your filter.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PAYMENTS (BILLING & PLANS) TAB === */}
                    {activeTab === "payments" && <PaymentsTab />}

                    {/* === TOUR SCHEDULE TAB === */}
                    {activeTab === "schedule" && <TourScheduleTab />}

                    {/* === MESSAGES TAB === */}
                    {activeTab === "messages" && <MessagesTab />}

                    {/* === DOCUMENTS & KYC TAB === */}
                    {activeTab === "documents" && <DocumentsTab />}

                    {/* === SETTINGS / PRIVACY TABS === */}
                    {(activeTab === "settings" || activeTab === "privacy") && (
                        <SettingsTab user={user} role={role} updateUserRole={updateUserRole} showToast={showToast} />
                    )}
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

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500">Loading Dashboard...</div>}>
            <DashboardMonolith />
        </Suspense>
    );
}

