"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/shared/Icon";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"kyc" | "properties">("kyc");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [kycFilter, setKycFilter] = useState<string>("ALL");

  // Fetch KYC Queue
  const { data: kycData, isLoading: isKycLoading } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/verifications");
      if (!res.ok) throw new Error("Failed to load KYC verifications");
      return res.json();
    },
  });

  // Fetch Properties
  const { data: propertiesData, isLoading: isPropsLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const res = await fetch("/api/admin/properties");
      if (!res.ok) throw new Error("Failed to load properties queue");
      return res.json();
    },
  });

  // KYC Mutation (Approve / Reject)
  const kycMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: "APPROVE" | "REJECT"; reason?: string }) => {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Action failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      showToast(data.message || "Updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update KYC", "error");
    },
  });

  // Property Moderation Mutation
  const propMutation = useMutation({
    mutationFn: async (payload: { propertyId: string; isVerified?: boolean; isFeatured?: boolean; delete?: boolean }) => {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Property update failed");
      return res.json();
    },
    onSuccess: (data) => {
      showToast(data.message || "Property updated", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update property", "error");
    },
  });

  const kycUsers: any[] = kycData?.users || [];
  const filteredKyc = kycUsers.filter((u) => {
    if (kycFilter === "ALL") return true;
    return u.kycStatus === kycFilter;
  });

  const properties: any[] = propertiesData?.properties || [];
  const pendingKycCount = kycUsers.filter((u) => u.kycStatus === "UNDER_REVIEW").length;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222] antialiased">
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-[#EBEBEB] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-extrabold text-lg text-[#222222]">
              Ghar <span className="text-[#FF385C]">Foundation</span>
            </Link>
            <span className="bg-[#222222] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Trust &amp; Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#717171] hidden sm:inline">
              Admin: <strong className="text-[#222222]">{user?.name || user?.email || "Superadmin"}</strong>
            </span>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 border border-[#DDDDDD] hover:bg-[#F7F7F7] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Icon name="arrow_back" size={15} />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#EBEBEB] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Pending KYC Reviews</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">{pendingKycCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Icon name="pending_actions" size={26} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEBEB] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Total Listings Active</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">{properties.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="apartment" size={26} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEBEB] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#717171] uppercase tracking-wider">Verified Properties</p>
              <p className="text-3xl font-extrabold text-[#008A05] mt-1">
                {properties.filter((p) => p.isVerified).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
              <Icon name="verified" size={26} fill />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#EBEBEB] space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("kyc")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "kyc"
                ? "border-[#FF385C] text-[#FF385C]"
                : "border-transparent text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon name="verified_user" size={18} />
            <span>Identity &amp; Aadhaar Submissions</span>
            {pendingKycCount > 0 && (
              <span className="bg-[#FF385C] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                {pendingKycCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "properties"
                ? "border-[#FF385C] text-[#FF385C]"
                : "border-transparent text-[#717171] hover:text-[#222222]"
            }`}
          >
            <Icon name="home_work" size={18} />
            <span>Property Listings Moderation ({properties.length})</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: KYC VERIFICATION QUEUE                                       */}
        {/* =================================================================== */}
        {activeTab === "kyc" && (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#717171]">Filter:</span>
              {["ALL", "UNDER_REVIEW", "VERIFIED", "REJECTED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setKycFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    kycFilter === f
                      ? "bg-[#222222] text-white"
                      : "bg-white border border-[#DDDDDD] text-[#717171] hover:border-[#222222]"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            {isKycLoading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#EBEBEB]">
                <Icon name="sync" size={24} className="animate-spin text-[#717171] mx-auto mb-2" />
                <p className="text-xs text-[#717171]">Loading KYC verification queue...</p>
              </div>
            ) : filteredKyc.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#EBEBEB]">
                <Icon name="check_circle" size={32} className="text-[#008A05] mx-auto mb-2" />
                <p className="font-bold text-sm text-[#222222]">No pending submissions matching &ldquo;{kycFilter}&rdquo;</p>
                <p className="text-xs text-[#717171] mt-1">All user identity verification requests are up to date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredKyc.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#EBEBEB] p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBEBEB]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-[#222222]">
                            {item.name || "Unnamed Resident"}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.kycStatus === "VERIFIED"
                              ? "bg-forest-100 text-forest-800"
                              : item.kycStatus === "UNDER_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.kycStatus || "PENDING"}
                          </span>
                        </div>
                        <p className="text-xs text-[#717171] mt-0.5">
                          Phone: <strong className="text-[#222222]">{item.phone || "N/A"}</strong> · Email: <strong className="text-[#222222]">{item.email || "N/A"}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono bg-[#F7F7F7] px-2.5 py-1 rounded-lg border border-[#EBEBEB]">
                          ID: {item.aadhaarMasked || "XXXX XXXX ••••"}
                        </span>
                        <span className="text-[11px] text-[#717171]">
                          Type: {item.kycDocumentType || "Aadhaar Card"}
                        </span>
                      </div>
                    </div>

                    {/* Document Photo Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front Photo */}
                      <div className="border border-[#EBEBEB] rounded-xl p-3 bg-[#F7F7F7]">
                        <p className="text-[11px] font-bold uppercase text-[#717171] mb-2 flex items-center justify-between">
                          <span>Front Photo (Name &amp; ID)</span>
                          {item.kycFrontUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(item.kycFrontUrl)}
                              className="text-[#FF385C] hover:underline normal-case text-xs"
                            >
                              Expand ↗
                            </button>
                          )}
                        </p>
                        {item.kycFrontUrl ? (
                          <div
                            onClick={() => setSelectedImage(item.kycFrontUrl)}
                            className="h-44 bg-white rounded-lg border border-[#EBEBEB] overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img src={item.kycFrontUrl} alt="Front ID" className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-32 bg-white rounded-lg border border-dashed border-[#DDDDDD] flex items-center justify-center text-xs text-[#717171]">
                            No front image uploaded
                          </div>
                        )}
                      </div>

                      {/* Back Photo */}
                      <div className="border border-[#EBEBEB] rounded-xl p-3 bg-[#F7F7F7]">
                        <p className="text-[11px] font-bold uppercase text-[#717171] mb-2 flex items-center justify-between">
                          <span>Back Photo (Address)</span>
                          {item.kycBackUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(item.kycBackUrl)}
                              className="text-[#FF385C] hover:underline normal-case text-xs"
                            >
                              Expand ↗
                            </button>
                          )}
                        </p>
                        {item.kycBackUrl ? (
                          <div
                            onClick={() => setSelectedImage(item.kycBackUrl)}
                            className="h-44 bg-white rounded-lg border border-[#EBEBEB] overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img src={item.kycBackUrl} alt="Back ID" className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="h-32 bg-white rounded-lg border border-dashed border-[#DDDDDD] flex items-center justify-center text-xs text-[#717171]">
                            No back image uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-[#717171]">
                        Submitted on {item.kycSubmittedAt ? new Date(item.kycSubmittedAt).toLocaleString("en-IN") : "Recently"}
                      </p>

                      <div className="flex items-center gap-2">
                        {item.kycStatus !== "REJECTED" && (
                          <button
                            disabled={kycMutation.isPending}
                            onClick={() => {
                              const reason = window.prompt("Rejection reason (sent to user):", "Document photo is blurry or unreadable.");
                              if (reason) {
                                kycMutation.mutate({ userId: item.id, action: "REJECT", reason });
                              }
                            }}
                            className="px-3.5 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                        )}

                        {item.kycStatus !== "VERIFIED" && (
                          <button
                            disabled={kycMutation.isPending}
                            onClick={() => kycMutation.mutate({ userId: item.id, action: "APPROVE" })}
                            className="px-4 py-1.5 bg-[#008A05] hover:bg-forest-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Icon name="check" size={15} />
                            <span>Approve Verification</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PROPERTIES MODERATION                                        */}
        {/* =================================================================== */}
        {activeTab === "properties" && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#222222]">All Properties on Ghar Foundation</h3>
              <span className="text-xs text-[#717171]">{properties.length} listings</span>
            </div>

            {isPropsLoading ? (
              <div className="p-8 text-center text-xs text-[#717171]">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#717171]">No properties posted yet.</div>
            ) : (
              <div className="divide-y divide-[#EBEBEB]">
                {properties.map((prop) => (
                  <div key={prop.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F7F7] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-[#EBEBEB] overflow-hidden shrink-0">
                        {prop.images?.[0]?.url ? (
                          <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#717171]">No img</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/property/${prop.id}`} className="font-bold text-sm text-[#222222] hover:underline line-clamp-1">
                            {prop.title}
                          </Link>
                          {prop.isVerified && (
                            <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Icon name="verified" size={11} fill /> Verified
                            </span>
                          )}
                          {prop.isFeatured && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#717171] mt-0.5">
                          {prop.city} · {prop.locality} · <strong className="text-[#222222]">₹{prop.rent?.toLocaleString("en-IN")}/mo</strong>
                        </p>
                        <p className="text-[11px] text-[#717171] mt-0.5">
                          Owner: {prop.owner?.name || "Direct Owner"} ({prop.owner?.phone || prop.owner?.email || "No phone"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => propMutation.mutate({ propertyId: prop.id, isVerified: !prop.isVerified })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          prop.isVerified
                            ? "bg-white border-[#DDDDDD] text-[#717171] hover:border-red-400 hover:text-red-600"
                            : "bg-[#008A05] text-white border-transparent hover:bg-forest-700"
                        }`}
                      >
                        {prop.isVerified ? "Remove Verified" : "Mark Verified"}
                      </button>

                      <button
                        onClick={() => propMutation.mutate({ propertyId: prop.id, isFeatured: !prop.isFeatured })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          prop.isFeatured
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : "bg-white border-[#DDDDDD] text-[#717171] hover:border-[#222222]"
                        }`}
                      >
                        {prop.isFeatured ? "Unfeature" : "Feature"}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Permanently delete this property listing?")) {
                            propMutation.mutate({ propertyId: prop.id, delete: true });
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Icon name="delete" size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal for Full ID Inspection */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img src={selectedImage} alt="Expanded ID Document" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
            <div className="p-3 text-center">
              <span className="text-xs font-bold text-[#717171]">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

