"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { claimInputSchema, claimFiltersSchema, type ClaimInput, type ClaimFilters } from "@/lib/validations/claim";
import { requireRole } from "@/lib/auth";
import { calculateInitialDollarPerSquare, decimalToNumber, serializeClaims, serializeClaim } from "@/lib/calculations";
import { CLAIM_STATUS_LABELS, getValidNextStatuses, isValidStatusTransition } from "@/lib/constants";
import { logAudit } from "@/actions/audit";
import { sendStatusChangeNotification } from "@/actions/notifications";
import type { ClaimStatus } from "@prisma/client";

/**
 * Get all claims with filters and pagination
 */
export async function getClaims(filters?: Partial<ClaimFilters>) {
  await requireRole(["admin", "manager", "estimator"]);

  const validated = claimFiltersSchema.parse(filters ?? {});
  const { status, contractorId, estimatorId, carrierId, search, dateFrom, dateTo, page, limit } = validated;

  const where: Record<string, unknown> = {};

  // Status filter
  if (status) {
    where.status = status;
  }

  // Relationship filters
  if (contractorId) {
    where.contractorId = contractorId;
  }
  if (estimatorId) {
    where.estimatorId = estimatorId;
  }
  if (carrierId) {
    where.carrierId = carrierId;
  }

  // Search filter (policyholder name, address, claim number)
  if (search) {
    where.OR = [
      { policyholderName: { contains: search, mode: "insensitive" } },
      { lossAddress: { contains: search, mode: "insensitive" } },
      { lossCity: { contains: search, mode: "insensitive" } },
      { claimNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      (where.createdAt as Record<string, Date>).gte = dateFrom;
    }
    if (dateTo) {
      (where.createdAt as Record<string, Date>).lte = dateTo;
    }
  }

  const [claims, total] = await Promise.all([
    db.claim.findMany({
      where,
      orderBy: { lastActivityAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        contractor: {
          select: { id: true, companyName: true },
        },
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
    // Serialize Decimal fields to numbers for client component compatibility
    claims: serializeClaims(claims),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single claim by ID with all relations
 */
export async function getClaim(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const claim = await db.claim.findUnique({
    where: { id },
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
      notes: {
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

  if (!claim) return null;

  // Serialize Decimal fields to numbers for client component compatibility
  return serializeClaim(claim);
}

/**
 * Create a new claim
 */
export async function createClaim(data: ClaimInput) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = claimInputSchema.parse(data);

  // Calculate initial dollar per square
  const dollarPerSquare = calculateInitialDollarPerSquare(
    validated.roofRCV,
    validated.totalSquares
  );

  // Get contractor billing % and estimator commission % for calculations
  const [contractor, estimator] = await Promise.all([
    db.contractor.findUnique({
      where: { id: validated.contractorId },
      select: { billingPercentage: true },
    }),
    db.estimator.findUnique({
      where: { id: validated.estimatorId },
      select: { commissionPercentage: true },
    }),
  ]);

  if (!contractor) {
    throw new Error("Contractor not found");
  }
  if (!estimator) {
    throw new Error("Estimator not found");
  }

  const claim = await db.claim.create({
    data: {
      // Policyholder Info
      policyholderName: validated.policyholderName,
      policyholderEmail: validated.policyholderEmail || null,
      policyholderPhone: validated.policyholderPhone || null,
      policyholderWorkPhone: validated.policyholderWorkPhone || null,
      policyholderFax: validated.policyholderFax || null,

      // Address
      lossAddress: validated.lossAddress,
      lossAddressLine2: validated.lossAddressLine2 || null,
      lossCity: validated.lossCity,
      lossState: validated.lossState,
      lossZip: validated.lossZip,

      // Claim Info
      claimNumber: validated.claimNumber || null,
      policyNumber: validated.policyNumber || null,
      dateOfLoss: validated.dateOfLoss || null,
      lossType: validated.lossType || null,

      // Relationships
      contractorId: validated.contractorId,
      estimatorId: validated.estimatorId,
      carrierId: validated.carrierId,
      adjusterId: validated.adjusterId || null,

      // Direct Adjuster Info
      adjusterNameOverride: validated.adjusterNameOverride || null,
      adjusterPhoneOverride: validated.adjusterPhoneOverride || null,
      adjusterEmailOverride: validated.adjusterEmailOverride || null,

      // Supervisor Info
      supervisorName: validated.supervisorName || null,
      supervisorPhone: validated.supervisorPhone || null,

      // External References
      contractorCrmId: validated.contractorCrmId || null,
      externalJobNumber: validated.externalJobNumber || null,

      // Job Classification
      jobType: validated.jobType,
      status: "missing_info",

      // Financial - Initial
      totalSquares: validated.totalSquares,
      roofRCV: validated.roofRCV,
      initialRCV: validated.initialRCV,
      dollarPerSquare,

      // Financial - Tracking
      currentTotalRCV: validated.initialRCV,
      totalIncrease: 0,
      percentageIncrease: 0,
      contractorBillingAmount: 0,
      estimatorCommission: 0,

      // Money Released
      moneyReleasedAmount: validated.moneyReleasedAmount || null,
    },
  });

  // Create initial note for claim creation
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (user) {
    await db.note.create({
      data: {
        claimId: claim.id,
        userId: user.id,
        content: "Claim created",
        type: "status_change",
        isInternal: false,
      },
    });
  }

  // Log audit entry for claim creation
  await logAudit({
    action: "create",
    entityType: "claim",
    entityId: claim.id,
    newValue: `Claim created for ${validated.policyholderName}`,
    metadata: {
      policyholderName: validated.policyholderName,
      lossAddress: validated.lossAddress,
      initialRCV: validated.initialRCV,
    },
  });

  revalidatePath("/dashboard/claims");
  revalidatePath("/dashboard");
  return { success: true, claim };
}

/**
 * Update an existing claim
 */
export async function updateClaim(id: string, data: Partial<ClaimInput>) {
  await requireRole(["admin", "manager", "estimator"]);

  // Get current claim to preserve unchanged fields
  const existingClaim = await db.claim.findUnique({
    where: { id },
  });

  if (!existingClaim) {
    throw new Error("Claim not found");
  }

  // Merge with existing data for validation
  const mergedData = {
    // Policyholder Info
    policyholderName: data.policyholderName ?? existingClaim.policyholderName,
    policyholderEmail: data.policyholderEmail ?? existingClaim.policyholderEmail ?? "",
    policyholderPhone: data.policyholderPhone ?? existingClaim.policyholderPhone ?? "",
    policyholderWorkPhone: data.policyholderWorkPhone ?? existingClaim.policyholderWorkPhone ?? "",
    policyholderFax: data.policyholderFax ?? existingClaim.policyholderFax ?? "",

    // Address
    lossAddress: data.lossAddress ?? existingClaim.lossAddress,
    lossAddressLine2: data.lossAddressLine2 ?? existingClaim.lossAddressLine2 ?? "",
    lossCity: data.lossCity ?? existingClaim.lossCity,
    lossState: data.lossState ?? existingClaim.lossState,
    lossZip: data.lossZip ?? existingClaim.lossZip,

    // Claim Info
    claimNumber: data.claimNumber ?? existingClaim.claimNumber ?? "",
    policyNumber: data.policyNumber ?? existingClaim.policyNumber ?? "",
    dateOfLoss: data.dateOfLoss ?? existingClaim.dateOfLoss ?? undefined,
    lossType: data.lossType ?? existingClaim.lossType ?? undefined,

    // Relationships
    contractorId: data.contractorId ?? existingClaim.contractorId,
    estimatorId: data.estimatorId ?? existingClaim.estimatorId,
    carrierId: data.carrierId ?? existingClaim.carrierId,
    adjusterId: data.adjusterId ?? existingClaim.adjusterId ?? "",

    // Direct Adjuster Info
    adjusterNameOverride: data.adjusterNameOverride ?? existingClaim.adjusterNameOverride ?? "",
    adjusterPhoneOverride: data.adjusterPhoneOverride ?? existingClaim.adjusterPhoneOverride ?? "",
    adjusterEmailOverride: data.adjusterEmailOverride ?? existingClaim.adjusterEmailOverride ?? "",

    // Supervisor Info
    supervisorName: data.supervisorName ?? existingClaim.supervisorName ?? "",
    supervisorPhone: data.supervisorPhone ?? existingClaim.supervisorPhone ?? "",

    // External References
    contractorCrmId: data.contractorCrmId ?? existingClaim.contractorCrmId ?? "",
    externalJobNumber: data.externalJobNumber ?? existingClaim.externalJobNumber ?? "",

    // Job Type
    jobType: data.jobType ?? existingClaim.jobType,

    // Financial - Initial
    totalSquares: data.totalSquares ?? decimalToNumber(existingClaim.totalSquares),
    roofRCV: data.roofRCV ?? decimalToNumber(existingClaim.roofRCV),
    initialRCV: data.initialRCV ?? decimalToNumber(existingClaim.initialRCV),

    // Financial - Final
    finalRoofRCV: data.finalRoofRCV ?? (existingClaim.finalRoofRCV ? decimalToNumber(existingClaim.finalRoofRCV) : undefined),
    finalTotalRCV: data.finalTotalRCV ?? (existingClaim.finalTotalRCV ? decimalToNumber(existingClaim.finalTotalRCV) : undefined),

    // Money Released
    moneyReleasedAmount: data.moneyReleasedAmount ?? (existingClaim.moneyReleasedAmount ? decimalToNumber(existingClaim.moneyReleasedAmount) : undefined),
  };

  const validated = claimInputSchema.parse(mergedData);

  // Recalculate dollar per square if roof data changed
  const dollarPerSquare = calculateInitialDollarPerSquare(
    validated.roofRCV,
    validated.totalSquares
  );

  // Calculate final dollar per square if final values provided
  const finalDollarPerSquare = validated.finalRoofRCV && validated.totalSquares
    ? calculateInitialDollarPerSquare(validated.finalRoofRCV, validated.totalSquares)
    : null;

  const claim = await db.claim.update({
    where: { id },
    data: {
      // Policyholder Info
      policyholderName: validated.policyholderName,
      policyholderEmail: validated.policyholderEmail || null,
      policyholderPhone: validated.policyholderPhone || null,
      policyholderWorkPhone: validated.policyholderWorkPhone || null,
      policyholderFax: validated.policyholderFax || null,

      // Address
      lossAddress: validated.lossAddress,
      lossAddressLine2: validated.lossAddressLine2 || null,
      lossCity: validated.lossCity,
      lossState: validated.lossState,
      lossZip: validated.lossZip,

      // Claim Info
      claimNumber: validated.claimNumber || null,
      policyNumber: validated.policyNumber || null,
      dateOfLoss: validated.dateOfLoss || null,
      lossType: validated.lossType || null,

      // Relationships
      contractorId: validated.contractorId,
      estimatorId: validated.estimatorId,
      carrierId: validated.carrierId,
      adjusterId: validated.adjusterId || null,

      // Direct Adjuster Info
      adjusterNameOverride: validated.adjusterNameOverride || null,
      adjusterPhoneOverride: validated.adjusterPhoneOverride || null,
      adjusterEmailOverride: validated.adjusterEmailOverride || null,

      // Supervisor Info
      supervisorName: validated.supervisorName || null,
      supervisorPhone: validated.supervisorPhone || null,

      // External References
      contractorCrmId: validated.contractorCrmId || null,
      externalJobNumber: validated.externalJobNumber || null,

      // Job Type
      jobType: validated.jobType,

      // Financial
      totalSquares: validated.totalSquares,
      roofRCV: validated.roofRCV,
      initialRCV: validated.initialRCV,
      dollarPerSquare,
      finalRoofRCV: validated.finalRoofRCV || null,
      finalTotalRCV: validated.finalTotalRCV || null,
      finalDollarPerSquare,

      // Money Released
      moneyReleasedAmount: validated.moneyReleasedAmount || null,

      lastActivityAt: new Date(),
    },
  });

  // Log audit entry for claim update
  await logAudit({
    action: "update",
    entityType: "claim",
    entityId: id,
    newValue: `Claim updated: ${validated.policyholderName}`,
    metadata: {
      policyholderName: validated.policyholderName,
    },
  });

  revalidatePath("/dashboard/claims");
  revalidatePath(`/dashboard/claims/${id}`);
  return { success: true, claim };
}

/**
 * Update claim status with automatic note creation and timestamp update
 */
export async function updateClaimStatus(id: string, newStatus: ClaimStatus) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  // Get current claim status
  const existingClaim = await db.claim.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!existingClaim) {
    throw new Error("Claim not found");
  }

  const oldStatus = existingClaim.status;

  // Validate status transition
  if (!isValidStatusTransition(oldStatus, newStatus)) {
    const validOptions = getValidNextStatuses(oldStatus)
      .map((s) => CLAIM_STATUS_LABELS[s] || s)
      .join(", ");
    throw new Error(
      `Invalid status transition from "${CLAIM_STATUS_LABELS[oldStatus]}" to "${CLAIM_STATUS_LABELS[newStatus]}". Valid options: ${validOptions || "none (terminal state)"}`
    );
  }

  // Update claim with new status and timestamps
  const updateData: Record<string, unknown> = {
    status: newStatus,
    statusChangedAt: new Date(),
    lastActivityAt: new Date(),
  };

  // Set completedAt for terminal states
  if (newStatus === "completed") {
    updateData.completedAt = new Date();
  }

  const claim = await db.claim.update({
    where: { id },
    data: updateData,
  });

  // Create status change note
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (user) {
    await db.note.create({
      data: {
        claimId: id,
        userId: user.id,
        content: `Status changed from "${oldStatus}" to "${newStatus}"`,
        type: "status_change",
        isInternal: false,
      },
    });
  }

  // Log audit entry for status change
  await logAudit({
    action: "status_change",
    entityType: "claim",
    entityId: id,
    fieldName: "status",
    oldValue: oldStatus,
    newValue: newStatus,
    metadata: {
      statusLabel: CLAIM_STATUS_LABELS[newStatus],
    },
  });

  // Send email notification to contractor (async, don't await)
  sendStatusChangeNotification(id, oldStatus, newStatus).catch((err) => {
    console.error("[Claims] Failed to send status change notification:", err);
  });

  revalidatePath("/dashboard/claims");
  revalidatePath(`/dashboard/claims/${id}`);
  revalidatePath("/dashboard");
  return { success: true, claim };
}

/**
 * Get claims requiring action (48-hour compliance)
 */
export async function getClaimsRequiringAction(limit: number = 10) {
  await requireRole(["admin", "manager", "estimator"]);

  // 36 hours ago for warning threshold
  const warningThreshold = new Date(Date.now() - 36 * 60 * 60 * 1000);

  const claims = await db.claim.findMany({
    where: {
      status: {
        notIn: ["completed", "work_suspended"],
      },
      lastActivityAt: {
        lt: warningThreshold,
      },
    },
    orderBy: { lastActivityAt: "asc" },
    take: limit,
    include: {
      contractor: {
        select: { companyName: true },
      },
      estimator: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  // Serialize Decimal fields to numbers for client component compatibility
  return serializeClaims(claims);
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  await requireRole(["admin", "manager", "estimator"]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    activeClaims,
    newThisWeek,
    totalIncreaseThisMonth,
    avgDollarPerSquare,
    supplementStats,
    noteStats,
  ] = await Promise.all([
    // Active claims (not completed or closed)
    db.claim.count({
      where: {
        status: { notIn: ["completed", "work_suspended"] },
      },
    }),
    // New claims this week
    db.claim.count({
      where: {
        createdAt: { gte: startOfWeek },
      },
    }),
    // Total increase this month
    db.claim.aggregate({
      where: {
        statusChangedAt: { gte: startOfMonth },
        status: { in: ["final_invoice_sent", "final_invoice_received", "money_released", "completed"] },
      },
      _sum: { totalIncrease: true },
    }),
    // Average dollar per square across all active claims
    db.claim.aggregate({
      where: {
        status: { notIn: ["completed", "work_suspended"] },
      },
      _avg: { dollarPerSquare: true },
    }),
    // Supplement stats: count and total amount this month
    db.supplement.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
      },
      _count: { id: true },
      _sum: { amount: true },
    }),
    // Note stats for active claims (for updates per job calculation)
    db.note.count({
      where: {
        type: { in: ["general", "call", "email", "document"] }, // Manual notes only
        claim: {
          status: { notIn: ["completed", "work_suspended"] },
        },
      },
    }),
  ]);

  // Calculate average updates per active job
  const updatesPerJob = activeClaims > 0 ? noteStats / activeClaims : 0;

  return {
    activeClaims,
    newThisWeek,
    totalIncreaseThisMonth: totalIncreaseThisMonth._sum.totalIncrease
      ? decimalToNumber(totalIncreaseThisMonth._sum.totalIncrease)
      : 0,
    avgDollarPerSquare: avgDollarPerSquare._avg.dollarPerSquare
      ? decimalToNumber(avgDollarPerSquare._avg.dollarPerSquare)
      : 0,
    // New KPIs per client request
    supplementCount: supplementStats._count.id || 0,
    supplementTotalAmount: supplementStats._sum.amount
      ? decimalToNumber(supplementStats._sum.amount)
      : 0,
    updatesPerJob: Math.round(updatesPerJob * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Get all dropdown options for claim forms
 */
export async function getClaimFormOptions() {
  await requireRole(["admin", "manager", "estimator"]);

  const [contractors, estimators, carriers, adjusters] = await Promise.all([
    db.contractor.findMany({
      where: { isActive: true },
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
    db.estimator.findMany({
      where: { isActive: true },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
    db.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.adjuster.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, carrierId: true, type: true },
    }),
  ]);

  return { contractors, estimators, carriers, adjusters };
}

/**
 * Get all active claims for Kanban board view
 */
export async function getClaimsForKanban() {
  await requireRole(["admin", "manager", "estimator"]);

  const claims = await db.claim.findMany({
    where: {
      status: {
        notIn: ["completed", "work_suspended"],
      },
    },
    orderBy: { lastActivityAt: "desc" },
    include: {
      contractor: {
        select: { id: true, companyName: true },
      },
      estimator: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  // Serialize Decimal fields to numbers for client component compatibility
  return serializeClaims(claims);
}

/**
 * Get enhanced manager dashboard statistics
 */
export async function getManagerDashboardStats() {
  await requireRole(["admin", "manager"]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // 48-hour compliance thresholds
  const complianceThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [
    // Basic stats
    activeClaims,
    completedThisMonth,
    completedLastMonth,
    totalIncreaseThisMonth,
    avgDollarPerSquare,
    // Claims by status
    claimsByStatus,
    // Compliance stats
    overdueCount,
    totalActiveForCompliance,
    // Recent activity (last 10 status changes)
    recentActivity,
    // Claims requiring attention
    claimsNeedingAttention,
  ] = await Promise.all([
    // Active claims
    db.claim.count({
      where: { status: { notIn: ["completed", "work_suspended"] } },
    }),
    // Completed this month
    db.claim.count({
      where: {
        completedAt: { gte: startOfMonth },
        status: "completed",
      },
    }),
    // Completed last month
    db.claim.count({
      where: {
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: "completed",
      },
    }),
    // Total increase this month
    db.claim.aggregate({
      where: {
        statusChangedAt: { gte: startOfMonth },
        status: { in: ["final_invoice_sent", "final_invoice_received", "money_released", "completed"] },
      },
      _sum: { totalIncrease: true },
    }),
    // Average dollar per square
    db.claim.aggregate({
      where: { status: { notIn: ["completed", "work_suspended"] } },
      _avg: { dollarPerSquare: true },
    }),
    // Claims grouped by status
    db.claim.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { status: { notIn: ["completed", "work_suspended"] } },
    }),
    // Overdue claims (more than 48 hours since last activity)
    db.claim.count({
      where: {
        status: { notIn: ["completed", "work_suspended"] },
        lastActivityAt: { lt: complianceThreshold },
      },
    }),
    // Total active claims for compliance calculation
    db.claim.count({
      where: { status: { notIn: ["completed", "work_suspended"] } },
    }),
    // Recent activity
    db.note.findMany({
      where: { type: "status_change" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        claim: {
          select: { id: true, policyholderName: true },
        },
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    // Claims requiring attention (overdue)
    db.claim.findMany({
      where: {
        status: { notIn: ["completed", "work_suspended"] },
        lastActivityAt: { lt: complianceThreshold },
      },
      orderBy: { lastActivityAt: "asc" },
      take: 5,
      include: {
        contractor: { select: { companyName: true } },
        estimator: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  // Calculate compliance percentage
  const compliancePercentage = totalActiveForCompliance > 0
    ? ((totalActiveForCompliance - overdueCount) / totalActiveForCompliance) * 100
    : 100;

  // Format claims by status for chart
  const statusChartData = claimsByStatus.map((item) => ({
    status: CLAIM_STATUS_LABELS[item.status] || item.status,
    count: item._count._all,
  }));

  return {
    activeClaims,
    completedThisMonth,
    completedLastMonth,
    totalIncreaseThisMonth: totalIncreaseThisMonth._sum.totalIncrease
      ? decimalToNumber(totalIncreaseThisMonth._sum.totalIncrease)
      : 0,
    avgDollarPerSquare: avgDollarPerSquare._avg.dollarPerSquare
      ? decimalToNumber(avgDollarPerSquare._avg.dollarPerSquare)
      : 0,
    compliancePercentage: Math.round(compliancePercentage),
    overdueCount,
    statusChartData,
    recentActivity,
    // Serialize Decimal fields to numbers for client component compatibility
    claimsNeedingAttention: serializeClaims(claimsNeedingAttention),
  };
}