export const dynamic = "force-dynamic";

import { EstimatorForm } from "@/components/estimators/estimator-form";
import { getManagers } from "@/actions/estimators";

export default async function NewEstimatorPage() {
  const managers = await getManagers();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Estimator</h1>
        <p className="text-slate-600">
          Create a new estimator profile for claims assignment and commission tracking
        </p>
      </div>

      <EstimatorForm managers={managers} />
    </div>
  );
}
