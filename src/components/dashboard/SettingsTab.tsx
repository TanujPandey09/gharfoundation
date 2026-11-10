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
        let finalUrl = base64;
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalUrl = uploadData.url;
            setImage(finalUrl);
          }
        }
        await updateProfile({ image: finalUrl });
        showToast("Profile picture uploaded to ImageKit & saved!", "success");
      } catch {
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
      // Re-fetch genuine verification status from backend
      try {
        const res = await fetch("/api/verification/status");
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data);
        }
      } catch {
        // Non-blocking
      }
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
    <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5 text-[#222222]">
      {/* Unified Header Banner (1320px width, identical to all other dashboard sections) */}
      <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">
            Account Preferences
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#222222] tracking-tight mt-0.5">
            Account &amp; Profile Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#717171] mt-1">
            Manage your personal identity, contact details, profile photo, and Uttarakhand KYC badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/documents" className="btn-cta-secondary px-4 py-2.5 text-xs">
            <Icon name="verified_user" size={16} className="text-[#008A05]" fill />
            <span>KYC &amp; Documents</span>
          </Link>
        </div>
      </div>

      {/* Balanced 12-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT 4 COLUMNS: Avatar + Aadhaar KYC + Verification Checklist */}
        <div className="lg:col-span-4 space-y-5">
          {/* Avatar & Identity Card */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 sm:p-6 shadow-sm flex flex-col items-center text-center">
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
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#008A05] border-2 border-white rounded-full flex items-center justify-center">
                  <Icon name="check" size={12} className="text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="photo_camera" size={20} className="text-white" />
                <span className="text-[10px] text-white font-bold mt-0.5">Upload</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <h3 className="text-base font-extrabold text-[#222222] mt-3">
              {name || "Verified Resident"}
            </h3>
            <p className="text-xs text-[#717171] mt-0.5">{email || "No email linked"}</p>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222]">
                {role === "OWNER" ? "Property Owner" : "Verified Renter"}
              </span>
              {aadhaarVerified && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#008A05] flex items-center gap-1">
                  <Icon name="verified" size={12} fill /> Aadhaar KYC
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-2.5 px-4 rounded-xl border border-[#EBEBEB] hover:border-[#222222] bg-[#F7F7F7] hover:bg-white text-xs font-bold text-[#222222] transition-all flex items-center justify-center gap-1.5"
            >
              <Icon name="photo_camera" size={15} className="text-[#FF385C]" />
              <span>{profileVerified ? "Update Profile Photo" : "Upload Profile Photo"}</span>
            </button>
          </div>

          {/* Aadhaar KYC Status Card */}
          <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-white shadow-sm space-y-3.5">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  aadhaarVerified ? "bg-[#E8F5E9] text-[#008A05]" : "bg-[#FFF0F3] text-[#FF385C]"
                }`}
              >
                <Icon name={aadhaarVerified ? "verified_user" : "security"} size={20} fill={aadhaarVerified} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-[#222222]">Identity &amp; Aadhaar KYC</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      aadhaarVerified
                        ? "bg-[#E8F5E9] text-[#008A05]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {aadhaarVerified ? "Verified" : "Pending Review"}
                  </span>
                </div>
                <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                  {aadhaarVerified
                    ? "Your identity screening is verified across all rental applications and leases."
                    : "Submit your government ID proof for tenant screening & Uttarakhand Police verification records."}
                </p>
              </div>
            </div>

            {aadhaarVerified ? (
              <Link
                href="/documents"
                className="btn-cta-secondary w-full py-2.5 text-xs justify-center"
              >
                Manage KYC Documents
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="btn-cta-primary w-full py-2.5 text-xs justify-center"
              >
                <Icon name="verified_user" size={15} />
                <span>Verify Aadhaar Now</span>
              </button>
            )}
          </div>

          {/* Profile Verification Checklist Card */}
          {verificationStatus && !isLoadingStatus && (
            <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-white shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#717171] flex items-center gap-1.5">
                <Icon name="shield" size={15} className="text-[#FF385C]" />
                <span>Verification Checklist</span>
              </h3>
              <div className="space-y-2">
                {verificationStatus.checks.map((check) => (
                  <div
                    key={check.id}
                    className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={check.verified ? "check_circle" : "schedule"}
                        size={16}
                        fill={check.verified}
                        className={check.verified ? "text-[#008A05]" : "text-[#FF385C]"}
                      />
                      <span className="text-xs font-bold text-[#222222]">{check.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        check.verified
                          ? "bg-[#E8F5E9] text-[#008A05]"
                          : "bg-[#FFF0F3] text-[#FF385C]"
                      }`}
                    >
                      {check.verified ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 8 COLUMNS: Profile & Contact Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-5">
          {/* Personal Details Card */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#222222] border-b border-[#EBEBEB] pb-3 flex items-center gap-2">
              <Icon name="person" size={19} className="text-[#FF385C]" />
              <span>Personal Identity &amp; Role</span>
            </h3>

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
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-2.5 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#222222] transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  Primary Workspace Mode
                </label>
                <select
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#222222] outline-none focus:bg-white focus:border-[#222222] appearance-none cursor-pointer transition-all pr-8"
                  value={role}
                  onChange={(e) => updateUserRole(e.target.value as any)}
                >
                  <option value="RENTER">Renter / Tenant Workspace</option>
                  <option value="OWNER">Property Owner / Host Studio</option>
                </select>
                <Icon
                  name="expand_more"
                  size={18}
                  className="absolute right-3 top-[36px] text-[#717171] pointer-events-none"
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
                className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-2.5 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#222222] resize-none transition-all placeholder:text-[#B0B0B0]"
              />
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#222222] border-b border-[#EBEBEB] pb-3 flex items-center gap-2">
              <Icon name="alternate_email" size={19} className="text-[#FF385C]" />
              <span>Contact &amp; Login Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  Email Address{" "}
                  {emailVerified && (
                    <span className="ml-1 text-[#008A05] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9]">
                      Verified
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={email}
                  placeholder="your.email@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-2.5 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#222222] transition-all"
                />
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
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-2.5 text-sm font-medium text-[#222222] outline-none focus:bg-white focus:border-[#222222] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#EBEBEB] rounded-2xl p-4 sm:p-5 shadow-sm">
            <span className="text-xs text-[#717171] font-semibold flex items-center gap-1.5">
              <Icon name="lock" size={15} className="text-[#008A05]" />
              <span>All personal details are 256-bit encrypted</span>
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="btn-cta-secondary px-5 py-2.5 text-xs"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-cta-primary px-6 py-2.5 text-xs disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Aadhaar Modal */}
      <AadhaarVerificationModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onSuccess={async () => {
          setAadhaarVerified(true);
          try {
            const res = await fetch("/api/verification/status");
            if (res.ok) {
              const data = await res.json();
              setVerificationStatus(data);
              setAadhaarVerified(!!data.aadhaarVerified || !!data.maskedAadhaar);
            }
          } catch {
            // fallback
          }
        }}
      />
    </div>
  );
};

export default SettingsTab;
