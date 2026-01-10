import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export type UserRole = "admin" | "manager" | "estimator" | "contractor";

/**
 * Get the current authenticated user from Clerk and sync with database
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to get user from database
  let dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      estimatorProfile: true,
      contractor: true,
    },
  });

  // If not found, sync from Clerk
  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        role: "estimator", // Default role
      },
      include: {
        estimatorProfile: true,
        contractor: true,
      },
    });
  }

  return dbUser;
}

/**
 * Check if current user has required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error(`Unauthorized: Requires one of: ${allowedRoles.join(", ")}`);
  }

  return user;
}

/**
 * Check if user can access a specific claim
 */
export async function canAccessClaim(claimId: string) {
  const user = await getCurrentUser();

  if (!user) return false;

  // Admins and managers can access all claims
  if (user.role === "admin" || user.role === "manager") {
    return true;
  }

  // Estimators can only access their assigned claims
  if (user.role === "estimator" && user.estimatorProfile) {
    const claim = await db.claim.findFirst({
      where: {
        id: claimId,
        estimatorId: user.estimatorProfile.id,
      },
    });
    return !!claim;
  }

  // Contractors can only access their company's claims
  if (user.role === "contractor" && user.contractorId) {
    const claim = await db.claim.findFirst({
      where: {
        id: claimId,
        contractorId: user.contractorId,
      },
    });
    return !!claim;
  }

  return false;
}
