"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contractorInputSchema, type ContractorInput } from "@/lib/validations/contractor";
import { requireRole } from "@/lib/auth";

/**
 * Get all contractors
 */
export async function getContractors() {
  await requireRole(["admin", "manager", "estimator"]);

  const contractors = await db.contractor.findMany({
    where: { isActive: true },
    orderBy: { companyName: "asc" },
    include: {
      _count: {
        select: { claims: true },
      },
    },
  });

  return contractors;
}

/**
 * Get a single contractor by ID
 */
export async function getContractor(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const contractor = await db.contractor.findUnique({
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

  return contractor;
}

/**
 * Create a new contractor
 */
export async function createContractor(data: ContractorInput) {
  await requireRole(["admin", "manager"]);

  // Validate input
  const validated = contractorInputSchema.parse(data);

  const contractor = await db.contractor.create({
    data: {
      companyName: validated.companyName,
      contactName: validated.contactName,
      email: validated.email,
      phone: validated.phone,
      address: validated.address,
      billingPercentage: validated.billingPercentage,
      residentialRate: validated.residentialRate,
      commercialRate: validated.commercialRate,
      reinspectionRate: validated.reinspectionRate,
      estimateFlatFee: validated.estimateFlatFee,
      paymentTerms: validated.paymentTerms,
      notes: validated.notes,
    },
  });

  revalidatePath("/dashboard/contractors");
  return { success: true, contractor };
}

/**
 * Update an existing contractor
 */
export async function updateContractor(id: string, data: ContractorInput) {
  await requireRole(["admin", "manager"]);

  // Validate input
  const validated = contractorInputSchema.parse(data);

  const contractor = await db.contractor.update({
    where: { id },
    data: {
      companyName: validated.companyName,
      contactName: validated.contactName,
      email: validated.email,
      phone: validated.phone,
      address: validated.address,
      billingPercentage: validated.billingPercentage,
      residentialRate: validated.residentialRate,
      commercialRate: validated.commercialRate,
      reinspectionRate: validated.reinspectionRate,
      estimateFlatFee: validated.estimateFlatFee,
      paymentTerms: validated.paymentTerms,
      notes: validated.notes,
    },
  });

  revalidatePath("/dashboard/contractors");
  revalidatePath(`/dashboard/contractors/${id}`);
  return { success: true, contractor };
}

/**
 * Deactivate a contractor (soft delete)
 */
export async function deactivateContractor(id: string) {
  await requireRole(["admin", "manager"]);

  await db.contractor.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/contractors");
  return { success: true };
}
