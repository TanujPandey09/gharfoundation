"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

// Local Uttarakhand Police Stations (Thanas)
const LOCAL_THANAS = [
  "Prem Nagar Police Station (Dehradun)",
  "Rajpur Police Station (Dehradun)",
  "Kotwali City Police Station (Dehradun)",
  "Dalanwala Police Station (Dehradun)",
  "Cantt Police Station (Dehradun)",
  "Patel Nagar Police Station (Dehradun)",
  "Clement Town Police Station (Dehradun)",
  "Mussoorie Police Station",
  "Muni Ki Reti Police Station (Rishikesh)",
  "Rishikesh City Kotwali",
  "Ranipur Police Station (Haridwar)",
  "Haldwani Kotwali (Nainital)",
  "Tallital Police Station (Nainital)",
];

export default function PoliceVerificationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    thana: "Prem Nagar Police Station (Dehradun)",
    ownerName: user?.name || "",
    ownerPhone: user?.phone || "",
    ownerAddress: "Dehradun, Uttarakhand",
    tenantName: "",
    tenantFatherName: "",
    tenantPhone: "",
    tenantEmail: "",
    tenantPermanentAddress: "",
    tenantWorkplace: "e.g. Student at UPES Bidholi / Software Engineer",
    tenantAadhaarMasked: "XXXX-XXXX-••••",
    rentalPropertyAddress: "",
    monthlyRent: "",
    ref1Name: "",
    ref1Phone: "",
    ref2Name: "",
    ref2Phone: "",
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen text-[#222222] font-sans antialiased">
      {/* Hero Header */}
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-6 pb-8 sm:pt-10 sm:pb-12 print:hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/95 border border-[#86EFAC] text-[#16A34A] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
            <Icon name="local_police" size={15} />
            <span>Uttarakhand Police Act 2007 (Section 83) Compliant</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Uttarakhand Police Tenant Verification Dossier
          </h1>
          <p className="mt-2 text-[#717171] max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            In Uttarakhand, landlord failure to submit tenant police verification invites penalties up to ₹10,000. Generate your official pre-filled verification dossier in 60 seconds.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* Police Portal Info Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <Icon name="verified_user" size={22} fill />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#166534]">
                Official Uttarakhand Police Citizen Portal Access
              </h3>
              <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
                You can submit this dossier physically at your local Thana, or file digitally on the official Uttarakhand Police portal or Gaura Shakti citizen app.
              </p>
            </div>
          </div>
          <a
            href="https://uttarakhandpolice.uk.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <span>Visit UK Police Portal</span>
            <Icon name="open_in_new" size={14} />
          </a>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#EBEBEB] mb-8 space-x-6 text-sm font-bold print:hidden">
          <button
            onClick={() => setPreviewMode(false)}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              !previewMode ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon name="edit_document" size={18} />
            <span>1. Fill Form Details</span>
          </button>
          <button
            onClick={() => {
              if (!formData.tenantName || !formData.rentalPropertyAddress) {
                showToast("Please fill in Tenant Name and Property Address first", "warning");
              }
              setPreviewMode(true);
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              previewMode ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon name="print" size={18} />
            <span>2. View Printable Dossier</span>
          </button>
        </div>

        {!previewMode ? (
          /* ================================================================= */
          /* FORM ENTRY VIEW                                                   */
          /* ================================================================= */
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EBEBEB] shadow-sm space-y-8">
            {/* Step 1: Thana & Landlord */}
            <div>
              <h3 className="font-bold text-base text-[#222222] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#222222] text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Jurisdiction Police Station &amp; Landlord (Lessor)</span>
              </h3>
              <p className="text-xs text-[#717171] mb-4">Select the nearest Thana where the rental property is situated.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Local Police Station (Thana) *
                  </label>
                  <select
                    value={formData.thana}
                    onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  >
                    {LOCAL_THANAS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Landlord / Property Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devendra Rawat"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Landlord Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Rental Property Full Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House No, Lane, Locality, Dehradun, Uttarakhand - 248007"
                    value={formData.rentalPropertyAddress}
                    onChange={(e) => setFormData({ ...formData, rentalPropertyAddress: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Tenant Information */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-bold text-base text-[#222222] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#222222] text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Tenant (Lessee / Resident) Information</span>
              </h3>
              <p className="text-xs text-[#717171] mb-4">Complete details of the tenant moving into the Uttarakhand residence.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Negi"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Father&apos;s / Guardian&apos;s Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. S. Negi"
                    value={formData.tenantFatherName}
                    onChange={(e) => setFormData({ ...formData, tenantFatherName: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98111 22334"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Aadhaar Number (Masked)
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-1234"
                    value={formData.tenantAadhaarMasked}
                    onChange={(e) => setFormData({ ...formData, tenantAadhaarMasked: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Permanent Hometown Address (As per Aadhaar/Voter ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Village, Post Office, Tehsil, District, State, PIN"
                    value={formData.tenantPermanentAddress}
                    onChange={(e) => setFormData({ ...formData, tenantPermanentAddress: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Occupation / University Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student at UPES Bidholi, B.Tech CSE (Enrollment #...) OR Senior Analyst at IT Park"
                    value={formData.tenantWorkplace}
                    onChange={(e) => setFormData({ ...formData, tenantWorkplace: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Two Local References */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-bold text-base text-[#222222] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#222222] text-white text-xs flex items-center justify-center font-mono">3</span>
                <span>Two References (Mandatory for Police Verification)</span>
              </h3>
              <p className="text-xs text-[#717171] mb-4">Local friends, relatives, or college faculty in Uttarakhand.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Reference 1 Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.ref1Name}
                    onChange={(e) => setFormData({ ...formData, ref1Name: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Reference 1 Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 94120 00000"
                    value={formData.ref1Phone}
                    onChange={(e) => setFormData({ ...formData, ref1Phone: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Reference 2 Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Rawat"
                    value={formData.ref2Name}
                    onChange={(e) => setFormData({ ...formData, ref2Name: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Reference 2 Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98970 00000"
                    value={formData.ref2Phone}
                    onChange={(e) => setFormData({ ...formData, ref2Phone: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#EBEBEB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#717171]">
                All data is formatted according to standard Uttarakhand Police Form Proforma.
              </span>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="btn-cta-primary px-6 py-3 text-xs sm:text-sm w-full sm:w-auto"
              >
                <span>Generate Dossier Preview →</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* PRINTABLE DOSSIER VIEW (A4 Printable Document)                    */
          /* ================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 border border-[#DDDDDD] hover:bg-[#F7F7F7] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Icon name="arrow_back" size={16} />
                <span>Back to Edit Form</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-[#222222] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Icon name="print" size={16} />
                <span>Print Official Dossier / Save PDF</span>
              </button>
            </div>

            {/* Official Proforma Document */}
            <div className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-[#222222] shadow-xl max-w-4xl mx-auto text-[#222222] font-serif print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="text-center pb-6 border-b-2 border-[#222222] mb-6">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#717171]">
                  उत्तराखंड पुलिस (Uttarakhand Police)
                </p>
                <h2 className="text-xl sm:text-2xl font-bold uppercase mt-1">
                  किरायेदार सत्यापन प्रपत्र / TENANT VERIFICATION FORM
                </h2>
                <p className="text-xs font-sans mt-1">
                  Under Section 83, Uttarakhand Police Act, 2007 (Mandatory Tenant Registration)
                </p>
                <p className="text-xs font-sans font-semibold mt-1 text-[#555555]">
                  Submitted to: <strong>{formData.thana}</strong>
                </p>
              </div>

              {/* Photo Box & Tenant Basic */}
              <div className="flex justify-between items-start gap-6 pb-6 border-b border-[#DDDDDD]">
                <div className="space-y-2 text-xs flex-1">
                  <p><strong>1. Tenant Full Name:</strong> {formData.tenantName || "________________________"}</p>
                  <p><strong>2. Father&apos;s / Husband&apos;s Name:</strong> {formData.tenantFatherName || "________________________"}</p>
                  <p><strong>3. Mobile Number:</strong> {formData.tenantPhone || "________________________"}</p>
                  <p><strong>4. Aadhaar / ID No (Masked):</strong> {formData.tenantAadhaarMasked || "XXXX-XXXX-••••"}</p>
                  <p><strong>5. Occupation / College / Office:</strong> {formData.tenantWorkplace || "________________________"}</p>
                </div>
                <div className="w-28 h-32 border-2 border-dashed border-[#888888] rounded flex flex-col items-center justify-center text-[10px] text-[#717171] text-center p-2 shrink-0">
                  <span>Affix Recent Passport Size Photo of Tenant</span>
                </div>
              </div>

              {/* Addresses */}
              <div className="py-4 border-b border-[#DDDDDD] text-xs space-y-3">
                <div>
                  <p className="font-bold">6. Permanent Hometown Address:</p>
                  <p className="pl-4 text-[#333333] mt-0.5">{formData.tenantPermanentAddress || "________________________________________________________"}</p>
                </div>
                <div>
                  <p className="font-bold">7. Rented Accommodation Address in Uttarakhand:</p>
                  <p className="pl-4 text-[#333333] mt-0.5">{formData.rentalPropertyAddress || "________________________________________________________"}</p>
                </div>
              </div>

              {/* Landlord Details */}
              <div className="py-4 border-b border-[#DDDDDD] text-xs space-y-2">
                <p className="font-bold">8. Landlord (House Owner) Details:</p>
                <p className="pl-4">Name: <strong>{formData.ownerName || "________________________"}</strong></p>
                <p className="pl-4">Phone: <strong>{formData.ownerPhone || "________________________"}</strong></p>
                <p className="pl-4">Owner Address: {formData.ownerAddress}</p>
              </div>

              {/* Local References */}
              <div className="py-4 border-b border-[#DDDDDD] text-xs space-y-2">
                <p className="font-bold">9. Two Local References in Uttarakhand:</p>
                <p className="pl-4">1) Name: {formData.ref1Name || "________________________"} &nbsp;|&nbsp; Phone: {formData.ref1Phone || "________________________"}</p>
                <p className="pl-4">2) Name: {formData.ref2Name || "________________________"} &nbsp;|&nbsp; Phone: {formData.ref2Phone || "________________________"}</p>
              </div>

              {/* Declaration */}
              <div className="pt-6 text-[11px] leading-relaxed text-[#333333] space-y-3">
                <p className="font-bold uppercase tracking-wider text-[#222222]">घोषणा / Declaration:</p>
                <p>
                  I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief. I have no criminal record or pending legal proceedings against me.
                </p>
                <div className="pt-10 flex justify-between items-end text-xs font-bold text-[#222222]">
                  <div>
                    <div className="border-t border-[#222222] pt-1 w-44 text-center">
                      Signature of Landlord
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-normal text-[10px] text-[#717171] mb-8">Date: {new Date().toLocaleDateString("en-IN")}</p>
                    <div className="border-t border-[#222222] pt-1 w-44 text-center">
                      Signature of Tenant
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

