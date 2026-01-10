"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { noteInputSchema, noteUpdateSchema, type NoteInput, type NoteUpdate } from "@/lib/validations/note";
import { requireRole } from "@/lib/auth";
import type { NoteType } from "@prisma/client";

/**
 * Get all notes for a claim
 */
export async function getNotesForClaim(claimId: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const notes = await db.note.findMany({
    where: { claimId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return notes;
}

/**
 * Get a single note by ID
 */
export async function getNote(id: string) {
  await requireRole(["admin", "manager", "estimator"]);

  const note = await db.note.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      claim: {
        select: {
          id: true,
          policyholderName: true,
        },
      },
    },
  });

  return note;
}

/**
 * Create a new note for a claim
 */
export async function createNote(data: NoteInput) {
  const clerkId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = noteInputSchema.parse(data);

  // Get user from Clerk ID
  const user = await db.user.findFirst({
    where: { clerkId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Contractors can only create general notes (not internal or carrier comms)
  if (user.role === "contractor" && validated.type !== "general") {
    throw new Error("Contractors can only create general notes");
  }

  // Contractors cannot mark notes as internal
  if (user.role === "contractor" && validated.isInternal) {
    throw new Error("Contractors cannot create internal notes");
  }

  // Verify claim exists
  const claim = await db.claim.findUnique({
    where: { id: validated.claimId },
    select: { id: true },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Create the note
  const note = await db.note.create({
    data: {
      claimId: validated.claimId,
      userId: user.id,
      content: validated.content,
      type: validated.type as NoteType,
      isInternal: validated.isInternal,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Update claim's lastActivityAt
  await db.claim.update({
    where: { id: validated.claimId },
    data: { lastActivityAt: new Date() },
  });

  revalidatePath(`/dashboard/claims/${validated.claimId}`);
  return { success: true, note };
}

/**
 * Update an existing note (only content and isInternal)
 */
export async function updateNote(id: string, data: NoteUpdate) {
  const clerkId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = noteUpdateSchema.parse(data);

  // Get user
  const user = await db.user.findFirst({
    where: { clerkId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get existing note
  const existingNote = await db.note.findUnique({
    where: { id },
    select: { userId: true, claimId: true, type: true },
  });

  if (!existingNote) {
    throw new Error("Note not found");
  }

  // Only the note creator or admin/manager can update
  if (existingNote.userId !== user.id && !["admin", "manager"].includes(user.role)) {
    throw new Error("You can only edit your own notes");
  }

  // Cannot edit status_change notes
  if (existingNote.type === "status_change") {
    throw new Error("Cannot edit system-generated status change notes");
  }

  const note = await db.note.update({
    where: { id },
    data: {
      content: validated.content,
      isInternal: validated.isInternal,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  revalidatePath(`/dashboard/claims/${existingNote.claimId}`);
  return { success: true, note };
}

/**
 * Delete a note
 */
export async function deleteNote(id: string) {
  const clerkId = await requireRole(["admin", "manager", "estimator"]);

  // Get user
  const user = await db.user.findFirst({
    where: { clerkId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get existing note
  const existingNote = await db.note.findUnique({
    where: { id },
    select: { userId: true, claimId: true, type: true },
  });

  if (!existingNote) {
    throw new Error("Note not found");
  }

  // Only the note creator or admin can delete
  if (existingNote.userId !== user.id && user.role !== "admin") {
    throw new Error("You can only delete your own notes");
  }

  // Cannot delete status_change notes
  if (existingNote.type === "status_change") {
    throw new Error("Cannot delete system-generated status change notes");
  }

  await db.note.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/claims/${existingNote.claimId}`);
  return { success: true };
}
