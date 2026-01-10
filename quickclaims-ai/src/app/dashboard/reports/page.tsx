import { Suspense } from "react";
import { getContractorsForReport, getEstimatorsForReport } from "@/actions/reports";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [contractors, estimators] = await Promise.all([
    getContractorsForReport(),
    getEstimatorsForReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">Generate billing and commission reports</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ReportsClient contractors={contractors} estimators={estimators} />
      </Suspense>
    </div>
  );
}
