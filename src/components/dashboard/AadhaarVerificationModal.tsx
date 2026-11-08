"use client";

import React, { useState, useEffect } from "react";
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

  const [step, setStep] = useState<"DETAILS" | "METHOD" | "OTP" | "UPLOAD" | "SUCCESS">("DETAILS");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [consentGiven, setConsentGiven] = useState(true);

  // OTP Verification States
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  // Upload States
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (step === "OTP" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

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
      showToast("Please enter your full name as on your Aadhaar card", "error");
      return;
    }
    if (!consentGiven) {
      showToast("Consent is required to verify identity with UIDAI guidelines", "warning");
      return;
    }
    setStep("METHOD");
  };

  const handleStartOtp = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/verification/aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          fullName,
          method: "OTP",
          maskedAadhaar: `XXXX XXXX ${aadhaarNumber.replace(/\s/g, "").slice(-4)}`,
        }),
      });
      if (res.ok) {
        setStep("OTP");
        setTimer(60);
        showToast("OTP sent to your Aadhaar-registered mobile number", "info");
      } else {
        showToast("Failed to initiate OTP. Please try again.", "error");
      }
    } catch {
      showToast("Failed to initiate OTP. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);
    if (val && index < 5) {
      const nextInput = document.getElementById(`aadhaar-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      showToast("Please enter the complete 6-digit OTP", "warning");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/verification/aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          fullName,
          method: "OTP_VERIFY",
          otpCode: code,
          maskedAadhaar: `XXXX XXXX ${aadhaarNumber.replace(/\s/g, "").slice(-4)}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setStep("SUCCESS");
        showToast("Aadhaar identity verified successfully!", "success");
        if (updateProfile) {
          await updateProfile({ onboardingStatus: "COMPLETED" });
        }
        if (onSuccess) onSuccess();
      } else {
        showToast(data.error || "OTP verification failed", "error");
      }
    } catch {
      showToast("Verification failed. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
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
      showToast("Please upload both front and back photos of your Aadhaar card", "warning");
      return;
    }

    setIsVerifying(true);
    const formData = new FormData();
    formData.append("documentType", "AADHAAR_CARD");
    formData.append("frontImage", frontFile);
    formData.append("backImage", backFile);

    try {
      const res = await fetch("/api/verification/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const masked = `XXXX XXXX ${aadhaarNumber.replace(/\s/g, "").slice(-4) || "0000"}`;
        await fetch("/api/verification/aadhaar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aadhaarNumber,
            fullName,
            method: "UPLOAD",
            maskedAadhaar: masked,
          }),
        });
        setStep("SUCCESS");
        showToast("Aadhaar documents submitted and verified!", "success");
        if (updateProfile) {
          await updateProfile({ onboardingStatus: "COMPLETED" });
        }
        if (onSuccess) onSuccess();
      } else {
        showToast(data.error || "Document upload failed", "error");
      }
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-airbnbHover border border-[#EBEBEB] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-forest-50 text-forest-600 flex items-center justify-center font-bold">
              <Icon name="verified_user" size={18} fill />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#222222]">
                Aadhaar KYC Verification
              </h3>
              <p className="text-[11px] text-[#717171]">Official UIDAI Identity Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] transition-colors"
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
                  12-Digit Aadhaar Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5412 8901 2345"
                    value={aadhaarNumber}
                    onChange={handleAadhaarChange}
                    className="w-full h-12 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 text-base font-semibold tracking-wider text-[#222222] focus:bg-white focus:border-[#FF385C] focus:outline-none transition-all placeholder:text-[#B0B0B0]"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Icon name="credit_card" size={20} className="text-[#717171]" />
                  </div>
                </div>
                <p className="text-[11px] text-[#717171] mt-1">
                  Format: 12 numeric digits. No special characters required.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1.5">
                  Full Name (as printed on Aadhaar)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 text-sm font-medium text-[#222222] focus:bg-white focus:border-[#FF385C] focus:outline-none transition-all"
                />
              </div>

              {/* Security & Consent Box */}
              <div className="p-3.5 rounded-xl bg-forest-50/60 border border-forest-100 flex items-start gap-3">
                <Icon name="lock" size={18} className="text-forest-600 shrink-0 mt-0.5" />
                <div className="text-[12px] text-[#222222] leading-relaxed">
                  <p className="font-semibold text-forest-700">Bank-Grade 256-Bit SSL Encryption</p>
                  <p className="text-[#5E5E5E] text-[11px] mt-0.5">
                    Your Aadhaar data is encrypted and verified against UIDAI standards. Your full 12-digit number is never exposed to landlords or third parties.
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
                  I voluntarily give consent to Ghar Foundation to verify my identity details for rental screening and Uttarakhand police verification compliance.
                </span>
              </label>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-12 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                <span>Continue to Verification</span>
                <Icon name="arrow_forward" size={18} />
              </button>
            </form>
          )}

          {/* STEP 2: Choose Method */}
          {step === "METHOD" && (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <h4 className="font-bold text-base text-[#222222]">Choose Verification Method</h4>
                <p className="text-xs text-[#717171] mt-1">
                  Verifying for Aadhaar: <span className="font-mono font-bold text-[#222222]">{aadhaarNumber}</span>
                </p>
              </div>

              {/* Method 1: Instant OTP */}
              <button
                type="button"
                onClick={handleStartOtp}
                disabled={isVerifying}
                className="w-full p-4 rounded-xl border-2 border-[#EBEBEB] hover:border-[#FF385C] bg-white hover:bg-rausch-50/30 transition-all text-left flex items-start gap-3.5 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-rausch-100 text-[#FF385C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon name="sms" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-[#222222]">Instant OTP via Registered Mobile</p>
                    <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                      Fastest (30 sec)
                    </span>
                  </div>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Receive a 6-digit one-time password on your Aadhaar-linked mobile phone.
                  </p>
                </div>
              </button>

              {/* Method 2: Document Upload */}
              <button
                type="button"
                onClick={() => setStep("UPLOAD")}
                disabled={isVerifying}
                className="w-full p-4 rounded-xl border border-[#EBEBEB] hover:border-[#222222] bg-white transition-all text-left flex items-start gap-3.5 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon name="upload_file" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#222222]">Upload Aadhaar Card Photos</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Upload clear front &amp; back images of your physical card or masked e-Aadhaar PDF.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep("DETAILS")}
                className="w-full text-center text-xs font-semibold text-[#717171] hover:text-[#222222] pt-2"
              >
                ← Back to edit Aadhaar number
              </button>
            </div>
          )}

          {/* STEP 3A: OTP Verification */}
          {step === "OTP" && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rausch-100 text-[#FF385C] flex items-center justify-center mx-auto">
                <Icon name="phonelink_lock" size={26} />
              </div>

              <div>
                <h4 className="font-bold text-base text-[#222222]">Enter 6-Digit OTP</h4>
                <p className="text-xs text-[#717171] mt-1 max-w-xs mx-auto">
                  A verification code has been dispatched to your Aadhaar-linked mobile ending with <span className="font-bold text-[#222222]">...•729</span>
                </p>
              </div>

              {/* 6-box OTP input */}
              <div className="flex justify-center gap-2 sm:gap-3 py-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`aadhaar-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#F7F7F7] border border-[#EBEBEB] focus:border-[#FF385C] focus:bg-white rounded-xl focus:outline-none transition-all text-[#222222]"
                  />
                ))}
              </div>

              <div className="text-xs text-[#717171]">
                {timer > 0 ? (
                  <span>Resend code in <strong className="text-[#222222] tabular-nums">{timer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartOtp}
                    className="font-bold text-[#FF385C] hover:underline"
                  >
                    Resend OTP now
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("METHOD")}
                  className="flex-1 h-12 border border-[#EBEBEB] hover:bg-[#F7F7F7] text-[#222222] font-semibold text-xs rounded-xl transition-colors"
                >
                  Change Method
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="flex-1 h-12 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Icon name="sync" size={18} className="animate-spin text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify &amp; Confirm</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3B: Upload Documents */}
          {step === "UPLOAD" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-base text-[#222222]">Upload Aadhaar Card Photos</h4>
                <p className="text-xs text-[#717171] mt-0.5">
                  Upload high-resolution, un-cropped photos (JPEG, PNG, or WebP).
                </p>
              </div>

              {/* Front Photo */}
              <div>
                <span className="block text-xs font-bold text-[#222222] mb-1.5">
                  Front Side (with photo &amp; name)
                </span>
                {frontPreview ? (
                  <div className="relative h-28 rounded-xl border border-forest-300 overflow-hidden bg-forest-50/40 p-2 flex items-center justify-between">
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
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#DDDDDD] hover:border-[#FF385C] bg-[#F7F7F7] rounded-xl cursor-pointer transition-colors p-4 text-center">
                    <Icon name="add_photo_alternate" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-semibold text-[#222222]">Click to upload Front photo</span>
                    <span className="text-[10px] text-[#717171]">Up to 5MB</span>
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
                  Back Side (with address &amp; barcode)
                </span>
                {backPreview ? (
                  <div className="relative h-28 rounded-xl border border-forest-300 overflow-hidden bg-forest-50/40 p-2 flex items-center justify-between">
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
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-[#DDDDDD] hover:border-[#FF385C] bg-[#F7F7F7] rounded-xl cursor-pointer transition-colors p-4 text-center">
                    <Icon name="add_photo_alternate" size={24} className="text-[#717171] mb-1" />
                    <span className="text-xs font-semibold text-[#222222]">Click to upload Back photo</span>
                    <span className="text-[10px] text-[#717171]">Up to 5MB</span>
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
                  onClick={() => setStep("METHOD")}
                  className="flex-1 h-12 border border-[#EBEBEB] text-[#222222] font-semibold text-xs rounded-xl hover:bg-[#F7F7F7]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDocuments}
                  disabled={isVerifying || !frontFile || !backFile}
                  className="flex-1 h-12 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Icon name="sync" size={18} className="animate-spin text-white" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Submit &amp; Verify</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Confirmation */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto shadow-sm">
                <Icon name="verified" size={36} fill />
              </div>

              <div>
                <span className="inline-block bg-forest-100 text-forest-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                  KYC Verified
                </span>
                <h4 className="font-display font-extrabold text-2xl text-[#222222]">
                  Identity Verified Successfully
                </h4>
                <p className="text-xs text-[#717171] mt-1 max-w-sm mx-auto">
                  Your official Aadhaar verification has been added to your profile. You now hold the <strong className="text-[#222222]">Verified Resident</strong> badge for rentals.
                </p>
              </div>

              {/* Digital Badge Mockup Card */}
              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#222222]">{fullName}</p>
                  <p className="text-[11px] font-mono text-[#717171] mt-0.5">
                    Aadhaar: {aadhaarNumber || "XXXX XXXX 0000"}
                  </p>
                  <p className="text-[10px] text-forest-600 font-semibold mt-1 flex items-center gap-1">
                    <Icon name="check_circle" size={12} fill />
                    Verified on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center text-forest-600 shadow-sm">
                  <Icon name="security" size={22} />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 bg-[#222222] hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-sm"
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
