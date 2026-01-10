"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  adjusterInputSchema,
  adjusterFiltersSchema,
  type AdjusterInput,
  type AdjusterFilters,
} from "@/lib/validations/adjuster";
import { requireRole } from "@/lib/auth";

/**
 * Get all adjusters with filters
 */
export async function getAdjusters(filters?: Partial<AdjusterFilters>) {
  await requireRole(["admin", "manager", "estimator"]);

  const validated = adjusterFiltersSchema.parse(filters ?? {});
  const { carrierId, type, search, page, limit } = validated;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (carrierId) {
    where.carrierId = carrierId;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [adjusters, total] = await Promise.all([
    db.adjuster.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        carrier: {
          select: { id: true, name: true },
        },
        _count: {
          select: { claims: true },
        },
      },
    }),
    db.adjuster.count({ where }),
  ]);

  return {
    adjusters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single adjuster by ID
 */
export async function getAdjuster(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const adjuster = await db.adjuster.findUnique({
    where: { id },
    include: {
      carrier: true,
      claims: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          policyholderName: true,
          status: true,
          totalIncrease: true,
          createdAt: true,
        },
      },
      _count: {
        select: { claims: true },
      },
    },
  });

  return adjuster;
}

/**
 * Create a new adjuster
 */
export async function createAdjuster(data: AdjusterInput) {
  await requireRole(["admin", "manager"]);

  // Validate input
  const validated = adjusterInputSchema.parse(data);

  // Verify carrier exists
  const carrier = await db.carrier.findUnique({
    where: { id: validated.carrierId },
    select: { id: true },
  });

  if (!carrier) {
    throw new Error("Carrier not found");
  }

  const adjuster = await db.adjuster.create({
    data: {
      name: validated.name,
      carrierId: validated.carrierId,
      email: validated.email || null,
      phone: validated.phone || null,
      type: validated.type,
    },
  });

  revalidatePath("/dashboard/adjusters");
  revalidatePath(`/dashboard/carriers/${validated.carrierId}`);
  return { success: true, adjuster };
}

/**
 * Update an existing adjuster
 */
export async function updateAdjuster(id: string, data: AdjusterInput) {
  await requireRole(["admin", "manager"]);

  // Validate input
  const validated = adjusterInputSchema.parse(data);

  // Verify carrier exists if changing carrier
  const carrier = await db.carrier.findUnique({
    where: { id: validated.carrierId },
    select: { id: true },
  });

  if (!carrier) {
    throw new Error("Carrier not found");
  }

  const adjuster = await db.adjuster.update({
    where: { id },
    data: {
      name: validated.name,
      carrierId: validated.carrierId,
      email: validated.email || null,
      phone: validated.phone || null,
      type: validated.type,
    },
  });

  revalidatePath("/dashboard/adjusters");
  revalidatePath(`/dashboard/adjusters/${id}`);
  revalidatePath(`/dashboard/carriers/${validated.carrierId}`);
  return { success: true, adjuster };
}

/**
 * Deactivate an adjuster (soft delete)
 */
export async function deactivateAdjuster(id: string) {
  await requireRole(["admin", "manager"]);

  const adjuster = await db.adjuster.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/adjusters");
  revalidatePath(`/dashboard/carriers/${adjuster.carrierId}`);
  return { success: true };
}

/**
 * Get adjusters for a specific carrier (used in claim forms)
 */
export async function getAdjustersByCarrier(carrierId: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const adjusters = await db.adjuster.findMany({
    where: {
      carrierId,
      isActive: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      email: true,
      phone: true,
    },
  });

  return adjusters;
}

/**
 * Get adjuster statistics for analytics
 */
export async function getAdjusterStats(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const stats = await db.claim.aggregate({
    where: { adjusterId: id },
    _count: true,
    _avg: {
      totalIncrease: true,
      dollarPerSquare: true,
    },
  });

  return {
    claimCount: stats._count,
    avgIncrease: stats._avg.totalIncrease
      ? Number(stats._avg.totalIncrease)
      : 0,
    avgDollarPerSquare: stats._avg.dollarPerSquare
      ? Number(stats._avg.dollarPerSquare)
      : 0,
  };
}
