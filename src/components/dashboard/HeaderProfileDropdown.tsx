"use client";

import React, { useState, useEffect } from "react";
import Icon from "@/components/shared/Icon";
import Link from "next/link";

export const HeaderProfileDropdown = ({ user, toggleUserMode, logout }: any) => {
  const isOwner = user?.activeWorkspace === "HOSTING";
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ghar_aadhaar_verification");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.verified) setIsAadhaarVerified(true);
        } catch {}
      }
    }
  }, []);

  const displayName = user?.name || "Verified Resident";
  const displayEmail = user?.email || (user?.phone ? `+91 ${user.phone}` : "user@gharfoundation.com");
  const avatarUrl = user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FF385C&color=fff&bold=true`;

  return (
    <div className="relative group cursor-pointer ml-1">
      {/* Avatar Button */}
      <button
        type="button"
        className="w-10 h-10 rounded-full overflow-hidden border border-[#EBEBEB] hover:border-[#222222] transition-all flex items-center justify-center p-0.5 bg-white shadow-sm"
        aria-label="User profile menu"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover rounded-full"
        />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-[120%] w-[320px] bg-white rounded-2xl shadow-airbnbHover border border-[#EBEBEB] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-full transition-all duration-200 origin-top-right z-50 overflow-hidden flex flex-col">
        {/* Top Profile Header */}
        <div className="bg-[#F7F7F7] p-5 border-b border-[#EBEBEB] flex gap-3.5 items-start">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-[#222222] leading-tight truncate">
                {displayName}
              </p>
              {isAadhaarVerified && (
                <span title="Aadhaar KYC Verified">
                  <Icon name="verified" size={16} fill className="text-forest-600 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#717171] font-medium truncate mt-0.5 mb-2">
              {displayEmail}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="bg-white border border-[#EBEBEB] text-[#222222] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Icon name="tune" size={11} className="text-[#FF385C]" />
                {isOwner ? "Owner Mode" : "Tenant Mode"}
              </span>
              {isAadhaarVerified ? (
                <span className="bg-forest-100 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  KYC Verified
                </span>
              ) : (
                <Link
                  href="/documents"
                  className="bg-rausch-100 text-[#FF385C] hover:underline text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  Verify KYC
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Switch Workspace */}
        <div className="p-4 border-b border-[#EBEBEB] bg-white">
          <p className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-2">
            Switch Workspace
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => (!isOwner ? null : toggleUserMode())}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                !isOwner
                  ? "bg-rausch-50/50 border-[#FF385C]/30 text-[#222222]"
                  : "bg-white border-transparent hover:bg-[#F7F7F7] text-[#717171]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !isOwner ? "bg-[#FF385C] text-white" : "bg-[#F7F7F7] text-[#717171]"
                  }`}
                >
                  <Icon name="person" size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#222222]">Tenant View</p>
                  <p className="text-[11px] text-[#717171]">Find &amp; rent rooms</p>
                </div>
              </div>
              {!isOwner && <Icon name="check" size={16} className="text-[#FF385C]" />}
            </button>

            <button
              type="button"
              onClick={() => (isOwner ? null : toggleUserMode())}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border ${
                isOwner
                  ? "bg-rausch-50/50 border-[#FF385C]/30 text-[#222222]"
                  : "bg-white border-transparent hover:bg-[#F7F7F7] text-[#717171]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isOwner ? "bg-[#FF385C] text-white" : "bg-[#F7F7F7] text-[#717171]"
                  }`}
                >
                  <Icon name="home_work" size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#222222]">Owner Portal</p>
                  <p className="text-[11px] text-[#717171]">Manage listings &amp; leases</p>
                </div>
              </div>
              {isOwner && <Icon name="check" size={16} className="text-[#FF385C]" />}
            </button>
          </div>
        </div>

        {/* Menu Links */}
        <div className="p-2 bg-white border-b border-[#EBEBEB] space-y-0.5">
          <Link
            href="/documents"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F7F7F7] text-left transition-colors text-xs font-semibold text-[#222222]"
          >
            <Icon name="verified_user" size={16} className="text-forest-600" />
            <span>Aadhaar KYC &amp; Documents</span>
          </Link>
          <Link
            href="/settings"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F7F7F7] text-left transition-colors text-xs font-semibold text-[#222222]"
          >
            <Icon name="manage_accounts" size={16} className="text-[#717171]" />
            <span>Profile &amp; Account Settings</span>
          </Link>
          <Link
            href="/pricing"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F7F7F7] text-left transition-colors text-xs font-semibold text-[#222222]"
          >
            <Icon name="sell" size={16} className="text-[#717171]" />
            <span>Services &amp; Boosts</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="p-2 bg-white">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-left transition-colors text-xs font-bold text-[#C13515]"
          >
            <Icon name="logout" size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderProfileDropdown;
