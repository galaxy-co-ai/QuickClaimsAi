"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

// Carrier input schema
const carrierInputSchema = z.object({
  name: z.string().min(1, "Carrier name is required").max(200),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type CarrierInput = z.infer<typeof carrierInputSchema>;

/**
 * Get all carriers with adjusters for list view
 */
export async function getCarriers() {
  await requireRole(["admin", "manager", "estimator"]);

  const carriers = await db.carrier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      adjusters: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          type: true,
        },
      },
      _count: {
        select: { claims: true, adjusters: true },
      },
    },
  });

  return carriers;
}

/**
 * Get a single carrier by ID
 */
export async function getCarrier(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const carrier = await db.carrier.findUnique({
    where: { id },
    include: {
      adjusters: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { claims: true, adjusters: true },
      },
    },
  });

  return carrier;
}

/**
 * Create a new carrier
 */
export async function createCarrier(data: CarrierInput) {
  await requireRole(["admin", "manager"]);

  const validated = carrierInputSchema.parse(data);

  const carrier = await db.carrier.create({
    data: {
      name: validated.name,
      phone: validated.phone,
      email: validated.email || null,
      website: validated.website || null,
      notes: validated.notes,
    },
  });

  revalidatePath("/dashboard/carriers");
  return { success: true, carrier };
}

/**
 * Update an existing carrier
 */
export async function updateCarrier(id: string, data: CarrierInput) {
  await requireRole(["admin", "manager"]);

  const validated = carrierInputSchema.parse(data);

  const carrier = await db.carrier.update({
    where: { id },
    data: {
      name: validated.name,
      phone: validated.phone,
      email: validated.email || null,
      website: validated.website || null,
      notes: validated.notes,
    },
  });

  revalidatePath("/dashboard/carriers");
  revalidatePath(`/dashboard/carriers/${id}`);
  return { success: true, carrier };
}

/**
 * Deactivate a carrier (soft delete)
 */
export async function deactivateCarrier(id: string) {
  await requireRole(["admin", "manager"]);

  await db.carrier.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/carriers");
  return { success: true };
}
