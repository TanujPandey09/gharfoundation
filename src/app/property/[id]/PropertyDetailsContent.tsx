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

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

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

  const { data: propertyData, isLoading } = useQuery({
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-[#F7F7F7] rounded-xl mx-auto" />
          <div className="h-4 w-96 bg-[#F7F7F7] rounded-lg mx-auto" />
          <div className="h-96 w-full max-w-4xl bg-[#F7F7F7] rounded-3xl mx-auto" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 bg-white">
        <Icon name="home_work" className="mx-auto text-[#B0B0B0]" size={64} />
        <h2 className="font-sans font-bold text-2xl text-[#222222]">
          Property Not Found
        </h2>
        <p className="text-sm text-[#717171]">
          This listing may have already been rented or removed by the homeowner.
        </p>
        <Link
          href="/search"
          className="inline-block bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-sm transition-all"
        >
          Browse All Rentals
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
      fetch(`/api/favorites/${property.id}`, { method: "DELETE" }).catch(() => {});
      setIsFavorite(false);
      showToast("Removed from favorites", "info");
    } else {
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      }).catch(() => {});
      setIsFavorite(true);
      showToast("Saved to favorites", "success");
    }

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
    setInitialMessage(`Hi ${safeOwner.name || "Owner"}, I am interested in your property '${property.title}'. Is it available for move-in?`);
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
      navigator.share({
        title: property.title,
        text: property.description,
        url,
      }).then(() => showToast("Link shared successfully", "success")).catch(() => {});
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
        showToast("Listing reported. Our local team will investigate.", "success");
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

  const images = property.images && property.images.length > 0 ? property.images : [];
  const cleanPhone = (safeOwner.phone || "919999999999").replace(/\D/g, "");

  return (
    <div className="bg-white min-h-screen text-[#222222]">
      
      {/* ===================================================================== */}
      {/* 1. MOBILE DETAILS VIEW (< lg)                                         */}
      {/* ===================================================================== */}
      <div className="lg:hidden pb-28 relative">
        {/* Photo Slider */}
        <div className="relative w-full aspect-[4/3] bg-[#F7F7F7] overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[activeImageIdx].url}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[#717171]">
              No Image Available
            </div>
          )}

          {/* Top navigation overlay buttons */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md text-[#222222]"
              title="Go Back"
            >
              <Icon name="arrow_back" size={18} />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md text-[#222222]"
              title="Share"
            >
              <Icon name="share" size={18} />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md text-[#222222]"
              title="Save"
            >
              <Icon
                name="favorite"
                size={18}
                fill={isFavorite}
                className={isFavorite ? "text-[#FF385C]" : "text-[#717171]"}
              />
            </button>
          </div>

          {/* Zero Brokerage Pill */}
          <div className="absolute bottom-4 left-4 bg-[#008A05] text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
            <Icon name="verified" size={13} className="text-white fill-current" />
            <span>Zero Brokerage</span>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIdx ? "bg-white w-3" : "bg-white/60 w-1.5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="px-4 py-5 space-y-6">
          <div>
            <div className="flex justify-between items-start gap-3">
              <h1 className="font-sans font-extrabold text-xl text-[#222222] leading-tight">
                {property.title}
              </h1>
              <div className="text-right shrink-0">
                <p className="text-xl font-extrabold text-[#222222] tabular-nums">
                  {formatPrice(property.rent)}
                </p>
                <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block">
                  / month
                </span>
              </div>
            </div>
            <p className="flex items-center gap-1 text-xs text-[#717171] mt-1 font-medium">
              <Icon name="place" size={14} className="text-[#FF385C] shrink-0" />
              <span>{property.address}, {property.city}</span>
            </p>
          </div>

          {/* Key Specs Bar (Housing.com style) */}
          <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-[#EBEBEB]">
            <div className="bg-[#F7F7F7] rounded-xl p-3 text-center">
              <span className="block text-xs font-extrabold text-[#222222]">{property.bedrooms} BHK</span>
              <span className="text-[10px] font-bold text-[#717171] uppercase">Bedrooms</span>
            </div>
            <div className="bg-[#F7F7F7] rounded-xl p-3 text-center">
              <span className="block text-xs font-extrabold text-[#222222]">{property.bathrooms} Bath</span>
              <span className="text-[10px] font-bold text-[#717171] uppercase">Bathrooms</span>
            </div>
            <div className="bg-[#F7F7F7] rounded-xl p-3 text-center">
              <span className="block text-xs font-extrabold text-[#222222] tabular-nums">{property.area} sq.ft</span>
              <span className="text-[10px] font-bold text-[#717171] uppercase">Area</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
              About this Property
            </h3>
            <p className="text-xs text-[#717171] leading-relaxed whitespace-pre-line">
              {isReadMore ? property.description : `${property.description.slice(0, 160)}...`}
            </p>
            {property.description.length > 160 && (
              <button
                onClick={() => setIsReadMore(!isReadMore)}
                className="text-xs font-bold text-[#FF385C] hover:underline"
              >
                {isReadMore ? "Show Less" : "Read Full Description"}
              </button>
            )}
          </div>

          {/* Verified Host Card */}
          <div className="p-4 rounded-2xl border border-[#EBEBEB] bg-[#F7F7F7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={safeOwner.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                alt={safeOwner.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-[#222222]">{safeOwner.name}</h4>
                <p className="text-[11px] text-forest-700 font-bold flex items-center gap-1 mt-0.5">
                  <Icon name="verified" size={13} fill className="text-forest-600" />
                  Aadhaar KYC Verified Landlord
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-white border border-[#EBEBEB] px-2 py-1 rounded-md text-[#222222]">
              Owner
            </span>
          </div>

          {/* Map Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
              Location
            </h3>
            <div className="h-44 rounded-2xl overflow-hidden border border-[#EBEBEB]">
              <PropertyMap properties={[property]} selectedProperty={property} />
            </div>
          </div>

          {/* Report */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-semibold text-[#717171] hover:text-[#FF385C] flex items-center justify-center gap-1 mx-auto"
            >
              <Icon name="report" size={14} />
              <span>Report this listing as fake or misleading</span>
            </button>
          </div>
        </div>

        {/* Mobile Sticky Bottom CTA Drawer (Airbnb style) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#EBEBEB] px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-md shadow-2xl">
          <div>
            <p className="text-lg font-extrabold text-[#222222] tabular-nums leading-none">
              {formatPrice(property.rent)}
            </p>
            <p className="text-[10px] font-bold text-forest-700 mt-0.5">Zero Brokerage</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:+${cleanPhone}`}
              className="h-11 w-11 rounded-xl border border-[#222222] flex items-center justify-center text-[#222222] hover:bg-[#F7F7F7] active:scale-95 transition-all"
            >
              <Icon name="call" size={18} />
            </a>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${safeOwner.name || "Owner"}, I am interested in your property on Ghar Foundation: ${property.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Icon name="chat" size={16} className="text-white" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={handleOpenTourModal}
              className="h-11 px-4 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <span>Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. DESKTOP DETAILS VIEW (>= lg) — AIRBNB 5-PHOTO COLLAGE              */}
      {/* ===================================================================== */}
      <div className="hidden lg:block max-w-[1320px] mx-auto px-6 lg:px-12 pt-4 pb-10 space-y-6">
        
        {/* Header Strip */}
        <div>
          <div className="flex justify-between items-start gap-4 mb-1">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-sans font-extrabold text-2xl xl:text-3xl text-[#222222] tracking-tight">
                  {property.title}
                </h1>
                {property.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-forest-50 border border-forest-200 text-forest-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Icon name="verified" size={14} fill className="text-forest-600" />
                    Verified Listing
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-[#717171] mt-1.5 font-semibold">
                <Icon name="place" size={16} className="text-[#FF385C]" />
                <span>{property.address}, {property.city}</span>
                <span className="mx-1">·</span>
                <span className="text-forest-700 font-bold">100% Direct Owner Deal</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="btn-cta-secondary px-4 py-2 text-xs"
              >
                <Icon name="share" size={15} />
                <span>Share</span>
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] ${
                  isFavorite
                    ? "border-[#FF385C] text-[#FF385C] bg-[#FFF0F2]"
                    : "border-[#DDDDDD] hover:border-[#222222] text-[#222222] bg-white hover:bg-[#F7F7F7]"
                }`}
              >
                <Icon name="favorite" size={15} fill={isFavorite} className={isFavorite ? "text-[#FF385C]" : "text-[#717171]"} />
                <span>{isFavorite ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* AIRBNB 5-PHOTO MOSAIC GRID                                          */}
        {/* =================================================================== */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2.5 h-[420px] rounded-3xl overflow-hidden relative">
          {images.length > 0 ? (
            <>
              {/* Primary Large Image */}
              <div
                onClick={() => setActiveImageIdx(0)}
                className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group bg-[#F7F7F7]"
              >
                <img
                  src={images[0].url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail 1 */}
              <div
                onClick={() => setActiveImageIdx(1 % images.length)}
                className="relative cursor-pointer overflow-hidden group bg-[#F7F7F7]"
              >
                <img
                  src={images[1 % images.length].url}
                  alt="Thumb 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail 2 */}
              <div
                onClick={() => setActiveImageIdx(2 % images.length)}
                className="relative cursor-pointer overflow-hidden group bg-[#F7F7F7]"
              >
                <img
                  src={images[2 % images.length].url}
                  alt="Thumb 2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail 3 */}
              <div
                onClick={() => setActiveImageIdx(3 % images.length)}
                className="relative cursor-pointer overflow-hidden group bg-[#F7F7F7]"
              >
                <img
                  src={images[3 % images.length].url}
                  alt="Thumb 3"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail 4 */}
              <div
                onClick={() => setActiveImageIdx(4 % images.length)}
                className="relative cursor-pointer overflow-hidden group bg-[#F7F7F7]"
              >
                <img
                  src={images[4 % images.length].url}
                  alt="Thumb 4"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </>
          ) : (
            <div className="col-span-4 row-span-2 bg-[#F7F7F7] flex items-center justify-center text-[#717171]">
              Photos arriving soon
            </div>
          )}

          <button
            onClick={() => showToast(`Viewing all ${images.length} photos`, "info")}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-[#222222] shadow-md border border-[#EBEBEB] flex items-center gap-1.5 hover:bg-white transition-all"
          >
            <Icon name="photo_camera" size={16} />
            <span>Show all {images.length} photos</span>
          </button>
        </div>

        {/* Content & Sticky Sidebar Grid */}
        <div className="grid grid-cols-12 gap-10 items-start">
          
          {/* Left Details Column */}
          <div className="col-span-8 space-y-8">
            
            {/* Quick Specs Strip */}
            <div className="grid grid-cols-4 gap-3 py-4 border-y border-[#EBEBEB]">
              <div className="p-3 bg-[#F7F7F7] rounded-2xl text-center">
                <span className="block text-sm font-extrabold text-[#222222]">{property.bedrooms} BHK</span>
                <span className="text-[10px] font-bold text-[#717171] uppercase">Bedrooms</span>
              </div>
              <div className="p-3 bg-[#F7F7F7] rounded-2xl text-center">
                <span className="block text-sm font-extrabold text-[#222222]">{property.bathrooms} Bath</span>
                <span className="text-[10px] font-bold text-[#717171] uppercase">Bathrooms</span>
              </div>
              <div className="p-3 bg-[#F7F7F7] rounded-2xl text-center">
                <span className="block text-sm font-extrabold text-[#222222] tabular-nums">{property.area} sq.ft</span>
                <span className="text-[10px] font-bold text-[#717171] uppercase">Super Area</span>
              </div>
              <div className="p-3 bg-[#F7F7F7] rounded-2xl text-center">
                <span className="block text-sm font-extrabold text-[#222222] capitalize">
                  {property.isFurnished.replace(/_/g, " ").toLowerCase()}
                </span>
                <span className="text-[10px] font-bold text-[#717171] uppercase">Furnishing</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-sans font-bold text-lg text-[#222222]">
                About this rental
              </h3>
              <p className="text-sm text-[#717171] leading-relaxed whitespace-pre-line font-normal">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4 pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-sans font-bold text-lg text-[#222222]">
                What this place offers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((am) => (
                  <div
                    key={am.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] text-xs font-semibold text-[#222222]"
                  >
                    <Icon name="check_circle" size={16} className="text-forest-600 shrink-0" fill />
                    <span>{am.name}</span>
                  </div>
                ))}
                {property.parking && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] text-xs font-semibold text-[#222222]">
                    <Icon name="check_circle" size={16} className="text-forest-600 shrink-0" fill />
                    <span>Gated Parking Space</span>
                  </div>
                )}
                {property.internet && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-[#EBEBEB] bg-[#F7F7F7] text-xs font-semibold text-[#222222]">
                    <Icon name="check_circle" size={16} className="text-forest-600 shrink-0" fill />
                    <span>High-Speed Internet Ready</span>
                  </div>
                )}
              </div>
            </div>

            {/* Locality & Map */}
            <div className="space-y-4 pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-sans font-bold text-lg text-[#222222]">
                Where you'll be
              </h3>
              <p className="text-xs text-[#717171]">
                {property.address}, {property.city}, Uttarakhand
              </p>
              <div className="h-64 rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm">
                <PropertyMap properties={[property]} selectedProperty={property} />
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4 pt-6 border-t border-[#EBEBEB]">
              <h3 className="font-sans font-bold text-lg text-[#222222] flex items-center gap-2">
                <span>Reviews &amp; Ratings</span>
                <span className="text-xs font-bold text-[#717171]">({reviews.length})</span>
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-[#717171]">No reviews yet. Be the first to share your experience with this homeowner.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#222222]">{rev.user?.name || "Verified Tenant"}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Icon key={i} name="star" size={12} className="fill-current text-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#717171]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Booking & Contact Card (Airbnb Style) */}
          <div className="col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-xl space-y-5">
              
              {/* Price Header */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-[#222222] tabular-nums">
                    {formatPrice(property.rent)}
                  </span>
                  <span className="text-xs text-[#717171] ml-1">/ month</span>
                </div>
                <span className="inline-block bg-forest-50 border border-forest-200 text-forest-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  ₹0 Brokerage
                </span>
              </div>

              {/* Indian Rental Breakdown Matrix (Housing.com style) */}
              <div className="bg-[#F7F7F7] rounded-2xl p-4 border border-[#EBEBEB] space-y-2 text-xs">
                <div className="flex justify-between text-[#717171]">
                  <span>Security Deposit</span>
                  <span className="font-bold text-[#222222] tabular-nums">{formatPrice(property.deposit)}</span>
                </div>
                <div className="flex justify-between text-[#717171]">
                  <span>Maintenance Fee</span>
                  <span className="font-bold text-[#222222] tabular-nums">
                    {property.maintenance > 0 ? formatPrice(property.maintenance) : "Included"}
                  </span>
                </div>
                <div className="flex justify-between text-[#717171]">
                  <span>Brokerage Commission</span>
                  <span className="font-bold text-forest-700">₹0 (Zero Fees)</span>
                </div>
                <div className="pt-2 border-t border-[#EBEBEB] flex justify-between font-bold text-[#222222]">
                  <span>Total Day-1 Payable</span>
                  <span className="tabular-nums">{formatPrice(property.rent + property.deposit)}</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#EBEBEB]">
                <img
                  src={safeOwner.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"}
                  alt={safeOwner.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#222222] truncate">{safeOwner.name}</p>
                  <p className="text-[10px] text-forest-700 font-bold flex items-center gap-1">
                    <Icon name="verified" size={11} fill className="text-forest-600" />
                    Verified Homeowner
                  </p>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="space-y-2.5">
                <button
                  onClick={handleOpenTourModal}
                  className="btn-cta-primary w-full text-xs py-3.5 px-4"
                >
                  <Icon name="event" size={16} />
                  <span>Schedule Physical Visit</span>
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${safeOwner.name || "Owner"}, I am interested in your property on Ghar Foundation: ${property.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="btn-cta-whatsapp w-full text-xs py-3.5 px-4"
                >
                  <Icon name="chat" size={16} className="text-white" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`tel:+${cleanPhone}`}
                  className="btn-cta-secondary w-full text-xs py-3.5 px-4"
                >
                  <Icon name="call" size={16} />
                  <span>Call Owner (+{cleanPhone})</span>
                </a>
              </div>

              <p className="text-[10px] text-[#717171] text-center font-medium leading-relaxed">
                Shield Protection: Never pay token money before physical site inspection. Leases are digitally signed upon mutual agreement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Booking Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EBEBEB]">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB]">
              <h3 className="font-bold text-base text-[#222222]">Schedule Property Visit</h3>
              <button onClick={() => setShowTourModal(false)} className="text-[#717171] hover:text-[#222222]">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleTourSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#222222]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Time Slot</label>
                <select
                  value={tourTime}
                  onChange={(e) => setTourTime(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#222222]"
                >
                  <option value="10:30 AM">Morning (10:30 AM - 12:00 PM)</option>
                  <option value="02:30 PM">Afternoon (02:30 PM - 04:00 PM)</option>
                  <option value="05:30 PM">Evening (05:30 PM - 07:00 PM)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmittingTour}
                className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all"
              >
                {isSubmittingTour ? "Scheduling..." : "Confirm Visit Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EBEBEB]">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB]">
              <h3 className="font-bold text-base text-[#222222]">Report Listing</h3>
              <button onClick={() => setShowReportModal(false)} className="text-[#717171] hover:text-[#222222]">
                <Icon name="close" size={20} />
              </button>
            </div>
            <textarea
              placeholder="Why are you reporting this listing? (e.g. Broker posed as owner, incorrect rent...)"
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-3 text-xs focus:outline-none focus:border-[#222222]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl border border-[#EBEBEB] text-xs font-bold text-[#717171]"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
