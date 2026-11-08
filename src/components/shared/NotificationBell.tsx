"use client";

import React, { useState, useEffect } from "react";
import Icon from "./Icon";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => {});
    showToast("All notifications marked as read", "success");
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1b253b] transition-colors relative"
        title="Notifications"
      >
        <Icon name="notifications" size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-[#0c0f17]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161f32] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-[#10b981] font-bold hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-[13px]">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    !notif.isRead ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""
                  }`}
                >
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-wider">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
