"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Icon from "@/components/shared/Icon";
import { HeaderProfileDropdown } from "@/components/dashboard/HeaderProfileDropdown";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SidebarItem = ({ icon, label, isActive, href, onClick, badge }: any) => {
    const baseClass = `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150 active:scale-[0.98] ${
        isActive
            ? "bg-rausch-100 text-[#FF385C]"
            : "text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]"
    }`;

    const iconClass = isActive ? "text-[#FF385C]" : "text-[#717171]";

    const content = (
        <>
            <div className="flex items-center space-x-3">
                <Icon name={icon} size={18} className={iconClass} />
                <span>{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-700 px-2 py-0.2 rounded-full">
                    {badge}
                </span>
            )}
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={baseClass}>
                {content}
            </button>
        );
    }
    return (
        <Link href={href} className={baseClass}>
            {content}
        </Link>
    );
};

export default function UserAppLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, toggleUserMode } = useAuth();
    const pathname = usePathname();
    const displayRole = user?.role === "ADMIN" ? "ADMIN" : (user?.activeWorkspace === "HOSTING" ? "OWNER" : "RENTER");
    const [verificationPending, setVerificationPending] = useState<boolean | null>(null);

    useEffect(() => {
        const checkVerification = async () => {
            if (!user) return;
            try {
                const res = await fetch("/api/verification/status");
                if (res.ok) {
                    const data = await res.json();
                    setVerificationPending(!data.allVerified);
                }
            } catch {
                setVerificationPending(!!user.email && !!user.image ? false : true);
            }
        };
        checkVerification();
    }, [user]);

    const showPrompt = verificationPending === true && pathname !== "/settings";

    return (
        <div className="flex h-screen bg-[#F7F7F7] font-sans overflow-hidden antialiased text-[#222222]">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:flex w-[260px] bg-white border-r border-[#EBEBEB] flex-col justify-between shrink-0 h-full">
                <div>
                    <div className="p-6 pb-4">
                        <Link href="/" className="flex items-baseline gap-1 group">
                            <h1 className="font-display font-extrabold text-2xl text-[#222222] tracking-tight group-hover:text-[#FF385C] transition-colors cursor-pointer">
                                Ghar<span className="text-[#FF385C]">.</span>
                            </h1>
                        </Link>
                        <p className="text-[11px] text-[#717171] font-bold uppercase tracking-wider mt-1">
                            {displayRole === "RENTER" ? "Tenant Workspace" : "Owner Workspace"}
                        </p>
                    </div>

                    <nav className="space-y-1 px-3">
                        {displayRole === "RENTER" ? (
                            <>
                                <SidebarItem icon="grid_view" label="Overview" href="/dashboard" isActive={pathname === "/dashboard"} />
                                <SidebarItem icon="verified_user" label="Documents & KYC" href="/documents" isActive={pathname === "/documents"} badge="Aadhaar" />
                                <SidebarItem icon="favorite_border" label="Saved Homes" href="/favorites" isActive={pathname === "/favorites"} />
                                <SidebarItem icon="event" label="Tour Schedule" href="/schedule" isActive={pathname === "/schedule"} />
                                <SidebarItem icon="chat_bubble_outline" label="Messages" href="/messages" isActive={pathname === "/messages"} />
                                <SidebarItem icon="receipt_long" label="Payments" href="/payments" isActive={pathname === "/payments"} />
                            </>
                        ) : (
                            <>
                                <SidebarItem icon="grid_view" label="Overview" href="/dashboard" isActive={pathname === "/dashboard"} />
                                <SidebarItem icon="maps_home_work" label="My Properties" href="/properties" isActive={pathname === "/properties"} />
                                <SidebarItem icon="verified_user" label="Police KYC & Leases" href="/documents" isActive={pathname === "/documents"} badge="Verified" />
                                <SidebarItem icon="chat_bubble_outline" label="Messages" href="/messages" isActive={pathname === "/messages"} />
                                <SidebarItem icon="receipt_long" label="Payments" href="/payments" isActive={pathname === "/payments"} />
                            </>
                        )}
                    </nav>

                    {displayRole !== "RENTER" && (
                        <div className="mt-6 px-3">
                            <p className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-2 px-3">Management</p>
                            <nav className="space-y-1">
                                <SidebarItem icon="group" label="Leads & Tenants" href="/leads" isActive={pathname === "/leads"} />
                                <SidebarItem icon="insights" label="Analytics" href="/analytics" isActive={pathname === "/analytics"} />
                            </nav>
                        </div>
                    )}
                </div>

                <div className="px-3 pb-6 space-y-1">
                    <SidebarItem icon="settings" label="Settings" href="/settings" isActive={pathname === "/settings"} />
                    <SidebarItem icon="logout" label="Log Out" onClick={() => logout()} />
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* TOP HEADER */}
                <header className="h-[64px] bg-white border-b border-[#EBEBEB] flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
                    <div className="w-[340px] relative hidden md:block">
                        <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                        <input
                            type="text"
                            placeholder="Search properties, agreements, or tenants..."
                            className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-full py-2 pl-10 pr-4 text-[13px] font-medium text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#FF385C] focus:bg-white transition-all"
                        />
                    </div>
                    <div className="md:hidden flex items-center">
                        <Link href="/">
                            <span className="font-display font-extrabold text-xl text-[#222222]">
                                Ghar<span className="text-[#FF385C]">.</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <Link
                            href="/documents"
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-forest-700 bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-full hover:bg-forest-100 transition-colors"
                        >
                            <Icon name="verified_user" size={14} fill className="text-forest-600" />
                            <span>Aadhaar KYC</span>
                        </Link>
                        <NotificationBell />
                        <HeaderProfileDropdown user={user} toggleUserMode={toggleUserMode} logout={logout} />
                    </div>
                </header>

                {/* PAGE SCROLLABLE CONTAINER */}
                <div className="flex-1 overflow-y-auto bg-[#F7F7F7]/60">
                    {/* Verification Prompt Banner */}
                    {showPrompt && (
                        <div className="max-w-5xl mx-auto p-4 sm:p-6">
                            <div className="bg-rausch-50 border border-rausch-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#FF385C] flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon name="error_outline" size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-[#222222]">Complete Your Profile</h3>
                                        <p className="text-xs text-[#717171] mt-1">
                                            Verify your email and add a profile picture to unlock messaging, bookings, and the trusted resident badge.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/settings"
                                    className="px-5 py-2.5 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                                >
                                    Complete Now
                                </Link>
                            </div>
                        </div>
                    )}

                    {children}
                </div>

                {/* MOBILE BOTTOM NAV — AIRBNB STYLE */}
                <div className="md:hidden border-t border-[#EBEBEB] bg-white flex justify-around px-2 py-2 shrink-0 z-20 pb-[env(safe-area-inset-bottom)]">
                    <Link href="/dashboard" className={`flex flex-col items-center gap-0.5 py-1 px-2 ${pathname === "/dashboard" ? "text-[#FF385C] font-bold" : "text-[#717171]"}`}>
                        <Icon name="grid_view" size={20} />
                        <span className="text-[10px]">Overview</span>
                    </Link>
                    <Link href={displayRole === "RENTER" ? "/favorites" : "/properties"} className={`flex flex-col items-center gap-0.5 py-1 px-2 ${pathname === "/properties" || pathname === "/favorites" ? "text-[#FF385C] font-bold" : "text-[#717171]"}`}>
                        <Icon name={displayRole === "RENTER" ? "favorite_border" : "domain"} size={20} />
                        <span className="text-[10px]">{displayRole === "RENTER" ? "Saved" : "Listings"}</span>
                    </Link>
                    <Link href="/documents" className={`flex flex-col items-center gap-0.5 py-1 px-2 ${pathname === "/documents" ? "text-[#FF385C] font-bold" : "text-[#717171]"}`}>
                        <Icon name="verified_user" size={20} />
                        <span className="text-[10px]">KYC &amp; Docs</span>
                    </Link>
                    <Link href="/messages" className={`flex flex-col items-center gap-0.5 py-1 px-2 ${pathname === "/messages" ? "text-[#FF385C] font-bold" : "text-[#717171]"}`}>
                        <Icon name="chat_bubble_outline" size={20} />
                        <span className="text-[10px]">Inbox</span>
                    </Link>
                    <Link href="/settings" className={`flex flex-col items-center gap-0.5 py-1 px-2 ${pathname === "/settings" ? "text-[#FF385C] font-bold" : "text-[#717171]"}`}>
                        <Icon name="person_outline" size={20} />
                        <span className="text-[10px]">Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
