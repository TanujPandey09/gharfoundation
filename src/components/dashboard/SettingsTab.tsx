"use client";

import React, { useState, useEffect, useRef } from "react";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import AadhaarVerificationModal from "./AadhaarVerificationModal";

interface VerificationStatus {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
    role: string;
  };
  checks: Array<{
    id: string;
    label: string;
    verified: boolean;
  }>;
  allVerified: boolean;
  onboardingStatus: string;
  maskedAadhaar: string | null;
}

export const SettingsTab = ({ showToast }: any) => {
  const { user, updateUserRole, updateProfile } = useAuth();
  const role = user?.role || "RENTER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data + verification status from backend
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setImage(user.image || "");
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/verification/status");
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data);
          setAadhaarVerified(!!data.aadhaarVerified);
          if (data.user.name) setName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.image) setImage(data.user.image);
        }
      } catch {
        // Fallback to localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("ghar_aadhaar_verification");
          if (stored) {
            try {
              if (JSON.parse(stored).verified) setAadhaarVerified(true);
            } catch {}
          }
        }
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Profile image must be under 5MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      try {
        await updateProfile({ image: base64 });
        showToast("Profile picture updated successfully!", "success");
      } catch (err: any) {
        showToast("Failed to update avatar photo", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, email, phone, image });
      showToast("Profile settings saved successfully!", "success");
      setVerificationStatus((prev) => prev ? { ...prev, allVerified: true } : null);
    } catch (err: any) {
      showToast(err.message || "Failed to save settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setImage(user.image || "");
    }
    showToast("Changes discarded", "info");
  };

  const avatarDisplay =
    image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Resident")}&background=FF385C&color=fff&bold=true`;

  const emailVerified = verificationStatus?.checks.find((c) => c.id === "email")?.verified || false;
  const profileVerified = verificationStatus?.checks.find((c) => c.id === "profile")?.verified || false;

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#222222] tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-[#717171] mt-1">
          Manage your personal identity, contact email, profile picture, and verified badges.
        </p>
      </div>

      {/* Verification Status Banner */}
      {verificationStatus && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[#EBEBEB] bg-white shadow-sm">
          <h3 className="text-base font-bold text-[#222222] border-b border-[#EBEBEB] pb-3 flex items-center gap-2 mb-4">
            <Icon name="shield" size={20} className="text-[#FF385C]" />
            <span>Profile Verification Status</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {verificationStatus.checks.map((check) => (
              <div
                key={check.id}
                className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  check.verified ? "bg-forest-100 text-forest-700" : "bg-rausch-100 text-[#FF385C]"
                }`}>
                  <Icon name={check.verified ? "check_circle" : "pending"} size={16} fill={check.verified} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                    {check.label}
                  </p>
                  <p className="text-[10px] text-[#717171]">
                    {check.verified ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>
            ))}
            {!verificationStatus.allVerified && (
              <button
                onClick={() => {
                  if (!profileVerified) fileInputRef.current?.click();
                  if (!emailVerified) showToast("Verify your email address in your inbox to complete this step.", "info");
                }}
                className="px-4 py-2 text-xs font-bold text-[#FF385C] border border-[#FF385C] rounded-xl hover:bg-[#FFF0F2] transition-colors"
              >
                Complete Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Aadhaar KYC Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#EBEBEB] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            aadhaarVerified ? "bg-forest-100 text-forest-700" : "bg-rausch-100 text-[#FF385C]"
          }`}>
            <Icon name={aadhaarVerified ? "verified_user" : "security"} size={22} fill={aadhaarVerified} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-[#222222]">Aadhaar KYC Status</p>
              {aadhaarVerified ? (
                <span className="bg-forest-100 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Verified
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#717171] mt-0.5">
              {aadhaarVerified
                ? "Your UIDAI identity verification is active on your profile."
                : "Verify your Aadhaar to get the trusted green badge on all rental applications."}
            </p>
          </div>
        </div>

        {aadhaarVerified ? (
          <Link
            href="/documents"
            className="px-4 py-2 text-xs font-semibold text-[#222222] border border-[#EBEBEB] rounded-xl hover:bg-[#F7F7F7] transition-colors"
          >
            Manage Documents
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsAadhaarModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#FF385C] hover:bg-[#E00B41] rounded-xl shadow-sm transition-transform active:scale-95"
          >
            Verify Aadhaar
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 sm:p-8 shadow-sm">
          <h3 className="text-base font-bold text-[#222222] border-b border-[#EBEBEB] pb-3 flex items-center gap-2 mb-6">
            <Icon name="person" size={20} className="text-[#FF385C]" />
            <span>Public Profile &amp; Picture</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar Uploader */}
            <div className="shrink-0 flex flex-col items-center gap-2.5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#EBEBEB] relative group cursor-pointer shadow-sm hover:border-[#FF385C] transition-all"
                title={profileVerified ? "Profile picture verified" : "Click to upload profile photo"}
              >
                <img
                  src={avatarDisplay}
                  alt={name || "Avatar"}
                  className="w-full h-full object-cover"
                />
                {profileVerified && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-forest-700 border-2 border-white rounded-full flex items-center justify-center">
                    <Icon name="check" size={12} className="text-white" />
                  </div>
                )}
                {!profileVerified && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="photo_camera" size={22} className="text-white" />
                    <span className="text-[10px] text-white font-bold mt-1">Upload</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs font-bold ${profileVerified ? "text-forest-700" : "text-[#FF385C]"} ${profileVerified ? "hover:text-forest-600" : "hover:underline"}`}
              >
                {profileVerified ? "Photo Verified" : "Change Photo"}
              </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    placeholder="Enter your full name"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#FF385C] transition-all"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                    Account Mode
                  </label>
                  <select
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#FF385C] appearance-none cursor-pointer transition-all pr-8"
                    value={role}
                    onChange={(e) => updateUserRole(e.target.value as any)}
                  >
                    <option value="RENTER">Renter / Tenant</option>
                    <option value="OWNER">Property Owner / Landlord</option>
                  </select>
                  <Icon
                    name="expand_more"
                    size={18}
                    className="absolute right-3 top-[38px] text-[#717171] pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  About You / Rental Bio
                </label>
                <textarea
                  rows={3}
                  defaultValue="Family / Working professional seeking verified rentals in Dehradun and Uttarakhand foothills."
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#FF385C] resize-none transition-all placeholder:text-[#B0B0B0]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#222222] border-b border-[#EBEBEB] pb-3 flex items-center gap-2">
            <Icon name="alternate_email" size={20} className="text-[#FF385C]" />
            <span>Contact &amp; Login Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                Email Address {emailVerified ? <span className="ml-1 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100">Verified</span> : null}
              </label>
              <input
                type="email"
                value={email}
                placeholder="your.email@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#FF385C] transition-all"
              />
              {!emailVerified && (
                <p className="text-[11px] text-[#717171] mt-1">
                  Verify your email to unlock messaging and booking features.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                Phone Number (WhatsApp Active)
              </label>
              <input
                type="text"
                value={phone}
                placeholder="+91 98765 43210"
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#FF385C] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-xs text-[#717171] font-semibold">
            All details encrypted and safe
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="bg-white border border-[#EBEBEB] text-[#222222] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#F7F7F7] transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#FF385C] hover:bg-[#E00B41] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Aadhaar Modal */}
      <AadhaarVerificationModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onSuccess={() => {
          setAadhaarVerified(true);
        }}
      />
    </div>
  );
};

export default SettingsTab;
