/**
 * Multi-provider SMS delivery service for Ghar Foundation.
 * 
 * Supports:
 * 1. Fast2SMS (Recommended for India — instant Quick OTP route, no DLT required for dev, ~₹0.20/SMS)
 * 2. Twilio (Global standard)
 * 3. Local / Dev Console Fallback (logs code to terminal when no provider key is configured)
 */

interface SendSmsResult {
  success: boolean;
  provider: "FAST2SMS" | "TWILIO" | "CONSOLE_DEV";
  messageId?: string;
  error?: string;
}

/**
 * Sends a 6-digit OTP verification SMS to a mobile phone number.
 * 
 * @param phone - E.164 or 10-digit phone number (e.g. "+919876543210" or "9876543210")
 * @param otpCode - The 6-digit numeric OTP code
 */
export async function sendOtpSms(phone: string, otpCode: string): Promise<SendSmsResult> {
  const digits = phone.replace(/\D/g, "");
  const indian10Digit = digits.length >= 10 ? digits.slice(-10) : digits;

  // 1. FAST2SMS (India Quick OTP Route)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey && fast2smsKey !== "mock-key") {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpCode,
          numbers: indian10Digit,
        }),
      });

      const data = await response.json();

      if (data.return === true || response.ok) {
        return {
          success: true,
          provider: "FAST2SMS",
          messageId: data.request_id || "sent",
        };
      } else {
        console.error("[Fast2SMS Delivery Error]:", data);
        return {
          success: false,
          provider: "FAST2SMS",
          error: data.message?.[0] || "Fast2SMS dispatch failed",
        };
      }
    } catch (err: any) {
      console.error("[Fast2SMS Error]:", err.message);
    }
  }

  // 2. TWILIO (Global SMS Gateway)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedTo = phone.startsWith("+") ? phone : `+91${indian10Digit}`;
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", formattedTo);
      params.append("From", twilioFrom);
      params.append(
        "Body",
        `Your Ghar Foundation verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code.`
      );

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      const twilioData = await twilioRes.json();

      if (twilioRes.ok) {
        return {
          success: true,
          provider: "TWILIO",
          messageId: twilioData.sid,
        };
      } else {
        console.error("[Twilio Delivery Error]:", twilioData);
        return {
          success: false,
          provider: "TWILIO",
          error: twilioData.message || "Twilio SMS dispatch failed",
        };
      }
    } catch (err: any) {
      console.error("[Twilio Error]:", err.message);
    }
  }

  // 3. PRODUCTION CHECK: If no SMS provider is configured in production, fail honestly
  if (process.env.NODE_ENV === "production") {
    console.error("[SMS Gateway Error] No active SMS gateway (FAST2SMS_API_KEY or TWILIO) configured in production.");
    return {
      success: false,
      provider: "CONSOLE_DEV",
      error: "SMS verification is temporarily unavailable. Please sign in with Email.",
    };
  }

  // 4. LOCAL DEVELOPMENT CONSOLE FALLBACK (Safe for Dev & Testing Only)
  console.log(`\n======================================================`);
  console.log(`[DEV OTP SMS] Mobile: +91 ${indian10Digit}`);
  console.log(`[DEV OTP SMS] OTP Code: ${otpCode}`);
  console.log(`(Configure FAST2SMS_API_KEY in .env to deliver real SMS to mobile devices)`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: "CONSOLE_DEV",
  };
}

