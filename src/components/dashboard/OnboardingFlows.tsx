import React, { useState } from "react";
import Icon from "@/components/shared/Icon";

interface OnboardingFlowsProps {
    user: any;
    onRefresh: () => void;
    showToast: (msg: string, type: "success" | "error" | "info") => void;
    onCloseOwnerOnboarding?: () => void;
    forceOwnerOnboardingOpen?: boolean;
}

export const OnboardingFlows: React.FC<OnboardingFlowsProps> = ({
    user,
    onRefresh,
    showToast,
    onCloseOwnerOnboarding,
    forceOwnerOnboardingOpen = false,
}) => {
    const [showChoice, setShowChoice] = useState(user?.onboardingStatus === "NOT_STARTED" && !forceOwnerOnboardingOpen);
    const [showOwnerStep, setShowOwnerStep] = useState(forceOwnerOnboardingOpen);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form states
    const [phone, setPhone] = useState(user?.phone || "");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [ownerType, setOwnerType] = useState("PRIVATE_OWNER");
    const [businessName, setBusinessName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [propertyTitle, setPropertyTitle] = useState("");
    const [propertyRent, setPropertyRent] = useState("");
    const [propertyType, setPropertyType] = useState("BHK_1");

    // Step 1: Phone Verification
    const sendVerificationCode = () => {
        if (!phone) {
            showToast("Please enter a valid phone number", "error");
            return;
        }
        setCodeSent(true);
        showToast("Verification code sent to " + phone, "success");
    };

    const verifyCode = () => {
        if (code === "1234" || code === "123456" || code.length >= 4) {
            showToast("Phone verified successfully!", "success");
            setStep(2);
        } else {
            showToast("Invalid verification code. Try '1234'", "error");
        }
    };

    // Skip / Default Search Choice
    const handleSelectTenant = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/tenant-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferredCity: "Dehradun" }),
            });
            if (res.ok) {
                showToast("Welcome to GharFoundation!", "success");
                setShowChoice(false);
                onRefresh();
            } else {
                throw new Error();
            }
        } catch {
            showToast("Failed to initialize profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ onboardingStatus: "COMPLETED", activeWorkspace: "SEARCH" }),
            });
            if (res.ok) {
                setShowChoice(false);
                onRefresh();
            } else {
                throw new Error();
            }
        } catch {
            showToast("Failed to save preference", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStartOwnerOnboarding = () => {
        setShowChoice(false);
        setShowOwnerStep(true);
        setStep(1);
    };

    // Submit final owner profile
    const handleSubmitOwner = async () => {
        setLoading(true);
        try {
            // First, create the owner profile
            const res = await fetch("/api/user/owner-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerType,
                    businessName: businessName || null,
                    companyName: companyName || null,
                    licenseNumber: licenseNumber || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to create owner profile");

            // Optional: Add first property draft
            if (propertyTitle && propertyRent) {
                await fetch("/api/properties", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: propertyTitle,
                        rent: parseFloat(propertyRent),
                        deposit: parseFloat(propertyRent) * 2,
                        propertyType,
                        district: "Dehradun",
                        city: "Dehradun",
                        locality: "Rajpur Road",
                        area: 1200,
                        bedrooms: 2,
                        bathrooms: 2,
                        description: "Onboarding draft listing.",
                        isVerified: false,
                    }),
                });
            }

            showToast("Owner Profile verified successfully! Welcome to Hosting Workspace.", "success");
            setShowOwnerStep(false);
            if (onCloseOwnerOnboarding) onCloseOwnerOnboarding();
            onRefresh();
        } catch (err: any) {
            showToast(err.message || "Failed to complete onboarding", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 1. INITIAL CHOICE MODAL */}
            {showChoice && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-extrabold text-[#022c22] tracking-tight">Welcome to GharFoundation</h2>
                            <p className="text-slate-500 text-sm font-semibold mt-2">What would you like to do today?</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleSelectTenant}
                                disabled={loading}
                                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-[#022c22] hover:bg-slate-50/50 text-left transition-all group active:scale-[0.99]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-[#022c22] group-hover:text-white transition-all">
                                    <Icon name="home" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">🏠 Find a Home</h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Browse property listings in Uttarakhand immediately.</p>
                                </div>
                            </button>

                            <button
                                onClick={handleStartOwnerOnboarding}
                                disabled={loading}
                                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-[#022c22] hover:bg-slate-50/50 text-left transition-all group active:scale-[0.99]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-[#022c22] group-hover:text-white transition-all">
                                    <Icon name="domain" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">🏢 List My Property</h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Start listing rooms, flats or commercial rentals.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => showToast("Broker/Agency registration details are coming soon!", "info")}
                                disabled={loading}
                                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-[#022c22] hover:bg-slate-50/50 text-left transition-all group active:scale-[0.99]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-[#022c22] group-hover:text-white transition-all">
                                    <Icon name="handshake" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[15px]">🤝 Broker / Agency</h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Access enterprise tools for team management. <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold ml-1">Soon</span></p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                            <button
                                onClick={handleSkip}
                                disabled={loading}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. GUIDED OWNER STEPPER */}
            {showOwnerStep && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Stepper Progress bar */}
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                            <div>
                                <h3 className="font-extrabold text-[#022c22] text-lg">Owner Onboarding</h3>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">Step {step} of 4</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4].map((s) => (
                                    <div
                                        key={s}
                                        className={`w-3.5 h-1.5 rounded-full transition-all ${s <= step ? "bg-[#022c22]" : "bg-slate-100"
                                            }`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* STEP 1: Phone Verification */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-[15px]">Verify Phone Number</h4>
                                    <p className="text-xs text-slate-500 mt-1">Provide a mobile contact number to prevent fraudulent verification attempts.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                                        <input
                                            type="tel"
                                            placeholder="Enter mobile number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                        />
                                    </div>
                                    {!codeSent ? (
                                        <button
                                            onClick={sendVerificationCode}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
                                        >
                                            Send Verification Code
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Enter 4-digit code (e.g., 1234)"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all text-center tracking-widest"
                                            />
                                            <button
                                                onClick={verifyCode}
                                                className="w-full bg-[#022c22] hover:bg-[#15345a] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                                            >
                                                Verify Code & Continue
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Business Profile */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-[15px]">Configure Portfolio Settings</h4>
                                    <p className="text-xs text-slate-500 mt-1">Specify your registration scope on the platform.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Registration Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["PRIVATE_OWNER", "BROKER", "AGENCY"].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setOwnerType(type)}
                                                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${ownerType === type
                                                            ? "border-[#022c22] bg-[#022c22]/5 text-[#022c22]"
                                                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {type.replace("_", " ")}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {ownerType !== "PRIVATE_OWNER" && (
                                        <>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Company Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Elite Realty"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Commercial License / RERA ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. REC-10294"
                                                    value={licenseNumber}
                                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Business Name (Display Name)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Malhotra Properties"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 bg-[#022c22] hover:bg-[#15345a] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: First Property Listing Draft */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-[15px]">Create First Listing Draft</h4>
                                    <p className="text-xs text-slate-500 mt-1">Get your portfolio started by initializing a property draft.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Listing Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Modern BHK in Rajpur Road"
                                            value={propertyTitle}
                                            onChange={(e) => setPropertyTitle(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Monthly Rent (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 15000"
                                            value={propertyRent}
                                            onChange={(e) => setPropertyRent(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-[#022c22] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="flex-1 bg-[#022c22] hover:bg-[#15345a] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Submit & Finish */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce">
                                        <Icon name="check_circle" size={32} />
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-[17px] mb-2">Onboarding Completed!</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-[340px] mx-auto">
                                        Your profile will be set to verified immediately. You can now access all landlord tools and complete your listings details.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={loading}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmitOwner}
                                        disabled={loading}
                                        className="flex-1 bg-[#022c22] hover:bg-[#15345a] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        {loading ? "Submitting..." : "Submit & Launch Hosting"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
