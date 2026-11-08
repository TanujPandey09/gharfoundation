import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import React from "react";
import Icon from "@/components/shared/Icon";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col items-center justify-center space-y-6">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <Icon name="sync" size={48} className="text-[#FF385C] animate-spin" />
        <h2 className="text-xl font-bold text-[#222222]">
          Authenticating...
        </h2>
        <p className="text-sm text-[#717171]">
          Please wait while we securely connect your account.
        </p>
      </div>

      <AuthenticateWithRedirectCallback 
        redirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
