import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
