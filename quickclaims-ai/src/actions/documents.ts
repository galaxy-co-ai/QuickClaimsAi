"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  documentUploadSchema,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type DocumentUploadInput,
  type DocumentTypeValue,
} from "@/lib/validations/document";
import type { DocumentType } from "@prisma/client";

/**
 * Upload a document to Vercel Blob and create database record
 */
export async function uploadDocument(formData: FormData) {
  const userId = await requireRole(["admin", "manager", "estimator"]);

  // Extract file and metadata from FormData
  const file = formData.get("file") as File | null;
  const claimId = formData.get("claimId") as string;
  const type = formData.get("type") as DocumentTypeValue;
  const description = formData.get("description") as string | null;

  // Validate file exists
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    throw new Error(
      `Invalid file type. Allowed types: PDF, images (JPEG, PNG, GIF, WebP), Word documents, Excel spreadsheets`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 10MB`);
  }

  // Validate metadata
  const validated = documentUploadSchema.parse({
    claimId,
    type,
    description,
  });

  // Verify claim exists
  const claim = await db.claim.findUnique({
    where: { id: validated.claimId },
    select: { id: true, policyholderName: true },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Get user's internal ID
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `claims/${validated.claimId}/${timestamp}-${sanitizedName}`;

  // Upload to Vercel Blob
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  // Create database record
  const document = await db.document.create({
    data: {
      claimId: validated.claimId,
      filename: filename,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      url: blob.url,
      type: validated.type as DocumentType,
      description: validated.description ?? null,
      uploadedById: user.id,
    },
  });

  // Create note for document upload
  await db.note.create({
    data: {
      claimId: validated.claimId,
      userId: user.id,
      content: `Document uploaded: ${file.name} (${validated.type})`,
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
  return { success: true, document };
}

/**
 * Get all documents for a claim
 */
export async function getDocumentsForClaim(claimId: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const documents = await db.document.findMany({
    where: { claimId },
    orderBy: { uploadedAt: "desc" },
    include: {
      uploadedBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return documents;
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const document = await db.document.findUnique({
    where: { id },
    include: {
      claim: {
        select: { id: true, policyholderName: true },
      },
      uploadedBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return document;
}

/**
 * Delete a document from Vercel Blob and database
 */
export async function deleteDocument(id: string) {
  const userId = await requireRole(["admin", "manager"]);

  const document = await db.document.findUnique({
    where: { id },
    select: { claimId: true, url: true, originalFilename: true },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Delete from Vercel Blob
  try {
    await del(document.url);
  } catch (error) {
    console.error("Failed to delete from Blob storage:", error);
    // Continue with database deletion even if Blob deletion fails
  }

  // Delete from database
  await db.document.delete({
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
        claimId: document.claimId,
        userId: user.id,
        content: `Document deleted: ${document.originalFilename}`,
        type: "general",
        isInternal: true,
      },
    });
  }

  revalidatePath(`/dashboard/claims/${document.claimId}`);
  revalidatePath("/dashboard/claims");
  return { success: true };
}

/**
 * Update document metadata (type, description)
 */
export async function updateDocument(
  id: string,
  data: { type?: DocumentTypeValue; description?: string }
) {
  await requireRole(["admin", "manager", "estimator"]);

  const document = await db.document.findUnique({
    where: { id },
    select: { claimId: true },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const updatedDocument = await db.document.update({
    where: { id },
    data: {
      type: data.type as DocumentType | undefined,
      description: data.description,
    },
  });

  revalidatePath(`/dashboard/claims/${document.claimId}`);
  return { success: true, document: updatedDocument };
}
