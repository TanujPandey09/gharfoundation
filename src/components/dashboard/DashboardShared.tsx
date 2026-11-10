"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";

export const VisitCard = ({ time, title, person, image, onClick }: any) => (
    <div
        onClick={onClick}
        className="bg-white rounded-2xl border border-[#EBEBEB] p-4 flex gap-3.5 items-center hover:border-[#222222] hover:shadow-sm transition-all cursor-pointer active:scale-[0.99]"
    >
        <img
            src={image}
            className="w-16 h-16 rounded-xl object-cover bg-[#F7F7F7] shrink-0 border border-[#EBEBEB]"
            alt={title || "Visit"}
        />
        <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 text-[#008A05] bg-[#E8F5E9] px-2 py-0.5 rounded-md font-bold text-[11px]">
                <Icon name="schedule" size={12} />
                <span className="truncate">{time}</span>
            </span>
            <p className="text-[#222222] font-bold text-sm truncate mt-1">{title}</p>
            <div className="flex items-center gap-1.5 text-xs text-[#717171] mt-0.5">
                <Icon name="person_outline" size={14} />
                <span className="truncate">{person}</span>
            </div>
        </div>
        <Icon name="chevron_right" size={18} className="text-[#717171] shrink-0" />
    </div>
);

export const PropertyMiniCard = ({ id, image, badge, title, price, location, specs }: any) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const favorites: any = queryClient.getQueryData(["user-favorites"]) || [];
    const isFavorited = favorites.some((f: any) => f.propertyId === id || f.property?.id === id);

    const toggleFavoriteMutation = useMutation({
        mutationFn: async () => {
            if (isFavorited) {
                const record = favorites.find((f: any) => f.propertyId === id || f.property?.id === id);
                const targetId = record?.id || id;
                const res = await fetch(`/api/favorites/${targetId}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to remove favorite");
                return { action: "removed" };
            } else {
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ propertyId: id }),
                });
                if (!res.ok) throw new Error("Failed to add favorite");
                return { action: "added" };
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
            showToast(data.action === "added" ? "Saved to wishlist" : "Removed from wishlist", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update favorite", "error");
        },
    });

    const specParts = (specs || "").split("•").map((s: string) => s.trim());

    return (
        <div
            onClick={() => router.push(`/property/${id}`)}
            className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden hover:border-[#222222] hover:shadow-md transition-all group cursor-pointer relative flex flex-col"
        >
            <div className="relative h-40 overflow-hidden bg-[#F7F7F7]">
                {badge && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#222222] shadow-sm z-10 uppercase tracking-wider">
                        {badge}
                    </div>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation.mutate();
                    }}
                    disabled={toggleFavoriteMutation.isPending}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10 shadow-sm hover:scale-105 active:scale-95"
                >
                    <Icon
                        name={isFavorited ? "favorite" : "favorite_border"}
                        size={17}
                        className={isFavorited ? "text-[#FF385C]" : "text-[#222222] hover:text-[#FF385C]"}
                    />
                </button>
                <img
                    src={image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={title || "Property"}
                />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-[#222222] text-sm truncate group-hover:text-[#FF385C] transition-colors">
                            {title}
                        </h4>
                        <span className="text-[#222222] font-extrabold text-sm shrink-0 tabular-nums">{price}</span>
                    </div>
                    <p className="text-xs text-[#717171] truncate mt-0.5">{location}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#717171] pt-3 mt-3 font-semibold border-t border-[#EBEBEB]">
                    {specParts[0] && (
                        <span className="flex items-center gap-1">
                            <Icon name="bed" size={14} /> {specParts[0]}
                        </span>
                    )}
                    {specParts[1] && (
                        <span className="flex items-center gap-1">
                            <Icon name="shower" size={14} /> {specParts[1]}
                        </span>
                    )}
                    {specParts[2] && (
                        <span className="flex items-center gap-1">
                            <Icon name="square_foot" size={14} /> {specParts[2]}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const LargePropertyCard = ({
    id,
    image,
    isPremium,
    isVerified,
    title,
    price,
    location,
    specs,
    isNew,
    readyToMove,
    onDelete,
    onEdit,
    onClick,
}: any) => {
    const router = useRouter();
    const specParts = (specs || "").split("•").map((s: string) => s.trim());

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else if (id) {
            router.push(`/property/${id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden hover:border-[#222222] hover:shadow-md transition-all group cursor-pointer relative flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden bg-[#F7F7F7]">
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {isVerified && (
                        <span className="bg-[#008A05] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                            <Icon name="verified" size={12} fill /> VERIFIED
                        </span>
                    )}
                    {isPremium && (
                        <span className="bg-[#222222] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm">
                            FEATURED
                        </span>
                    )}
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(id);
                            }}
                            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#222222] hover:bg-[#222222] hover:text-white transition-colors shadow-sm"
                            title="Edit Property"
                        >
                            <Icon name="edit" size={15} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                            }}
                            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#222222] hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                            title="Delete Property"
                        >
                            <Icon name="delete" size={15} />
                        </button>
                    )}
                </div>
                <img
                    src={image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={title || "Property"}
                />
            </div>

            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-base text-[#222222] leading-snug truncate flex-1 group-hover:text-[#FF385C] transition-colors">
                            {title}
                        </h3>
                        <span className="font-extrabold text-base text-[#222222] shrink-0 tabular-nums">{price}</span>
                    </div>
                    <p className="text-xs text-[#717171] font-medium flex items-center gap-1 truncate mb-3.5">
                        <Icon name="location_on" size={14} className="text-[#FF385C] shrink-0" />
                        <span className="truncate">{location}</span>
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#EBEBEB] text-[11px] text-[#222222] font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                            <Icon name="bed" size={15} className="text-[#717171]" /> {specParts[0] || "1 BHK"}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                            <Icon name="shower" size={15} className="text-[#717171]" /> {specParts[1] || "1 Bath"}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                            <Icon name="square_foot" size={15} className="text-[#717171]" /> {specParts[2] || "600 sqft"}
                        </span>
                    </div>
                </div>

                <div className="pt-3.5 flex items-center justify-between">
                    {isNew ? (
                        <span className="bg-[#FFF0F3] text-[#FF385C] font-bold text-[10px] px-2.5 py-1 rounded-full">
                            New Listing
                        </span>
                    ) : readyToMove ? (
                        <span className="text-[#008A05] font-bold text-xs flex items-center gap-1">
                            <Icon name="check_circle" size={14} fill /> Ready to move
                        </span>
                    ) : (
                        <span className="text-[11px] font-semibold text-[#717171]">Direct Owner</span>
                    )}

                    <span className="text-[#222222] group-hover:text-[#FF385C] font-bold text-xs flex items-center gap-1 transition-colors">
                        View Details <Icon name="arrow_forward" size={14} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export const SearchHistoryItem = ({ title, subtitle }: any) => (
    <div className="bg-white border border-[#EBEBEB] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-[#222222] transition-all active:scale-[0.99]">
        <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-[#222222] shrink-0">
            <Icon name="travel_explore" size={16} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#222222] truncate">{title}</p>
            <p className="text-[11px] text-[#717171] truncate">{subtitle}</p>
        </div>
        <Icon name="chevron_right" size={16} className="text-[#717171] shrink-0" />
    </div>
);

export const QuickActionCard = ({ icon, label }: any) => (
    <button
        type="button"
        className="w-full bg-[#F7F7F7] hover:bg-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-[#EBEBEB] hover:border-[#222222] active:scale-[0.98] transition-all group"
    >
        <Icon name={icon} size={20} className="text-[#222222] group-hover:text-[#FF385C] transition-colors" />
        <span className="text-[#222222] text-xs font-bold">{label}</span>
    </button>
);

export const MessageItem = ({ avatar, name, snippet, color, isUnread }: any) => (
    <div className="bg-white border border-[#EBEBEB] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-[#222222] transition-all relative">
        {isUnread && <div className="absolute top-3 right-3 w-2 h-2 bg-[#FF385C] rounded-full" />}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color || "bg-[#F7F7F7] text-[#222222]"}`}>
            {avatar}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#222222] truncate pr-3">{name}</p>
            <p className={`text-xs truncate pr-2 ${isUnread ? "text-[#222222] font-semibold" : "text-[#717171]"}`}>{snippet}</p>
        </div>
    </div>
);

export const SavedPropertyItem = ({ title, price, image }: any) => (
    <div className="bg-white border border-[#EBEBEB] rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-[#222222] transition-all active:scale-[0.99]">
        <div className="flex items-center gap-3 min-w-0">
            <img src={image} className="w-12 h-11 rounded-lg object-cover shrink-0 bg-[#F7F7F7]" alt={title || "Saved"} />
            <div className="min-w-0">
                <p className="text-xs font-bold text-[#222222] truncate">{title}</p>
                <p className="text-xs font-extrabold text-[#008A05] tabular-nums mt-0.5">{price}</p>
            </div>
        </div>
        <Icon name="chevron_right" size={18} className="text-[#717171] shrink-0" />
    </div>
);

export const StatCard = ({ title, value, trend, trendColor }: any) => (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 flex flex-col justify-between">
        <h4 className="text-[11px] font-bold text-[#717171] uppercase tracking-wider">{title}</h4>
        <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#222222] leading-none tabular-nums block">{value}</span>
            <span className={`text-xs font-bold ${trendColor || "text-[#717171]"} mt-2 inline-block`}>{trend}</span>
        </div>
    </div>
);

export const ChartBar = ({ month, val1, val2 }: any) => (
    <div className="flex flex-col items-center gap-2.5 flex-1">
        <div className="w-full max-w-[44px] h-[180px] flex items-end justify-center gap-1.5 group relative">
            <div
                className="w-3.5 bg-[#EBEBEB] rounded-t-md group-hover:bg-[#B0B0B0] transition-colors"
                style={{ height: `${val1}%` }}
            />
            <div
                className="w-3.5 bg-[#222222] rounded-t-md group-hover:bg-[#FF385C] transition-colors"
                style={{ height: `${val2}%` }}
            />
            <div className="absolute -top-9 hidden group-hover:flex bg-[#222222] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap z-10">
                {val2} Views · {val1} Leads
            </div>
        </div>
        <span className="text-[11px] font-bold text-[#717171]">{month}</span>
    </div>
);

export const ManagementCard = ({ icon, label }: any) => (
    <button
        type="button"
        className="w-full bg-[#F7F7F7] hover:bg-white rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 border border-[#EBEBEB] hover:border-[#222222] active:scale-[0.98] transition-all group"
    >
        <Icon name={icon} size={22} className="text-[#222222] group-hover:text-[#FF385C] transition-colors" />
        <span className="text-[#222222] text-xs font-bold">{label}</span>
    </button>
);
