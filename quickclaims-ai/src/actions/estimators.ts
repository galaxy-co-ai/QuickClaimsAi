"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

// Shared rate validation (optional, 0-50% stored as decimal)
const rateSchema = z
  .number()
  .min(0, "Rate must be at least 0%")
  .max(0.5, "Rate cannot exceed 50%")
  .optional();

// Flat fee validation (optional, positive dollar amount)
const flatFeeSchema = z
  .number()
  .min(0, "Fee must be positive")
  .max(10000, "Fee cannot exceed $10,000")
  .optional();

// Estimator input schema
const estimatorInputSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  
  // Legacy/default commission percentage (required for backwards compatibility)
  commissionPercentage: z
    .number()
    .min(0.01, "Commission must be at least 1%")
    .max(0.20, "Commission cannot exceed 20%"),
  
  // Commission rate fields by job type
  residentialRate: rateSchema,
  commercialRate: rateSchema,
  reinspectionRate: rateSchema,
  estimateFlatFee: flatFeeSchema,
});

export type EstimatorInput = z.infer<typeof estimatorInputSchema>;

/**
 * Get all estimators
 */
export async function getEstimators() {
  await requireRole(["admin", "manager", "estimator"]);

  const estimators = await db.estimator.findMany({
    where: { isActive: true },
    orderBy: { lastName: "asc" },
    include: {
      _count: {
        select: { claims: true },
      },
    },
  });

  return estimators;
}

/**
 * Get a single estimator by ID
 */
export async function getEstimator(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const estimator = await db.estimator.findUnique({
    where: { id },
    include: {
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

  return estimator;
}

/**
 * Create a new estimator
 */
export async function createEstimator(data: EstimatorInput) {
  await requireRole(["admin", "manager"]);

  const validated = estimatorInputSchema.parse(data);

  const estimator = await db.estimator.create({
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      commissionPercentage: validated.commissionPercentage,
      residentialRate: validated.residentialRate,
      commercialRate: validated.commercialRate,
      reinspectionRate: validated.reinspectionRate,
      estimateFlatFee: validated.estimateFlatFee,
    },
  });

  revalidatePath("/dashboard/estimators");
  return { success: true, estimator };
}

/**
 * Update an existing estimator
 */
export async function updateEstimator(id: string, data: EstimatorInput) {
  await requireRole(["admin", "manager"]);

  const validated = estimatorInputSchema.parse(data);

  const estimator = await db.estimator.update({
    where: { id },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      commissionPercentage: validated.commissionPercentage,
      residentialRate: validated.residentialRate,
      commercialRate: validated.commercialRate,
      reinspectionRate: validated.reinspectionRate,
      estimateFlatFee: validated.estimateFlatFee,
    },
  });

  revalidatePath("/dashboard/estimators");
  revalidatePath(`/dashboard/estimators/${id}`);
  return { success: true, estimator };
}

/**
 * Deactivate an estimator (soft delete)
 */
export async function deactivateEstimator(id: string) {
  await requireRole(["admin", "manager"]);

  await db.estimator.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/estimators");
  return { success: true };
}
