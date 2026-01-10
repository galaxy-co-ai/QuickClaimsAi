import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export type UserRole = "admin" | "manager" | "estimator" | "contractor";

/**
 * Map Clerk organization roles to app roles
 * Clerk roles: org:admin, org:contractor, org:estimator, org:member
 */
function mapOrgRoleToAppRole(orgRole: string | null | undefined): UserRole {
  if (!orgRole) return "estimator";

  // Remove "org:" prefix if present
  const role = orgRole.replace("org:", "");

  switch (role) {
    case "admin":
      return "admin";
    case "contractor":
      return "contractor";
    case "estimator":
      return "estimator";
    case "member":
      return "estimator"; // Members default to estimator
    default:
      return "estimator";
  }
}

/**
 * Get the current authenticated user's role from Clerk organization membership
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { userId, orgRole } = await auth();

  if (!userId) {
    return null;
  }

  // Get role from organization membership
  return mapOrgRoleToAppRole(orgRole);
}

/**
 * Get the current organization ID
 */
export async function getCurrentOrgId(): Promise<string | null> {
  const { orgId } = await auth();
  return orgId || null;
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
