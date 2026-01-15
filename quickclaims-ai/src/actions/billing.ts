"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { decimalToNumber } from "@/lib/calculations";
import { CLAIM_STATUS_LABELS } from "@/lib/constants";
import { z } from "zod";

// Input schema for billing filters
const billingFiltersSchema = z.object({
  contractorId: z.string().optional(),
  isPaid: z.boolean().optional(),
  page: z.number().default(1),
  limit: z.number().default(50),
});

export type BillingFilters = z.infer<typeof billingFiltersSchema>;

/**
 * Get claims with billing amounts for the billing management page
 */
export async function getBillingClaims(filters?: Partial<BillingFilters>) {
  await requireRole(["admin", "manager"]);

  const validated = billingFiltersSchema.parse(filters ?? {});
  const { contractorId, isPaid, page, limit } = validated;

  const where: Record<string, unknown> = {
    // Only include claims that are approved or completed (have billing amounts)
    status: { in: ["approved", "final_invoice_pending", "final_invoice_sent", "completed"] },
  };

  if (contractorId) {
    where.contractorId = contractorId;
  }

  if (isPaid === true) {
    where.billingPaidAt = { not: null };
  } else if (isPaid === false) {
    where.billingPaidAt = null;
  }

  const [claims, total] = await Promise.all([
    db.claim.findMany({
      where,
      orderBy: { statusChangedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        contractor: {
          select: { id: true, companyName: true },
        },
        estimator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    db.claim.count({ where }),
  ]);

  // Calculate totals
  const totals = await db.claim.aggregate({
    where,
    _sum: {
      contractorBillingAmount: true,
      totalIncrease: true,
    },
    _count: { id: true },
  });

  // Transform claims for client
  const claimsData = claims.map((claim) => ({
    id: claim.id,
    policyholderName: claim.policyholderName,
    lossAddress: `${claim.lossAddress}, ${claim.lossCity}`,
    contractorId: claim.contractor.id,
    contractorName: claim.contractor.companyName,
    estimatorName: `${claim.estimator.firstName} ${claim.estimator.lastName}`,
    totalIncrease: decimalToNumber(claim.totalIncrease),
    billingAmount: decimalToNumber(claim.contractorBillingAmount),
    status: CLAIM_STATUS_LABELS[claim.status] || claim.status,
    statusChangedAt: claim.statusChangedAt,
    isPaid: !!claim.billingPaidAt,
    billingPaidAt: claim.billingPaidAt,
  }));

  return {
    claims: claimsData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    totals: {
      count: totals._count.id || 0,
      totalIncrease: totals._sum.totalIncrease
        ? decimalToNumber(totals._sum.totalIncrease)
        : 0,
      totalBilling: totals._sum.contractorBillingAmount
        ? decimalToNumber(totals._sum.contractorBillingAmount)
        : 0,
    },
  };
}

/**
 * Mark a claim as paid
 */
export async function markClaimPaid(claimId: string) {
  const userId = await requireRole(["admin", "manager"]);

  await db.claim.update({
    where: { id: claimId },
    data: {
      billingPaidAt: new Date(),
      billingPaidById: userId,
    },
  });

  revalidatePath("/dashboard/billing");
  return { success: true };
}

/**
 * Mark a claim as unpaid
 */
export async function markClaimUnpaid(claimId: string) {
  await requireRole(["admin", "manager"]);

  await db.claim.update({
    where: { id: claimId },
    data: {
      billingPaidAt: null,
      billingPaidById: null,
    },
  });

  revalidatePath("/dashboard/billing");
  return { success: true };
}

/**
 * Mark multiple claims as paid
 */
export async function markClaimsPaid(claimIds: string[]) {
  const userId = await requireRole(["admin", "manager"]);

  await db.claim.updateMany({
    where: { id: { in: claimIds } },
    data: {
      billingPaidAt: new Date(),
      billingPaidById: userId,
    },
  });

  revalidatePath("/dashboard/billing");
  return { success: true, count: claimIds.length };
}

/**
 * Get contractors for billing filter dropdown
 */
export async function getContractorsForBilling() {
  await requireRole(["admin", "manager"]);

  return db.contractor.findMany({
    where: { isActive: true },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
    },
  });
}
