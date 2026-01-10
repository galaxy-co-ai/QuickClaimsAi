import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export type UserRole = "admin" | "manager" | "estimator" | "contractor";

/**
 * Get the current authenticated user's role from Clerk metadata
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Get role from public metadata (set in Clerk Dashboard or via API)
  const role = user.publicMetadata?.role as UserRole | undefined;

  // Default to estimator if no role set
  return role || "estimator";
}

/**
 * Get the current user's contractor ID (if they are a contractor user)
 */
export async function getCurrentUserContractorId(): Promise<string | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { contractorId: true },
  });

  return user?.contractorId || null;
}

/**
 * Get the current user's database ID
 */
export async function getCurrentDbUserId(): Promise<string | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  return user?.id || null;
}

/**
 * Require authentication and optionally specific roles
 * Throws redirect if not authenticated or unauthorized
 */
export async function requireRole(allowedRoles?: UserRole[]) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = await getCurrentUserRole();

    if (!role || !allowedRoles.includes(role)) {
      redirect("/dashboard?error=unauthorized");
    }
  }

  return userId;
}

/**
 * Check if current user has permission for an action
 */
export async function hasPermission(allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getCurrentUserRole();

  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}

/**
 * Require contractor role and return contractor ID
 * Redirects if not authenticated or not a contractor
 */
export async function requireContractor(): Promise<{
  userId: string;
  contractorId: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getCurrentUserRole();

  if (role !== "contractor") {
    redirect("/dashboard?error=unauthorized");
  }

  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: { id: true, contractorId: true },
  });

  if (!user?.contractorId) {
    redirect("/dashboard?error=no-contractor-linked");
  }

  return { userId, contractorId: user.contractorId };
}
