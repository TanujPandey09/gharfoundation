/**
 * Ghar Foundation Notification Dispatch Service
 * Configured for Email, FCM Push, and future WhatsApp hooks.
 */

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: "INFO" | "FAVORITE_UPDATE" | "APPROVAL" | "TRANSACTION" | "CHAT";
  meta?: Record<string, any>;
}

// 1. Firebase Cloud Messaging (FCM) Push Notifications Setup
export async function initializeFcmPush(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("Push notifications not supported in this browser.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("FCM Notification Permission Granted.");
      // In production, fetch the device registration token from FCM:
      // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      return "mock-device-fcm-token-123456";
    }
  } catch (error) {
    console.error("Failed to request FCM token", error);
  }
  return null;
}

// 2. WhatsApp Notification Trigger Pipeline (Future Ready)
export async function sendWhatsAppReminder(phone: string, templateName: string, variables: Record<string, string>): Promise<boolean> {
  console.log(`[WhatsApp API Pipeline] Sending ${templateName} template to ${phone}`, variables);
  
  // Simulated WhatsApp Business API Call (e.g. Meta Cloud API or Twilio)
  // const response = await axios.post('https://graph.facebook.com/v17.0/.../messages', { ... });
  
  return true;
}

// 3. Central Dispatcher
export async function dispatchSystemNotification(payload: NotificationPayload): Promise<boolean> {
  console.log(`[Notification Dispatcher] Sending ${payload.type} notification to User ${payload.userId}:`, payload);
  
  // A. Save to Database:
  // await prisma.notification.create({ data: { ... } });

  // B. Trigger FCM Push if Token exists:
  // sendFcmMessage(token, payload.title, payload.body);

  // C. Send email (if user selected preference):
  // await sendNotificationEmail(payload);

  return true;
}
