"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User, Role } from "../types";
import { useUser, useClerk } from "@clerk/nextjs";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => void;
  loginMockUser: (role: Role) => void;
  logout: () => void;
  updateUserRole: (role: Role) => void;
  setOnboardingOption: (option: "FIND_HOME" | "LIST_PROPERTY" | "BOTH") => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  toggleUserMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();

  const [guestUser, setGuestUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [dbSynced, setDbSynced] = useState(false);

  // Load guest session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ghar_guest_user");
    if (storedUser) {
      try {
        setGuestUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse guest session", e);
      }
    }
  }, []);

  // ─── DB Sync ──────────────────────────────────────────────────────────────
  // When a Clerk user signs in, ensure they exist in our PostgreSQL database
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || dbSynced) return;

    const syncUser = async () => {
      try {
        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            name: clerkUser.fullName || clerkUser.firstName || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress || null,
            phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
            image: clerkUser.imageUrl || null,
          }),
        });
        if (response.ok) {
          // Fetch the full DB user profile to get onboarding options, role, etc.
          const resUser = await fetch("/api/user");
          if (resUser.ok) {
            const fullUser = await resUser.json();
            setDbUser(fullUser);
          }
          setDbSynced(true);
        }
      } catch (e) {
        console.error("DB user sync failed (non-blocking):", e);
        // Non-blocking — user can still use the app
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser, dbSynced]);

  // Clear guest session when Clerk user is authenticated
  useEffect(() => {
    if (isSignedIn && guestUser) {
      localStorage.removeItem("ghar_guest_user");
      setGuestUser(null);
    }
  }, [isSignedIn, guestUser]);

  // Compute aggregated user from Clerk user OR Guest session
  const activeUser = useMemo<User | null>(() => {
    if (!isLoaded) return null;

    if (isSignedIn && clerkUser) {
      // Check role/onboarding overlays from Clerk publicMetadata or local overrides
      const cachedRole = localStorage.getItem(`clerk_role_${clerkUser.id}`) as Role;
      const cachedOnboard = localStorage.getItem(`clerk_onboard_${clerkUser.id}`) as any;
      const cachedWorkspace = localStorage.getItem(`clerk_workspace_${clerkUser.id}`);
      const activeWorkspace = dbUser?.activeWorkspace || cachedWorkspace || "SEARCH";
      const onboardingStatus = dbUser?.onboardingStatus || "NOT_STARTED";

      const role = dbUser?.role || cachedRole || (clerkUser.publicMetadata?.role as Role) || "RENTER";

      return {
        id: clerkUser.id,
        name: dbUser?.name || clerkUser.fullName || clerkUser.firstName || "Uttarakhand Citizen",
        email: dbUser?.email || clerkUser.primaryEmailAddress?.emailAddress || null,
        phone: dbUser?.phone || clerkUser.primaryPhoneNumber?.phoneNumber || null,
        image: dbUser?.image || clerkUser.imageUrl || null,
        role: role,
        activeWorkspace: activeWorkspace,
        onboardingStatus: onboardingStatus,
        ownerProfile: dbUser?.ownerProfile || null,
        tenantProfile: dbUser?.tenantProfile || null,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : new Date().toISOString(),
      };
    }

    return guestUser;
  }, [isLoaded, isSignedIn, clerkUser, guestUser, dbUser]);

  const loginAsGuest = useCallback(() => {
    const guestObj: User = {
      id: "usr-guest-temp-" + Math.floor(Math.random() * 1000),
      name: "Guest Renter",
      email: null,
      phone: null,
      image: null,
      role: "GUEST",
      activeWorkspace: "SEARCH",
      onboardingStatus: "COMPLETED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGuestUser(guestObj);
    localStorage.setItem("ghar_guest_user", JSON.stringify(guestObj));
  }, []);

  const loginMockUser = useCallback((role: Role) => {
    const mockObj: User = {
      id: "usr-mock-" + role.toLowerCase(),
      name: `Demo ${role === "OWNER" ? "Property Owner" : "Premium Tenant"}`,
      email: `demo-${role.toLowerCase()}@eliterent.com`,
      phone: "+91 99999 99999",
      image: null,
      role: role,
      activeWorkspace: role === "OWNER" ? "HOSTING" : "SEARCH",
      onboardingStatus: "COMPLETED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGuestUser(mockObj);
    localStorage.setItem("ghar_guest_user", JSON.stringify(mockObj));
    document.cookie = "clerk_bypass=true; path=/; max-age=86400";
  }, []);

  const logout = useCallback(() => {
    if (isSignedIn) {
      clerk.signOut();
    }
    setGuestUser(null);
    setDbUser(null);
    setDbSynced(false);
    localStorage.removeItem("ghar_guest_user");
    document.cookie = "clerk_bypass=; path=/; max-age=0";
    document.cookie = "ghar_phone_uid=; path=/; max-age=0";
  }, [isSignedIn, clerk]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (isSignedIn && clerkUser) {
      try {
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          throw new Error("Failed to update profile in database");
        }
        const updatedUser = await res.json();
        setDbUser(updatedUser);

        // Update local storage fallbacks
        if (data.activeWorkspace) {
          localStorage.setItem(`clerk_workspace_${clerkUser.id}`, data.activeWorkspace);
        }
      } catch (err) {
        console.error("Failed to patch user profile:", err);
        throw err;
      }
    } else if (guestUser) {
      const updated = { ...guestUser, ...data } as User;
      setGuestUser(updated);
      localStorage.setItem("ghar_guest_user", JSON.stringify(updated));
      if (guestUser.id?.startsWith("usr_phone_")) {
        try {
          const res = await fetch("/api/user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            const dbUpdated = await res.json();
            setGuestUser(dbUpdated);
            localStorage.setItem("ghar_guest_user", JSON.stringify(dbUpdated));
          }
        } catch {
          // Non-blocking fallback
        }
      }
    }
  }, [isSignedIn, clerkUser, guestUser]);

  const updateUserRole = useCallback(async (role: Role) => {
    await updateProfile({ role });
  }, [updateProfile]);

  const setOnboardingOption = useCallback(async (option: "FIND_HOME" | "LIST_PROPERTY" | "BOTH") => {
    let newRole: Role = "RENTER";
    if (option === "FIND_HOME") newRole = "RENTER";
    else if (option === "LIST_PROPERTY") newRole = "OWNER";
    else if (option === "BOTH") newRole = "OWNER";

    await updateProfile({ role: newRole });
  }, [updateProfile]);

  const toggleUserMode = useCallback(async () => {
    if (isSignedIn && clerkUser && activeUser) {
      const newMode = activeUser.activeWorkspace === "HOSTING" ? "SEARCH" : "HOSTING";
      try {
        await updateProfile({ activeWorkspace: newMode });
        localStorage.setItem(`clerk_workspace_${clerkUser.id}`, newMode);
      } catch (err) {
        console.error("Failed to toggle mode:", err);
      }
    } else if (guestUser) {
      const newMode = guestUser.activeWorkspace === "HOSTING" ? "SEARCH" : "HOSTING";
      const updated = { ...guestUser, activeWorkspace: newMode } as User;
      setGuestUser(updated);
      localStorage.setItem("ghar_guest_user", JSON.stringify(updated));
    }
  }, [isSignedIn, clerkUser, activeUser, guestUser, updateProfile]);

  const isAuthenticated = activeUser !== null && activeUser.role !== "GUEST";

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading: !isLoaded,
        loginAsGuest,
        loginMockUser,
        logout,
        updateUserRole,
        setOnboardingOption,
        updateProfile,
        isAuthenticated,
        toggleUserMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
