import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getContractorsForReport, getEstimatorsForReport, getContractorOwnInfo } from "@/actions/reports";
import { getCurrentUserRole, type UserRole } from "@/lib/auth";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const role = await getCurrentUserRole();

  // Only admin, manager, estimator, and contractor can access reports
  if (!role || !["admin", "manager", "estimator", "contractor"].includes(role)) {
    redirect("/dashboard?error=unauthorized");
  }

  const isAdminOrManager = role === "admin" || role === "manager";
  const isContractor = role === "contractor";

  // Fetch data based on role
  const [contractors, estimators, contractorInfo] = await Promise.all([
    isAdminOrManager ? getContractorsForReport() : Promise.resolve([]),
    isAdminOrManager ? getEstimatorsForReport() : Promise.resolve([]),
    isContractor ? getContractorOwnInfo() : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">
          {isContractor
            ? "View your billing reports"
            : "Generate billing and commission reports"}
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ReportsClient
          contractors={contractors}
          estimators={estimators}
          userRole={role as UserRole}
          contractorInfo={contractorInfo}
        />
      </Suspense>
    </div>
  );
}
