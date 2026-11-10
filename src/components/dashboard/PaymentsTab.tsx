"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

const PLANS = [
  {
    id: "FREE",
    name: "Starter Direct",
    price: 0,
    subtitle: "For individual Uttarakhand homeowners & renters",
    limit: 2,
    features: [
      "Up to 2 active property listings",
      "Direct Renter-to-Owner chat & call",
      "Zero brokerage guarantee",
      "Aadhaar KYC trust badge",
    ],
  },
  {
    id: "OWNER_PREMIUM",
    name: "Owner Pro",
    price: 999,
    popular: true,
    subtitle: "Boost visibility across Dehradun, Rishikesh & Mussoorie",
    limit: 15,
    features: [
      "Up to 15 active property listings",
      "Featured placement in search results",
      "Digital Rental Agreement generator",
      "Priority WhatsApp & Email lead alerts",
    ],
  },
  {
    id: "BROKER_MONTHLY",
    name: "Portfolio / Agency",
    price: 2999,
    subtitle: "For multi-property hosts, PGs & verified hill estates",
    limit: 100,
    features: [
      "Unlimited active listings",
      "Full Lead CRM & Conversion Analytics",
      "Dedicated Relationship Manager",
      "Instant Featured badge on top listings",
    ],
  },
];

export function PaymentsTab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");
  const [customPurpose, setCustomPurpose] = useState("Monthly Rent / Security Deposit");

  const { data, isLoading } = useQuery({
    queryKey: ["user-payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Failed to load billing data");
      return res.json();
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (payload: { amount: number; purpose: string; planName?: string }) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Payment failed");
      }
      return res.json();
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ["user-payments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast(
        `Transaction ${resData.payment?.transactionId} recorded successfully!`,
        "success"
      );
      setCustomAmount("");
    },
    onError: (err: any) => {
      showToast(err.message || "Payment failed", "error");
    },
  });

  const activePlanId = data?.activeSubscription?.planName || "FREE";
  const currentPlan = PLANS.find((p) => p.id === activePlanId) || PLANS[0];
  const payments = data?.payments || [];
  const propertiesCount = data?.propertiesCount || 0;
  const nextBillingDate = data?.activeSubscription?.endDate
    ? new Date(data.activeSubscription.endDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No recurring charge (Free Plan)";

  const handleDownloadReceipt = (payment: any) => {
    const content = [
      "==========================================",
      "         GHAR FOUNDATION RECEIPT          ",
      "==========================================",
      `Transaction ID : ${payment.transactionId}`,
      `Date           : ${new Date(payment.createdAt).toLocaleString("en-IN")}`,
      `Customer       : ${user?.name || "Verified User"} (${user?.email || ""})`,
      `Purpose        : ${payment.purpose}`,
      `Amount Paid    : INR ${Number(payment.amount).toLocaleString("en-IN")}`,
      `Status         : ${payment.status}`,
      "==========================================",
      "Zero-Brokerage Verified Rental Platform — Uttarakhand",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${payment.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-3.5 sm:p-5 space-y-5 max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Billing &amp; Membership</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">
            Payments, Plans &amp; Receipts
          </h1>
          <p className="text-xs sm:text-sm text-[#717171] mt-1">
            Manage your Ghar Foundation membership, rent receipts, and transaction history.
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-[#EBEBEB] rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
          <Icon name="event" size={18} className="text-[#FF385C]" />
          <div>
            <p className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
              Renewal / Cycle
            </p>
            <p className="text-xs font-bold text-[#222222]">{nextBillingDate}</p>
          </div>
        </div>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Active Plan Card */}
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-[#008A05]/10 text-[#008A05] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Active Membership
              </span>
              <span className="text-xs font-semibold text-[#717171]">
                Account: {user?.name || "Member"}
              </span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="text-2xl font-bold text-[#222222]">{currentPlan.name}</h2>
              <div>
                <span className="text-2xl font-extrabold text-[#222222]">
                  ₹{currentPlan.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#717171] font-medium">/month</span>
              </div>
            </div>
            <p className="text-sm text-[#717171] mb-6">{currentPlan.subtitle}</p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#717171]">Active Property Listings Used</span>
                <span className="text-[#222222]">
                  {propertiesCount} / {currentPlan.limit} Listings
                </span>
              </div>
              <div className="w-full bg-[#F7F7F7] h-2 rounded-full overflow-hidden border border-[#EBEBEB]">
                <div
                  className="bg-[#FF385C] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((propertiesCount / currentPlan.limit) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#EBEBEB] text-xs font-semibold text-[#008A05]">
            <span className="flex items-center gap-1">
              <Icon name="verified" size={16} /> Zero Brokerage Protection
            </span>
            <span className="flex items-center gap-1">
              <Icon name="receipt_long" size={16} /> Instant GST/Rent Receipts
            </span>
          </div>
        </div>

        {/* Record Rent / Token Payment Box */}
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#222222]">
                Rent Ledger &amp; Verified Rent Receipts
              </h3>
              <span className="bg-[#E8F5E9] text-[#008A05] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                HRA Compliant
              </span>
            </div>
            <p className="text-xs text-[#717171] mb-5">
              Record verified direct bank transfer, UPI or cash rent payments to issue printable legal receipts.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Receipt Purpose
                </label>
                <select
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#222222] outline-none focus:border-[#222222]"
                >
                  <option value="Monthly Rent Payment">Monthly Rent Payment</option>
                  <option value="Refundable Security Deposit">Refundable Security Deposit</option>
                  <option value="Booking Token Advance">Booking Token Advance</option>
                  <option value="Maintenance / Society Charges">Maintenance / Society Charges</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Amount (₹ INR)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 12000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-4 py-2.5 text-sm font-bold text-[#222222] outline-none focus:border-[#222222]"
                  />
                  <button
                    disabled={paymentMutation.isPending || !customAmount || Number(customAmount) <= 0}
                    onClick={() =>
                      paymentMutation.mutate({
                        amount: Number(customAmount),
                        purpose: customPurpose,
                      })
                    }
                    className="bg-[#222222] hover:bg-black disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    {paymentMutation.isPending ? "Recording..." : "Record & Issue Receipt"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#717171] pt-4 mt-4 border-t border-[#EBEBEB]">
            <Icon name="verified" size={15} className="text-[#008A05]" />
            <span>Digital Rent Ledger • Verifiable transaction IDs for HRA tax exemption</span>
          </div>
        </div>
      </div>

      {/* Membership Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#222222]">Membership &amp; Hosting Tiers</h2>
            <p className="text-xs text-[#717171]">Zero commission on all leases. Upgrade for enhanced visibility.</p>
          </div>
          <span className="bg-[#E8F5E9] text-[#008A05] text-xs font-bold px-3 py-1 rounded-full border border-[#C8E6C9]">
            Early Launch: Starter Plan 100% Free
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = activePlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? "border-2 border-[#FF385C] shadow-md relative"
                    : "border border-[#EBEBEB] shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 bg-[#FF385C] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#222222]">{plan.name}</h3>
                  <p className="text-xs text-[#717171] mt-1 min-h-[32px]">{plan.subtitle}</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-[#222222]">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#717171] font-medium"> / month</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-xs font-medium text-[#222222]">
                        <Icon name="check_circle" size={16} className="text-[#008A05] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent || paymentMutation.isPending}
                  onClick={() =>
                    paymentMutation.mutate({
                      amount: plan.price,
                      purpose: `${plan.name} Plan Subscription`,
                      planName: plan.id,
                    })
                  }
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB] cursor-default"
                      : "bg-[#222222] hover:bg-black text-white"
                  }`}
                >
                  {isCurrent ? "Current Active Plan" : plan.price === 0 ? "Switch to Free" : `Activate ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Transaction & Invoice History */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EBEBEB] flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-[#222222]">Transaction & Receipt History</h3>
            <p className="text-xs text-[#717171]">
              All recorded rent payments, deposits, and plan subscriptions on your account.
            </p>
          </div>
          <span className="text-xs font-bold text-[#717171] bg-[#F7F7F7] px-3 py-1 rounded-full border border-[#EBEBEB]">
            {payments.length} {payments.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-[#717171]">Loading transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="receipt_long" size={32} className="text-[#B0B0B0] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#222222]">No transactions yet</p>
            <p className="text-xs text-[#717171] mt-0.5">
              When you pay rent, book a property, or upgrade a plan, your downloadable receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB]">
                <tr>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase">Date</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase">Transaction ID</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase">Purpose</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase">Amount</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase">Status</th>
                  <th className="py-3 px-5 text-[11px] font-bold text-[#717171] uppercase text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] text-xs">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#F7F7F7]/60">
                    <td className="py-3.5 px-5 font-medium text-[#222222]">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#717171]">{p.transactionId}</td>
                    <td className="py-3.5 px-5 font-semibold text-[#222222]">{p.purpose}</td>
                    <td className="py-3.5 px-5 font-bold text-[#222222]">
                      ₹{Number(p.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(p)}
                        className="inline-flex items-center gap-1 text-[#FF385C] hover:underline font-bold"
                      >
                        <Icon name="download" size={16} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

