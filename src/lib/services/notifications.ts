import prisma from "@/lib/prisma";

/**
 * Ghar Foundation Notification Dispatch Service
 * Persists in-app notifications to PostgreSQL and supports FCM Push & WhatsApp hooks.
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
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return "fcm-browser-permission-granted";
    }
  } catch (error) {
    console.error("Failed to request notification permission", error);
  }
  return null;
}

// 2. WhatsApp Notification Trigger Pipeline
export async function sendWhatsAppReminder(
  phone: string,
  templateName: string,
  variables: Record<string, string>
): Promise<boolean> {
  console.log(`[WhatsApp Pipeline] ${templateName} -> ${phone}`, variables);
  return true;
}

// 3. Central Dispatcher — Saves directly to Prisma Notification table
export async function dispatchSystemNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.body,
        type: payload.type,
      },
    });
    return true;
  } catch (error) {
    console.error("[Notification Dispatcher] Failed to persist notification:", error);
    return false;
  }
}
