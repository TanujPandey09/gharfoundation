"use client";

import React, { useState, useEffect } from "react";
import { Property, Review } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import dynamic from "next/dynamic";
const PropertyMap = dynamic(() => import("@/components/property/PropertyMap"), { ssr: false });
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/shared/Icon";

interface PropertyDetailsContentProps {
  id: string;
}

export default function PropertyDetailsContent({ id }: PropertyDetailsContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  // API-based data loading
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  // Removed duplicate isLoading state, handled by useQuery

  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("ghar_favorites") || "[]");
      return favs.includes(id);
    }
    return false;
  });

  // Report listing states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReadMore, setIsReadMore] = useState(false);

  // Tour Booking States
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("10:30 AM");
  const [isSubmittingTour, setIsSubmittingTour] = useState(false);

  // Messaging States
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  // Safe Fallback Owner Object to prevent any runtime null crashes
  const safeOwner = owner || property?.owner || {
    id: "",
    name: "Verified Landlord",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    phone: "+919999999999",
    role: "OWNER",
  };

  const handleWhatsAppClick = async () => {
    try {
      if (property?.id) {
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.name || "Interested Renter",
            email: user?.email || "renter-inquiry@gharfoundation.com",
            phone: user?.phone || null,
            propertyName: property.title,
            rentAmount: String(property.rent),
            notes: "Direct WhatsApp inquiry from property detail page",
            status: "NEW",
          }),
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  };

  // Fetch property from API using React Query for Hydration support
  const { data: propertyData, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error("Failed to fetch property");
      return res.json();
    }
  });

  useEffect(() => {
    if (propertyData) {
      if (propertyData.success === false) {
         setProperty(null);
      } else {
         const data = propertyData.data || propertyData;
         setProperty(data);
         setOwner(data.owner || null);
         setReviews(data.reviews || []);
      }
    }
  }, [propertyData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 bg-background dark:bg-darkBackground transition-colors">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 bg-background dark:bg-darkBackground transition-colors">
        <Icon name="domain" className="mx-auto text-textSecondary" size={64} />
        <h2 className="font-sans font-bold text-2xl text-textPrimary dark:text-surface">
          Property Not Found
        </h2>
        <p className="text-sm text-textSecondary">
          The property you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/search"
          className="inline-block bg-primary hover:bg-primary-hover text-surface font-bold text-sm py-2.5 px-6 rounded-btn shadow-sm transition-colors"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (!user) {
      showToast("Please sign in to add to favorites", "warning");
      return;
    }

    if (isFavorite) {
      // Remove from favorites via API
      fetch(`/api/favorites/${property.id}`, { method: "DELETE" }).catch(() => {});
      setIsFavorite(false);
      showToast("Removed from favorites", "info");
    } else {
      // Add to favorites via API
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      }).catch(() => {});
      setIsFavorite(true);
      showToast("Added to favorites", "success");
    }

    // Also update localStorage for instant UI feedback
    const favs = JSON.parse(localStorage.getItem("ghar_favorites") || "[]");
    const updatedFavs = isFavorite
      ? favs.filter((fid: string) => fid !== property.id)
      : [...favs, property.id];
    localStorage.setItem("ghar_favorites", JSON.stringify(updatedFavs));
  };

  const handleOpenTourModal = () => {
    if (!user) {
      showToast("Please sign in to schedule a tour", "warning");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (owner?.id === user?.id) {
      showToast("You cannot schedule a tour on your own property", "warning");
      return;
    }
    setShowTourModal(true);
  };

  const handleOpenMessageModal = () => {
    if (!user) {
      showToast("Please sign in to send a message", "warning");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (safeOwner?.id === user?.id) {
      showToast("You cannot send messages to yourself", "warning");
      return;
    }
    setInitialMessage(`Hi ${safeOwner.name || "Host"}, I am interested in your property '${property.title}'. Is it still available?`);
    setShowMessageModal(true);
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourDate) {
      showToast("Please select a date", "warning");
      return;
    }
    setIsSubmittingTour(true);
    try {
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          date: tourDate,
          time: tourTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule tour");
      }
      showToast("Tour scheduled successfully!", "success");
      setShowTourModal(false);
      router.push("/dashboard?tab=schedule");
    } catch (err: any) {
      showToast(err.message || "Failed to schedule tour", "error");
    } finally {
      setIsSubmittingTour(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialMessage.trim()) {
      showToast("Please enter a message", "warning");
      return;
    }
    setIsSubmittingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: safeOwner.id,
          propertyId: id,
          content: initialMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      showToast("Message sent successfully!", "success");
      setShowMessageModal(false);
      router.push("/dashboard?tab=messages");
    } catch (err: any) {
      showToast(err.message || "Failed to send message", "error");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: property.title,
          text: property.description,
          url,
        })
        .then(() => showToast("Link shared successfully", "success"))
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Listing URL copied to clipboard", "success");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to leave a review", "warning");
      return;
    }
    if (!newComment.trim()) {
      showToast("Please write a comment", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/properties/${property.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      if (res.ok) {
        const review = await res.json();
        setReviews((prev) => [review, ...prev]);
        setNewComment("");
        setNewRating(5);
        showToast("Review submitted successfully", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit review", "error");
      }
    } catch {
      showToast("Failed to submit review", "error");
    }
  };

  const submitReport = async () => {
    if (!user) {
      showToast("Please sign in to report this listing", "warning");
      return;
    }
    if (!reportReason.trim()) {
      showToast("Please provide a reason", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/properties/${property.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (res.ok) {
        showToast("Thank you. Listing reported. Our admins will investigate.", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit report", "error");
      }
    } catch {
      showToast("Failed to submit report", "error");
    }

    setShowReportModal(false);
    setReportReason("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* 1. Mobile Details View (< lg) */}
      <div className="lg:hidden pb-24 bg-white dark:bg-[#14100D] min-h-screen text-[#0A0A0A] dark:text-gray-100 transition-colors duration-200 relative">
        {/* Top Image Slider & Navigation overlay */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[activeImageIdx].url}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-textSecondary bg-slate-100 dark:bg-slate-900">
              No Image Available
            </div>
          )}

          {/* Header buttons overlay */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm flex items-center justify-center shadow-md text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all"
              title="Go Back"
            >
              <Icon name="arrow_back" size={20} />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm flex items-center justify-center shadow-md text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all"
              title="Share"
            >
              <Icon name="share" size={20} />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-sm flex items-center justify-center shadow-md text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all"
              title="Save"
            >
              <Icon
                name="favorite"
                size={20}
                fill={isFavorite}
                className={isFavorite ? "text-error" : "text-slate-800 dark:text-white"}
              />
            </button>
          </div>

          {/* Verified Pill */}
          {property.isVerified && (
            <div className="absolute bottom-4 left-4 bg-emerald-600/95 backdrop-blur-sm text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md z-10">
              <Icon name="verified" size={14} className="text-white fill-current" />
              <span>Verified Property</span>
            </div>
          )}

          {/* Dot Indicators */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {property.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIdx ? "bg-white w-3" : "bg-white/50 w-1.5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="px-4 py-5 space-y-6">
          {/* Title & Price Info */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1">
              <h2 className="font-sans font-extrabold text-xl text-[#C2522D] dark:text-white leading-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="location_on" size={14} className="text-[#C2522D]" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-[#C2522D] tracking-tight">
                {formatPrice(property.rent)}
              </p>
              <span className="text-[8px] font-extrabold text-gray-400 dark:text-slate-500 block uppercase tracking-wider mt-0.5">
                PER MONTH
              </span>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-3 gap-3 border-y border-gray-100 dark:border-slate-800/80 py-4.5">
            <div className="bg-slate-50 dark:bg-[#1F1A17] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Icon name="hotel" className="text-[#C2522D] mb-1" size={20} />
              <span className="text-xs font-extrabold text-slate-850 dark:text-white">{property.bedrooms} BHK</span>
              <span className="text-[8px] font-bold text-gray-450 dark:text-slate-500 uppercase tracking-wider mt-0.5">BEDROOMS</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#1F1A17] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Icon name="bathtub" className="text-[#C2522D] mb-1" size={20} />
              <span className="text-xs font-extrabold text-slate-850 dark:text-white">{property.bathrooms} Bath</span>
              <span className="text-[8px] font-bold text-gray-450 dark:text-slate-500 uppercase tracking-wider mt-0.5">BATHROOMS</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#1F1A17] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Icon name="square_foot" className="text-[#C2522D] mb-1" size={20} />
              <span className="text-xs font-extrabold text-slate-850 dark:text-white">{property.area} sqft</span>
              <span className="text-[8px] font-bold text-gray-450 dark:text-slate-500 uppercase tracking-wider mt-0.5">SUPER AREA</span>
            </div>
          </div>

          {/* About this Home */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-[#C2522D] dark:text-white uppercase tracking-wider">
              About this Home
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {isReadMore ? property.description : `${property.description.slice(0, 160)}...`}
            </p>
            <button
              onClick={() => setIsReadMore(!isReadMore)}
              className="text-xs font-extrabold text-[#C2522D] hover:underline flex items-center gap-0.5"
            >
              <span>{isReadMore ? "Read Less" : "Read More"}</span>
              <Icon name={isReadMore ? "expand_less" : "expand_more"} size={16} />
            </button>
          </div>

          {/* Top Amenities */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#C2522D] dark:text-white uppercase tracking-wider">
              Top Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {property.amenities.slice(0, 4).map((am) => {
                let amenityIcon = "check_circle";
                if (am.name.toLowerCase().includes("wifi") || am.name.toLowerCase().includes("internet")) amenityIcon = "wifi";
                else if (am.name.toLowerCase().includes("pool")) amenityIcon = "pool";
                else if (am.name.toLowerCase().includes("gym") || am.name.toLowerCase().includes("fitness")) amenityIcon = "fitness_center";
                else if (am.name.toLowerCase().includes("parking")) amenityIcon = "local_parking";
                else if (am.name.toLowerCase().includes("security")) amenityIcon = "security";
                else if (am.name.toLowerCase().includes("balcony")) amenityIcon = "balcony";
                else if (am.name.toLowerCase().includes("kitchen")) amenityIcon = "countertops";
                else if (am.name.toLowerCase().includes("geyser") || am.name.toLowerCase().includes("fire")) amenityIcon = "fireplace";

                return (
                  <div
                    key={am.id}
                    className="bg-slate-50 dark:bg-[#1F1A17] rounded-xl p-3 flex items-center gap-3 border border-gray-100 dark:border-slate-800/40"
                  >
                    <Icon name={amenityIcon} className="text-[#C2522D] shrink-0" size={18} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{am.name}</span>
                  </div>
                );
              })}
            </div>
            {property.amenities.length > 4 && (
              <button
                onClick={() => showToast("Showing all amenities overlay (Simulated)", "info")}
                className="w-full border border-gray-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center mt-1"
              >
                Show All {property.amenities.length} Amenities
              </button>
            )}
          </div>

          {/* Locality Insights */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-[#C2522D] dark:text-white uppercase tracking-wider">
                Locality Insights
              </h3>
              <button
                onClick={() => showToast("Map location details centered", "info")}
                className="text-xs font-bold text-[#C2522D] hover:underline"
              >
                View on Map
              </button>
            </div>
            <div className="h-44 rounded-2xl overflow-hidden border border-gray-150 dark:border-slate-800 relative shadow-sm">
              <PropertyMap properties={[property]} selectedProperty={property} />
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="bg-slate-50 dark:bg-[#1F1A17] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800/40">
                <Icon name="directions_transit" className="text-amber-500" size={16} />
                <span>Metro (8 min)</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#1F1A17] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800/40">
                <Icon name="local_mall" className="text-purple-500" size={16} />
                <span>Mall (5 min)</span>
              </div>
            </div>
          </div>

          {/* Listed By Owner */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#C2522D] dark:text-white uppercase tracking-wider">
              Listed By
            </h3>
            <div className="bg-slate-50 dark:bg-[#1F1A17] p-4 rounded-2xl border border-gray-150/60 dark:border-slate-800/50 flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-full shrink-0">
                <img
                  src={safeOwner.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                  alt={safeOwner.name || "Owner"}
                  className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1F1A17] rounded-full flex items-center justify-center text-white text-[8px]">
                  <Icon name="check" size={8} className="text-white fill-current" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {safeOwner.name || "Verified Landlord"}
                </h4>
                <p className="text-[10px] text-gray-505 dark:text-gray-400 font-semibold mt-0.5 flex items-center gap-1.5">
                  <span>Elite Host</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
                  <span>12 Properties</span>
                </p>
                <p className="text-[10px] text-amber-500 font-bold mt-0.5 flex items-center gap-1">
                  <span>⭐ 4.9</span>
                  <span className="text-gray-450 dark:text-gray-500 font-semibold">(42 Reviews)</span>
                </p>
              </div>
            </div>
          </div>

          {/* What Residents Say */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#C2522D] dark:text-white uppercase tracking-wider">
              What Residents Say
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {/* Review Card 1 */}
              <div className="min-w-[280px] max-w-[290px] snap-center bg-white dark:bg-[#1F1A17] p-4 rounded-2xl border border-gray-150/60 dark:border-slate-800/80 flex flex-col gap-2.5 shadow-sm shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FDF3EE] dark:bg-emerald-950 flex items-center justify-center text-[#C2522D] text-xs font-bold shrink-0">
                    AS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ananya Singh</h4>
                    <div className="flex items-center text-amber-500 space-x-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Icon key={i} name="star" size={10} className="text-amber-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-350 leading-relaxed italic">
                  "The view is absolutely breathtaking. Ghar Foundation's KYC process was seamless and professional."
                </p>
              </div>

              {/* Review Card 2 */}
              <div className="min-w-[280px] max-w-[290px] snap-center bg-white dark:bg-[#1F1A17] p-4 rounded-2xl border border-gray-150/60 dark:border-slate-800/80 flex flex-col gap-2.5 shadow-sm shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E3F0EA] dark:bg-emerald-950 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                    VK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Vikram Kapoor</h4>
                    <div className="flex items-center text-amber-500 space-x-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Icon key={i} name="star" size={10} className="text-amber-500 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-355 leading-relaxed italic">
                  "Zero brokerage simulation is absolutely accurate. Beautiful place and premium service."
                </p>
              </div>
            </div>
          </div>

          {/* Report Link */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-semibold text-error hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Icon name="report" size={14} />
              <span>Report this listing as fake or misleading</span>
            </button>
          </div>
        </div>

        {/* Sticky Bottom Action Drawer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14100D]/95 border-t border-gray-150 dark:border-slate-850 px-4 py-3.5 flex items-center gap-3 backdrop-blur-md shadow-2xl">
          <a
            href={`tel:${safeOwner.phone || "+919999999999"}`}
            className="h-12 w-12 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1F1A17] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all shrink-0"
            title="Call Host"
          >
            <Icon name="phone" size={18} />
          </a>
          <a
            href={`https://wa.me/${safeOwner.phone?.replace("+", "") || "919999999999"}?text=Hi%20${encodeURIComponent(safeOwner.name || "Host")},%20I%20saw%20your%20listing%20'${encodeURIComponent(property.title)}'%20on%20Ghar%20Foundation.%20Is%20it%20available?`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="h-12 w-12 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 bg-white dark:bg-[#1F1A17] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all shrink-0"
            title="WhatsApp Host"
          >
            <Icon name="chat" size={18} />
          </a>
          <button
            onClick={handleOpenTourModal}
            className="flex-1 bg-[#C2522D] hover:bg-[#A8431F] dark:bg-[#C2522D] dark:hover:bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-sans font-bold text-xs text-center transition-all shadow-md active:scale-[0.98] transition-all"
          >
            Schedule Visit
          </button>
        </div>
      </div>

      {/* 2. Desktop Details View (>= lg) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 md:px-8 py-6 space-y-8 bg-background dark:bg-darkBackground transition-colors">
        {/* Back Button & Title Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-1.5 text-xs text-textSecondary hover:text-primary font-semibold"
            >
              <Icon name="arrow_back" size={16} />
              <span>Go Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-extrabold text-4xl lg:text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight tracking-tighter">
                {property.title}
              </h1>
              {property.isVerified && (
                <Icon
                  name="verified"
                  size={22}
                  className="text-primary fill-current shrink-0"
                />
              )}
            </div>
            <div className="flex items-center text-xs text-textSecondary">
              <Icon name="location_on" size={16} className="text-primary mr-1.5 shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Floating action tray */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-btn border flex items-center space-x-1.5 text-xs font-semibold transition-all ${
                isFavorite
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 text-error"
                  : "bg-surface dark:bg-slate-800 border-border dark:border-slate-700 text-textSecondary dark:text-textSecondary hover:bg-slate-50 dark:hover:bg-slate-750"
              }`}
            >
              <Icon
                name="favorite"
                size={16}
                fill={isFavorite}
                className={isFavorite ? "text-error" : "text-textSecondary"}
              />
              <span className="hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-btn border border-border dark:border-slate-700 bg-surface dark:bg-slate-800 text-textSecondary dark:text-textSecondary hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-[0.98] transition-all"
            >
              <Icon name="share" size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-btn border border-red-200/50 dark:border-red-950/30 bg-red-50/30 dark:bg-red-950/10 text-error hover:bg-red-50 dark:hover:bg-red-950/25 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Icon name="report" size={16} />
              <span className="hidden sm:inline">Report Fake</span>
            </button>
          </div>
        </div>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main image viewer */}
          <div className="lg:col-span-9 relative h-72 sm:h-[500px] h-[400px] lg:h-[600px] w-full rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-lg">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[activeImageIdx].url}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-textSecondary">
                No Image
              </div>
            )}

            {property.images && property.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIdx(
                      (prev) => (prev - 1 + property.images.length) % property.images.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-surface hover:bg-black/80 transition-colors"
                >
                  <Icon name="chevron_left" size={20} />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev + 1) % property.images.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-surface hover:bg-black/80 transition-colors"
                >
                  <Icon name="chevron_right" size={20} />
                </button>
              </>
            )}

            {/* Featured tag */}
            {property.isFeatured && (
              <span className="absolute top-4 left-4 bg-accent text-textPrimary text-xs font-bold px-3 py-1 rounded-btn shadow-md uppercase tracking-wider">
                Featured Listing
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto max-h-[500px] lg:max-h-[600px] gap-4 pb-2 lg:pb-0 scrollbar-hide pr-2">
            {property.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative h-20 w-28 lg:w-full lg:h-28 rounded-btn overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeImageIdx
                    ? "border-primary scale-[0.98] shadow-sm"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="thumbnail" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:p-6 md:p-8 items-start">
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* Price Overview Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider">
                  Monthly Rent
                </span>
                <p className="text-xl md:text-2xl font-sans font-bold text-primary dark:text-primary">
                  {formatPrice(property.rent)}
                </p>
                <span className="text-[10px] text-textSecondary block">
                  Excluding Maintenance
                </span>
              </div>
              <div className="space-y-1 border-x border-divider dark:border-slate-750">
                <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider">
                  Security Deposit
                </span>
                <p className="text-xl md:text-2xl font-sans font-bold text-textPrimary dark:text-surface">
                  {formatPrice(property.deposit)}
                </p>
                <span className="text-[10px] text-textSecondary block">Refundable</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-textSecondary tracking-wider">
                  Maintenance
                </span>
                <p className="text-xl md:text-2xl font-sans font-bold text-textPrimary dark:text-surface">
                  {property.maintenance > 0 ? formatPrice(property.maintenance) : "₹0"}
                </p>
                <span className="text-[10px] text-textSecondary block">Per Month</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-4">
              <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface">
                Description
              </h3>
              <p className="text-xs text-textSecondary leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Specification grid */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-4">
              <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface">
                Property Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-xs">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Type
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {property.propertyType.replace("_", " ")}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Furnishing
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface capitalize">
                    {property.isFurnished.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Super Area
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {property.area} Sq. Ft.
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Available From
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {new Date(property.availableFrom).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Bedrooms
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {property.bedrooms} BHK
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Bathrooms
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {property.bathrooms} Bath
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Balcony
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    {property.balcony} Balconies
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
                  <span className="text-textSecondary block font-bold text-[10px] uppercase tracking-wider mb-1">
                    Floor Number
                  </span>
                  <span className="font-bold text-textPrimary dark:text-surface">
                    Floor {property.floor}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities & Utilities */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-4">
              <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface">
                Amenities & Utilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((am) => (
                  <div
                    key={am.id}
                    className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700/50"
                  >
                    <Icon name="check_circle" size={16} className="text-primary shrink-0" />
                    <span>{am.name}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <Icon name="check_circle" size={16} className="text-primary shrink-0" />
                  <span>Water: {property.waterSupply || "Municipal Link"}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <Icon name="check_circle" size={16} className="text-primary shrink-0" />
                  <span>Electricity: {property.electricity || "Standard"}</span>
                </div>
                {property.internet && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <Icon name="check_circle" size={16} className="text-primary shrink-0" />
                    <span>WiFi Router Installed</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <Icon name="check_circle" size={16} className="text-primary shrink-0" />
                    <span>Reserved Gated Parking</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Places Grid */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-4">
              <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface">
                Nearby Access Points
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-btn">
                  <Icon name="school" size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-textPrimary dark:text-surface">Schools & Institutes</p>
                    <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                      Doon School / local colleges (within 2 km)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-btn">
                  <Icon name="local_hospital" size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-textPrimary dark:text-surface">Hospitals & Clinics</p>
                    <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                      Max Super Speciality / Local Medicals (within 3 km)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-btn">
                  <Icon name="local_mall" size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-textPrimary dark:text-surface">Local Markets</p>
                    <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                      Vegetable mandis / general grocery stalls (within 500m)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-btn">
                  <Icon name="directions_bus" size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-textPrimary dark:text-surface">Transit Nodes</p>
                    <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                      ISBT Link / Local Bus/Auto stops (within 400m)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Panel */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-6">
              <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface flex items-center space-x-2">
                <span>Reviews & Ratings</span>
                <span className="bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">
                  {reviews.length} Comments
                </span>
              </h3>

              {/* List Reviews */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-textSecondary text-center py-4">
                    No reviews yet. Be the first to leave a review.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-btn bg-slate-50 dark:bg-slate-900 space-y-2 border border-border dark:border-slate-800/40 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <img
                            src={
                              rev.user?.image ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={rev.user?.name || "Renter"}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-textPrimary dark:text-gray-200">
                            {rev.user?.name || "Renter"}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-500 space-x-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Icon key={i} name="star" size={12} className="text-amber-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-textSecondary leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-textSecondary">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              {user ? (
                <form
                  onSubmit={submitReview}
                  className="space-y-4 pt-4 border-t border-divider dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-bold text-textPrimary dark:text-surface">Your Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Icon
                            name="star"
                            size={18}
                            className={star <= newRating ? "text-amber-500 fill-current" : "text-slate-300 dark:text-slate-650"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <textarea
                      placeholder="Write a helpful review about location, water supply, landlord terms..."
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-border dark:border-slate-700 rounded-input p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-textPrimary dark:text-surface"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-surface hover:bg-primary-hover font-bold p-3 rounded-btn self-end transition-colors active:scale-[0.98] transition-all"
                    >
                      <Icon name="send" size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-btn text-center text-xs text-textSecondary border border-border dark:border-slate-800">
                  Please{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    sign in
                  </Link>{" "}
                  to post a rating/comment.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Host Details Card & Location Map */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Host Contact Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-5">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block">
                Listed By
              </span>
              <div className="flex items-center space-x-3">
                <img
                  src={
                    safeOwner.image ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  }
                  alt={safeOwner.name || "Owner"}
                  className="h-12 w-12 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-sans font-bold text-sm text-textPrimary dark:text-surface truncate">
                    {safeOwner.name || "Verified Landlord"}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                      {safeOwner.role || "OWNER"}
                    </span>
                    <span className="text-[10px] text-textSecondary font-semibold flex items-center">
                      ⭐ 4.8 Rating
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`tel:${safeOwner.phone || "+919999999999"}`}
                  className="w-full bg-primary hover:bg-primary-hover text-surface font-semibold text-xs py-3 px-4 rounded-btn flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Icon name="phone" size={16} />
                  <span>Call Owner ({safeOwner.phone || "+91 999 999 9999"})</span>
                </a>

                <a
                  href={`https://wa.me/${
                    safeOwner.phone?.replace("+", "") || "919999999999"
                  }?text=Hi%20${encodeURIComponent(safeOwner.name || "Host")},%20I%20saw%20your%20listing%20'${
                    encodeURIComponent(property.title)
                  }'%20on%20Ghar%20Foundation.%20Is%20it%20available?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-surface font-semibold text-xs py-3 px-4 rounded-btn flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Icon name="chat" size={16} />
                  <span>Chat via WhatsApp</span>
                </a>

                <button
                  onClick={handleOpenTourModal}
                  type="button"
                  className="w-full bg-[#C2522D] hover:bg-[#A8431F] dark:bg-[#1F5D4A] dark:hover:bg-[#A8431F] text-surface font-semibold text-xs py-3 px-4 rounded-btn flex items-center justify-center space-x-2 transition-colors shadow-sm active:scale-[0.98] transition-all"
                >
                  <Icon name="event" size={16} />
                  <span>Schedule Physical Tour</span>
                </button>

                <button
                  onClick={handleOpenMessageModal}
                  type="button"
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-white font-semibold text-xs py-3 px-4 rounded-btn flex items-center justify-center space-x-2 transition-colors border border-gray-200 dark:border-slate-600 shadow-sm active:scale-[0.98] transition-all"
                >
                  <Icon name="chat_bubble_outline" size={16} />
                  <span>Message Host (On-Platform)</span>
                </button>
              </div>

              <p className="text-[9px] text-textSecondary text-center font-medium leading-relaxed">
                Shield Check: We never ask for payments before physical inspection. Always inspect
                keys and rent contract locally.
              </p>
            </div>

            {/* Small Map Card */}
            <div className="bg-surface dark:bg-slate-800 p-4 rounded-card border border-border dark:border-slate-750/60 shadow-premium dark:shadow-premiumDark space-y-3">
              <h4 className="font-sans font-bold text-xs text-textPrimary dark:text-surface uppercase tracking-wider">
                Geographical Location
              </h4>
              <div className="h-44 rounded-btn overflow-hidden relative">
                <PropertyMap properties={[property]} selectedProperty={property} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-textSecondary font-semibold">
                <span>Lat: {property.latitude}</span>
                <span>Lng: {property.longitude}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REPORT LISTING DRAWER / MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-slate-900 rounded-dialog max-w-md w-full p-6 space-y-4 shadow-xl border border-border dark:border-slate-800 animate-scaleIn">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2 text-error">
                <Icon name="report" size={20} />
                <h3 className="font-sans font-bold text-base text-textPrimary dark:text-surface">
                  Report Fake Listing
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-textSecondary hover:text-textPrimary dark:hover:text-surface"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              If this property has already been rented, contains incorrect rent amounts, displays
              stolen photos, or the host is asking for advanced reservation fees without visiting,
              please report it below.
            </p>
            <textarea
              placeholder="Provide details (e.g. Host asked for advance payment, duplicate listing...)"
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-border dark:border-slate-800 rounded-input p-3 text-xs focus:outline-none focus:ring-1 focus:ring-error text-textPrimary dark:text-surface"
            />
            <div className="flex space-x-3 justify-end pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-border dark:border-slate-850 rounded-btn text-xs font-semibold text-textSecondary hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-error text-surface rounded-btn text-xs font-bold hover:bg-red-750 transition-colors active:scale-[0.98] transition-all"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TOUR SCHEDULING MODAL */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-150 dark:border-slate-800 animate-scaleIn">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-[#C2522D] dark:text-emerald-400">
                <Icon name="event" size={22} />
                <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                  Schedule Physical Tour
                </h3>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select a date and time slot to visit this property. The host will review and approve or suggest a different time slot.
            </p>
            <form onSubmit={handleTourSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1.5">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1.5">
                  Preferred Time Slot
                </label>
                <select
                  value={tourTime}
                  onChange={(e) => setTourTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="09:00 AM">09:00 AM (Morning)</option>
                  <option value="10:30 AM">10:30 AM (Morning)</option>
                  <option value="12:00 PM">12:00 PM (Noon)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="03:30 PM">03:30 PM (Afternoon)</option>
                  <option value="05:00 PM">05:00 PM (Evening)</option>
                </select>
              </div>

              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTourModal(false)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTour}
                  className="px-5 py-2.5 bg-[#C2522D] dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-[#A8431F] dark:hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSubmittingTour ? "Scheduling..." : "Confirm Booking Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MESSAGE HOST MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-150 dark:border-slate-800 animate-scaleIn">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-[#C2522D] dark:text-emerald-400">
                <Icon name="chat_bubble" size={22} />
                <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white">
                  Message Host
                </h3>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Start an on-platform conversation thread with the listing manager.
            </p>
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1.5">
                  Your Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  placeholder="Enter message to host..."
                />
              </div>

              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMessage}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {isSubmittingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
