"use client";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/lib/context/ToastContext";
import Icon from "@/components/shared/Icon";

export const VisitCard = ({ time, title, person, image, onClick }: any) => (
    <div onClick={onClick} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 shadow-sm items-center hover:shadow-md transition-shadow cursor-pointer">
        <img src={image} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" alt="visit" />
        <div className="min-w-0">
            <p className="text-[#022c22] font-semibold text-[13px]">{time}</p>
            <p className="text-slate-800 font-medium text-[14px] truncate">{title}</p>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-0.5">
                <Icon name="person_outline" size={14} />
                <span className="truncate">{person}</span>
            </div>
        </div>
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
            showToast(data.action === "added" ? "Added to favorites" : "Removed from favorites", "success");
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update favorite", "error");
        }
    });

    return (
        <div 
            onClick={() => router.push(`/property/${id}`)}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative"
        >
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-[#022c22] shadow-sm z-10 uppercase">
                {badge}
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteMutation.mutate();
                }}
                disabled={toggleFavoriteMutation.isPending}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10 shadow-sm"
            >
                <Icon 
                    name={isFavorited ? "favorite" : "favorite_border"} 
                    size={18} 
                    className={isFavorited ? "text-red-500" : "text-slate-400 hover:text-red-500"} 
                />
            </button>
            <div className="h-40 overflow-hidden">
                <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="prop" />
            </div>
            <div className="p-4 space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-[15px] truncate pr-2">{title}</h4>
                    <span className="text-[#022c22] font-bold text-[14px] shrink-0">{price}</span>
                </div>
                <p className="text-[12.5px] text-slate-500 truncate">{location}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 font-medium border-t border-gray-50 mt-2">
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="bed" size={14} /> {specs.split('•')[0].trim()}</div>
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="shower" size={14} /> {specs.split('•')[1].trim()}</div>
                    <div className="flex items-center gap-1.5 mt-2"><Icon name="square_foot" size={14} /> {specs.split('•')[2].trim()}</div>
                </div>
            </div>
        </div>
    );
};

export const LargePropertyCard = ({ id, image, isPremium, isVerified, title, price, location, specs, isNew, readyToMove, onDelete, onEdit }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative flex flex-col h-full">
        <div className="relative h-[220px] overflow-hidden">
            {isPremium && (
                <div className="absolute top-4 left-4 bg-[#022c22] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider z-10 shadow-sm">PREMIUM</div>
            )}
            {isVerified && (
                <div className={`absolute left-4 bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider z-10 shadow-sm flex items-center gap-1 ${isPremium ? 'top-10' : 'top-4'}`}><Icon name="check_circle" size={12} /> VERIFIED</div>
            )}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                {onEdit && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                        className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 hover:bg-white hover:text-emerald-600 transition-colors shadow-sm"
                        title="Edit Property"
                    >
                        <Icon name="edit" size={16} />
                    </button>
                )}
                {onDelete && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                        className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 hover:bg-white hover:text-red-600 transition-colors shadow-sm"
                        title="Delete Property"
                    >
                        <Icon name="delete" size={16} />
                    </button>
                )}
            </div>
            <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="prop" />
        </div>

        <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[18px] text-slate-800 leading-tight flex-1 pr-2">{title}</h3>
                <div className="text-right shrink-0">
                    <span className="font-bold text-[18px] text-[#022c22] block">{price}</span>
                </div>
            </div>
            <p className="text-[13px] text-slate-500 font-medium flex items-center gap-1 mb-4"><Icon name="location_on" size={16} /> {location}</p>

            <div className="flex items-center gap-4 text-[12px] text-slate-600 font-bold mb-5 pb-5 border-b border-gray-100">
                <span className="flex flex-col gap-1 items-center"><Icon name="bed" size={20} className="text-slate-400" /> {specs.split('•')[0].trim()}</span>
                <span className="flex flex-col gap-1 items-center"><Icon name="shower" size={20} className="text-slate-400" /> {specs.split('•')[1].trim()}</span>
                <span className="flex flex-col gap-1 items-center"><Icon name="square_foot" size={20} className="text-slate-400" /> {specs.split('•')[2].trim()}</span>
            </div>

            <div className="mt-auto flex items-center justify-between">
                {isNew && <span className="bg-orange-100 text-orange-700 font-bold text-[10px] px-2 py-1 rounded">New Listing</span>}
                {readyToMove && <span className="text-green-600 font-bold text-[11px] flex items-center gap-1"><Icon name="bolt" size={14} /> Ready to move</span>}
                {!isNew && !readyToMove && <div className="flex -space-x-2"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold border border-white">JD</div><div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-white">MK</div></div>}

                <button onClick={() => window.location.href = `/property/${id}`} className="text-[#022c22] font-bold text-[12px] flex items-center gap-1 hover:underline ml-auto">View Details <Icon name="arrow_forward" size={14} /></button>
            </div>
        </div>
    </div>
);

export const SearchHistoryItem = ({ title, subtitle }: any) => (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Icon name="history" size={16} />
        </div>
        <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-800 truncate">{title}</p>
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
        </div>
    </div>
);

export const QuickActionCard = ({ icon, label }: any) => (
    <button className="bg-[#2D4FAD] hover:bg-[#395CBB] rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-colors border border-[#3E62CA] active:scale-[0.98] transition-all">
        <Icon name={icon} size={20} className="text-emerald-200" />
        <span className="text-emerald-100 text-[11px] font-medium">{label}</span>
    </button>
);

export const MessageItem = ({ avatar, name, snippet, color, isUnread }: any) => (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm relative">
        {isUnread && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${color}`}>
            {avatar}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-slate-800 truncate pr-3">{name}</p>
            <p className={`text-[12px] truncate pr-2 ${isUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{snippet}</p>
        </div>
    </div>
);

export const SavedPropertyItem = ({ title, price, image }: any) => (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
            <img src={image} className="w-12 h-10 rounded object-cover shrink-0" alt="saved prop" />
            <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-800 truncate">{title}</p>
                <p className="text-[12.5px] font-bold text-[#022c22]">{price}</p>
            </div>
        </div>
        <Icon name="chevron_right" size={18} className="text-slate-400 shrink-0" />
    </div>
);

export const StatCard = ({ title, value, trend, trendColor }: any) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
        <div className="flex flex-col gap-1">
            <span className="text-[36px] font-bold text-slate-900 leading-none">{value}</span>
            <span className={`text-[12px] font-bold ${trendColor} mt-2`}>{trend}</span>
        </div>
    </div>
);

export const ChartBar = ({ month, val1, val2 }: any) => (
    <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-[200px] flex items-end justify-center gap-1 group relative">
            <div className="w-4 bg-[#CBD5E1] rounded-t-sm group-hover:bg-slate-400 transition-colors" style={{ height: `${val1}%` }}></div>
            <div className="w-4 bg-[#022c22] rounded-t-sm group-hover:bg-[#15345a] transition-colors" style={{ height: `${val2}%` }}></div>
            <div className="absolute -top-10 hidden group-hover:flex bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {val2} Views, {val1} Leads
            </div>
        </div>
        <span className="text-[11px] font-bold text-slate-500">{month}</span>
    </div>
);

export const ManagementCard = ({ icon, label }: any) => (
    <button className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
        <Icon name={icon} size={24} className="text-[#022c22]" />
        <span className="text-slate-700 text-[12px] font-bold">{label}</span>
    </button>
);



