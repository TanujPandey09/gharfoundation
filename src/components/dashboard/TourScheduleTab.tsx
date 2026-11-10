"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export function TourScheduleTab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tours");
      if (res.ok) {
        const data = await res.json();
        setTours(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleUpdateStatus = async (tourId: string, status: string) => {
    try {
      const res = await fetch(`/api/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTours((prev) => prev.map((t) => (t.id === tourId ? { ...t, status } : t)));
        showToast(`Tour visit marked as ${status.toLowerCase()}`, "success");
      } else {
        showToast("Failed to update tour status", "error");
      }
    } catch {
      showToast("Error updating tour status", "error");
    }
  };

  const handleCancelTour = async (tourId: string) => {
    try {
      const res = await fetch(`/api/tours/${tourId}`, { method: "DELETE" });
      if (res.ok) {
        setTours((prev) => prev.filter((t) => t.id !== tourId));
        showToast("Tour visit cancelled", "info");
      } else {
        showToast("Failed to cancel tour", "error");
      }
    } catch {
      showToast("Error cancelling tour", "error");
    }
  };

  const filteredTours = tours.filter((t) => (filter === "ALL" ? true : t.status === filter));

  return (
    <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 space-y-5">
      <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Appointments &amp; Visits</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Tour Schedule &amp; Property Visits</h1>
          <p className="text-xs sm:text-sm text-[#717171] mt-1">
            Manage upcoming property visits, confirm appointments, or reschedule tours.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-xl border border-[#EBEBEB] shrink-0">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === status
                  ? "bg-[#222222] text-white shadow-sm"
                  : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              {status === "ALL" ? `All (${tours.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-gray-100 animate-pulse border border-[#EBEBEB]" />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#FFF0F3] text-[#FF385C] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="calendar_month" size={32} />
          </div>
          <h2 className="text-lg font-bold text-[#222222] mb-1">No scheduled visits found</h2>
          <p className="text-sm text-[#717171] max-w-md mx-auto mb-6">
            When you book a property visit or a renter requests a tour of your listing, it will appear here.
          </p>
          <Link
            href="/search"
            className="btn-cta-primary text-sm px-6 py-3"
          >
            <Icon name="search" size={18} /> Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTours.map((tour) => {
            const isOwnerOfProperty = tour.property?.ownerId === user?.id;
            const dateStr = new Date(tour.scheduledDate || tour.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const coverImg =
              tour.property?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80";

            return (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border border-[#EBEBEB] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex gap-4">
                  <img
                    src={coverImg}
                    alt={tour.property?.title || "Property"}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#EBEBEB]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tour.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tour.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {tour.status}
                      </span>
                      <span className="text-xs font-semibold text-[#717171]">
                        {isOwnerOfProperty ? "Incoming Visit Request" : "My Visit Booking"}
                      </span>
                    </div>
                    <Link
                      href={`/properties/${tour.propertyId}`}
                      className="text-base font-bold text-[#222222] hover:text-[#FF385C] transition-colors line-clamp-1"
                    >
                      {tour.property?.title || "Uttarakhand Rental Property"}
                    </Link>
                    <p className="text-xs text-[#717171] truncate mt-0.5">
                      {tour.property?.areaName}, {tour.property?.city}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-[#222222]">
                      <span className="inline-flex items-center gap-1 bg-[#F7F7F7] px-2.5 py-1 rounded-lg">
                        <Icon name="event" size={14} className="text-[#FF385C]" /> {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F7F7F7] px-2.5 py-1 rounded-lg">
                        <Icon name="schedule" size={14} className="text-[#FF385C]" /> {tour.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between gap-2">
                  <div className="text-xs text-[#717171]">
                    {isOwnerOfProperty ? (
                      <span>
                        Visitor: <strong className="text-[#222222]">{tour.user?.name || "Renter"}</strong>
                        {tour.user?.phone ? ` • ${tour.user.phone}` : ""}
                      </span>
                    ) : (
                      <span>
                        Host: <strong className="text-[#222222]">{tour.property?.owner?.name || "Property Owner"}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwnerOfProperty && tour.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(tour.id, "APPROVED")}
                          className="px-3 py-1.5 bg-[#008A05] hover:bg-[#006e04] text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(tour.id, "REJECTED")}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleCancelTour(tour.id)}
                      className="px-3 py-1.5 border border-[#DDDDDD] hover:border-[#222222] text-[#222222] rounded-lg text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
