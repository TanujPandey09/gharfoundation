"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/shared/Icon";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { UserButton } from "@clerk/nextjs";

function PostPropertyContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeStep, setActiveStep] = useState(1); // Start at 1
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
      title: "",
      description: "",
      rent: "",
      deposit: "",
      maintenance: "0",
      bedrooms: 1,
      bathrooms: 1,
      kitchen: 1,
      balcony: 0,
      parking: false,
      floor: 0,
      area: "",
      propertyType: "BHK_1", // FLAT, INDEPENDENT_HOUSE, PG, BHK_1, etc.
      genderPreference: "ANY",
      waterSupply: "24/7",
      electricity: "24/7",
      internet: false,
      isFurnished: "SEMI_FURNISHED",
      district: "Dehradun",
      city: "Dehradun",
      areaName: "",
      address: "",
      landmark: "",
      pincode: "248001",
      latitude: 30.3165,
      longitude: 78.0322,
      amenities: ["Power Backup", "Free WiFi"] as string[],
      imageUrls: [] as string[]
  });

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/properties/${editId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            rent: String(data.rent || ""),
            deposit: String(data.deposit || ""),
            maintenance: String(data.maintenance || "0"),
            bedrooms: data.bedrooms ?? 1,
            bathrooms: data.bathrooms ?? 1,
            kitchen: data.kitchen ?? 1,
            balcony: data.balcony ?? 0,
            parking: Boolean(data.parking),
            floor: data.floor ?? 0,
            area: String(data.area || ""),
            propertyType: data.propertyType || "BHK_1",
            genderPreference: data.genderPreference || "ANY",
            waterSupply: data.waterSupply || "24/7",
            electricity: data.electricity || "24/7",
            internet: Boolean(data.internet),
            isFurnished: data.isFurnished || "SEMI_FURNISHED",
            district: data.district || "Dehradun",
            city: data.city || "Dehradun",
            areaName: data.areaName || "",
            address: data.address || "",
            landmark: data.landmark || "",
            pincode: data.pincode || "248001",
            latitude: data.latitude ?? 30.3165,
            longitude: data.longitude ?? 78.0322,
            amenities: Array.isArray(data.amenities)
              ? data.amenities.map((a: any) => (typeof a === "string" ? a : a.name))
              : [],
            imageUrls: Array.isArray(data.images)
              ? data.images.map((img: any) => (typeof img === "string" ? img : img.url))
              : [],
          });
        }
      })
      .catch((err) => console.error("Failed to load property for edit:", err));
  }, [editId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (ev) => {
            const img = new Image();
            img.src = ev.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 1280;
              let width = img.width;
              let height = img.height;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
              canvas.width = width;
              canvas.height = height;
              canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.75));
            };
            img.onerror = reject;
          };
          reader.onerror = reject;
        });
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            uploaded.push(uploadJson.url || dataUrl);
          } else {
            uploaded.push(dataUrl);
          }
        } catch {
          uploaded.push(dataUrl);
        }
      } catch (err) {
        console.error("Failed to compress image:", err);
      }
    }
    if (uploaded.length > 0) {
      setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploaded] }));
      showToast(`${uploaded.length} photo(s) uploaded!`, "success");
    }
    e.target.value = "";
  };

  const handleNext = () => {
      // Validate active step fields
      if (activeStep === 1) {
          if (!formData.title || formData.title.length < 5) {
              showToast("Title must be at least 5 characters long", "error");
              return;
          }
          if (!formData.description || formData.description.length < 20) {
              showToast("Description must be at least 20 characters long", "error");
              return;
          }
          if (!formData.area || Number(formData.area) <= 0) {
              showToast("Please enter a valid positive area in sq. ft.", "error");
              return;
          }
      } else if (activeStep === 2) {
          if (!formData.address || formData.address.length < 5) {
              showToast("Address must be at least 5 characters long", "error");
              return;
          }
          if (!formData.areaName) {
              showToast("Area name is required", "error");
              return;
          }
          if (!formData.city) {
              showToast("City is required", "error");
              return;
          }
          if (!/^\d{6}$/.test(formData.pincode)) {
              showToast("Pincode must be exactly 6 digits", "error");
              return;
          }
      } else if (activeStep === 5) {
          if (!formData.rent || Number(formData.rent) <= 0) {
              showToast("Rent must be a positive number", "error");
              return;
          }
          if (!formData.deposit || Number(formData.deposit) < 0) {
              showToast("Deposit cannot be negative", "error");
              return;
          }
      }

      if (activeStep < 7) setActiveStep(activeStep + 1);
  };
  
  const handleBack = () => {
      if (activeStep > 1) setActiveStep(activeStep - 1);
      else router.push("/dashboard");
  };

  const toggleAmenity = (name: string) => {
      if (formData.amenities.includes(name)) {
          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== name) });
      } else {
          setFormData({ ...formData, amenities: [...formData.amenities, name] });
      }
  };

  const handlePublish = async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
          // Double-check validations
          if (!formData.title || formData.title.length < 5) {
              showToast("Title must be at least 5 characters long", "error");
              setIsSubmitting(false);
              return;
          }
          if (!formData.description || formData.description.length < 20) {
              showToast("Description must be at least 20 characters long", "error");
              setIsSubmitting(false);
              return;
          }
          if (!formData.rent || Number(formData.rent) <= 0) {
              showToast("Rent must be a positive number", "error");
              setIsSubmitting(false);
              return;
          }
          if (!formData.address || formData.address.length < 5) {
              showToast("Address must be at least 5 characters long", "error");
              setIsSubmitting(false);
              return;
          }
          if (!formData.city) {
              showToast("City is required", "error");
              setIsSubmitting(false);
              return;
          }
          if (!/^\d{6}$/.test(formData.pincode)) {
              showToast("Pincode must be exactly 6 digits", "error");
              setIsSubmitting(false);
              return;
          }

          const payload = {
              title: formData.title,
              description: formData.description,
              rent: Number(formData.rent),
              deposit: Number(formData.deposit) || 0,
              maintenance: Number(formData.maintenance) || 0,
              bedrooms: Number(formData.bedrooms),
              bathrooms: Number(formData.bathrooms),
              kitchen: Number(formData.kitchen),
              balcony: Number(formData.balcony),
              parking: formData.parking,
              floor: Number(formData.floor),
              area: Number(formData.area),
              propertyType: formData.propertyType,
              genderPreference: formData.genderPreference,
              waterSupply: formData.waterSupply,
              electricity: formData.electricity,
              internet: formData.internet,
              isFurnished: formData.isFurnished,
              district: formData.district,
              city: formData.city,
              areaName: formData.areaName,
              address: formData.address,
              landmark: formData.landmark || undefined,
              pincode: formData.pincode,
              latitude: Number(formData.latitude),
              longitude: Number(formData.longitude),
              amenities: formData.amenities,
              imageUrls: formData.imageUrls,
          };

          const res = await fetch(editId ? `/api/properties/${editId}` : "/api/properties", {
              method: editId ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
          });

          if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              const msg =
                typeof errData.error === "object"
                  ? errData.error?.message || errData.error?.details || JSON.stringify(errData.error)
                  : errData.error || errData.message || "Failed to publish property";
              throw new Error(msg);
          }

          showToast(editId ? "Property updated successfully!" : "Property published successfully!", "success");
          router.push("/dashboard");
      } catch (err: any) {
          console.error(err);
          showToast(err.message || "An error occurred during submission", "error");
      } finally {
          setIsSubmitting(false);
      }
  };

  const calculateProgress = () => {
      return Math.round(((activeStep - 1) / 7) * 100);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* SIDEBAR (Desktop Only) */}
      <div className="hidden md:flex w-[270px] bg-white border-r border-[#EBEBEB] flex-col justify-between shrink-0 h-full z-10">
        <div>
          <div className="p-5 pb-4">
            <h1 className="font-bold text-xl text-[#222222] tracking-tight mb-1">
              Ghar<span className="text-[#FF385C]">.</span> Listing Studio
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF385C] rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
                <span className="text-[11px] text-[#717171] font-bold tracking-wide">{calculateProgress()}%</span>
            </div>
          </div>
          
          <nav className="space-y-1 px-3 mt-1">
            <SidebarStep icon="info" label="Basic Details" step={1} currentStep={activeStep} onClick={() => setActiveStep(1)} />
            <SidebarStep icon="location_on" label="Location" step={2} currentStep={activeStep} onClick={() => setActiveStep(2)} />
            <SidebarStep icon="check_circle" label="Amenities" step={3} currentStep={activeStep} onClick={() => setActiveStep(3)} />
            <SidebarStep icon="image" label="Photos & Videos" step={4} currentStep={activeStep} onClick={() => setActiveStep(4)} />
            <SidebarStep icon="payments" label="Pricing" step={5} currentStep={activeStep} onClick={() => setActiveStep(5)} />
            <SidebarStep icon="visibility" label="Preview" step={6} currentStep={activeStep} onClick={() => setActiveStep(6)} />
            <SidebarStep icon="rocket_launch" label="Publish" step={7} currentStep={activeStep} onClick={() => setActiveStep(7)} />
          </nav>
        </div>

        <div className="p-4">
            <div className="bg-[#F7F7F7] rounded-2xl p-3.5 border border-[#EBEBEB] flex gap-3 items-center">
                <div className="w-9 h-9 bg-white border border-[#EBEBEB] rounded-full flex items-center justify-center shrink-0 text-[#008A05]">
                    <Icon name="check" size={18} />
                </div>
                <div>
                    <span className="text-xs font-bold text-[#222222] block">100% Free Listing</span>
                    <span className="text-[11px] font-medium text-[#717171]">₹0 Brokerage Forever</span>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7F7F7]/60">
          
        {/* HEADER */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-50">
            <div className="font-extrabold text-xl text-[#222222] tracking-tight flex items-center gap-2">
                Ghar<span className="text-[#FF385C]">.</span> <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-0.5 rounded-full ml-1">Post Property Free</span>
            </div>
            
            {/* Top Stepper for Mobile */}
            <div className="md:hidden flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">Step {activeStep} of 7</span>
                <div className="w-24 h-1.5 bg-[#EBEBEB] rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-[#FF385C] rounded-full" style={{ width: `${(activeStep / 7) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => router.push("/dashboard")} className="btn-cta-secondary px-3.5 py-1.5 text-xs">Exit</button>
                <div className="border-l border-[#EBEBEB] pl-3">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto relative pb-24">
            
            {/* STEP 1: BASIC DETAILS */}
            {activeStep === 1 && (
                <div className="max-w-[820px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 1 of 7 · Property Configuration</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">What are you listing?</h2>
                        <p className="text-xs sm:text-sm text-[#717171] mt-1">Provide the foundational details of your property to help tenants find exactly what they need.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Property Title */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                            <label className="block text-[13px] font-bold text-slate-800 mb-3">Property Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Cozy 2BHK Mountain-view Cottage" 
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800" 
                            />
                            <p className="text-[12px] text-slate-500 font-medium mt-2">A descriptive title helps your listing stand out in search results.</p>
                        </div>

                        {/* Property Description */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                            <label className="block text-[13px] font-bold text-slate-800 mb-3">Property Description</label>
                            <textarea 
                                placeholder="Describe your property (minimum 20 characters)..." 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800" 
                            />
                            <p className="text-[12px] text-slate-500 font-medium mt-2">Highlight unique selling points like views, proximity to schools/markets, amenities, etc.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Property Category */}
                            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                                <label className="block text-[13px] font-bold text-slate-800 mb-4">Property Category</label>
                                <div className="space-y-3">
                                    <div 
                                        onClick={() => setFormData({ ...formData, propertyType: "FLAT" })} 
                                        className={`border rounded-xl p-4 flex gap-3 cursor-pointer transition-all ${
                                            formData.propertyType === "FLAT" ? "border-[#10b981] bg-[#EEF2FF]" : "border-slate-200/60 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#10b981] shrink-0"><Icon name="domain" size={20} /></div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-[#022c22]">Flat / Apartment</h4>
                                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Self-contained units in a building</p>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => setFormData({ ...formData, propertyType: "INDEPENDENT_HOUSE" })} 
                                        className={`border rounded-xl p-4 flex gap-3 cursor-pointer transition-all ${
                                            formData.propertyType === "INDEPENDENT_HOUSE" ? "border-[#10b981] bg-[#EEF2FF]" : "border-slate-200/60 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-slate-500 shrink-0"><Icon name="home" size={20} /></div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-slate-800">Independent House / Villa</h4>
                                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Standalone villas or bungalows</p>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => setFormData({ ...formData, propertyType: "PG" })} 
                                        className={`border rounded-xl p-4 flex gap-3 cursor-pointer transition-all ${
                                            formData.propertyType === "PG" ? "border-[#10b981] bg-[#EEF2FF]" : "border-slate-200/60 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-slate-500 shrink-0"><Icon name="group" size={20} /></div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-slate-800">Paying Guest (PG)</h4>
                                            <p className="text-[12px] text-slate-500 font-medium mt-0.5">Shared living with services</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BHK Type */}
                            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 flex flex-col">
                                <label className="block text-[13px] font-bold text-slate-800 mb-4">BHK Type (Bedrooms)</label>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[1, 2, 3, 4].map(bhk => (
                                        <div 
                                            key={bhk}
                                            onClick={() => setFormData({ ...formData, bedrooms: bhk })}
                                            className={`border rounded-xl py-3 text-center text-[13px] font-bold cursor-pointer transition-all ${
                                                formData.bedrooms === bhk 
                                                    ? "border-[#10b981] bg-[#EEF2FF] text-[#10b981]" 
                                                    : "border-slate-200/60 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {bhk === 4 ? "4+ BHK" : `${bhk} BHK`}
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Property Area (sq. ft.)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 1200" 
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room Specifications Details */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                            <label className="block text-[13px] font-bold text-slate-800 mb-4">Property Layout Specifications</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Bathrooms</label>
                                    <input 
                                        type="number" 
                                        value={formData.bathrooms} 
                                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })} 
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Kitchens</label>
                                    <input 
                                        type="number" 
                                        value={formData.kitchen} 
                                        onChange={(e) => setFormData({ ...formData, kitchen: parseInt(e.target.value) || 0 })} 
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Balconies</label>
                                    <input 
                                        type="number" 
                                        value={formData.balcony} 
                                        onChange={(e) => setFormData({ ...formData, balcony: parseInt(e.target.value) || 0 })} 
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Floor Number</label>
                                    <input 
                                        type="number" 
                                        value={formData.floor} 
                                        onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })} 
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Furnishing Status */}
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                            <label className="block text-[13px] font-bold text-slate-800 mb-4">Furnishing Status</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div 
                                    onClick={() => setFormData({ ...formData, isFurnished: "FULLY_FURNISHED" })} 
                                    className={`border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                        formData.isFurnished === "FULLY_FURNISHED" 
                                            ? "border-[#10b981] bg-[#EEF2FF] text-[#10b981]" 
                                            : "border-slate-200/60 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <Icon name="chair" size={24} />
                                    <span className="text-[13px] font-bold">Fully Furnished</span>
                                </div>
                                <div 
                                    onClick={() => setFormData({ ...formData, isFurnished: "SEMI_FURNISHED" })} 
                                    className={`border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                        formData.isFurnished === "SEMI_FURNISHED" 
                                            ? "border-[#10b981] bg-[#EEF2FF] text-[#10b981]" 
                                            : "border-slate-200/60 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <Icon name="event_seat" size={24} />
                                    <span className="text-[13px] font-bold">Semi Furnished</span>
                                </div>
                                <div 
                                    onClick={() => setFormData({ ...formData, isFurnished: "UNFURNISHED" })} 
                                    className={`border rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                        formData.isFurnished === "UNFURNISHED" 
                                            ? "border-[#10b981] bg-[#EEF2FF] text-[#10b981]" 
                                            : "border-slate-200/60 hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <Icon name="door_front" size={24} />
                                    <span className="text-[13px] font-bold">Unfurnished</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: LOCATION */}
            {activeStep === 2 && (
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 2 of 7 · Address &amp; Locality</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Where is your property located?</h2>
                        <p className="text-xs sm:text-sm text-[#717171] mt-1">Specify the exact address and location details. This helps tenants find your property easily.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:p-6 md:p-8">
                        {/* Map Area (Mock) */}
                        <div className="flex-1 bg-gray-200 rounded-2xl border border-gray-300 relative overflow-hidden h-[450px]">
                            {/* Fake Map Image Background */}
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="map" />
                            <div className="absolute inset-0 bg-emerald-50/40"></div>

                            {/* Map Pin Mock */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="bg-[#022c22] text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-1 shadow-md">DROP PIN HERE</div>
                                <div className="relative">
                                    <Icon name="location_on" size={48} className="text-[#022c22] drop-shadow-md relative z-10" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500/20 rounded-full animate-ping"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Address Form */}
                        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                                <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#022c22] mb-5">
                                    <Icon name="check_circle_outline" size={20} className="text-[#022c22]" /> Address Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Street / House No.</label>
                                        <input 
                                            type="text" 
                                            value={formData.address} 
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                            className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:border-[#022c22] outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Locality / Area</label>
                                        <input 
                                            type="text" 
                                            value={formData.areaName} 
                                            onChange={(e) => setFormData({ ...formData, areaName: e.target.value })} 
                                            className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:border-[#022c22] outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Landmark (Optional)</label>
                                        <input 
                                            type="text" 
                                            value={formData.landmark || ""} 
                                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} 
                                            placeholder="e.g. Near St. Andrews Church" 
                                            className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 focus:border-[#022c22] outline-none" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">City</label>
                                            <input 
                                                type="text" 
                                                value={formData.city} 
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                                                className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Pincode</label>
                                            <input 
                                                type="text" 
                                                value={formData.pincode} 
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} 
                                                className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5">District (Uttarakhand)</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.district} 
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                className="w-full bg-[#F8FAFC] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="Dehradun">Dehradun</option>
                                                <option value="Nainital">Nainital</option>
                                                <option value="Haridwar">Haridwar</option>
                                                <option value="Pauri Garhwal">Pauri Garhwal</option>
                                                <option value="Tehri Garhwal">Tehri Garhwal</option>
                                                <option value="Udham Singh Nagar">Udham Singh Nagar</option>
                                                <option value="Almora">Almora</option>
                                            </select>
                                            <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5">State</label>
                                        <input 
                                            type="text" 
                                            value="Uttarakhand" 
                                            disabled 
                                            className="w-full bg-[#E2E8F0] border border-slate-200/60 rounded-lg px-4 py-2.5 text-[14px] text-slate-500 outline-none cursor-not-allowed" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: AMENITIES */}
            {activeStep === 3 && (
                <div className="max-w-[820px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 3 of 7 · Features</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Amenities &amp; Facilities</h2>
                        <p className="text-xs sm:text-sm text-[#717171] mt-1">Select all the features available in your property to help verified tenants find you easily.</p>
                    </div>

                    <div className="space-y-10">
                        <AmenitySection title="General" icon="grid_view">
                            {["Power Backup", "Free WiFi", "Air Conditioning", "Lift", "Parking"].map(label => {
                                const iconsMap: Record<string, string> = {
                                    "Power Backup": "bolt",
                                    "Free WiFi": "wifi",
                                    "Air Conditioning": "ac_unit",
                                    "Lift": "elevator",
                                    "Parking": "local_parking"
                                };
                                return (
                                    <div key={label} onClick={() => toggleAmenity(label)}>
                                        <AmenityCard icon={iconsMap[label] || "check"} label={label} isSelected={formData.amenities.includes(label)} />
                                    </div>
                                );
                            })}
                        </AmenitySection>

                        <AmenitySection title="Security" icon="security">
                            {["Gated Security", "CCTV", "Fire Safety", "Smart Lock"].map(label => {
                                const iconsMap: Record<string, string> = {
                                    "Gated Security": "shield",
                                    "CCTV": "videocam",
                                    "Fire Safety": "fire_extinguisher",
                                    "Smart Lock": "vpn_key"
                                };
                                return (
                                    <div key={label} onClick={() => toggleAmenity(label)}>
                                        <AmenityCard icon={iconsMap[label] || "check"} label={label} isSelected={formData.amenities.includes(label)} />
                                    </div>
                                );
                            })}
                        </AmenitySection>

                        <AmenitySection title="Society & Lifestyle" icon="open_in_full">
                            {["Swimming Pool", "Gymnasium", "Garden/Park", "Club House", "Play Area"].map(label => {
                                const iconsMap: Record<string, string> = {
                                    "Swimming Pool": "pool",
                                    "Gymnasium": "fitness_center",
                                    "Garden/Park": "park",
                                    "Club House": "sports_tennis",
                                    "Play Area": "sentiment_satisfied"
                                };
                                return (
                                    <div key={label} onClick={() => toggleAmenity(label)}>
                                        <AmenityCard icon={iconsMap[label] || "check"} label={label} isSelected={formData.amenities.includes(label)} />
                                    </div>
                                );
                            })}
                        </AmenitySection>
                        
                        <AmenitySection title="Kitchen & Indoor" icon="kitchen">
                            {["Modular Kitchen", "Dishwasher", "Laundry Unit", "RO Water"].map(label => {
                                const iconsMap: Record<string, string> = {
                                    "Modular Kitchen": "kitchen",
                                    "Dishwasher": "local_laundry_service",
                                    "Laundry Unit": "local_laundry_service",
                                    "RO Water": "water_drop"
                                };
                                return (
                                    <div key={label} onClick={() => toggleAmenity(label)}>
                                        <AmenityCard icon={iconsMap[label] || "check"} label={label} isSelected={formData.amenities.includes(label)} />
                                    </div>
                                );
                            })}
                        </AmenitySection>
                    </div>
                </div>
            )}

            {/* STEP 4: PHOTOS */}
            {activeStep === 4 && (
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 4 of 7 · Media Gallery</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Photos &amp; Videos</h2>
                        <p className="text-xs sm:text-sm text-[#717171] mt-1">Upload high-clarity room photos directly to ImageKit CDN or paste image URLs below.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 space-y-6">
                            {/* Direct Device File Upload Box */}
                            <div className="bg-white border-2 border-dashed border-[#FF385C]/40 rounded-3xl p-6 sm:p-8 shadow-sm text-center hover:border-[#FF385C] transition-all">
                                <Icon name="cloud_upload" size={36} className="text-[#FF385C] mx-auto mb-2" />
                                <h3 className="text-[16px] font-bold text-[#222222] mb-1">Upload Photos from Device</h3>
                                <p className="text-[12px] text-[#717171] font-medium mb-4">Select JPG/PNG photos from your phone or computer (auto-optimized via ImageKit).</p>
                                <label className="btn-cta-primary px-6 py-3 text-[13px] cursor-pointer">
                                    <Icon name="upload_file" size={18} /> Select Photos
                                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>

                            {/* URL Add Box */}
                            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#022c22] mb-2">
                                    <Icon name="add_photo_alternate" size={20} className="text-[#022c22]" /> Add Photo URL
                                </h3>
                                <p className="text-[12px] text-slate-500 font-medium mb-4">Paste any image web URL directly to dynamically add it to this listing.</p>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. https://images.unsplash.com/photo-..." 
                                        id="new-photo-url-input"
                                        className="flex-1 bg-[#F8FAFC] border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800" 
                                    />
                                    <button 
                                        onClick={() => {
                                            const input = document.getElementById("new-photo-url-input") as HTMLInputElement;
                                            if (input && input.value) {
                                                if (!input.value.startsWith("http")) {
                                                    showToast("Please enter a valid URL beginning with http/https", "error");
                                                    return;
                                                }
                                                setFormData({ ...formData, imageUrls: [...formData.imageUrls, input.value] });
                                                input.value = "";
                                                showToast("Image added!", "success");
                                            }
                                        }}
                                        className="bg-[#0B1E4D] text-white px-6 py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#1c3875]"
                                    >
                                        Add Photo
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <span className="text-[12px] font-bold text-slate-600 block mb-2">Or add high quality presets:</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({ ...formData, imageUrls: [...formData.imageUrls, "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"] })}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                                        >
                                            + Add Living Room
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({ ...formData, imageUrls: [...formData.imageUrls, "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"] })}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                                        >
                                            + Add Bedroom
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({ ...formData, imageUrls: [...formData.imageUrls, "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"] })}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                                        >
                                            + Add Kitchen
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Media */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">UPLOADED MEDIA ({formData.imageUrls.length})</h3>
                                    <span className="text-[12px] text-slate-500 font-medium">Click a photo to remove it</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {formData.imageUrls.map((url, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => {
                                                setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
                                                showToast("Image removed", "info");
                                            }}
                                            className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm relative h-32 cursor-pointer group hover:opacity-85 transition-opacity"
                                        >
                                            {index === 0 && <div className="absolute top-2 left-2 bg-[#059669] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 uppercase">COVER PHOTO</div>}
                                            <div className="absolute inset-0 bg-red-500/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[12px] transition-opacity">Remove</div>
                                            <img src={url} className="w-full h-full object-cover" alt={`Uploaded ${index + 1}`} />
                                        </div>
                                    ))}
                                    {formData.imageUrls.length === 0 && (
                                        <div className="col-span-3 border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                            <Icon name="add_a_photo" size={32} className="mb-2" />
                                            <span className="text-[12px] font-medium">No photos added yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: PRICING */}
            {activeStep === 5 && (
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 5 of 7 · Rent &amp; Deposit</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Configure Pricing</h2>
                        <p className="text-xs sm:text-sm text-[#717171] mt-1">Define your monthly rent, security deposit, and maintenance terms with zero brokerage.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:p-6 md:p-8">
                        {/* Form */}
                        <div className="flex-1 space-y-6">
                            {/* Monthly Rent */}
                            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden">
                                <h3 className="text-[13px] font-bold text-slate-800 mb-4">Monthly Rent (₹)</h3>
                                <div className="border border-slate-200/60 rounded-xl px-4 py-3 flex items-center bg-[#F8FAFC] focus-within:border-[#022c22]">
                                    <span className="text-[20px] font-bold text-slate-400 mr-2">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.rent}
                                        onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                                        className="w-full bg-transparent outline-none text-[24px] font-bold text-slate-900" 
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[12px] text-slate-500 font-medium">Expected monthly income</span>
                                </div>
                            </div>

                            {/* Security Deposit */}
                            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-[13px] font-bold text-slate-800">Security Deposit (₹)</h3>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Refundable amount collected upfront</p>
                                    </div>
                                    <Icon name="info" size={18} className="text-slate-400" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center bg-[#F8FAFC]">
                                        <span className="text-[14px] font-bold text-slate-400 mr-2">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="Amount" 
                                            value={formData.deposit}
                                            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[14px] font-bold text-slate-900" 
                                        />
                                    </div>
                                    <div className="flex bg-[#F1F5F9] rounded-xl p-1 shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deposit: String(Number(formData.rent || 0) * 2) })}
                                            className="bg-white shadow-sm rounded-lg px-4 py-1.5 text-[12px] font-bold text-[#022c22]"
                                        >
                                            2x Rent
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deposit: String(Number(formData.rent || 0) * 5) })}
                                            className="rounded-lg px-4 py-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-800"
                                        >
                                            5x Rent
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Maintenance Charges */}
                                <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
                                    <h3 className="text-[13px] font-bold text-slate-800 mb-4">Maintenance Charges (₹ / month)</h3>
                                    <div className="border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center bg-[#F8FAFC] mb-4">
                                        <span className="text-[14px] font-bold text-slate-400 mr-2">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="Monthly" 
                                            value={formData.maintenance}
                                            onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[14px] text-slate-900" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* STEP 6: PREVIEW */}
            {activeStep === 6 && (
                <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C]">Step 6 of 7 · Live Preview</span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight mt-0.5">Preview Listing</h2>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm p-2 mb-8">
                        <div className="grid grid-cols-3 gap-2 h-[400px]">
                            <div className="col-span-2 relative rounded-2xl overflow-hidden bg-slate-100">
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 shadow-sm border border-white">
                                    <Icon name="verified" size={16} className="text-[#10b981]" />
                                    <span className="text-[11px] font-bold text-[#022c22] tracking-wide">ELITE VERIFIED</span>
                                </div>
                                {formData.imageUrls && formData.imageUrls[0] ? (
                                    <img src={formData.imageUrls[0]} alt="Property Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image Uploaded</div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="h-1/2 rounded-2xl overflow-hidden bg-slate-100">
                                    {formData.imageUrls && formData.imageUrls[1] ? (
                                        <img src={formData.imageUrls[1]} alt="Property View 2" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image 2</div>
                                    )}
                                </div>
                                <div className="h-1/2 rounded-2xl overflow-hidden bg-slate-100 relative">
                                    {formData.imageUrls && formData.imageUrls[2] ? (
                                        <img src={formData.imageUrls[2]} alt="Property View 3" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image 3</div>
                                    )}
                                    {formData.imageUrls && formData.imageUrls.length > 3 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                            <span className="text-white font-bold text-lg">+ {formData.imageUrls.length - 3} Photos</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:p-6 md:p-8">
                        <div className="flex-1 space-y-8">
                            <div className="bg-white rounded-3xl border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h1 className="text-[28px] font-bold text-[#022c22] mb-2 leading-tight">
                                            {formData.title || "Untitled Property Listing"}
                                        </h1>
                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                            <Icon name="location_on" size={18} className="text-[#10b981]" />
                                            <span>{formData.address}, {formData.areaName}, {formData.city}, {formData.pincode} ({formData.district} district)</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[28px] font-bold text-[#10b981]">
                                            ₹{Number(formData.rent || 0).toLocaleString()}<span className="text-[16px] text-slate-500 font-medium">/mo</span>
                                        </div>
                                        <div className="text-[12px] font-bold text-slate-500 mt-1">
                                            Deposit: ₹{Number(formData.deposit || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100">
                                    <div className="flex flex-col items-center justify-center border-r border-slate-200/60 last:border-0">
                                        <Icon name="bed" size={24} className="text-[#10b981] mb-2" />
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">BHK</span>
                                        <span className="text-[14px] font-bold text-[#022c22]">{formData.bedrooms} BHK</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center border-r border-slate-200/60 last:border-0">
                                        <Icon name="square_foot" size={24} className="text-[#10b981] mb-2" />
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Area</span>
                                        <span className="text-[14px] font-bold text-[#022c22]">{formData.area} sq. ft.</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center border-r border-slate-200/60 last:border-0">
                                        <Icon name="chair" size={24} className="text-[#10b981] mb-2" />
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Furnishing</span>
                                        <span className="text-[14px] font-bold text-[#022c22]">{formData.isFurnished.replace("_", " ")}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center border-r border-slate-200/60 last:border-0">
                                        <Icon name="directions_car" size={24} className="text-[#10b981] mb-2" />
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parking</span>
                                        <span className="text-[14px] font-bold text-[#022c22]">{formData.parking}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm">
                                <h3 className="text-[20px] font-bold text-[#022c22] mb-4">About this property</h3>
                                <p className="text-[15px] text-slate-600 leading-relaxed font-medium mb-4 whitespace-pre-wrap">
                                    {formData.description || "No description provided."}
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm">
                                <h3 className="text-[20px] font-bold text-[#022c22] mb-6">Property Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                    {formData.amenities.map(amenity => {
                                        const iconsMap: Record<string, string> = {
                                            "Power Backup": "bolt",
                                            "Free WiFi": "wifi",
                                            "Air Conditioning": "ac_unit",
                                            "Lift": "elevator",
                                            "Parking": "local_parking",
                                            "Gated Security": "shield",
                                            "CCTV": "videocam",
                                            "Fire Safety": "fire_extinguisher",
                                            "Smart Lock": "vpn_key",
                                            "Swimming Pool": "pool",
                                            "Gymnasium": "fitness_center",
                                            "Garden/Park": "park",
                                            "Club House": "sports_tennis",
                                            "Play Area": "sentiment_satisfied",
                                            "Modular Kitchen": "kitchen",
                                            "Dishwasher": "local_laundry_service",
                                            "Laundry Unit": "local_laundry_service",
                                            "RO Water": "water_drop"
                                        };
                                        return (
                                            <div key={amenity} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#10b981]">
                                                    <Icon name={iconsMap[amenity] || "check"} size={20} />
                                                </div>
                                                <span className="font-bold text-[14px] text-slate-800">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                    {formData.amenities.length === 0 && (
                                        <p className="text-slate-400 text-sm col-span-3">No amenities listed.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 7: PUBLISH */}
            {activeStep === 7 && (
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
                    <div className="hero-mesh-bg rounded-2xl border border-[#EBEBEB] p-6 sm:p-8 text-center mb-6">
                        <div className="w-16 h-16 bg-[#FFF0F3] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FFD1D8]">
                            <Icon name="celebration" size={32} className="text-[#FF385C]" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight mb-2">You&apos;re ready to launch!</h2>
                        <p className="text-xs sm:text-sm text-[#717171] max-w-[500px] mx-auto leading-relaxed">
                            Your verified listing is ready. Review the summary below and click &ldquo;Publish Listing&rdquo; to go live immediately.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <h3 className="text-[20px] font-bold text-[#022c22]">Listing Summary</h3>
                                <button className="text-[#10b981] font-bold text-[14px] hover:underline" onClick={() => setActiveStep(1)}>Edit details</button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#10b981]">
                                        <Icon name="domain" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-500">Property Name</p>
                                        <p className="font-bold text-[15px] text-[#022c22] truncate max-w-[160px]">{formData.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#10b981]">
                                        <Icon name="image" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-500">Media Quality</p>
                                        <p className="font-bold text-[15px] text-[#022c22]">{formData.imageUrls.length} Photo(s)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#10b981]">
                                        <Icon name="currency_rupee" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-500">Expected Rent</p>
                                        <p className="font-bold text-[15px] text-[#022c22]">₹{Number(formData.rent || 0).toLocaleString()} / month</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#10b981]">
                                        <Icon name="verified_user" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-500">Verification Status</p>
                                        <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mt-0.5">Ready for Review</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[320px] shrink-0">
                            <div className="bg-[#0B1E4D] rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-xl h-full flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Icon name="rocket_launch" size={120} />
                                </div>
                                <h3 className="text-[22px] font-bold mb-6 relative z-10">What's next?</h3>
                                <div className="space-y-6 relative z-10 flex-1">
                                    <div className="flex gap-4">
                                        <Icon name="fact_check" size={24} className="text-emerald-300 shrink-0" />
                                        <p className="text-[13px] text-emerald-50 font-medium leading-relaxed">Your property details will go live immediately on publication.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Icon name="notifications_active" size={24} className="text-emerald-300 shrink-0" />
                                        <p className="text-[13px] text-emerald-50 font-medium leading-relaxed">You can manage this property and see scheduled tours directly in the Owner Portal.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* OTHER STEPS PLACEHOLDER */}
            {![1, 2, 3, 4, 5, 6, 7].includes(activeStep) && (
                <div className="flex flex-col items-center justify-center h-[600px] text-center">
                    <Icon name="construction" size={64} className="text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-[#022c22] mb-2">Step {activeStep} Development</h2>
                    <p className="text-slate-500">This step is currently a placeholder for the wizard flow.</p>
                </div>
            )}

            {/* BOTTOM FIXED BAR */}
            <div className="fixed bottom-0 left-0 md:left-[270px] right-0 bg-white/95 backdrop-blur-md border-t border-[#EBEBEB] p-3.5 sm:px-8 flex flex-col sm:flex-row items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.04)] z-50 gap-3 sm:gap-0">
                
                {/* Left side: Back & Help */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4">
                    <button onClick={handleBack} disabled={isSubmitting || activeStep === 1} className="btn-cta-secondary w-full sm:w-auto px-5 py-2.5 text-xs disabled:opacity-30">
                        <Icon name="arrow_back" size={16} /> Back
                    </button>
                </div>
                
                {/* Right side: Progress & Next */}
                <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3 sm:gap-5">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#008A05] animate-pulse"></div>
                        <span className="text-xs font-bold text-[#717171]">Progress: {calculateProgress()}% Complete</span>
                    </div>
                    <button 
                        onClick={activeStep === 7 ? handlePublish : handleNext} 
                        disabled={isSubmitting}
                        className="btn-cta-primary w-full sm:w-auto px-7 py-2.5 text-xs sm:text-sm disabled:opacity-50"
                    >
                        {isSubmitting ? "Publishing..." : activeStep === 7 ? "Publish Listing" : "Next Step"} <Icon name={activeStep === 7 ? "rocket_launch" : "arrow_forward"} size={16} />
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

const SidebarStep = ({ icon, label, step, currentStep, onClick }: any) => {
    const isActive = step === currentStep;
    
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all text-left active:scale-[0.98] ${
            isActive 
                ? "bg-[#FFF0F3] text-[#FF385C]" 
                : "text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]"
            }`}
        >
            <Icon name={icon} size={18} className={isActive ? "text-[#FF385C]" : "text-[#717171]"} />
            <span>{label}</span>
        </button>
    );
};

const AmenitySection = ({ title, icon, children }: any) => (
    <div>
        {title && (
            <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#022c22] mb-4">
                <Icon name={icon} size={20} className="text-[#022c22]" /> {title}
            </h3>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {children}
        </div>
    </div>
);

const AmenityCard = ({ icon, label, isSelected }: any) => (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer bg-white h-24 ${
        isSelected 
            ? "border-[#10b981] shadow-sm" 
            : "border-gray-100 hover:border-slate-200/60 hover:bg-slate-50 shadow-sm"
    }`}>
        <Icon name={icon} size={28} className={isSelected ? "text-[#022c22] mb-2" : "text-slate-500 mb-2"} />
        <span className={`text-[12px] font-bold text-center leading-tight ${isSelected ? "text-[#022c22]" : "text-slate-700"}`}>
            {label}
        </span>
    </div>
);

export default function PostPropertyPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500">Loading Property Wizard...</div>}>
      <PostPropertyContent />
    </Suspense>
  );
}
