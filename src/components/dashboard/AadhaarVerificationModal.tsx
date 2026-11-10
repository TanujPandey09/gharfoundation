"use client";

import React, { useState } from "react";
import Icon from "@/components/shared/Icon";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";

interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AadhaarVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: AadhaarVerificationModalProps) {
  const { showToast } = useToast();
  const { user, updateProfile } = useAuth();

  const [step, setStep] = useState<"DETAILS" | "UPLOAD" | "SUCCESS">("DETAILS");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [consentGiven, setConsentGiven] = useState(true);

  // Upload States
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    setAadhaarNumber(parts ? parts.join(" ") : raw);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = aadhaarNumber.replace(/\s/g, "");
    if (cleanNumber.length !== 12) {
      showToast("Please enter a valid 12-digit Aadhaar number", "error");
      return;
    }
    if (!fullName.trim()) {
      showToast("Please enter your full name as printed on your ID card", "error");
      return;
    }
    if (!consentGiven) {
      showToast("Consent is required to verify identity for rental screening", "warning");
      return;
    }
    setStep("UPLOAD");
  };

  const handleFileChange = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size must be under 5MB", "warning");
      return;
    }
    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitDocuments = async () => {
    if (!frontFile || !backFile) {
      showToast("Please upload both front and back photos of your ID card", "warning");
      return;
    }

    setIsVerifying(true);
    const formData = new FormData();
    formData.append("documentType", "AADHAAR_CARD");
    formData.append("frontImage", frontFile);
    formData.append("backImage", backFile);

    try {
      const uploadRes = await fetch("/api/verification/documents", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload document photos");
      }

      const masked = `XXXX XXXX ${aadhaarNumber.replace(/\s/g, "").slice(-4)}`;
      const aadhaarRes = await fetch("/api/verification/aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          fullName,
          method: "UPLOAD",
          maskedAadhaar: masked,
        }),
      });

      if (aadhaarRes.ok) {
        setStep("SUCCESS");
        showToast("Identity document submitted for verification!", "success");
        if (updateProfile) {
          await updateProfile({ onboardingStatus: "COMPLETED" });
        }
        if (onSuccess) onSuccess();
      } else {
        showToast("Verification submission failed. Please try again.", "error");
      }
    } catch {
      showToast("Failed to submit verification. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#EBEBEB] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between hero-mesh-bg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#008A05] text-white flex items-center justify-center font-bold">
              <Icon name="verified_user" size={18} fill />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#222222]">
                Identity &amp; Aadhaar Verification
              </h3>
              <p className="text-[11px] text-[#717171]">Uttarakhand Police Form &amp; Tenancy Compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#717171] hover:text-[#222222] hover:bg-white/60 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* STEP 1: Aadhaar Details */}
          {step === "DETAILS" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  12-Digit Aadhaar / Government ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5412 8901 2345"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    className="w-full h-12 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 text-base font-semibold tracking-wider text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all placeholder:text-[#B0B0B0]"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Icon name="credit_card" size={20} className="text-[#717171]" />
                  </div>
                </div>
                <p className="text-[11px] text-[#717171] mt-1">
                  Stored securely as masked digits (e.g. XXXX XXXX 2345) under DPDP privacy regulations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  Full Name (as printed on your ID card)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 text-sm font-medium text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all"
                />
              </div>

              {/* Security & Consent Box */}
              <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-start gap-3">
                <Icon name="lock" size={18} className="text-[#008A05] shrink-0 mt-0.5" />
                <div className="text-[12px] text-[#222222] leading-relaxed">
                  <p className="font-bold text-[#008A05]">256-Bit SSL Encrypted Verification</p>
                  <p className="text-[#717171] text-[11px] mt-0.5">
                    Your details are verified solely for rental screening and to auto-fill the official Uttarakhand Police Tenant Verification Form. Full numbers are never published.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#FF385C] accent-[#FF385C] cursor-pointer"
                />
                <span className="text-[11px] text-[#717171] leading-tight">
                  I voluntarily provide my identity details to Ghar Foundation for rental tenant screening and Uttarakhand Police verification records.
                </span>
              </label>

              <button
                type="submit"
                className="btn-cta-primary w-full h-12 text-sm justify-center gap-1.5 mt-2"
              >
                <span>Continue to Document Upload</span>
                <Icon name="arrow_forward" size={17} />
              </button>
            </form>
          )}

          {/* STEP 2: Upload Documents */}
          {step === "UPLOAD" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-[#222222]">Upload ID Proof Photos</h4>
                <p className="text-xs text-[#717171] mt-0.5">
                  Upload clear photos of front and back (Masked Aadhaar, Voter ID, or DL).
                </p>
              </div>

              {/* Front Photo */}
              <div>
                <span className="block text-xs font-bold text-[#222222] mb-1.5">
                  Front Side (with photo &amp; name)
                </span>
                {frontPreview ? (
                  <div className="relative h-28 rounded-xl border border-[#C8E6C9] overflow-hidden bg-[#E8F5E9]/40 p-2 flex items-center justify-between">
                    <img src={frontPreview} alt="Front preview" className="h-full object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#EBEBEB] hover:border-[#222222] bg-[#F7F7F7] rounded-xl cursor-pointer transition-colors p-4 text-center">
                    <Icon name="add_photo_alternate" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-semibold text-[#222222]">Click to upload Front photo</span>
                    <span className="text-[10px] text-[#717171]">PNG, JPEG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("front", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Photo */}
              <div>
                <span className="block text-xs font-bold text-[#222222] mb-1.5">
                  Back Side (with address)
                </span>
                {backPreview ? (
                  <div className="relative h-28 rounded-xl border border-[#C8E6C9] overflow-hidden bg-[#E8F5E9]/40 p-2 flex items-center justify-between">
                    <img src={backPreview} alt="Back preview" className="h-full object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setBackFile(null); setBackPreview(null); }}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#EBEBEB] hover:border-[#222222] bg-[#F7F7F7] rounded-xl cursor-pointer transition-colors p-4 text-center">
                    <Icon name="add_photo_alternate" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-semibold text-[#222222]">Click to upload Back photo</span>
                    <span className="text-[10px] text-[#717171]">PNG, JPEG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("back", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("DETAILS")}
                  className="btn-cta-secondary flex-1 h-12 text-xs justify-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDocuments}
                  disabled={isVerifying || !frontFile || !backFile}
                  className="btn-cta-primary flex-1 h-12 text-xs justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifying ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#008A05] flex items-center justify-center mx-auto shadow-sm">
                <Icon name="task_alt" size={36} fill />
              </div>

              <div>
                <span className="inline-block bg-[#E8F5E9] text-[#008A05] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  Documents Submitted
                </span>
                <h4 className="font-display font-extrabold text-2xl text-[#222222]">
                  Verification Under Review
                </h4>
                <p className="text-xs text-[#717171] mt-1 max-w-sm mx-auto leading-relaxed">
                  Your identity documents have been submitted to the Ghar Foundation verification team. Your details are now linked to pre-fill your official Uttarakhand Police Verification Form.
                </p>
              </div>

              {/* Badge Preview */}
              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#222222]">{fullName}</p>
                  <p className="text-[11px] font-mono text-[#717171] mt-0.5">
                    Masked ID: {`XXXX XXXX ${aadhaarNumber.replace(/\s/g, "").slice(-4)}` || "XXXX XXXX 0000"}
                  </p>
                  <p className="text-[10px] text-[#008A05] font-semibold mt-1 flex items-center gap-1">
                    <Icon name="schedule" size={12} />
                    Submitted on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center text-[#008A05] shadow-sm">
                  <Icon name="verified_user" size={22} />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-cta-dark w-full h-12 text-sm justify-center"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
