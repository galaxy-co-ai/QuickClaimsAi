import { Resend } from "resend";

// Default sender email
const FROM_EMAIL = process.env.EMAIL_FROM || "QuickClaims <noreply@quickclaims.ai>";

// Lazy-initialized Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // Skip if no API key configured (development mode)
  const client = getResendClient();
  if (!client) {
    console.log("[Email] Skipping email - no RESEND_API_KEY configured");
    console.log("[Email] Would send:", { to: options.to, subject: options.subject });
    return { success: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export { getResendClient as getResend };
