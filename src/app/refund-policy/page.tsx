import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/Icon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Ghar Foundation",
  description: "Read Ghar Foundation's transparent refund, cancellation, and fee terms for homeowners and tenants in Uttarakhand.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-[#222222] font-sans antialiased">
      <div className="hero-mesh-bg border-b border-[#EBEBEB] pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/95 border border-[#BBF7D0] text-[#16A34A] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
            <Icon name="verified" size={15} />
            <span>Fair &amp; Transparent Terms</span>
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight text-[#222222]">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-[#717171] max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Last Updated: November 2026 · Compliant with the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-8 text-xs sm:text-sm text-[#444444] leading-relaxed">
        
        {/* Core Principles */}
        <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
          <h3 className="font-bold text-sm text-[#166534] flex items-center gap-2">
            <Icon name="check_circle" size={18} fill />
            <span>100% Free Core Marketplace Guarantee</span>
          </h3>
          <p className="text-[#15803D]">
            Ghar Foundation is a zero-brokerage direct rental platform. Searching listings, contacting verified landlords via call or WhatsApp, scheduling in-person property tours, and basic property postings during our launch period are <strong>100% Free of Cost</strong>.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#222222]">
            1. Paid Services &amp; Add-ons Covered
          </h2>
          <p>
            This policy applies exclusively to optional, paid value-added services offered on Ghar Foundation, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Featured Listing Boosts:</strong> Enhanced placement on search results for property owners.</li>
            <li><strong>Compliance Assistance Packs:</strong> Physical delivery or doorstep coordination of legal agreements and police verification dossiers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#222222]">
            2. Cancellation Window &amp; Full Refund Eligibility
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Featured Boosts:</strong> If you purchase an optional listing boost and request cancellation within <strong>24 hours</strong> of purchase, a <strong>100% full refund</strong> will be issued provided the listing has not generated more than 3 direct tenant inquiries.
            </li>
            <li>
              <strong>Document &amp; Compliance Services:</strong> If you cancel before our compliance team has drafted or dispatched the legal documents, you are entitled to a complete 100% refund. Once stamp duty has been purchased or e-stamped through government portals, the statutory stamp duty amount is non-refundable.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#222222]">
            3. Pro-Rata Refunds
          </h2>
          <p>
            If your property is rented out within the first 7 days of an active 30-day Featured Boost, you may request a pro-rata credit or refund for the remaining unused days by writing to our helpdesk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#222222]">
            4. Refund Processing Timelines
          </h2>
          <p>
            Approved refunds are credited directly to your original payment method (Bank Account / UPI / Debit or Credit Card) within <strong>5 to 7 business days</strong>. You will receive an automated SMS/email confirmation containing the banking reference (UTR) number.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-base text-[#222222]">
            5. How to Request a Cancellation or Refund
          </h2>
          <p>
            To initiate a cancellation or refund request, please reach out to our team with your listing ID or registered mobile number:
          </p>
          <div className="p-4 bg-[#F7F7F7] rounded-xl border border-[#EBEBEB] space-y-1 text-xs">
            <p><strong>Email:</strong> support@gharfoundation.com</p>
            <p><strong>Helpdesk Phone:</strong> +91 79060 12345 (Mon–Sat, 9:30 AM to 6:30 PM)</p>
            <p><strong>Address:</strong> Plot No. 12, IT Park, Sahastradhara Road, Dehradun, Uttarakhand 248013</p>
          </div>
        </section>

      </div>
    </div>
  );
}

