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

// Clean English labels
const TYPE_LABEL: Record<string, string> = {
  RK_1: "1 RK",
  ROOM_SET_1: "1 Room Set",
  ROOM_SET_2: "2 Room Set",
  BHK_1: "1 BHK Flat",
  BHK_2: "2 BHK Flat",
  BHK_3: "3 BHK Flat",
  FLAT: "Flat",
  INDEPENDENT_HOUSE: "Independent House",
  VILLA: "Independent Villa",
  PG: "PG / Co-living",
  SHOP: "Commercial Shop",
  OFFICE: "Office Space",
};

const FURNISH_LABEL: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
};

const WHO_LABEL: Record<string, string> = {
  ANY: "All welcome",
  FAMILY: "Family friendly",
  STUDENTS: "Students welcome",
  BACHELOR: "Bachelors welcome",
  MALE: "Boys only",
  FEMALE: "Girls only",
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

  const imageCount = property.images?.length ?? 0;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please sign in to save properties", "warning");
      return;
    }

    const favs = JSON.parse(localStorage.getItem("ghar_favorites") || "[]");
    let updatedFavs;
    let newFavState;

    if (favs.includes(property.id)) {
      updatedFavs = favs.filter((id: string) => id !== property.id);
      newFavState = false;
      showToast("Removed from saved list", "info");
      // Sync with database
      fetch(`/api/favorites/${property.id}`, { method: "DELETE" }).catch(() => {});
    } else {
      updatedFavs = [...favs, property.id];
      newFavState = true;
      showToast("Added to saved list", "success");
      // Sync with database
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
  const isAvailableNow =
    !property.availableFrom || new Date(property.availableFrom).getTime() <= Date.now();

  const rawPhone = (property as any).owner?.phone || (property as any).ownerPhone || "919999999999";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-card bg-white shadow-e1 transition-shadow duration-300 ease-ghar hover:shadow-e2 dark:bg-mitti-900"
    >
      {/* Photo — 4:3 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-mitti-100 dark:bg-mitti-800">
        <Link href={`/property/${property.id}`} className="block h-full w-full" aria-label={property.title}>
          {imageCount > 0 ? (
            <img
              src={property.images[currentImageIndex].url}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-ghar group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-mitti-500">
              <Icon name="home" size={32} />
              <span className="text-xs font-medium">Photo coming soon</span>
            </div>
          )}
        </Link>

        {/* Favourite */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from saved" : "Save property"}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 z-sticky grid h-10 w-10 place-items-center rounded-full bg-white/95 text-mitti-700 shadow-e1 transition-transform duration-150 ease-ghar hover:scale-105 active:scale-95"
        >
          <motion.span animate={{ scale: isFavorite ? [1, 1.25, 1] : 1 }} className="grid place-items-center">
            <Icon
              name="favorite"
              fill={isFavorite}
              className={isFavorite ? "text-terracotta-600" : "text-mitti-700"}
              size={20}
            />
          </motion.span>
        </button>

        {/* Featured */}
        {property.isFeatured && (
          <span className="pointer-events-none absolute left-3 top-3 z-sticky rounded-full bg-haldi px-2.5 py-1 text-[11px] font-semibold text-mitti-900">
            Featured
          </span>
        )}

        {/* Photo count */}
        {imageCount > 0 && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-sticky flex items-center gap-1 rounded-full bg-mitti-900/70 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
            <Icon name="photo_camera" size={13} className="text-white" />
            {imageCount}
          </span>
        )}

        {/* Gallery controls */}
        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 z-sticky grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-mitti-800 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Icon name="chevron_left" size={18} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 z-sticky grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-mitti-800 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Icon name="chevron_right" size={18} />
            </button>
            <div className="absolute bottom-3.5 left-1/2 z-sticky flex -translate-x-1/2 gap-1">
              {property.images.slice(0, 6).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-ghar ${
                    idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-grow flex-col gap-3 p-4">
        {/* Trust row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-2 py-0.5 text-[11px] font-semibold text-forest-700">
              <Icon name="verified" fill size={13} className="text-forest-600" />
              Verified Owner
            </span>
          )}
          {whoLabel && (
            <span className="rounded-full bg-mitti-100 px-2 py-0.5 text-[11px] font-medium text-mitti-700 dark:bg-mitti-800 dark:text-mitti-200">
              {whoLabel}
            </span>
          )}
          {isAvailableNow && (
            <span className="rounded-full bg-mitti-100 px-2 py-0.5 text-[11px] font-medium text-mitti-700 dark:bg-mitti-800 dark:text-mitti-200">
              Available now
            </span>
          )}
        </div>

        {/* Rent */}
        <Link href={`/property/${property.id}`} className="block">
          <p className="flex items-baseline gap-1">
            <span data-rent className="font-sans text-[22px] font-bold leading-none text-mitti-900 dark:text-white">
              {formatPrice(property.rent)}
            </span>
            <span className="text-sm text-mitti-500">/ month</span>
          </p>
          <h3 className="mt-2 line-clamp-1 font-sans text-base font-semibold tracking-normal text-mitti-800 transition-colors group-hover:text-terracotta-700 dark:text-mitti-100">
            {typeLabel}
            {furnishLabel && <span className="font-normal text-mitti-500"> · {furnishLabel}</span>}
          </h3>
        </Link>

        {/* Location */}
        <p className="flex items-center gap-1 text-sm text-mitti-600 dark:text-mitti-300">
          <Icon name="location_on" size={16} className="shrink-0 text-terracotta-600" />
          <span className="truncate">
            {property.areaName}, {property.city}
          </span>
        </p>

        {/* Meta */}
        <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-mitti-100 pt-3 text-[13px] text-mitti-600 dark:border-mitti-800 dark:text-mitti-300 tabular-nums">
          {property.deposit > 0 && <span>Deposit: {formatPrice(property.deposit)}</span>}
          {property.area > 0 && <span>{property.area} sq ft</span>}
          {property.parking && <span>Parking included</span>}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:+${cleanPhone}`}
            className="flex h-11 items-center justify-center gap-1.5 rounded-btn border-[1.5px] border-mitti-800 text-sm font-semibold text-mitti-900 transition-colors duration-150 hover:bg-mitti-50 active:scale-[0.98] dark:border-mitti-300 dark:text-white dark:hover:bg-mitti-800"
          >
            <Icon name="call" size={18} />
            Call Owner
          </a>
          <a
            href={`https://wa.me/${cleanPhone}?text=Hi, I am interested in your property: ${encodeURIComponent(property.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-btn bg-whatsapp text-sm font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
          >
            <Icon name="chat" size={18} className="text-white" />
            WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export default PropertyCard;
