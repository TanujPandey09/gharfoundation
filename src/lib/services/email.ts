/**
 * Ghar Foundation Email Service
 * Handles transactional template building and transmission.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Low-level email transmitter wrapper (Supports Resend REST API out-of-the-box + Dev Simulation)
async function sendRawEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Ghar Foundation <notifications@gharfoundation.com>",
          to: [to],
          subject,
          html,
        }),
      });
      if (res.ok) {
        return true;
      }
      console.error("[Email Service] Resend error status:", res.status);
    } catch (error) {
      console.error("[Email Service] Failed to transmit email via Resend:", error);
    }
  }

  // Simulation mode for local development/testing
  console.log(`[Email Service Simulation] Transmitting mail: To "${to}", Subject "${subject}"`);
  return true;
}

/**
 * Trigger: When Admin approves a property listing.
 */
export async function sendPropertyApprovedEmail(ownerEmail: string, ownerName: string, propertyTitle: string): Promise<boolean> {
  const subject = "🎉 Listing Approved! Your property is live on Ghar Foundation";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #111827; line-height: 1.6;">
      <h2 style="color: #064e3b;">Hello ${ownerName},</h2>
      <p>Great news! Your listing <strong>"${propertyTitle}"</strong> has passed verification checks and is now live on our platform.</p>
      <p>Renters in Uttarakhand can now contact you directly via Phone, Chat, or WhatsApp.</p>
      <a href="https://gharfoundation.vercel.app/dashboard" style="background-color: #064e3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 15px;">Manage Listing</a>
      <p style="margin-top: 30px; font-size: 11px; color: #6b7280;">Best regards,<br/>The Ghar Foundation Admin Team</p>
    </div>
  `;
  return sendRawEmail({ to: ownerEmail, subject, html });
}

/**
 * Trigger: When Admin rejects a property listing.
 */
export async function sendPropertyRejectedEmail(ownerEmail: string, ownerName: string, propertyTitle: string, reason: string): Promise<boolean> {
  const subject = "⚠️ Property Listing Action Required - Ghar Foundation";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #111827; line-height: 1.6;">
      <h2>Hello ${ownerName},</h2>
      <p>We reviewed your listing <strong>"${propertyTitle}"</strong>, but unfortunately, it could not be approved at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please edit the description or upload clearer pictures on your dashboard and resubmit for approval.</p>
      <a href="https://gharfoundation.com/dashboard" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 15px;">Update Listing</a>
    </div>
  `;
  return sendRawEmail({ to: ownerEmail, subject, html });
}

/**
 * Trigger: Daily / Instant match notification for Saved Searches.
 */
export async function sendSavedSearchMatchEmail(userEmail: string, userName: string, searchQuery: string, matchesCount: number): Promise<boolean> {
  const subject = `🔔 ${matchesCount} New properties matching your search "${searchQuery}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #111827; line-height: 1.6;">
      <h2 style="color: #064e3b;">Hello ${userName},</h2>
      <p>We found ${matchesCount} new rental listings in Uttarakhand that match your saved search criteria: <strong>"${searchQuery}"</strong>.</p>
      <p>Be the first to contact the owner directly before they are booked!</p>
      <a href="https://gharfoundation.com/search?q=${encodeURIComponent(searchQuery)}" style="background-color: #064e3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 15px;">View Matches</a>
    </div>
  `;
  return sendRawEmail({ to: userEmail, subject, html });
}

/**
 * Trigger: When a favorited listing is updated (e.g. price change).
 */
export async function sendFavoritePropertyUpdatedEmail(userEmail: string, userName: string, propertyTitle: string, changeDescription: string): Promise<boolean> {
  const subject = `⭐ Update on your favorite property: "${propertyTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #111827; line-height: 1.6;">
      <h2>Hello ${userName},</h2>
      <p>One of your saved favorites <strong>"${propertyTitle}"</strong> has been updated.</p>
      <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-style: italic;">"${changeDescription}"</p>
      <p>Visit the details page to review the updated details and contact the host.</p>
    </div>
  `;
  return sendRawEmail({ to: userEmail, subject, html });
}
