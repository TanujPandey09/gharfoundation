"use client";

import React, { useState, useId } from "react";
import Icon from "@/components/shared/Icon";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";
import {
  validateAadhaarVerhoeff,
  validateVoterId,
  validateDrivingLicense,
  formatAadhaarInput,
  maskAadhaar,
  compressIdImage,
} from "@/lib/validations/id-verification";

interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type DocumentType = "AADHAAR_CARD" | "VOTER_ID" | "DRIVING_LICENSE" | "PASSPORT";

export default function AadhaarVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: AadhaarVerificationModalProps) {
  const frontInputId = useId();
  const backInputId = useId();
  const { showToast } = useToast();
  const { user, updateProfile } = useAuth();

  const [step, setStep] = useState<"DETAILS" | "UPLOAD" | "SUCCESS">("DETAILS");
  const [docType, setDocType] = useState<DocumentType>("AADHAAR_CARD");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [consentGiven, setConsentGiven] = useState(true);

  // Upload States
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time Aadhaar validation
  const cleanDigits = idNumber.replace(/\D/g, "");
  const isAadhaar = docType === "AADHAAR_CARD";
  const aadhaarCheck = isAadhaar && cleanDigits.length === 12
    ? validateAadhaarVerhoeff(cleanDigits)
    : null;

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (docType === "AADHAAR_CARD") {
      setIdNumber(formatAadhaarInput(val));
    } else {
      setIdNumber(val.toUpperCase());
    }
  };

  const handleDocTypeChange = (type: DocumentType) => {
    setDocType(type);
    setIdNumber("");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 3) {
      showToast("Please enter your legal name as printed on your ID card", "error");
      return;
    }

    if (docType === "AADHAAR_CARD") {
      const check = validateAadhaarVerhoeff(cleanDigits);
      if (!check.valid) {
        showToast(check.error || "Please enter a valid 12-digit Aadhaar number", "error");
        return;
      }
    } else if (docType === "VOTER_ID") {
      const check = validateVoterId(idNumber);
      if (!check.valid) {
        showToast(check.error || "Please enter a valid Voter ID number", "error");
        return;
      }
    } else if (docType === "DRIVING_LICENSE") {
      const check = validateDrivingLicense(idNumber);
      if (!check.valid) {
        showToast(check.error || "Please enter a valid Driving License number", "error");
        return;
      }
    } else {
      if (idNumber.trim().length < 6) {
        showToast("Please enter a valid Passport number", "error");
        return;
      }
    }

    if (!consentGiven) {
      showToast("Consent is required under DPDP Act to verify your rental profile", "warning");
      return;
    }

    setStep("UPLOAD");
  };

  const handleFileSelect = async (
    side: "front" | "back",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Auto-compress large phone camera photos (up to 15MB) into lightweight JPEGs
      const { file: compressed, previewUrl } = await compressIdImage(file, 1400, 0.82);

      if (side === "front") {
        setFrontFile(compressed);
        setFrontPreview(previewUrl);
      } else {
        setBackFile(compressed);
        setBackPreview(previewUrl);
      }
      showToast(`${side === "front" ? "Front" : "Back"} photo optimized & ready`, "info");
    } catch {
      showToast("Failed to process image. Please try another photo.", "error");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmitDocuments = async () => {
    if (!frontFile || !backFile) {
      showToast("Please provide both front and back photos of your ID document", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Front & Back images to ImageKit
      const formData = new FormData();
      formData.append("documentType", docType);
      formData.append("frontImage", frontFile);
      formData.append("backImage", backFile);

      const uploadRes = await fetch("/api/verification/documents", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || "Document upload to storage failed");
      }

      // 2. Submit Identity Record with Masked ID
      const masked = docType === "AADHAAR_CARD"
        ? maskAadhaar(cleanDigits)
        : `XXXX •••• ${idNumber.trim().slice(-4)}`;

      const verifyRes = await fetch("/api/verification/aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber: docType === "AADHAAR_CARD" ? cleanDigits : idNumber,
          fullName: fullName.trim(),
          method: "UPLOAD",
          maskedAadhaar: masked,
          documentType: docType,
        }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.error || "Identity submission failed");
      }

      setStep("SUCCESS");
      showToast("ID document screening submitted successfully!", "success");

      if (updateProfile) {
        await updateProfile({ onboardingStatus: "COMPLETED" });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to submit document. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskedDisplay = docType === "AADHAAR_CARD"
    ? maskAadhaar(cleanDigits)
    : idNumber.trim() ? `XXXX •••• ${idNumber.trim().slice(-4)}` : "XXXX •••• ••••";

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EBEBEB] overflow-hidden my-auto">
        
        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}
        <div className="px-5 py-4 border-b border-[#EBEBEB] flex items-center justify-between hero-mesh-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#008A05] text-white flex items-center justify-center font-bold shadow-sm">
              <Icon name="verified_user" size={20} fill />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-extrabold text-base text-[#222222]">
                  Identity &amp; Tenant Screening
                </h3>
                <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full border border-forest-200">
                  DPDP Compliant
                </span>
              </div>
              <p className="text-[11px] text-[#717171]">
                Pre-fills official Uttarakhand Police verification forms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#717171] hover:text-[#222222] hover:bg-white/80 transition-colors"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-3 border-b border-[#EBEBEB] text-center text-xs font-bold">
          <div className={`py-2 border-b-2 transition-colors ${
            step === "DETAILS" ? "border-[#FF385C] text-[#FF385C] bg-[#FF385C]/5" : "border-transparent text-[#717171]"
          }`}>
            1. Document Details
          </div>
          <div className={`py-2 border-b-2 transition-colors ${
            step === "UPLOAD" ? "border-[#FF385C] text-[#FF385C] bg-[#FF385C]/5" : "border-transparent text-[#717171]"
          }`}>
            2. Upload Photos
          </div>
          <div className={`py-2 border-b-2 transition-colors ${
            step === "SUCCESS" ? "border-[#008A05] text-[#008A05] bg-[#008A05]/5" : "border-transparent text-[#717171]"
          }`}>
            3. Verification Status
          </div>
        </div>

        {/* ================================================================= */}
        {/* BODY                                                              */}
        {/* ================================================================= */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          
          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 1: DETAILS                                               */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === "DETAILS" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              
              {/* Document Type Tabs */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-2">
                  Select Identity Document
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "AADHAAR_CARD", label: "Aadhaar Card", icon: "badge" },
                    { id: "VOTER_ID", label: "Voter ID", icon: "how_to_vote" },
                    { id: "DRIVING_LICENSE", label: "Driving Lic.", icon: "directions_car" },
                    { id: "PASSPORT", label: "Passport", icon: "flight" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleDocTypeChange(tab.id as DocumentType)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        docType === tab.id
                          ? "border-[#222222] bg-[#222222] text-white shadow-sm"
                          : "border-[#DDDDDD] bg-[#F7F7F7] text-[#717171] hover:border-[#B0B0B0] hover:text-[#222222]"
                      }`}
                    >
                      <Icon name={tab.icon} size={18} className="mb-1" />
                      <span className="text-[11px] truncate w-full text-center">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Virtual ID Card Preview */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white p-4 shadow-md border border-slate-700/60 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF385C]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 via-white to-green-600 flex items-center justify-center text-[8px] font-black text-black">
                      🇮🇳
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">
                      Republic of India • Resident Verification
                    </span>
                  </div>
                  <Icon name="nfc" size={16} className="text-slate-400" />
                </div>

                <div className="pt-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      {docType.replace("_", " ")}
                    </p>
                    <p className="font-mono text-base font-bold tracking-wider text-white mt-0.5">
                      {maskedDisplay}
                    </p>
                    <p className="text-xs font-semibold text-slate-200 mt-2 truncate max-w-[200px]">
                      {fullName || "Legal Resident Name"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <Icon name="fingerprint" size={26} className="text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">MASKED</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                  <span>FOR TENANT SCREENING ONLY</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Icon name="lock" size={10} /> 256-bit Encrypted
                  </span>
                </div>
              </div>

              {/* ID Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                    {docType === "AADHAAR_CARD"
                      ? "12-Digit Aadhaar Number"
                      : `${docType.replace("_", " ")} Number`}
                  </label>
                  {isAadhaar && aadhaarCheck && (
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      aadhaarCheck.valid ? "text-[#008A05]" : "text-amber-600"
                    }`}>
                      <Icon name={aadhaarCheck.valid ? "check_circle" : "error"} size={13} fill />
                      {aadhaarCheck.valid ? "Checksum Valid" : "Checksum Mismatch"}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode={isAadhaar ? "numeric" : "text"}
                    placeholder={
                      docType === "AADHAAR_CARD"
                        ? "5412 8901 2345"
                        : docType === "VOTER_ID"
                        ? "ABC1234567"
                        : docType === "DRIVING_LICENSE"
                        ? "UK07 20210001234"
                        : "Passport Number"
                    }
                    value={idNumber}
                    onChange={handleIdChange}
                    className={`w-full h-12 bg-[#F7F7F7] border rounded-xl px-4 text-sm sm:text-base font-semibold tracking-wider text-[#222222] focus:bg-white focus:outline-none transition-all placeholder:text-[#B0B0B0] ${
                      isAadhaar && aadhaarCheck && !aadhaarCheck.valid
                        ? "border-amber-400 focus:border-amber-500"
                        : "border-[#EBEBEB] focus:border-[#222222]"
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Icon name="badge" size={20} className="text-[#717171]" />
                  </div>
                </div>

                {isAadhaar && aadhaarCheck && !aadhaarCheck.valid && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    {aadhaarCheck.error}
                  </p>
                )}
                <p className="text-[11px] text-[#717171] mt-1">
                  Full 12 digits are masked as <span className="font-mono font-bold text-[#222222]">{maskedDisplay}</span>. Only the last 4 digits are shared for police verification.
                </p>
              </div>

              {/* Legal Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  Legal Full Name (as on card)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra Pant"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 text-sm font-medium text-[#222222] focus:bg-white focus:border-[#222222] focus:outline-none transition-all"
                />
              </div>

              {/* DPDP Compliance & Consent */}
              <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-start gap-2.5">
                <Icon name="gavel" size={18} className="text-[#008A05] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#717171] leading-relaxed">
                  <span className="font-bold text-[#222222]">DPDP Act 2023 &amp; UIDAI Privacy: </span>
                  Ghar Foundation stores masked credentials exclusively for tenant verification and pre-filling the Uttarakhand Police verification form. We never sell or expose your ID.
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#FF385C] accent-[#FF385C] cursor-pointer"
                />
                <span className="text-[11px] text-[#717171] leading-tight select-none">
                  I voluntarily provide my identity details for rental background verification and compliance with Uttarakhand Police tenant registration.
                </span>
              </label>

              <button
                type="submit"
                className="btn-cta-primary w-full h-12 text-sm justify-center gap-1.5 mt-2"
              >
                <span>Continue to Upload ID Photos</span>
                <Icon name="arrow_forward" size={17} />
              </button>
            </form>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 2: UPLOAD PHOTOS                                         */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === "UPLOAD" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#222222]">
                    Upload {docType.replace("_", " ")} Photos
                  </h4>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Clear photos of front and back. Masked Aadhaar is accepted and encouraged.
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#008A05] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                  Auto-Compressed
                </span>
              </div>

              {/* Front Photo */}
              <div>
                <span className="block text-xs font-bold text-[#222222] mb-1.5">
                  1. Front Side (Photo, Name &amp; ID Number)
                </span>
                {frontPreview ? (
                  <div className="relative h-32 rounded-xl border border-forest-200 overflow-hidden bg-forest-50/50 p-2.5 flex items-center justify-between">
                    <img src={frontPreview} alt="Front preview" className="h-full max-w-[70%] object-contain rounded-lg border border-[#EBEBEB] bg-white" />
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-[11px] font-bold text-forest-700 flex items-center gap-1">
                        <Icon name="check_circle" size={14} fill /> Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor={frontInputId} className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#DDDDDD] hover:border-[#222222] bg-[#F7F7F7] hover:bg-white rounded-xl cursor-pointer transition-all p-4 text-center">
                    <Icon name="add_a_photo" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-bold text-[#222222]">Upload Front Photo</span>
                    <span className="text-[10px] text-[#717171] mt-0.5">Supports Camera capture or Gallery</span>
                    <input
                      id={frontInputId}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileSelect("front", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Back Photo */}
              <div>
                <span className="block text-xs font-bold text-[#222222] mb-1.5">
                  2. Back Side (Address &amp; Barcode)
                </span>
                {backPreview ? (
                  <div className="relative h-32 rounded-xl border border-forest-200 overflow-hidden bg-forest-50/50 p-2.5 flex items-center justify-between">
                    <img src={backPreview} alt="Back preview" className="h-full max-w-[70%] object-contain rounded-lg border border-[#EBEBEB] bg-white" />
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-[11px] font-bold text-forest-700 flex items-center gap-1">
                        <Icon name="check_circle" size={14} fill /> Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => { setBackFile(null); setBackPreview(null); }}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor={backInputId} className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#DDDDDD] hover:border-[#222222] bg-[#F7F7F7] hover:bg-white rounded-xl cursor-pointer transition-all p-4 text-center">
                    <Icon name="add_a_photo" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-bold text-[#222222]">Upload Back Photo</span>
                    <span className="text-[10px] text-[#717171] mt-0.5">Supports Camera capture or Gallery</span>
                    <input
                      id={backInputId}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileSelect("back", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Privacy Tip Banner */}
              <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-2 text-[11px] text-[#717171]">
                <Icon name="info" size={16} className="text-[#FF385C] shrink-0" />
                <span>
                  Tip: Download your official Masked e-Aadhaar from{" "}
                  <a href="https://myaadhaar.uidai.gov.in" target="_blank" rel="noopener noreferrer" className="font-bold text-[#222222] underline">
                    myaadhaar.uidai.gov.in
                  </a>.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
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
                  disabled={isSubmitting || isCompressing || !frontFile || !backFile}
                  className="btn-cta-primary flex-1 h-12 text-xs justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="sync" size={16} className="animate-spin" />
                      <span>Uploading to ImageKit...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="upload" size={16} />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 3: SUCCESS CONFIRMATION                                  */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#008A05] flex items-center justify-center mx-auto shadow-sm">
                <Icon name="task_alt" size={38} fill />
              </div>

              <div>
                <span className="inline-block bg-[#E8F5E9] text-[#008A05] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  Screening Submitted
                </span>
                <h4 className="font-display font-extrabold text-2xl text-[#222222]">
                  Verification Under Review
                </h4>
                <p className="text-xs text-[#717171] mt-1 max-w-sm mx-auto leading-relaxed">
                  Your identity documents have been encrypted and queued for review. Your verified identity now pre-fills your official Uttarakhand Police Tenant Verification Form and rental lease agreements.
                </p>
              </div>

              {/* Verified Card Summary */}
              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#222222]">{fullName}</p>
                  <p className="text-[11px] font-mono text-[#717171] mt-0.5">
                    {docType.replace("_", " ")}: {maskedDisplay}
                  </p>
                  <p className="text-[10px] text-[#008A05] font-semibold mt-1 flex items-center gap-1">
                    <Icon name="schedule" size={12} />
                    Submitted on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center text-[#008A05] shadow-sm">
                  <Icon name="verified_user" size={22} fill />
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
