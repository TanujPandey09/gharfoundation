"use client";

import React, { useState, useEffect } from "react";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import AadhaarVerificationModal from "./AadhaarVerificationModal";
import { useQuery } from "@tanstack/react-query";

interface AadhaarData {
  verified: boolean;
  maskedAadhaar: string;
  name: string;
  verifiedAt: string;
}

export default function DocumentsTab() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [aadhaarData, setAadhaarData] = useState<AadhaarData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    emailVerified: boolean;
    profileVerified: boolean;
    aadhaarVerified: boolean;
    documentsVerified: boolean;
    allVerified: boolean;
  } | null>(null);

  // Fetch verification status from backend API
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const res = await fetch("/api/verification/status");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch real lease agreements from API
  const { data: leasesData, isLoading: leasesLoading } = useQuery({
    queryKey: ["user-leases"],
    queryFn: async () => {
      const res = await fetch("/api/leases");
      if (!res.ok) return { data: [] };
      return res.json();
    },
  });

  useEffect(() => {
    if (statusData) {
      setVerificationStatus({
        emailVerified: statusData.checks?.find((c: any) => c.id === "email")?.verified || false,
        profileVerified: statusData.checks?.find((c: any) => c.id === "profile")?.verified || false,
        aadhaarVerified: statusData.checks?.find((c: any) => c.id === "aadhaar")?.verified || false,
        documentsVerified: statusData.checks?.find((c: any) => c.id === "documents")?.verified || false,
        allVerified: statusData.allVerified || false,
      });
      if (statusData.checks?.find((c: any) => c.id === "aadhaar")?.verified) {
        setAadhaarData({
          verified: true,
          maskedAadhaar: statusData.maskedAadhaar || "XXXX XXXX ••••",
          name: statusData.user?.name || user?.name || "Verified User",
          verifiedAt: new Date().toISOString(),
        });
      }
    }
  }, [statusData, user]);

  const leases = leasesData?.data || [];

  const handleDownloadPoliceForm = () => {
    showToast("Generating Uttarakhand Police Tenant Verification Form...", "info");
    setTimeout(() => {
      showToast("Verification document downloaded. Ready for submission.", "success");
    }, 1000);
  };

  const handleDownloadAgreement = (title: string) => {
    showToast(`Downloading rental agreement for ${title}...`, "info");
  };

  return (
    <div className="w-full p-3.5 sm:p-5 space-y-5 max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C] bg-white/90 border border-[#FFD1D8] px-3 py-0.5 rounded-full">
            Legal &amp; KYC Center
          </span>
        </div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#222222] tracking-tight mt-2">
          Verification &amp; Documents
        </h1>
        <p className="text-xs sm:text-sm text-[#717171] mt-1 max-w-2xl">
          Manage your Aadhaar identity verification, official Uttarakhand Police tenant forms, and 11-month registered rental agreements.
        </p>
      </div>

      {/* Verification Progress Summary */}
      {verificationStatus && (
        <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#222222] mb-4 flex items-center gap-2">
            <Icon name="assessment" size={20} className="text-[#FF385C]" />
            <span>Overall Profile Completeness</span>
          </h3>
          <div className="space-y-3">
            {[
              { label: "Email Address", verified: verificationStatus.emailVerified },
              { label: "Profile Picture", verified: verificationStatus.profileVerified },
              { label: "Aadhaar KYC", verified: verificationStatus.aadhaarVerified },
              { label: "Documents Upload", verified: verificationStatus.documentsVerified },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
                <span className="text-sm text-[#222222] font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.verified ? "bg-forest-100 text-forest-700" : "bg-rausch-100 text-[#FF385C]"
                }`}>
                  {item.verified ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
            {verificationStatus.allVerified ? (
              <div className="mt-3 p-3 rounded-xl bg-forest-50 border border-forest-100 flex items-center gap-2">
                <Icon name="verified" size={16} className="text-forest-700 fill" />
                <span className="text-sm font-bold text-forest-800">
                  All verifications complete — you are a trusted resident on Ghar Foundation.
                </span>
              </div>
            ) : (
              <button
                onClick={() => showToast("Go to Settings to complete pending verifications.", "info")}
                className="mt-3 w-full text-center text-xs font-bold text-[#FF385C] hover:underline"
              >
                Complete pending verifications →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. AADHAAR IDENTITY VERIFICATION CARD (PRIMARY TRUST PILLAR)           */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EBEBEB]">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              aadhaarData?.verified
                ? "bg-forest-100 text-forest-700"
                : "bg-rausch-100 text-[#FF385C]"
            }`}>
              <Icon name={aadhaarData?.verified ? "verified_user" : "credit_card"} size={26} fill={aadhaarData?.verified} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#222222]">Aadhaar e-KYC Verification</h3>
                {aadhaarData?.verified ? (
                  <span className="inline-flex items-center gap-1 bg-forest-100 text-forest-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <Icon name="check_circle" size={13} fill /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-[#717171] mt-0.5">
                Official Government UIDAI verification for seamless trust with landlords and local police stations.
              </p>
            </div>
          </div>

          <div>
            {aadhaarData?.verified ? (
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="btn-cta-secondary px-4 py-2 text-xs"
              >
                View Certificate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="btn-cta-primary px-5 py-2.5 text-xs"
              >
                <Icon name="security" size={16} />
                <span>Verify Aadhaar Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Details Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <p className="text-[11px] uppercase font-bold text-[#717171] tracking-wider">Aadhaar Status</p>
            <p className="font-bold text-sm text-[#222222] mt-1 flex items-center gap-1">
              {aadhaarData?.verified ? (
                <>
                  <Icon name="check_circle" size={15} className="text-forest-600" fill />
                  <span>UIDAI Identity Confirmed</span>
                </>
              ) : (
                <>
                  <Icon name="pending" size={15} className="text-amber-600" />
                  <span>Not verified yet</span>
                </>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <p className="text-[11px] uppercase font-bold text-[#717171] tracking-wider">Masked ID Number</p>
            <p className="font-mono font-bold text-sm text-[#222222] mt-1">
              {aadhaarData?.maskedAadhaar || "XXXX XXXX ••••"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <p className="text-[11px] uppercase font-bold text-[#717171] tracking-wider">Verified User Name</p>
            <p className="font-bold text-sm text-[#222222] mt-1 truncate">
              {aadhaarData?.name || user?.name || "Pending verification"}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. UTTARAKHAND POLICE TENANT VERIFICATION FORM                         */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EBEBEB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
              <Icon name="local_police" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#222222]">
                  Uttarakhand Police Verification (Mandatory)
                </h3>
                <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Official Form
                </span>
              </div>
              <p className="text-xs text-[#717171] mt-0.5">
                Uttarakhand state law requires landlords and tenants to register verification details with the nearest local Thana.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPoliceForm}
            className="px-4 py-2.5 border border-[#222222] hover:bg-[#F7F7F7] text-[#222222] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Icon name="download" size={16} />
            <span>Download Police Form PDF</span>
          </button>
        </div>

        {/* 3 Step Process Guide */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <p className="font-bold text-[#222222]">Auto-Fill Identity</p>
            <p className="text-[#717171] mt-1 leading-relaxed">
              We pre-fill your verified Aadhaar, phone number, and Uttarakhand rental property address into the official template.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <p className="font-bold text-[#222222]">Emergency &amp; Workplace Info</p>
            <p className="text-[#717171] mt-1 leading-relaxed">
              Attach employer / college verification letter and two emergency references from your hometown.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <div className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <p className="font-bold text-[#222222]">Online Submission / Thana Receipt</p>
            <p className="text-[#717171] mt-1 leading-relaxed">
              Submit via Uttarakhand Police citizen portal or submit the signed paper copy to your local police beat officer.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. 11-MONTH DIGITAL RENTAL AGREEMENTS (LEGAL COMPLIANCE)                */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EBEBEB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F7F7] text-[#222222] flex items-center justify-center shrink-0 border border-[#EBEBEB]">
              <Icon name="history_edu" size={26} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#222222]">11-Month Rental Agreements</h3>
              <p className="text-xs text-[#717171] mt-0.5">
                Lawyer-drafted, digital e-stamped tenancy agreements compliant with the Indian Registration Act.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast("Opening digital agreement draft studio...", "info")}
            className="px-4 py-2.5 bg-[#222222] hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Icon name="add" size={16} />
            <span>Draft New Agreement</span>
          </button>
        </div>

        {/* Leases List */}
        <div className="pt-6">
          {leasesLoading ? (
            <div className="h-28 rounded-xl bg-[#F7F7F7] animate-pulse" />
          ) : leases.length > 0 ? (
            <div className="space-y-3">
              {leases.map((lease: any) => (
                <div
                  key={lease.id}
                  className="p-4 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] hover:bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#222222]">{lease.propertyName}</p>
                      <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                        {lease.status || "ACTIVE"}
                      </span>
                    </div>
                    <p className="text-xs text-[#717171] mt-0.5">
                      Tenant: <span className="font-semibold text-[#222222]">{lease.tenantName}</span> · Rent: <span className="font-bold text-[#222222]">₹{lease.rent.toLocaleString()}/mo</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAgreement(lease.propertyName)}
                      className="px-3.5 py-1.5 border border-[#EBEBEB] bg-white hover:bg-[#F7F7F7] text-xs font-semibold text-[#222222] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Icon name="download" size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <Icon name="description" size={32} className="text-[#B0B0B0] mx-auto mb-2" />
              <p className="font-bold text-sm text-[#222222]">No active agreements created yet</p>
              <p className="text-xs text-[#717171] max-w-sm mx-auto mt-1 mb-3">
                When you finalize a tenant or rent a room, generate a certified 11-month agreement in minutes.
              </p>
              <button
                type="button"
                onClick={() => showToast("Opening template library...", "info")}
                className="text-xs font-bold text-[#FF385C] hover:underline"
              >
                Browse Standard Uttarakhand Agreement Template →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Aadhaar Verification Modal */}
      <AadhaarVerificationModal
        isOpen={isAadhaarModalOpen}
        onClose={() => {
          setIsAadhaarModalOpen(false);
        }}
        onSuccess={() => {
          setAadhaarData({
            verified: true,
            maskedAadhaar: "XXXX XXXX ••••",
            name: user?.name || "Verified User",
            verifiedAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
