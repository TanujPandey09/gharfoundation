"use client";

import React, { useState, useEffect } from "react";
import { Property } from "@/lib/types";
import Icon from "../shared/Icon";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface PropertyMapProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
  selectedProperty?: Property | null;
}

// Fix Leaflet's default icon path issues in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom active/selected icon
const activeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when selected property changes
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

// Generate a random ID that changes ONLY when the module is hot-reloaded by Next.js Fast Refresh.
// This ensures React completely destroys and recreates the MapContainer DOM node, preventing Leaflet from crashing.
const HOT_RELOAD_KEY = Math.random().toString(36).substring(7);

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  onSelectProperty,
  selectedProperty,
}) => {
  const [activePin, setActivePin] = useState<Property | null>(null);
  const mapRef = React.useRef<any>(null);

  // Clear Leaflet's internal footprint strictly on unmount to bypass Next.js React 18 double-mount bug
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const container = mapRef.current.getContainer();
        if (container) {
          container._leaflet_id = null;
        }
      }
    };
  }, []);

  // Default to Dehradun center
  const defaultCenter: [number, number] = [30.3165, 78.0322];

  const handlePinClick = (prop: Property) => {
    setActivePin(prop);
    if (onSelectProperty) {
      onSelectProperty(prop);
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      setActivePin(selectedProperty);
    }
  }, [selectedProperty]);

  // Handle SSR: don't render map on server
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return <div className="w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-900 rounded-card" />;

  const centerCoordinates: [number, number] = selectedProperty?.latitude && selectedProperty?.longitude
    ? [selectedProperty.latitude, selectedProperty.longitude]
    : (properties.length > 0 && properties[0].latitude && properties[0].longitude
      ? [properties[0].latitude, properties[0].longitude]
      : defaultCenter);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-950 rounded-card overflow-hidden border border-border dark:border-slate-800 transition-colors">
      <MapContainer
        key={HOT_RELOAD_KEY}
        ref={mapRef}
        center={centerCoordinates}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapRecenter center={centerCoordinates} />

        {properties.map((prop) => {
          if (!prop.latitude || !prop.longitude) return null;

          const isSelected = selectedProperty?.id === prop.id || activePin?.id === prop.id;

          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={isSelected ? activeIcon : defaultIcon}
              eventHandlers={{
                click: () => handlePinClick(prop),
              }}
            >
              <Popup>
                <div className="flex flex-col space-y-2 min-w-[150px]">
                  <img
                    src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100"}
                    alt={prop.title}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <div className="font-bold text-sm text-[#00236f] truncate">
                    ₹{prop.rent.toLocaleString()}/mo
                  </div>
                  <div className="text-xs font-semibold text-gray-800 truncate">
                    {prop.title}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {prop.bedrooms} BHK • {prop.city}
                  </div>
                  <Link
                    href={`/property/${prop.id}`}
                    className="mt-1 block text-center bg-[#10b981] text-white text-[10px] font-bold py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls UI Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center pointer-events-none">
        <div className="bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-btn shadow-sm border border-border dark:border-slate-800 flex items-center space-x-2 text-xs font-bold text-textPrimary dark:text-surface pointer-events-auto">
          <Icon name="explore" size={16} className="text-primary animate-spin-slow" />
          <span>Interactive Map</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
