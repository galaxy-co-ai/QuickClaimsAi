"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  supplementInputSchema,
  supplementApprovalSchema,
  type SupplementInput,
  type SupplementApproval,
} from "@/lib/validations/supplement";
import { requireRole } from "@/lib/auth";
import { calculateClaimMetrics, decimalToNumber } from "@/lib/calculations";
import type { SupplementStatus } from "@prisma/client";

/**
 * Recalculate claim totals based on approved supplements
 */
async function recalculateClaimTotals(claimId: string) {
  // Get claim with contractor and estimator for percentages
  const claim = await db.claim.findUnique({
    where: { id: claimId },
    include: {
      contractor: { select: { billingPercentage: true } },
      estimator: { select: { commissionPercentage: true } },
      supplements: {
        where: {
          status: { in: ["approved", "partial"] },
        },
        select: { approvedAmount: true, amount: true, status: true },
      },
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Sum approved supplement amounts (use approvedAmount for partial, full amount for approved)
  const supplementAmounts = claim.supplements.map((s) => {
    if (s.status === "partial" && s.approvedAmount) {
      return decimalToNumber(s.approvedAmount);
    }
    return decimalToNumber(s.amount);
  });

  // Calculate new metrics
  const metrics = calculateClaimMetrics({
    initialRCV: decimalToNumber(claim.initialRCV),
    roofRCV: decimalToNumber(claim.roofRCV),
    totalSquares: decimalToNumber(claim.totalSquares),
    supplementAmounts,
    contractorBillingPercentage: decimalToNumber(claim.contractor.billingPercentage),
    estimatorCommissionPercentage: decimalToNumber(claim.estimator.commissionPercentage),
  });

  // Update claim with new totals
  await db.claim.update({
    where: { id: claimId },
    data: {
      currentTotalRCV: metrics.currentTotalRCV,
      totalIncrease: metrics.totalIncrease,
      percentageIncrease: metrics.percentageIncrease,
      dollarPerSquare: metrics.dollarPerSquare,
      contractorBillingAmount: metrics.contractorBillingAmount,
      estimatorCommission: metrics.estimatorCommission,
      lastActivityAt: new Date(),
    },
  });
}

/**
 * Get all supplements for a claim
 */
export async function getSupplementsForClaim(claimId: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const supplements = await db.supplement.findMany({
    where: { claimId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return supplements;
}

/**
 * Get a single supplement by ID
 */
export async function getSupplement(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const supplement = await db.supplement.findUnique({
    where: { id },
    include: {
      claim: {
        select: {
          id: true,
          policyholderName: true,
          currentTotalRCV: true,
        },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return supplement;
}

/**
 * Create a new supplement
 */
export async function createSupplement(data: SupplementInput) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = supplementInputSchema.parse(data);

  // Get current claim RCV for previousRCV/newRCV tracking
  const claim = await db.claim.findUnique({
    where: { id: validated.claimId },
    select: { currentTotalRCV: true },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const previousRCV = decimalToNumber(claim.currentTotalRCV);
  const newRCV = previousRCV + validated.amount;

  // Get user's internal ID from Clerk ID
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Create supplement
  const supplement = await db.supplement.create({
    data: {
      claimId: validated.claimId,
      amount: validated.amount,
      previousRCV,
      newRCV,
      description: validated.description,
      lineItems: validated.lineItems ?? Prisma.JsonNull,
      status: "draft",
      createdById: user.id,
    },
  });

  // Create note for supplement creation
  await db.note.create({
    data: {
      claimId: validated.claimId,
      userId: user.id,
      content: `Supplement created: ${validated.description} ($${validated.amount.toLocaleString()})`,
      type: "general",
      isInternal: false,
    },
  });

  // Update claim lastActivityAt
  await db.claim.update({
    where: { id: validated.claimId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/dashboard/claims/${validated.claimId}`);
  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return { success: true, supplement };
}

/**
 * Update an existing supplement
 */
export async function updateSupplement(
  id: string,
  data: Partial<Omit<SupplementInput, "claimId">>
) {
  await requireRole(["admin", "manager", "estimator"]);

  const existingSupplement = await db.supplement.findUnique({
    where: { id },
    include: { claim: { select: { currentTotalRCV: true } } },
  });

  if (!existingSupplement) {
    throw new Error("Supplement not found");
  }

  // Calculate new RCV if amount changed
  const newAmount = data.amount ?? decimalToNumber(existingSupplement.amount);
  const previousRCV = decimalToNumber(existingSupplement.previousRCV);
  const newRCV = previousRCV + newAmount;

  const supplement = await db.supplement.update({
    where: { id },
    data: {
      amount: data.amount,
      description: data.description,
      lineItems: data.lineItems,
      newRCV,
    },
  });

  // Recalculate claim totals if this supplement was approved
  if (
    existingSupplement.status === "approved" ||
    existingSupplement.status === "partial"
  ) {
    await recalculateClaimTotals(existingSupplement.claimId);
  }

  revalidatePath(`/dashboard/claims/${existingSupplement.claimId}`);
  revalidatePath("/dashboard/claims");
  return { success: true, supplement };
}

/**
 * Update supplement status (submit, approve, deny)
 */
export async function updateSupplementStatus(
  id: string,
  status: SupplementStatus,
  approvedAmount?: number
) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  const existingSupplement = await db.supplement.findUnique({
    where: { id },
    select: { claimId: true, status: true, amount: true, description: true },
  });

  if (!existingSupplement) {
    throw new Error("Supplement not found");
  }

  const oldStatus = existingSupplement.status;

  // Build update data
  const updateData: Record<string, unknown> = { status };

  if (status === "submitted") {
    updateData.submittedAt = new Date();
  }

  if (status === "approved" || status === "partial") {
    updateData.approvedAt = new Date();
    if (status === "partial" && approvedAmount !== undefined) {
      updateData.approvedAmount = approvedAmount;
    } else if (status === "approved") {
      updateData.approvedAmount = decimalToNumber(existingSupplement.amount);
    }
  }

  const supplement = await db.supplement.update({
    where: { id },
    data: updateData,
  });

  // Create status change note
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (user) {
    let noteContent = `Supplement "${existingSupplement.description}" status changed from "${oldStatus}" to "${status}"`;
    if (status === "partial" && approvedAmount !== undefined) {
      noteContent += ` (approved: $${approvedAmount.toLocaleString()})`;
    }

    await db.note.create({
      data: {
        claimId: existingSupplement.claimId,
        userId: user.id,
        content: noteContent,
        type: "status_change",
        isInternal: false,
      },
    });
  }

  // Recalculate claim totals when supplement is approved/partial or was previously approved
  if (
    status === "approved" ||
    status === "partial" ||
    status === "denied" ||
    oldStatus === "approved" ||
    oldStatus === "partial"
  ) {
    await recalculateClaimTotals(existingSupplement.claimId);
  }

  revalidatePath(`/dashboard/claims/${existingSupplement.claimId}`);
  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return { success: true, supplement };
}

/**
 * Approve a supplement with optional partial amount
 */
export async function approveSupplement(data: SupplementApproval) {
  const validated = supplementApprovalSchema.parse(data);

  return updateSupplementStatus(
    validated.supplementId,
    validated.status,
    validated.approvedAmount
  );
}

/**
 * Delete a supplement (hard delete - only for drafts)
 */
export async function deleteSupplement(id: string) {
  const userId = await requireRole(["admin", "manager"]);

  const supplement = await db.supplement.findUnique({
    where: { id },
    select: { claimId: true, status: true, description: true },
  });

  if (!supplement) {
    throw new Error("Supplement not found");
  }

  // Only allow deletion of draft supplements
  if (supplement.status !== "draft") {
    throw new Error("Only draft supplements can be deleted");
  }

  await db.supplement.delete({
    where: { id },
  });

  // Create note for deletion
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (user) {
    await db.note.create({
      data: {
        claimId: supplement.claimId,
        userId: user.id,
        content: `Supplement deleted: ${supplement.description}`,
        type: "general",
        isInternal: true,
      },
    });
  }

  revalidatePath(`/dashboard/claims/${supplement.claimId}`);
  revalidatePath("/dashboard/claims");
  return { success: true };
}
