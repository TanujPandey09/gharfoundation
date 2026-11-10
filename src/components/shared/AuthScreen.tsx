"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/shared/Icon";
import { useAuth } from "@/lib/context/AuthContext";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

const LEFT_CONTENT = {
  phone: {
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Verified Rentals", value: "2,500+" },
      { label: "Brokerage Fees", value: "₹0" }
    ],
    testimonial: {
      stars: 5,
      quote: "Found our 2 BHK apartment in Dehradun in 2 days. 100% direct owner contact and zero brokerage saved us ₹18,000!",
      author: "Pooja Negi",
      role: "Tenant in Rajpur Road, Dehradun",
      avatar: "PN"
    }
  },
  otp: {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Aadhaar Verified", value: "100%" },
      { label: "Happy Families", value: "5,000+" }
    ],
    testimonial: {
      stars: 5,
      quote: "The instant Aadhaar verification and Uttarakhand police verification support gave us total peace of mind.",
      author: "Amit Rawat",
      role: "Property Owner in Haldwani",
      avatar: "AR"
    }
  }
};

export default function AuthScreen({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const { loginMockUser } = useAuth();

  // Auth States
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"phone" | "password" | "forgot_password" | "otp" | "details">("phone");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // UX States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [useDirectPhoneOtp, setUseDirectPhoneOtp] = useState(false);
  const [otpPreviewCode, setOtpPreviewCode] = useState<string | null>(null);

  // Refs for OTP input navigation
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper: Map Clerk error codes to user-friendly messages
  const getClerkErrorMessage = (err: any): string => {
    const code = err.errors?.[0]?.code;
    const msg = err.errors?.[0]?.message || err.message || "";
    switch (code) {
      case "captcha_invalid":
      case "captcha_not_verified":
      case "captcha_missing":
        return "Bot verification failed. Please reload the page and try again.";
      case "form_identifier_not_found":
        return "No account found with this identifier.";
      case "strategy_for_user_invalid":
        return "This login method is not available. Please try another method.";
      case "form_code_incorrect":
        return "The code you entered is incorrect. Please try again.";
      case "verification_expired":
        return "The verification code has expired. Please request a new one.";
      case "too_many_requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "session_exists":
        return "You are already signed in. Redirecting...";
      case "verification_already_verified":
        return "Already verified! Redirecting you now...";
      default:
        return msg || "Something went wrong. Please try again.";
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Normalize E.164 phone number cleanly (handles mobile autofill with +91 or leading 0)
  const getCleanFullPhone = () => {
    let digits = phone.replace(/\D/g, "");
    if (countryCode === "+91") {
      if (digits.length === 12 && digits.startsWith("91")) {
        digits = digits.slice(2);
      } else if (digits.length === 11 && digits.startsWith("0")) {
        digits = digits.slice(1);
      }
    }
    return `${countryCode}${digits}`;
  };

  // Format phone display (e.g. +91 98765 43210)
  const getFormattedPhone = () => {
    let cleaned = phone.replace(/\D/g, "");
    if (countryCode === "+91" && cleaned.length === 12 && cleaned.startsWith("91")) {
      cleaned = cleaned.slice(2);
    }
    if (cleaned.length === 10) {
      return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return `${countryCode} ${cleaned}`;
  };

  // Fallback helper: Send OTP via built-in Ghar Foundation Mobile OTP API
  const sendDirectMobileOtp = async (fullPhone: string) => {
    const res = await fetch("/api/auth/phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SEND",
        phone: fullPhone,
        mode,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to send OTP to mobile number.");
    }
    setUseDirectPhoneOtp(true);
    setOtpPreviewCode(data.otpPreview || "123456");
    setOtp(Array(6).fill(""));
    setTimer(59);
    setStep("otp");
  };

  // OAuth triggers using Clerk redirect
  const handleOAuth = async (provider: "oauth_google" | "oauth_apple" | "oauth_microsoft") => {
    if (!isSignInLoaded || !signIn) return;
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "OAuth login failed.");
    }
  };

  // Submit Identifier (Check if user exists)
  const handleSubmitIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isSignInLoaded || !isSignUpLoaded || !signIn || !signUp) return;
    setIsLoading(true);
    setIsPasswordReset(false);

    if (authMethod === "phone") {
      const rawDigits = phone.replace(/\D/g, "");
      if (!rawDigits || rawDigits.length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        setIsLoading(false);
        return;
      }
      const fullPhone = getCleanFullPhone();

      try {
        // 1. Check if user exists via Clerk signIn
        const signInResult = await signIn.create({ identifier: fullPhone });

        if (initialMode === "signup") {
          setError("An account with this phone number already exists. Please log in.");
          setIsLoading(false);
          return;
        }

        setMode("login");

        if (signInResult.status === "complete") {
          await setActive({ session: signInResult.createdSessionId });
          window.location.href = "/dashboard";
          return;
        }

        const phoneFactor = signInResult.supportedFirstFactors?.find(
          (f: any) => f.strategy === "phone_code"
        );

        if (phoneFactor) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: (phoneFactor as any).phoneNumberId,
          });
          setUseDirectPhoneOtp(false);
          setOtpPreviewCode(null);
          setIsSignUpMode(false);
          setTimer(59);
          setStep("otp");
        } else {
          await sendDirectMobileOtp(fullPhone);
        }
      } catch (err: any) {
        // 2. If Clerk phone auth is not enabled in Clerk Dashboard ("Missing identifier",
        //    "form_param_format_invalid", SMS unsupported for +91, or account not found),
        //    try Clerk signUp first if applicable, otherwise seamlessly use Direct Mobile OTP.
        const errCode = err.errors?.[0]?.code;
        if (errCode === "form_identifier_not_found" || err.message?.includes("not found")) {
          if (initialMode === "signup") {
            try {
              setMode("signup");
              await signUp.create({ phoneNumber: fullPhone });
              await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
              setUseDirectPhoneOtp(false);
              setOtpPreviewCode(null);
              setIsSignUpMode(true);
              setTimer(59);
              setStep("otp");
              return;
            } catch {
              // Clerk Phone Sign-Up not enabled or requires Email identifier -> fallback to Direct Mobile OTP
            }
          }
        }

        try {
          await sendDirectMobileOtp(fullPhone);
        } catch (fallbackErr: any) {
          setError(fallbackErr.message || getClerkErrorMessage(err));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Email / Username Flow
      if (!email) {
        setError(initialMode === "signup" ? "Please enter a valid email address." : "Please enter a valid email address or username.");
        setIsLoading(false);
        return;
      }
      if (initialMode === "signup" && !email.includes("@")) {
        setError("Please enter a valid email address to sign up.");
        setIsLoading(false);
        return;
      }

      try {
        const signInResult = await signIn.create({ identifier: email });

        if (initialMode === "signup") {
          setError("An account with this email address already exists. Please log in.");
          setIsLoading(false);
          return;
        }

        setMode("login");

        if (signInResult.status === "complete") {
          await setActive({ session: signInResult.createdSessionId });
          window.location.href = "/dashboard";
          return;
        }

        // Check for password factor
        const passwordFactor = signInResult.supportedFirstFactors?.find(
          (f: any) => f.strategy === "password"
        );
        const emailFactor = signInResult.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code"
        );

        if (passwordFactor) {
          // Returning user -> Ask for password
          setStep("password");
        } else if (emailFactor) {
          // Legacy passwordless user -> send OTP
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: (emailFactor as any).emailAddressId,
          });
          setIsSignUpMode(false);
          setTimer(59);
          setStep("otp");
        } else {
          throw new Error("No supported login method available.");
        }
      } catch (err: any) {
        const errCode = err.errors?.[0]?.code;
        if (errCode === "form_identifier_not_found" || err.message?.includes("not found")) {
          if (initialMode === "login") {
            setError("No account found with this email address. Please sign up.");
            setIsLoading(false);
            return;
          }

          try {
            setMode("signup");
            await signUp.create({ emailAddress: email });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setIsSignUpMode(true);
            setTimer(59);
            setStep("otp");
          } catch (signUpErr: any) {
            setError(getClerkErrorMessage(signUpErr));
          }
        } else {
          setError(getClerkErrorMessage(err));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Submit Password for Email Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !setActive) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      } else {
        setError("Login incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Forgot Password
  const handleForgotPassword = async () => {
    if (!signIn) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsPasswordReset(true);
      setTimer(59);
      setStep("otp");
    } catch (err: any) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    // Direct Mobile OTP Verification (used when Clerk Phone SMS is disabled/unavailable)
    if (authMethod === "phone" && useDirectPhoneOtp) {
      setIsLoading(true);
      try {
        const fullPhone = getCleanFullPhone();
        const res = await fetch("/api/auth/phone-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VERIFY",
            phone: fullPhone,
            code,
            firstName,
            lastName,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid OTP code. Please try again.");
          return;
        }
        if (data.user) {
          localStorage.setItem("ghar_guest_user", JSON.stringify(data.user));
        }
        window.location.href =
          data.isNewUser || initialMode === "signup" || mode === "signup"
            ? "/onboarding"
            : "/dashboard";
      } catch (err: any) {
        setError(err.message || "Failed to verify OTP code.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!isSignInLoaded || !isSignUpLoaded || !signIn || !signUp) return;

    setIsLoading(true);
    try {
      if (isSignUpMode) {
        // Check if signUp is already complete (e.g. test mode auto-verified)
        if (signUp.status === "complete") {
          await setActive({ session: signUp.createdSessionId });
          window.location.href = "/onboarding";
          return;
        }

        // Complete Sign Up flow
        try {
          const signUpResult = authMethod === "phone"
            ? await signUp.attemptPhoneNumberVerification({ code })
            : await signUp.attemptEmailAddressVerification({ code });
          console.log("========== SIGNUP RESULT ==========");
          console.log(signUpResult);
          console.log("status:", signUpResult.status);
          console.log("missingFields:", (signUpResult as any).missingFields);
          console.log("unverifiedFields:", (signUpResult as any).unverifiedFields);
          console.log("==================================");
          if (signUpResult.status === "complete") {
            await setActive({ session: signUpResult.createdSessionId });
            window.location.href = "/onboarding";
          } else if (signUpResult.status === "missing_requirements") {
            console.log("Sign-up status:", signUpResult.status, "Missing:", (signUpResult as any).missingFields);

            // First, try the fallback to sign in (in case this email/phone is already attached to an existing account)
            try {
              const identifier = authMethod === "phone"
                ? `${countryCode}${phone.replace(/\D/g, "")}`
                : email;
              const siResult = await signIn.create({ identifier });

              if (siResult.status === "complete") {
                await setActive({ session: siResult.createdSessionId });
                window.location.href = "/dashboard";
                return;
              }

              // Need to verify via sign-in flow
              const factor = siResult.supportedFirstFactors?.find(
                (f: any) => f.strategy === (authMethod === "phone" ? "phone_code" : "email_code")
              );
              if (factor) {
                if (authMethod === "phone") {
                  await signIn.prepareFirstFactor({
                    strategy: "phone_code",
                    phoneNumberId: (factor as any).phoneNumberId,
                  });
                } else {
                  await signIn.prepareFirstFactor({
                    strategy: "email_code",
                    emailAddressId: (factor as any).emailAddressId,
                  });
                }
                // Re-use the same OTP code for sign-in
                const siVerify = await signIn.attemptFirstFactor({
                  strategy: (authMethod === "phone" ? "phone_code" : "email_code") as any,
                  code,
                });
                if (siVerify.status === "complete") {
                  await setActive({ session: siVerify.createdSessionId });
                  window.location.href = "/onboarding";
                  return;
                }
              }
            } catch (siErr) {
              console.error("Sign-in fallback error:", siErr);
            }

            // If sign-in fallback fails, it means it's a true new user missing required fields
            setMissingFields((signUpResult as any).missingFields || []);
            setStep("details");

          } else {
            setError("Sign up requires additional fields. Please contact support or try a different login method.");
          }
        } catch (verifyErr: any) {
          const errCode = verifyErr.errors?.[0]?.code;
          // If already verified, try sign-in flow
          if (errCode === "verification_already_verified" ||
            verifyErr.message?.includes("already verified")) {
            try {
              const identifier = authMethod === "phone"
                ? `${countryCode}${phone.replace(/\D/g, "")}`
                : email;
              const siResult = await signIn.create({ identifier });
              if (siResult.status === "complete") {
                await setActive({ session: siResult.createdSessionId });
                window.location.href = "/dashboard";
                return;
              }
            } catch { /* fall through */ }
            setError("Already verified! Redirecting...");
            setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
            return;
          }
          throw verifyErr;
        }
      } else {
        // Complete Sign In / Password Reset flow
        const strategy = isPasswordReset
          ? "reset_password_email_code"
          : (authMethod === "phone" ? "phone_code" : "email_code");

        const signInResult = await signIn.attemptFirstFactor({
          strategy,
          code,
        });

        if (signInResult.status === "complete") {
          await setActive({ session: signInResult.createdSessionId });
          window.location.href = "/dashboard";
        } else if (signInResult.status === "needs_new_password") {
          setStep("forgot_password");
        } else {
          setError("Sign in incomplete. Please check your verification.");
        }
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(getClerkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendCode = async () => {
    if (timer > 0) return;
    setError("");
    setIsLoading(true);

    try {
      if (authMethod === "phone" && useDirectPhoneOtp) {
        await sendDirectMobileOtp(getCleanFullPhone());
        return;
      }
      if (!signIn || !signUp) return;
      if (authMethod === "phone") {
        const fullPhone = getCleanFullPhone();
        if (isSignUpMode) {
          await signUp.preparePhoneNumberVerification({
            strategy: "phone_code",
          });
        } else {
          const signInResult = await signIn.create({
            identifier: fullPhone,
          });
          const phoneFactor = signInResult.supportedFirstFactors?.find(
            (f: any) => f.strategy === "phone_code"
          );
          if (phoneFactor) {
            await signIn.prepareFirstFactor({
              strategy: "phone_code",
              phoneNumberId: (phoneFactor as any).phoneNumberId,
            });
          }
        }
      } else {
        // Email Resend
        if (isSignUpMode) {
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
        } else {
          const signInResult = await signIn.create({
            identifier: email,
          });
          const emailFactor = signInResult.supportedFirstFactors?.find(
            (f: any) => f.strategy === "email_code"
          );
          if (emailFactor) {
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: (emailFactor as any).emailAddressId,
            });
          }
        }
      }
      setTimer(59);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Missing Details
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !setActive) return;
    setError("");
    setIsLoading(true);

    try {
      const updatePayload: any = {};
      if (missingFields.includes("username")) {
        if (!username.trim() || username.length < 4) {
          setError("Username must be at least 4 characters long.");
          setIsLoading(false);
          return;
        }
        updatePayload.username = username.trim();
      }
      if (missingFields.includes("first_name")) {
        if (!firstName.trim()) {
          setError("First name is required.");
          setIsLoading(false);
          return;
        }
        updatePayload.firstName = firstName.trim();
      }
      if (missingFields.includes("last_name")) {
        if (!lastName.trim()) {
          setError("Last name is required.");
          setIsLoading(false);
          return;
        }
        updatePayload.lastName = lastName.trim();
      }

      // If phone_number is missing but we are doing email auth
      if (missingFields.includes("phone_number") && authMethod === "email") {
        if (!phone || phone.length < 7) {
          setError("Please enter a valid phone number.");
          setIsLoading(false);
          return;
        }
        let cleanPhone = phone.replace(/\D/g, "");
        if (countryCode === "+91" && cleanPhone.startsWith("91") && cleanPhone.length > 10) {
          cleanPhone = cleanPhone.substring(2);
        }
        if (countryCode === "+1" && cleanPhone.startsWith("1") && cleanPhone.length > 10) {
          cleanPhone = cleanPhone.substring(1);
        }
        updatePayload.phoneNumber = `${countryCode}${cleanPhone}`;
      }

      // If email_address is missing but we are doing phone auth
      if (missingFields.includes("email_address") && authMethod === "phone") {
        if (!email || !email.includes("@")) {
          setError("Please enter a valid email address.");
          setIsLoading(false);
          return;
        }
        updatePayload.emailAddress = email;
      }

      // Password requirement (always collect if creating account)
      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      updatePayload.password = password;

      const result = await signUp.update(updatePayload);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/onboarding";
      } else if (result.status === "missing_requirements") {
        if (result.unverifiedFields?.includes("phone_number")) {
          await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
          setAuthMethod("phone");
          setStep("otp");
          setTimer(59);
          setOtp(Array(6).fill(""));
          setError("Please verify the phone number you just provided.");
        } else if (result.unverifiedFields?.includes("email_address")) {
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setAuthMethod("email");
          setStep("otp");
          setTimer(59);
          setOtp(Array(6).fill(""));
          setError("Please verify the email address you just provided.");
        } else {
          setMissingFields(result.missingFields || []);
          setError("Please fill out all required fields correctly.");
        }
      }
    } catch (err: any) {
      console.error("Submit details error:", err);
      setError(getClerkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !setActive) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn.resetPassword({
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      setError(getClerkErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Key Handling
  const handleOtpChange = (val: string, idx: number) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return;

    const newOtp = [...otp];
    newOtp[idx] = clean.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[idx]) {
        newOtp[idx] = "";
      } else if (idx > 0) {
        newOtp[idx - 1] = "";
        otpRefs.current[idx - 1]?.focus();
      }
      setOtp(newOtp);
    }
  };

  const currentLeft = LEFT_CONTENT[step === "otp" ? "otp" : "phone"];

  return (
    <div className="bg-white min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row transition-colors">

      {/* ─── LEFT COLUMN: Luxury Building & Glassmorphism Panels (Desktop Only) ─── */}
      <div className="hidden lg:block lg:w-1/2 lg:h-screen relative overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentLeft.image}
            src={currentLeft.image}
            alt="Luxury Building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Emerald/slate gradient overlay to match image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-rausch/20 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-10"></div>

        {/* Logo at Top Left */}
        <div className="absolute top-12 left-12 z-20 flex items-center space-x-2 text-white">
          <Icon name="business" className="text-rausch" size={24} />
          <span className="font-display font-bold text-xl tracking-tight">Ghar Foundation</span>
        </div>

        {/* Floating Glassmorphism Panels */}
        <div className="absolute bottom-16 left-12 right-12 z-20 space-y-6 max-w-xl">
          {/* Testimonial Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLeft.testimonial.author}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl space-y-4"
            >
              {/* Stars */}
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="star" className="text-yellow-400" size={16} />
                ))}
              </div>
              <p className="text-sm text-white leading-relaxed font-medium">
                "{currentLeft.testimonial.quote}"
              </p>
              {/* User Profile */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-rausch border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {currentLeft.testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">{currentLeft.testimonial.author}</h4>
                  <p className="text-[11px] text-gray-300 font-medium mt-1">{currentLeft.testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats Row */}
          <div className="flex gap-4">
            {currentLeft.stats.map((stat) => (
              <div key={stat.label} className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 p-5 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-extrabold text-white">{stat.value}</h3>
                <p className="text-[10px] text-gray-200/90 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Custom Auth Form ─── */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen flex flex-col justify-start lg:justify-center bg-white text-[#222222] overflow-y-auto">

        {/* Mobile Header — Compact, High-Trust, Zero Wasted Vertical Space */}
        <div className="flex lg:hidden justify-between items-center px-4 sm:px-6 py-3.5 bg-white border-b border-[#EBEBEB] sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl tracking-tight text-[#222222]">
              Ghar<span className="text-[#FF385C]">.</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#008A05] border border-[#C8E6C9]">
              ₹0 Brokerage
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#222222] bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#EBEBEB] px-3 py-1.5 rounded-full transition-colors"
          >
            <Icon name="arrow_back" size={14} />
            <span>Home</span>
          </Link>
        </div>

        {/* Mobile Compact Context Banner */}
        <div className="flex lg:hidden items-center justify-between px-4 sm:px-6 py-2.5 bg-[#F7F7F7] border-b border-[#EBEBEB] text-[11px] font-semibold text-[#717171]">
          <span className="flex items-center gap-1.5 text-[#222222] font-bold">
            <Icon name="verified" size={14} className="text-[#008A05]" fill />
            100% Direct Owner Homes
          </span>
          <span>Dehradun · Rishikesh · Nainital</span>
        </div>

        {/* Auth Content Wrapper */}
        <div className="bg-white relative z-20 px-4 sm:px-10 lg:px-14 xl:px-18 py-4 sm:py-8 flex-1 lg:flex-none flex flex-col justify-between lg:justify-center max-w-md sm:max-w-lg mx-auto lg:mx-0 w-full lg:max-w-xl">

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-1 flex flex-col justify-center"
              >
                {/* Welcome Heading */}
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717171]">
                    {mode === "login"
                      ? "Log in to message homeowners directly and manage your visits."
                      : "Join Ghar Foundation to rent or list verified homes with zero brokerage."}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon name="error" size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Horizontal Social Buttons */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth("oauth_google")}
                    disabled={isLoading}
                    title="Continue with Google"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-[#F7F7F7] text-[#222222] h-11 sm:h-12 rounded-xl border border-[#EBEBEB] transition-all active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-xs font-bold hidden sm:inline">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth("oauth_apple")}
                    disabled={isLoading}
                    title="Continue with Apple"
                    className="flex items-center justify-center gap-2 bg-[#222222] hover:bg-black text-white h-11 sm:h-12 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                    </svg>
                    <span className="text-xs font-bold hidden sm:inline">Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth("oauth_microsoft")}
                    disabled={isLoading}
                    title="Continue with Microsoft"
                    className="flex items-center justify-center gap-2 bg-white hover:bg-[#F7F7F7] text-[#222222] h-11 sm:h-12 rounded-xl border border-[#EBEBEB] transition-all active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 23 23" width="18" height="18">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span className="text-xs font-bold hidden sm:inline">Microsoft</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-[#EBEBEB]" />
                  <span className="text-[11px] font-bold text-[#717171] px-3 uppercase tracking-wider">or continue with</span>
                  <div className="flex-1 border-t border-[#EBEBEB]" />
                </div>

                {/* Auth Method Tabs */}
                <div className="flex bg-[#F7F7F7] border border-[#EBEBEB] p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("phone");
                      setError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === "phone"
                      ? "bg-white text-[#222222] shadow-sm"
                      : "text-[#717171] hover:text-[#222222]"
                      }`}
                  >
                    Mobile Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("email");
                      setError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === "email"
                      ? "bg-white text-[#222222] shadow-sm"
                      : "text-[#717171] hover:text-[#222222]"
                      }`}
                  >
                    {initialMode === "login" ? "Email / Username" : "Email Address"}
                  </button>
                </div>

                {/* Custom Form */}
                <form onSubmit={handleSubmitIdentifier} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    {authMethod === "phone" ? (
                      <>
                        <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                          Mobile Number
                        </label>
                        <div className="flex gap-2 min-w-0">
                          {/* Country Code Select Dropdown */}
                          <div className="relative z-30 shrink-0" ref={dropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              disabled={isLoading}
                              className="flex items-center justify-center gap-1 h-12 px-2.5 sm:px-3 border border-[#EBEBEB] bg-[#F7F7F7] hover:bg-[#EBEBEB]/60 rounded-xl text-xs sm:text-sm font-bold text-[#222222] transition-all min-w-[72px]"
                            >
                              <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}</span>
                              <span>{countryCode}</span>
                              <Icon name="arrow_drop_down" size={16} className="text-[#717171] -ml-0.5" />
                            </button>

                            <AnimatePresence>
                              {showCountryDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className="absolute top-14 left-0 bg-white border border-[#EBEBEB] rounded-xl shadow-xl py-1.5 w-44 z-50 overflow-hidden"
                                >
                                  {COUNTRY_CODES.map((item) => (
                                    <button
                                      key={item.code}
                                      type="button"
                                      onClick={() => {
                                        setCountryCode(item.code);
                                        setShowCountryDropdown(false);
                                      }}
                                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-left text-[#222222] hover:bg-[#F7F7F7] transition-all"
                                    >
                                      <span className="text-base leading-none">{item.flag}</span>
                                      <span className="font-bold text-[#222222]">{item.code}</span>
                                      <span className="text-[#717171] text-[10px] ml-auto">{item.country}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Phone Input Box */}
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                            placeholder="10-digit mobile number"
                            className="flex-1 min-w-0 h-12 px-3.5 sm:px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                          {initialMode === "login" ? "Email or Username" : "Email Address"}
                        </label>
                        <input
                          type={initialMode === "login" && !email.includes("@") ? "text" : "email"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          placeholder="name@example.com"
                          className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                          required
                        />
                      </>
                    )}
                  </div>

                  {/* Required Clerk CAPTCHA Element */}
                  <div id="clerk-captcha" className="my-1 flex justify-center" />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-cta-primary w-full h-12 text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>

              </motion.div>
            ) : step === "password" ? (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-1 flex flex-col justify-center"
              >
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                    Enter your password
                  </h2>
                  <div className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                    Signing in as <span className="font-bold text-[#222222] break-all">{email}</span>.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setError("");
                        setPassword("");
                      }}
                      className="text-xs font-bold text-[#FF385C] hover:underline ml-1"
                    >
                      Change account
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon name="error" size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-bold text-[#FF385C] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-cta-primary w-full h-12 text-sm disabled:opacity-50"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              </motion.div>
            ) : step === "forgot_password" ? (
              <motion.div
                key="forgot-password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-1 flex flex-col justify-center"
              >
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                    Reset password
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                    Create a new secure password for your Ghar Foundation account.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon name="error" size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-cta-primary w-full h-12 text-sm disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Update Password"}
                  </button>
                </form>
              </motion.div>
            ) : step === "otp" ? (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-1 flex flex-col justify-center"
              >
                {/* OTP Heading */}
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                    {authMethod === "phone" ? "Verify your number" : "Verify your email"}
                  </h2>
                  <div className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-bold text-[#222222] break-all">
                      {authMethod === "phone" ? getFormattedPhone() : email}
                    </span>.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setError("");
                        setOtp(Array(6).fill(""));
                      }}
                      className="text-xs font-bold text-[#FF385C] hover:underline ml-1"
                    >
                      {authMethod === "phone" ? "Edit number" : "Edit email"}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon name="error" size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Instant OTP Preview Banner (When Clerk SMS is not configured for +91) */}
                {authMethod === "phone" && useDirectPhoneOtp && otpPreviewCode && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#222222]">
                      <Icon name="sms" size={17} className="text-[#008A05] shrink-0" />
                      <span>
                        Instant Mobile OTP:{" "}
                        <strong className="font-mono font-extrabold text-sm text-[#008A05] tracking-wider">
                          {otpPreviewCode}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(otpPreviewCode.split("").slice(0, 6))}
                      className="text-[11px] font-bold bg-white border border-[#C8E6C9] text-[#008A05] hover:bg-[#008A05] hover:text-white px-2.5 py-1 rounded-lg transition-colors shrink-0"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {/* Responsive 6-Digit OTP Boxes (Fits 320px+ screens cleanly) */}
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex justify-between gap-1.5 sm:gap-2.5 max-w-xs sm:max-w-sm mx-auto">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        disabled={isLoading}
                        className="flex-1 min-w-0 max-w-[48px] h-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-[#222222] focus:outline-none focus:border-[#222222] transition-all"
                      />
                    ))}
                  </div>

                  {/* Resend Timer Text */}
                  <div className="flex justify-between items-center px-1 text-xs">
                    <p className="font-semibold text-[#717171]">
                      Resend in <span className="font-extrabold text-[#222222] tabular-nums">00:{timer < 10 ? `0${timer}` : timer}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={timer > 0 || isLoading}
                      className={`font-bold text-xs transition-colors ${timer > 0
                        ? "text-[#B0B0B0] cursor-not-allowed"
                        : "text-[#FF385C] hover:underline"
                        }`}
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-cta-primary w-full h-12 text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="details-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 flex-1 flex flex-col justify-center"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                    Complete your profile
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717171] leading-relaxed">
                    Add your name and password to finish setting up your account.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Icon name="error" size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitDetails} className="space-y-3.5">
                  {missingFields.includes("username") && (
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        placeholder="Choose a username"
                        className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {missingFields.includes("first_name") && (
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. Rahul"
                          className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                          required
                        />
                      </div>
                    )}

                    {missingFields.includes("last_name") && (
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={isLoading}
                          placeholder="e.g. Sharma"
                          className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {missingFields.includes("phone_number") && authMethod === "email" && (
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="flex gap-2 min-w-0">
                        <div className="relative z-30 shrink-0" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1 h-12 px-2.5 sm:px-3 border border-[#EBEBEB] bg-[#F7F7F7] rounded-xl text-xs sm:text-sm font-bold text-[#222222] min-w-[72px]"
                          >
                            <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}</span>
                            <span>{countryCode}</span>
                            <Icon name="arrow_drop_down" size={16} className="text-[#717171] -ml-0.5" />
                          </button>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          disabled={isLoading}
                          placeholder="10-digit mobile number"
                          className="flex-1 min-w-0 h-12 px-3.5 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {missingFields.includes("email_address") && authMethod === "phone" && (
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        placeholder="name@example.com"
                        className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                        Create Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 border border-[#EBEBEB] bg-[#F7F7F7] focus:bg-white rounded-xl text-sm font-semibold text-[#222222] placeholder-[#717171]/70 focus:outline-none focus:border-[#222222] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full items-center justify-center h-12 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold rounded-xl text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Complete Registration"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom section: Mode Switcher, Trust Badges & Legal Footer */}
          <div className="mt-6 pt-5 border-t border-[#EBEBEB] space-y-4">
            {/* Mode Switcher */}
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-[#717171]">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <Link
                  href={mode === "login" ? "/signup" : "/login"}
                  className="text-[#FF385C] font-bold hover:underline"
                >
                  {mode === "login" ? "Sign Up for free" : "Log In"}
                </Link>
              </p>
            </div>

            {/* Compact 4-Pillar Trust Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Icon name="verified" className="text-[#008A05]" size={15} fill />
                <span className="text-[11px] font-bold text-[#222222]">Direct Owners</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Icon name="savings" className="text-[#FF385C]" size={15} />
                <span className="text-[11px] font-bold text-[#222222]">₹0 Brokerage</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Icon name="badge" className="text-[#008A05]" size={15} />
                <span className="text-[11px] font-bold text-[#222222]">Aadhaar KYC</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <Icon name="lock" className="text-[#222222]" size={15} />
                <span className="text-[11px] font-bold text-[#222222]">Encrypted</span>
              </div>
            </div>

            {/* Legal Notice */}
            <p className="text-[11px] text-[#717171] text-center leading-relaxed">
              By continuing, you agree to Ghar Foundation&apos;s{" "}
              <Link href="/terms" className="text-[#222222] font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              &amp;{" "}
              <Link href="/privacy" className="text-[#222222] font-bold hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
