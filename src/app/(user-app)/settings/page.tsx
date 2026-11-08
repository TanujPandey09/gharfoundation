"use client";

import React from "react";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";

export default function SettingsPage() {
    const { user, updateUserRole } = useAuth();
    const { showToast } = useToast();
    const role = user?.role || "RENTER";

    return <SettingsTab user={user} role={role} updateUserRole={updateUserRole} showToast={showToast} />;
}
