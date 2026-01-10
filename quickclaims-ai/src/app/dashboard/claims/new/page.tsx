export const dynamic = "force-dynamic";

import { ClaimForm } from "@/components/claims/claim-form";
import { getClaimFormOptions } from "@/actions/claims";

export default async function NewClaimPage() {
  const options = await getClaimFormOptions();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Claim</h1>
        <p className="text-slate-600">
          Create a new supplement claim for tracking
        </p>
      </div>

      <ClaimForm
        contractors={options.contractors}
        estimators={options.estimators}
        carriers={options.carriers}
        adjusters={options.adjusters}
      />
    </div>
  );
}
