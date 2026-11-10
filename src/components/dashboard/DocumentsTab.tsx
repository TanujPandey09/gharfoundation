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
      if (statusData.checks?.find((c: any) => c.id === "aadhaar")?.verified || statusData.maskedAadhaar) {
        setAadhaarData({
          verified: Boolean(statusData.checks?.find((c: any) => c.id === "aadhaar")?.verified),
          maskedAadhaar: statusData.maskedAadhaar || "XXXX XXXX ••••",
          name: statusData.user?.name || user?.name || "Verified User",
          verifiedAt: new Date().toISOString(),
        });
      }
    }
  }, [statusData, user]);

  const leases = leasesData?.data || [];

  const handleDownloadPoliceForm = () => {
    showToast("Generating official Uttarakhand Police Tenant Verification document...", "info");
    const content = [
      "=====================================================================",
      "           UTTARAKHAND POLICE - TENANT VERIFICATION FORM             ",
      "             (उत्तराखंड पुलिस - किरायेदार सत्यापन प्रपत्र)              ",
      "=====================================================================",
      "",
      "1. TENANT DETAILS (किरायेदार का विवरण):",
      `   Full Name            : ${user?.name || "Resident"}`,
      `   Contact / WhatsApp   : ${user?.phone || "+91 XXXXXXXXXX"}`,
      `   Email Address        : ${user?.email || "N/A"}`,
      `   Identity Proof       : Masked Government ID (${aadhaarData?.maskedAadhaar || "XXXX XXXX ••••"})`,
      "   Permanent Address    : ___________________________________________",
      "   Occupation / Office  : ___________________________________________",
      "",
      "2. RENTAL PREMISES IN UTTARAKHAND (किराये के मकान का विवरण):",
      "   Property Locality    : Dehradun / Rishikesh / Uttarakhand Foothills",
      "   Nearest Police Thana : ___________________________________________",
      "   Landlord Name        : ___________________________________________",
      "   Landlord Phone       : ___________________________________________",
      "",
      "3. EMERGENCY CONTACTS (दो स्थानीय/मूल संदर्भ व्यक्ति):",
      "   Reference 1 (Name & Phone): ______________________________________",
      "   Reference 2 (Name & Phone): ______________________________________",
      "",
      "4. DECLARATION (घोषणा):",
      "   I hereby declare that all information furnished above is true to",
      "   the best of my knowledge and belief.",
      "",
      "   Tenant Signature: _______________    Date: " + new Date().toLocaleDateString("en-IN"),
      "   Landlord Signature: _____________    Thana Receipt No: ___________",
      "=====================================================================",
      "Generated via Ghar Foundation Tenant Screening Portal - Zero Brokerage",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Uttarakhand-Police-Tenant-Verification-Form.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Uttarakhand Police form generated and downloaded successfully!", "success");
  };

  const handleDownloadAgreement = (title?: string) => {
    const propertyTitle = title || "Uttarakhand Residential Rental Unit";
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const content = [
      "=====================================================================",
      "               11-MONTH RESIDENTIAL LEASE AGREEMENT DRAFT             ",
      "        (Compliant with Indian Registration Act & Tenancy Norms)      ",
      "=====================================================================",
      "",
      `This AGREEMENT is executed on this ${dateStr} at Dehradun, Uttarakhand, by and between:`,
      "",
      "1. LANDLORD / LESSOR (मकान मालिक):",
      "   Name         : " + (user?.name || "___________________________________________"),
      "   Mobile Phone : " + (user?.phone || "___________________________________________"),
      "   Address      : ___________________________________________________________",
      "   (Hereinafter called the 'FIRST PARTY' / Lessor)",
      "",
      "2. TENANT / LESSEE (किरायेदार):",
      "   Name         : ___________________________________________",
      "   Aadhaar/ID   : " + (aadhaarData?.maskedAadhaar || "XXXX XXXX ••••"),
      "   Mobile Phone : ___________________________________________",
      "   Permanent Add: ___________________________________________________________",
      "   (Hereinafter called the 'SECOND PARTY' / Lessee)",
      "",
      "3. PREMISES DETAILS (किराये की संपत्ति):",
      `   Property Name: ${propertyTitle}`,
      "   Address      : Dehradun / Rishikesh, Uttarakhand, India",
      "   Premises Use : Strictly for quiet, private RESIDENTIAL accommodation only.",
      "",
      "4. KEY COMMERCIAL TERMS (किराया एवं धरोहर राशि):",
      "   a. Monthly Rent     : Rs. _________/- (Rupees ____________________ only),",
      "                         payable on or before the 7th of each English calendar month.",
      "   b. Security Deposit : Rs. _________/- (Refundable upon vacating after deduction",
      "                         of unpaid bills/damages, within 15 days of key handover).",
      "   c. Agreement Period : Exactly 11 (Eleven) Months commencing from ____________",
      "                         to ____________ (extendable with mutual written consent).",
      "   d. Lock-in Period   : 1 Month from the commencement date.",
      "   e. Notice Period    : 1 (One) Calendar Month notice by either party prior to vacation.",
      "",
      "5. STATUTORY COVENANTS & UTTARAKHAND POLICE CLEARANCE:",
      "   a. Police Verification: Both parties undertake to complete Uttarakhand Police",
      "      tenant verification within 7 days of occupancy as mandated by Uttarakhand state laws.",
      "   b. Utility Charges: Electricity and Water charges shall be borne by the Lessee",
      "      as per individual meter reading or mutual proportionate ratio.",
      "   c. Prohibited Uses: Subletting, commercial enterprise, or hazardous activities",
      "      are strictly prohibited on the said premises.",
      "",
      "IN WITNESS WHEREOF, both parties set their hands on the day, month, and year above written.",
      "",
      "________________________                    ________________________",
      "FIRST PARTY (LANDLORD)                      SECOND PARTY (TENANT)",
      "",
      "Witness 1: ___________________               Witness 2: ___________________",
      "Phone/ID:  ___________________               Phone/ID:  ___________________",
      "=====================================================================",
      "Generated via Ghar Foundation Legal & KYC Center • Zero Brokerage Network",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `11-Month-Rental-Agreement-Draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("11-Month Rental Agreement draft downloaded successfully!", "success");
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
                ? "bg-[#E8F5E9] text-[#008A05]"
                : aadhaarData?.maskedAadhaar && aadhaarData?.maskedAadhaar !== "XXXX XXXX ••••"
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              <Icon name={aadhaarData?.verified ? "verified_user" : "badge"} size={26} fill={aadhaarData?.verified} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#222222]">Tenant &amp; Host Identity Screening</h3>
                {aadhaarData?.verified ? (
                  <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#008A05] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <Icon name="check_circle" size={13} fill /> Verified
                  </span>
                ) : aadhaarData?.maskedAadhaar && aadhaarData?.maskedAadhaar !== "XXXX XXXX ••••" ? (
                  <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Submitted (Under Review)
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-[#717171] mt-0.5">
                Identity and masked document screening for Uttarakhand Police verification and tenancy safety.
              </p>
            </div>
          </div>

          <div>
            {aadhaarData?.verified || (aadhaarData?.maskedAadhaar && aadhaarData?.maskedAadhaar !== "XXXX XXXX ••••") ? (
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="btn-cta-secondary px-4 py-2 text-xs"
              >
                <span>{aadhaarData?.verified ? "View ID Record" : "Update Documents"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="btn-cta-primary px-5 py-2.5 text-xs"
              >
                <Icon name="security" size={16} />
                <span>Submit ID Proof</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Details Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB]">
            <p className="text-[11px] uppercase font-bold text-[#717171] tracking-wider">Verification Status</p>
            <p className="font-bold text-sm text-[#222222] mt-1 flex items-center gap-1">
              {aadhaarData?.verified ? (
                <>
                  <Icon name="check_circle" size={15} className="text-[#008A05]" fill />
                  <span>Screening Verified</span>
                </>
              ) : aadhaarData?.maskedAadhaar && aadhaarData?.maskedAadhaar !== "XXXX XXXX ••••" ? (
                <>
                  <Icon name="schedule" size={15} className="text-blue-600" />
                  <span>Submitted · Under Review</span>
                </>
              ) : (
                <>
                  <Icon name="pending" size={15} className="text-amber-600" />
                  <span>Pending Submission</span>
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

          <div className="flex items-center gap-2">
            <a
              href="https://uttarakhandpolice.uk.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-[#DDDDDD]"
            >
              <Icon name="open_in_new" size={15} />
              <span>Official Police Portal</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadPoliceForm}
              className="px-4 py-2.5 bg-[#222222] hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="download" size={16} />
              <span>Download Police Form</span>
            </button>
          </div>
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
            onClick={() => handleDownloadAgreement()}
            className="px-4 py-2.5 bg-[#222222] hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Icon name="download" size={16} />
            <span>Draft Standard Agreement</span>
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
                onClick={() => handleDownloadAgreement()}
                className="text-xs font-bold text-[#FF385C] hover:underline"
              >
                Download Standard Uttarakhand Agreement Template →
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
