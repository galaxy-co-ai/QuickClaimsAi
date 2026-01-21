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
import { calculateClaimMetrics, decimalToNumber, serializeSupplements, serializeSupplement } from "@/lib/calculations";
import {
  calculateCommission,
  buildRateProfile,
  determineCommissionType,
  type PropertyType,
} from "@/lib/commission-engine";
import { logAudit } from "@/actions/audit";
import { sendSupplementApprovedNotification } from "@/actions/notifications";
import type { SupplementStatus } from "@prisma/client";

/**
 * Recalculate claim totals based on approved supplements
 * Uses commission engine for proper rate selection based on job type
 */
async function recalculateClaimTotals(claimId: string) {
  // Get claim with contractor and estimator including all rate fields
  const claim = await db.claim.findUnique({
    where: { id: claimId },
    include: {
      contractor: {
        select: {
          billingPercentage: true,
          residentialRate: true,
          commercialRate: true,
          reinspectionRate: true,
          estimateFlatFee: true,
        },
      },
      estimator: {
        select: {
          commissionPercentage: true,
          residentialRate: true,
          commercialRate: true,
          reinspectionRate: true,
          estimateFlatFee: true,
        },
      },
      supplements: {
        where: {
          status: { in: ["approved", "partial"] },
        },
        select: {
          approvedAmount: true,
          amount: true,
          status: true,
          previousRoofSquares: true,
          newRoofSquares: true,
        },
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

  // Calculate basic metrics (currentTotalRCV, totalIncrease, etc.)
  const metrics = calculateClaimMetrics({
    initialRCV: decimalToNumber(claim.initialRCV),
    roofRCV: decimalToNumber(claim.roofRCV),
    totalSquares: decimalToNumber(claim.totalSquares),
    supplementAmounts,
    // Pass legacy rates for backwards compatibility - commission engine will override
    contractorBillingPercentage: decimalToNumber(claim.contractor.billingPercentage),
    estimatorCommissionPercentage: decimalToNumber(claim.estimator.commissionPercentage),
  });

  // Determine roof squares change from supplements (use the most recent change)
  let previousRoofSquares: number | null = decimalToNumber(claim.totalSquares);
  let newRoofSquares: number | null = null;

  // Check if any approved supplement changed roof squares
  for (const supplement of claim.supplements) {
    if (supplement.newRoofSquares) {
      newRoofSquares = decimalToNumber(supplement.newRoofSquares);
      if (supplement.previousRoofSquares) {
        previousRoofSquares = decimalToNumber(supplement.previousRoofSquares);
      }
    }
  }

  // Use commission engine for proper rate-based calculation
  const propertyType = (claim.propertyType as PropertyType) || "residential";
  const commissionResult = calculateCommission({
    jobType: claim.jobType,
    propertyType,
    previousRoofSquares,
    newRoofSquares,
    commissionableAmount: metrics.totalIncrease,
    contractorRates: buildRateProfile(claim.contractor),
    estimatorRates: buildRateProfile(claim.estimator),
  });

  // Update claim with new totals using commission engine results
  await db.claim.update({
    where: { id: claimId },
    data: {
      currentTotalRCV: metrics.currentTotalRCV,
      totalIncrease: metrics.totalIncrease,
      percentageIncrease: metrics.percentageIncrease,
      dollarPerSquare: metrics.dollarPerSquare,
      // Use commission engine results instead of legacy calculation
      contractorBillingAmount: commissionResult.contractorAmount,
      estimatorCommission: commissionResult.estimatorAmount,
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

  // Serialize Decimal fields to numbers for client component compatibility
  return serializeSupplements(supplements);
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

  if (!supplement) return null;

  // Serialize Decimal fields to numbers for client component compatibility
  return serializeSupplement(supplement);
}

/**
 * Create a new supplement
 */
export async function createSupplement(data: SupplementInput) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = supplementInputSchema.parse(data);

  // Get current claim RCV and squares for tracking
  const claim = await db.claim.findUnique({
    where: { id: validated.claimId },
    select: {
      currentTotalRCV: true,
      totalSquares: true,
      jobType: true,
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  const previousRCV = decimalToNumber(claim.currentTotalRCV);
  const newRCV = previousRCV + validated.amount;

  // For roof squares tracking (reinspection detection)
  const previousRoofSquares = validated.previousRoofSquares ?? decimalToNumber(claim.totalSquares);
  const newRoofSquares = validated.newRoofSquares ?? null;

  // Determine commission type based on squares change
  const commissionType = determineCommissionType(
    claim.jobType,
    previousRoofSquares,
    newRoofSquares
  );

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
      omApproved: validated.omApproved ?? false,
      status: "draft",
      createdById: user.id,
      // Roof squares for reinspection detection
      previousRoofSquares,
      newRoofSquares,
      // Roof RCV tracking
      previousRoofRCV: validated.previousRoofRCV ?? null,
      newRoofRCV: validated.newRoofRCV ?? null,
      // Increase breakdown for price per square calculation
      roofingIncrease: validated.roofingIncrease ?? null,
      nonRoofingIncrease: validated.nonRoofingIncrease ?? null,
      // Commission type determined from squares change
      commissionType,
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

  // Log audit entry for supplement creation
  await logAudit({
    action: "create",
    entityType: "supplement",
    entityId: supplement.id,
    newValue: `Supplement created: ${validated.description} ($${validated.amount.toLocaleString()})`,
    metadata: {
      claimId: validated.claimId,
      amount: validated.amount,
      description: validated.description,
    },
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

  // Log audit entry for supplement update
  await logAudit({
    action: "update",
    entityType: "supplement",
    entityId: id,
    newValue: `Supplement updated`,
    metadata: {
      claimId: existingSupplement.claimId,
      amount: data.amount,
      description: data.description,
    },
  });

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

  // Log audit entry for supplement status change
  const auditAction = status === "approved" || status === "partial" ? "approve" :
                      status === "submitted" ? "submit" : "status_change";
  await logAudit({
    action: auditAction,
    entityType: "supplement",
    entityId: id,
    fieldName: "status",
    oldValue: oldStatus,
    newValue: status,
    metadata: {
      claimId: existingSupplement.claimId,
      description: existingSupplement.description,
      amount: decimalToNumber(existingSupplement.amount),
      approvedAmount: approvedAmount,
    },
  });

  // Send email notification when supplement is approved (async, don't await)
  if (status === "approved" || status === "partial") {
    sendSupplementApprovedNotification(id).catch((err) => {
      console.error("[Supplements] Failed to send approval notification:", err);
    });
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

  // Log audit entry for supplement deletion
  await logAudit({
    action: "delete",
    entityType: "supplement",
    entityId: id,
    oldValue: supplement.description,
    metadata: {
      claimId: supplement.claimId,
      description: supplement.description,
    },
  });

  revalidatePath(`/dashboard/claims/${supplement.claimId}`);
  revalidatePath("/dashboard/claims");
  return { success: true };
}