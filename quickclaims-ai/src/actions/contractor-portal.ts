"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireContractor, getCurrentDbUserId, getCurrentUserRole } from "@/lib/auth";
import { decimalToNumber } from "@/lib/calculations";

/**
 * Get claims for the current contractor (contractor portal)
 */
export async function getContractorClaims(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { contractorId } = await requireContractor();

  const page = filters?.page || 1;
  const limit = filters?.limit || 25;
  const where: Record<string, unknown> = {
    contractorId,
  };

  // Status filter
  if (filters?.status) {
    where.status = filters.status;
  }

  // Search filter
  if (filters?.search) {
    where.OR = [
      { policyholderName: { contains: filters.search, mode: "insensitive" } },
      { lossAddress: { contains: filters.search, mode: "insensitive" } },
      { lossCity: { contains: filters.search, mode: "insensitive" } },
      { claimNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [claims, total] = await Promise.all([
    db.claim.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        estimator: {
          select: { id: true, firstName: true, lastName: true },
        },
        carrier: {
          select: { id: true, name: true },
        },
        _count: {
          select: { supplements: true },
        },
      },
    }),
    db.claim.count({ where }),
  ]);

  return {
    claims,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single claim for contractor view (filtered to only their claims)
 */
export async function getContractorClaim(id: string) {
  const { contractorId } = await requireContractor();

  const claim = await db.claim.findFirst({
    where: {
      id,
      contractorId, // Ensure contractor can only access their own claims
    },
    include: {
      contractor: true,
      estimator: true,
      carrier: true,
      adjuster: true,
      supplements: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      // Filter out internal notes for contractor view
      notes: {
        where: {
          isInternal: false,
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!claim) {
    throw new Error("Claim not found or access denied");
  }

  return claim;
}

/**
 * Add a comment to a claim (contractor can only add general notes)
 */
export async function addContractorComment(claimId: string, content: string) {
  const { contractorId } = await requireContractor();
  const dbUserId = await getCurrentDbUserId();

  if (!dbUserId) {
    throw new Error("User not found in database");
  }

  // Verify the claim belongs to this contractor
  const claim = await db.claim.findFirst({
    where: {
      id: claimId,
      contractorId,
    },
    select: { id: true },
  });

  if (!claim) {
    throw new Error("Claim not found or access denied");
  }

  // Create the note (always general type for contractors, never internal)
  const note = await db.note.create({
    data: {
      claimId,
      userId: dbUserId,
      content: content.trim(),
      type: "general",
      isInternal: false,
    },
  });

  // Update claim lastActivityAt
  await db.claim.update({
    where: { id: claimId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/contractor/claims/${claimId}`);
  revalidatePath(`/dashboard/claims/${claimId}`);
  return { success: true, note };
}

/**
 * Get contractor dashboard stats
 */
export async function getContractorDashboardStats() {
  const { contractorId } = await requireContractor();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activeClaims,
    completedThisMonth,
    totalIncreaseThisMonth,
    avgDollarPerSquare,
  ] = await Promise.all([
    // Active claims for this contractor
    db.claim.count({
      where: {
        contractorId,
        status: { notIn: ["completed", "closed_lost"] },
      },
    }),
    // Completed claims this month
    db.claim.count({
      where: {
        contractorId,
        completedAt: { gte: startOfMonth },
      },
    }),
    // Total increase this month for completed/approved claims
    db.claim.aggregate({
      where: {
        contractorId,
        statusChangedAt: { gte: startOfMonth },
        status: { in: ["approved", "final_invoice_pending", "final_invoice_sent", "completed"] },
      },
      _sum: { totalIncrease: true },
    }),
    // Average dollar per square
    db.claim.aggregate({
      where: {
        contractorId,
        status: { notIn: ["completed", "closed_lost"] },
      },
      _avg: { dollarPerSquare: true },
    }),
  ]);

  return {
    activeClaims,
    completedThisMonth,
    totalIncreaseThisMonth: totalIncreaseThisMonth._sum.totalIncrease
      ? decimalToNumber(totalIncreaseThisMonth._sum.totalIncrease)
      : 0,
    avgDollarPerSquare: avgDollarPerSquare._avg.dollarPerSquare
      ? decimalToNumber(avgDollarPerSquare._avg.dollarPerSquare)
      : 0,
  };
}
