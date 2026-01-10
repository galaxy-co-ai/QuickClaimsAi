"use server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { generateStatusChangeEmail, generateSupplementApprovedEmail } from "@/lib/email-templates";
import { decimalToNumber } from "@/lib/calculations";
import type { ClaimStatus } from "@prisma/client";

/**
 * Send email notification when claim status changes
 */
export async function sendStatusChangeNotification(
  claimId: string,
  oldStatus: ClaimStatus,
  newStatus: ClaimStatus
): Promise<void> {
  try {
    // Get claim with contractor details
    const claim = await db.claim.findUnique({
      where: { id: claimId },
      include: {
        contractor: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
    });

    if (!claim || !claim.contractor.email) {
      console.log("[Notification] No claim or contractor email found for status change notification");
      return;
    }

    // Generate email content
    const { subject, html, text } = generateStatusChangeEmail({
      policyholderName: claim.policyholderName,
      lossAddress: `${claim.lossAddress}, ${claim.lossCity}, ${claim.lossState} ${claim.lossZip}`,
      claimNumber: claim.claimNumber || undefined,
      oldStatus,
      newStatus,
      contractorName: claim.contractor.companyName,
    });

    // Send email
    const result = await sendEmail({
      to: claim.contractor.email,
      subject,
      html,
      text,
    });

    if (!result.success) {
      console.error("[Notification] Failed to send status change email:", result.error);
    }
  } catch (error) {
    console.error("[Notification] Error sending status change notification:", error);
  }
}

/**
 * Send email notification when supplement is approved
 */
export async function sendSupplementApprovedNotification(
  supplementId: string
): Promise<void> {
  try {
    // Get supplement with claim and contractor details
    const supplement = await db.supplement.findUnique({
      where: { id: supplementId },
      include: {
        claim: {
          include: {
            contractor: {
              select: {
                companyName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!supplement || !supplement.claim.contractor.email) {
      console.log("[Notification] No supplement or contractor email found for approval notification");
      return;
    }

    // Only send for approved or partial status
    if (supplement.status !== "approved" && supplement.status !== "partial") {
      console.log("[Notification] Supplement not in approved/partial status, skipping notification");
      return;
    }

    const claim = supplement.claim;
    const isPartial = supplement.status === "partial";
    const approvedAmount = supplement.approvedAmount
      ? decimalToNumber(supplement.approvedAmount)
      : decimalToNumber(supplement.amount);

    // Generate email content
    const { subject, html, text } = generateSupplementApprovedEmail({
      policyholderName: claim.policyholderName,
      lossAddress: `${claim.lossAddress}, ${claim.lossCity}, ${claim.lossState} ${claim.lossZip}`,
      claimNumber: claim.claimNumber || undefined,
      contractorName: claim.contractor.companyName,
      supplementDescription: supplement.description,
      requestedAmount: decimalToNumber(supplement.amount),
      approvedAmount,
      isPartial,
    });

    // Send email
    const result = await sendEmail({
      to: claim.contractor.email,
      subject,
      html,
      text,
    });

    if (!result.success) {
      console.error("[Notification] Failed to send supplement approved email:", result.error);
    }
  } catch (error) {
    console.error("[Notification] Error sending supplement approved notification:", error);
  }
}
