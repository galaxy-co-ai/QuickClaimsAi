"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole, getCurrentUserRole, getCurrentDbUserId } from "@/lib/auth";
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
  
  // Manager assignment (User ID of manager)
  managerId: z.string().optional().nullable(),
  
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
 * Get all users with manager role (for dropdown)
 */
export async function getManagers() {
  await requireRole(["admin", "manager"]);

  const managers = await db.user.findMany({
    where: { 
      role: "manager",
      isActive: true,
    },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  return managers;
}

/**
 * Get all estimators (filtered by manager if user is a manager)
 */
export async function getEstimators() {
  await requireRole(["admin", "manager", "estimator"]);

  const role = await getCurrentUserRole();
  const userId = await getCurrentDbUserId();

  // Build where clause - managers only see their assigned estimators
  const where: { isActive: boolean; managerId?: string } = { isActive: true };
  
  if (role === "manager" && userId) {
    where.managerId = userId;
  }

  const estimators = await db.estimator.findMany({
    where,
    orderBy: { lastName: "asc" },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
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
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
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
      managerId: validated.managerId || null,
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
      managerId: validated.managerId || null,
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
