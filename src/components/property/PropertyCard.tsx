"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { motion } from "framer-motion";
import Icon from "@/components/shared/Icon";

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
}

const TYPE_LABEL: Record<string, string> = {
  RK_1: "1 RK Studio",
  ROOM_SET_1: "1 Room Set (Kitchen+Bath)",
  ROOM_SET_2: "2 Room Set",
  BHK_1: "1 BHK Flat",
  BHK_2: "2 BHK Flat",
  BHK_3: "3 BHK Flat",
  FLAT: "Apartment",
  INDEPENDENT_HOUSE: "Independent House",
  VILLA: "Cottage / Villa",
  PG: "PG & Co-living",
  SHOP: "Commercial Space",
  OFFICE: "Office Space",
};

const FURNISH_LABEL: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-Furnished",
  FULLY_FURNISHED: "Fully Furnished",
};

const WHO_LABEL: Record<string, string> = {
  ANY: "All Welcome",
  FAMILY: "Family Friendly",
  STUDENTS: "Students Welcome",
  BACHELOR: "Bachelors Allowed",
  MALE: "Boys Only",
  FEMALE: "Girls Only",
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("ghar_favorites") || "[]");
      return favs.includes(property.id);
    }
    return false;
  });

  const images = property.images && property.images.length > 0 ? property.images : [];
  const imageCount = images.length;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageCount > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % imageCount);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageCount > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please sign in to save properties", "warning");
      return;
    }

    const favs = JSON.parse(localStorage.getItem("ghar_favorites") || "[]");
    let updatedFavs: string[];
    let newFavState: boolean;

    if (favs.includes(property.id)) {
      updatedFavs = favs.filter((id: string) => id !== property.id);
      newFavState = false;
      showToast("Removed from saved list", "info");
      fetch(`/api/favorites/${property.id}`, { method: "DELETE" }).catch(() => {});
    } else {
      updatedFavs = [...favs, property.id];
      newFavState = true;
      showToast("Added to saved list", "success");
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      }).catch(() => {});
    }

    localStorage.setItem("ghar_favorites", JSON.stringify(updatedFavs));
    setIsFavorite(newFavState);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, newFavState);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const typeLabel = TYPE_LABEL[property.propertyType] ?? property.propertyType.replace(/_/g, " ");
  const furnishLabel = FURNISH_LABEL[property.isFurnished] ?? "";
  const whoLabel = WHO_LABEL[property.genderPreference];

  const rawPhone = (property as any).owner?.phone || (property as any).ownerPhone || "919999999999";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-[#EBEBEB] shadow-sm hover:shadow-lg transition-all duration-300">
      
      {/* 1. Property Photo Container (Airbnb Aspect Ratio) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F7F7]">
        <Link href={`/property/${property.id}`} className="block h-full w-full" aria-label={property.title}>
          {imageCount > 0 ? (
            <img
              src={images[currentImageIndex].url}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#717171]">
              <Icon name="home_work" size={32} />
              <span className="text-xs font-semibold">Verified photos coming soon</span>
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#008A05] text-white px-2.5 py-1 text-[11px] font-extrabold shadow-sm backdrop-blur-md">
            <Icon name="verified" fill size={12} className="text-white" />
            <span>Zero Brokerage</span>
          </span>
          {property.isFeatured && (
            <span className="rounded-full bg-[#FF385C] text-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from saved" : "Save property"}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#222222] shadow-md hover:scale-110 active:scale-95 transition-all"
        >
          <motion.span animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }} className="grid place-items-center">
            <Icon
              name="favorite"
              fill={isFavorite}
              className={isFavorite ? "text-[#FF385C]" : "text-[#717171] hover:text-[#222222]"}
              size={18}
            />
          </motion.span>
        </button>

        {/* Photo Count Pill */}
        {imageCount > 0 && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white tabular-nums backdrop-blur-sm">
            <Icon name="photo_camera" size={12} className="text-white" />
            {imageCount}
          </span>
        )}

        {/* Image Slider Controls */}
        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222222] opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md hover:bg-white"
            >
              <Icon name="chevron_left" size={16} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222222] opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md hover:bg-white"
            >
              <Icon name="chevron_right" size={16} />
            </button>

            {/* Slide Dots */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 pointer-events-none">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? "w-3 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="flex flex-grow flex-col p-4">
        
        {/* Title & BHK */}
        <Link href={`/property/${property.id}`} className="block group/title">
          <h3 className="line-clamp-1 font-sans text-base font-bold text-[#222222] group-hover/title:text-[#FF385C] transition-colors">
            {typeLabel}
          </h3>
          <p className="flex items-center gap-1 text-xs text-[#717171] mt-0.5 font-medium truncate">
            <Icon name="place" size={13} className="shrink-0 text-[#FF385C]" />
            <span className="truncate">{property.areaName || property.address}, {property.city}</span>
          </p>
        </Link>

        {/* Feature Tags (Housing.com style) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {furnishLabel && (
            <span className="rounded-md bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 text-[10px] font-semibold text-[#717171]">
              {furnishLabel}
            </span>
          )}
          {property.area > 0 && (
            <span className="rounded-md bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 text-[10px] font-semibold text-[#717171] tabular-nums">
              {property.area} sq.ft
            </span>
          )}
          {whoLabel && (
            <span className="rounded-md bg-forest-50 border border-forest-200 px-2 py-0.5 text-[10px] font-bold text-forest-700">
              {whoLabel}
            </span>
          )}
        </div>

        {/* Rent & Deposit Strip */}
        <div className="mt-3.5 pt-3 border-t border-[#EBEBEB] flex items-baseline justify-between">
          <div>
            <p className="flex items-baseline gap-1 text-[#222222]">
              <span className="font-sans text-xl font-extrabold tabular-nums tracking-tight">
                {formatPrice(property.rent)}
              </span>
              <span className="text-xs text-[#717171] font-normal">/ month</span>
            </p>
            {property.deposit > 0 && (
              <p className="text-[11px] text-[#717171] font-medium tabular-nums mt-0.5">
                Deposit: {formatPrice(property.deposit)}
              </p>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-forest-700 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-full">
            Direct Owner
          </span>
        </div>

        {/* Actions (Housing.com / MagicBricks Quick Contact) */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
          <a
            href={`tel:+${cleanPhone}`}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#222222] text-xs font-bold text-[#222222] hover:bg-[#F7F7F7] active:scale-95 transition-all"
          >
            <Icon name="call" size={15} />
            <span>Call</span>
          </a>
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi, I saw your listing on Ghar Foundation: ${property.title} in ${property.areaName || property.city}. Is it available?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
          >
            <Icon name="chat" size={15} className="text-white" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
