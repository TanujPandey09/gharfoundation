"use client";

import React, { useState } from "react";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function AgreementsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    city: "Dehradun",
    startDate: new Date().toISOString().split("T")[0],
    durationMonths: "11",
    landlordName: user?.name || "Devendra Rawat",
    landlordFather: "Late Shri B. S. Rawat",
    landlordAddress: "Lane 5, Rajpur Road, Dehradun, Uttarakhand",
    landlordPhone: user?.phone || "+91 98765 43210",
    tenantName: "Amit Negi",
    tenantFather: "Shri S. S. Negi",
    tenantPermanentAddress: "Village Pokhri, Pauri Garhwal, Uttarakhand",
    tenantPhone: "+91 98111 22334",
    propertyAddress: "2nd Floor Flat, 12 Kaulagarh Road, Dehradun - 248001",
    propertyType: "2 BHK Residential Flat",
    monthlyRent: "16500",
    securityDeposit: "33000",
    maintenanceCharges: "500",
    noticePeriodMonths: "1",
    electricityPayment: "Tenant shall pay monthly electricity bills as per separate sub-meter reading.",
    waterCharges: "Included in monthly maintenance / continuous municipal supply.",
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
          <div className="inline-flex items-center gap-2 bg-white/95 border border-[#93C5FD] text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
            <Icon name="description" size={15} />
            <span>Uttarakhand Standard 11-Month Residential Leave &amp; License Draft</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            11-Month Digital Rental Agreement Generator
          </h1>
          <p className="mt-2 text-[#717171] max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Lawyer-drafted, compliant with Uttarakhand tenancy norms. Draft your agreement in minutes, print on non-judicial e-Stamp paper, and move in safely without broker fees.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* e-Stamping Legal Guidance Strip */}
        <div className="mb-8 p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-blue-700 flex items-center justify-center shrink-0">
              <Icon name="gavel" size={22} fill />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E40AF]">
                Uttarakhand e-Stamping &amp; Legal Validity Guide
              </h3>
              <p className="text-xs text-[#1D4ED8] mt-0.5 leading-relaxed">
                Agreements for 11 months do not require mandatory sub-registrar office registration. Print this draft on a ₹100 or ₹500 non-judicial e-Stamp paper (available at any CSC center or StockHolding Uttarakhand portal).
              </p>
            </div>
          </div>
          <a
            href="https://www.shcilestamp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <span>StockHolding e-Stamp Portal</span>
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
            <span>1. Fill Agreement Terms</span>
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              previewMode ? "border-[#FF385C] text-[#FF385C]" : "border-transparent text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon name="visibility" size={18} />
            <span>2. View Legal Agreement Draft</span>
          </button>
        </div>

        {!previewMode ? (
          /* ================================================================= */
          /* FORM ENTRY VIEW                                                   */
          /* ================================================================= */
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EBEBEB] shadow-sm space-y-8">
            {/* Step 1: Parties */}
            <div>
              <h3 className="font-bold text-base text-[#222222] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#222222] text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Landlord (Lessor) &amp; Tenant (Lessee)</span>
              </h3>
              <p className="text-xs text-[#717171] mb-4">Official names and addresses as per Aadhaar.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Landlord Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.landlordName}
                    onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Landlord Father&apos;s Name *
                  </label>
                  <input
                    type="text"
                    value={formData.landlordFather}
                    onChange={(e) => setFormData({ ...formData, landlordFather: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Landlord Residential Address *
                  </label>
                  <input
                    type="text"
                    value={formData.landlordAddress}
                    onChange={(e) => setFormData({ ...formData, landlordAddress: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Father&apos;s Name *
                  </label>
                  <input
                    type="text"
                    value={formData.tenantFather}
                    onChange={(e) => setFormData({ ...formData, tenantFather: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Tenant Permanent Hometown Address *
                  </label>
                  <input
                    type="text"
                    value={formData.tenantPermanentAddress}
                    onChange={(e) => setFormData({ ...formData, tenantPermanentAddress: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Property & Financial Terms */}
            <div className="pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-bold text-base text-[#222222] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#222222] text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Premises &amp; Financial Terms</span>
              </h3>
              <p className="text-xs text-[#717171] mb-4">Rent, security deposit, and lease start date.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Rented Property Address in Uttarakhand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Property Configuration
                  </label>
                  <input
                    type="text"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-1.5">
                    Lease Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#222222] text-[#222222]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#EBEBEB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#717171]">
                Generates complete 12 standard legal clauses protecting both parties.
              </span>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="btn-cta-primary px-6 py-3 text-xs sm:text-sm w-full sm:w-auto"
              >
                <span>Generate Legal Agreement Draft →</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* PRINTABLE AGREEMENT DRAFT VIEW                                    */
          /* ================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 border border-[#DDDDDD] hover:bg-[#F7F7F7] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Icon name="arrow_back" size={16} />
                <span>Back to Edit Terms</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-[#222222] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Icon name="print" size={16} />
                <span>Print Legal Agreement Draft / PDF</span>
              </button>
            </div>

            {/* Official Legal Draft Document */}
            <div className="bg-white p-8 sm:p-14 rounded-2xl border-2 border-[#222222] shadow-xl max-w-4xl mx-auto text-[#222222] font-serif leading-relaxed print:border-none print:shadow-none print:p-0 text-xs sm:text-sm space-y-5">
              
              <div className="text-center pb-6 border-b-2 border-[#222222]">
                <p className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#717171]">
                  (To be executed on Non-Judicial Stamp Paper of Rs. 100/- or higher)
                </p>
                <h2 className="text-lg sm:text-xl font-bold uppercase mt-2">
                  RESIDENTIAL LEAVE &amp; LICENSE AGREEMENT
                </h2>
                <p className="text-xs font-sans mt-1">
                  For an eleven (11) month residential tenancy in the State of Uttarakhand
                </p>
              </div>

              <p>
                This <strong>LEAVE AND LICENSE AGREEMENT</strong> is made and executed at <strong>{formData.city}</strong>, Uttarakhand, on this <strong>{new Date(formData.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>, by and between:
              </p>

              <div className="bg-[#F9F9F9] p-4 rounded-xl border border-[#EBEBEB] space-y-2">
                <p>
                  <strong>1. THE LICENSOR / LANDLORD (FIRST PARTY):</strong><br />
                  <strong>{formData.landlordName}</strong>, Son/Daughter of {formData.landlordFather}, residing at {formData.landlordAddress}, Phone: {formData.landlordPhone} (hereinafter called the &ldquo;FIRST PARTY&rdquo;).
                </p>
                <p className="text-center font-bold text-xs">AND</p>
                <p>
                  <strong>2. THE LICENSEE / TENANT (SECOND PARTY):</strong><br />
                  <strong>{formData.tenantName}</strong>, Son/Daughter of {formData.tenantFather}, permanent resident of {formData.tenantPermanentAddress}, Phone: {formData.tenantPhone} (hereinafter called the &ldquo;SECOND PARTY&rdquo;).
                </p>
              </div>

              <p>
                WHEREAS the First Party is the absolute owner of the residential property situated at: <strong>{formData.propertyAddress}</strong> (&ldquo;Scheduled Premises&rdquo;).
              </p>

              <h4 className="font-bold text-sm uppercase pt-2 border-t border-[#DDDDDD]">
                NOW THIS AGREEMENT WITNESSETH AS UNDER:
              </h4>

              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>TENURE:</strong> This License is granted for a fixed period of <strong>{formData.durationMonths} months</strong> commencing from <strong>{formData.startDate}</strong> and expiring on completion of the tenure unless terminated earlier.
                </li>
                <li>
                  <strong>LICENSE FEE / RENT:</strong> The Second Party agrees to pay a monthly rent of <strong>₹{Number(formData.monthlyRent).toLocaleString("en-IN")}/-</strong> (Rupees in words) per month on or before the 7th day of every English calendar month.
                </li>
                <li>
                  <strong>SECURITY DEPOSIT:</strong> The Second Party has paid an interest-free refundable security deposit of <strong>₹{Number(formData.securityDeposit).toLocaleString("en-IN")}/-</strong> to the First Party. This amount shall be refunded upon vacating after deducting any unpaid electricity, water, or damage charges.
                </li>
                <li>
                  <strong>UTILITIES:</strong> {formData.electricityPayment} {formData.waterCharges}
                </li>
                <li>
                  <strong>RESIDENTIAL USE ONLY:</strong> The premises shall be used purely for peaceful residential purposes. No commercial or illegal activity shall be conducted on the premises.
                </li>
                <li>
                  <strong>POLICE VERIFICATION:</strong> The Second Party undertakes to submit full identity proofs (Aadhaar / Voter ID) for mandatory Uttarakhand Police tenant verification as required under state law.
                </li>
                <li>
                  <strong>NOTICE PERIOD:</strong> Either party may terminate this agreement by serving a prior written notice of <strong>{formData.noticePeriodMonths} month(s)</strong> or paying rent in lieu thereof.
                </li>
              </ol>

              <div className="pt-12 flex justify-between items-end font-sans text-xs font-bold">
                <div className="text-center">
                  <div className="border-t border-[#222222] pt-1 w-44">
                    Signature of Licensor / Landlord
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-[#222222] pt-1 w-44">
                    Signature of Licensee / Tenant
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#DDDDDD] grid grid-cols-2 gap-6 text-[11px] font-sans text-[#555555]">
                <div>
                  <p className="font-bold">WITNESS 1:</p>
                  <p>Name: ______________________</p>
                  <p>Signature: __________________</p>
                </div>
                <div>
                  <p className="font-bold">WITNESS 2:</p>
                  <p>Name: ______________________</p>
                  <p>Signature: __________________</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

