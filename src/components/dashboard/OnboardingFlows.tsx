"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/shared/Icon";

export const OnboardingFlows = ({
  user,
  onRefresh,
  showToast,
  forceOwnerOnboardingOpen = false,
  onCloseOwnerOnboarding,
}: any) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Renter State
  const [preferredCity, setPreferredCity] = useState("Dehradun");
  const [preferredArea, setPreferredArea] = useState("Rajpur Road");
  const [budgetMax, setBudgetMax] = useState("15000");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["APARTMENT"]);

  // Owner State
  const [ownerType, setOwnerType] = useState("PRIVATE_OWNER");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState("Dehradun");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyRent, setPropertyRent] = useState("");

  useEffect(() => {
    if (forceOwnerOnboardingOpen) {
      setStep(1);
      setDismissed(false);
    }
  }, [forceOwnerOnboardingOpen]);

  if (!user || dismissed) return null;

  const isOwnerFlow =
    forceOwnerOnboardingOpen ||
    (user.role === "OWNER" &&
      user.onboardingStatus !== "COMPLETED" &&
      user.onboardingStatus !== "VERIFIED");

  const isRenterFlow =
    !isOwnerFlow &&
    user.role === "RENTER" &&
    user.onboardingStatus !== "COMPLETED";

  if (!isRenterFlow && !isOwnerFlow) return null;

  const handleClose = () => {
    setDismissed(true);
    if (onCloseOwnerOnboarding) onCloseOwnerOnboarding();
  };

  const handlePropertyTypeToggle = (type: string) => {
    if (propertyTypes.includes(type)) {
      if (propertyTypes.length > 1) {
        setPropertyTypes(propertyTypes.filter((t) => t !== type));
      }
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const handleSubmitRenter = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "RENTER",
          preferredCity,
          preferredArea,
          budgetMax,
          propertyTypes,
        }),
      });
      if (res.ok) {
        showToast("Preferences saved! Welcome to Ghar Foundation.", "success");
        setDismissed(true);
        onRefresh();
      } else {
        showToast("Failed to save preferences.", "error");
      }
    } catch {
      showToast("Error saving preferences.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOwner = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "OWNER",
          ownerType,
          businessName,
          phone,
          city,
          companyName,
          licenseNumber,
          propertyTitle,
          propertyRent,
        }),
      });
      if (res.ok) {
        showToast("Host workspace activated!", "success");
        setDismissed(true);
        if (onCloseOwnerOnboarding) onCloseOwnerOnboarding();
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to complete onboarding.", "error");
      }
    } catch {
      showToast("Error submitting onboarding.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* ================================================================= */}
      {/* RENTER ONBOARDING MODAL — COMPACT & ZERO DESKTOP SCROLL           */}
      {/* ================================================================= */}
      {isRenterFlow && (
        <div className="bg-white rounded-2xl w-full max-w-lg border border-[#EBEBEB] shadow-2xl overflow-hidden text-[#222222]">
          {/* Header */}
          <div className="hero-mesh-bg px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF385C] text-white flex items-center justify-center shadow-sm">
                <Icon name="home" size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF385C]">
                  Step {step} of 2 · Quick Setup
                </span>
                <h3 className="text-base font-extrabold text-[#222222]">
                  Personalize Your Rental Feed
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white border border-[#EBEBEB] text-[#717171] hover:text-[#222222] flex items-center justify-center transition-colors"
              title="Skip for now"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Preferred City
                    </label>
                    <select
                      value={preferredCity}
                      onChange={(e) => setPreferredCity(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    >
                      {["Dehradun", "Rishikesh", "Nainital", "Mussoorie", "Haridwar", "Haldwani"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Preferred Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajpur Road, Tapovan"
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-medium text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Max Monthly Rent Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs font-bold text-[#717171] hover:text-[#222222] px-3 py-2"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-cta-primary px-6 py-2.5 text-xs"
                  >
                    <span>Next Step</span>
                    <Icon name="arrow_forward" size={15} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-2">
                    Select Property Types
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "APARTMENT", label: "Flat / Apartment", icon: "apartment" },
                      { id: "VILLA", label: "Independent House", icon: "home" },
                      { id: "STUDIO", label: "1 / 2 Room Set", icon: "meeting_room" },
                      { id: "SHARED", label: "PG / Co-Living", icon: "groups" },
                    ].map((type) => {
                      const active = propertyTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handlePropertyTypeToggle(type.id)}
                          className={`p-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            active
                              ? "border-[#FF385C] bg-[#FFF0F3] text-[#FF385C]"
                              : "border-[#EBEBEB] bg-[#F7F7F7] text-[#717171] hover:text-[#222222]"
                          }`}
                        >
                          <Icon name={type.icon} size={16} />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="btn-cta-secondary flex-1 py-2.5 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitRenter}
                    disabled={loading}
                    className="btn-cta-primary flex-1 py-2.5 text-xs disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Finish Setup"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* OWNER ONBOARDING MODAL — COMPACT & ZERO DESKTOP SCROLL            */}
      {/* ================================================================= */}
      {isOwnerFlow && (
        <div className="bg-white rounded-2xl w-full max-w-xl border border-[#EBEBEB] shadow-2xl overflow-hidden text-[#222222]">
          {/* Header */}
          <div className="hero-mesh-bg px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#222222] text-white flex items-center justify-center">
                <Icon name="real_estate_agent" size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF385C]">
                  Step {step} of 3 · Host Setup
                </span>
                <h3 className="text-base font-extrabold text-[#222222]">
                  Activate Homeowner Studio
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white border border-[#EBEBEB] text-[#717171] hover:text-[#222222] flex items-center justify-center transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Direct Contact / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-medium text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Primary City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    >
                      {["Dehradun", "Rishikesh", "Nainital", "Mussoorie", "Haridwar", "Haldwani"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Host Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "PRIVATE_OWNER", label: "Direct Owner" },
                      { id: "BROKER", label: "Property Manager" },
                      { id: "AGENCY", label: "Homestay / PG" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOwnerType(t.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          ownerType === t.id
                            ? "border-[#FF385C] bg-[#FFF0F3] text-[#FF385C]"
                            : "border-[#EBEBEB] bg-[#F7F7F7] text-[#717171] hover:text-[#222222]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rawat Residency / Direct Owner"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-medium text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-cta-primary px-6 py-2.5 text-xs"
                  >
                    <span>Continue</span>
                    <Icon name="arrow_forward" size={15} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-[#222222] text-sm">Initialize First Property Draft (Optional)</h4>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Enter a title and monthly rent to create a starter draft, or skip to go straight to your dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Listing Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunny 2BHK on Rajpur Road"
                      value={propertyTitle}
                      onChange={(e) => setPropertyTitle(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-medium text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#717171] uppercase tracking-wider block mb-1.5">
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 16000"
                      value={propertyRent}
                      onChange={(e) => setPropertyRent(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#222222] focus:outline-none focus:bg-white focus:border-[#222222]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-cta-secondary flex-1 py-2.5 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-cta-primary flex-1 py-2.5 text-xs"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center py-3">
                  <div className="w-12 h-12 bg-[#E8F5E9] text-[#008A05] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#C8E6C9]">
                    <Icon name="verified" size={26} fill />
                  </div>
                  <h4 className="font-extrabold text-[#222222] text-base">Ready to Launch Host Studio!</h4>
                  <p className="text-xs text-[#717171] leading-relaxed max-w-sm mx-auto mt-1">
                    Your Direct Owner profile is ready. Manage properties, view tenant leads, and generate 11-month Uttarakhand rental agreements.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="btn-cta-secondary flex-1 py-2.5 text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitOwner}
                    disabled={loading}
                    className="btn-cta-primary flex-1 py-2.5 text-xs disabled:opacity-50"
                  >
                    {loading ? "Activating..." : "Launch Host Workspace"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default OnboardingFlows;
