export const dynamic = "force-dynamic";

import { getBillingClaims, getContractorsForBilling } from "@/actions/billing";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const [billingData, contractors] = await Promise.all([
    getBillingClaims(),
    getContractorsForBilling(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing Management</h1>
        <p className="text-slate-600">
          Track and manage contractor billing payments
        </p>
      </div>

      <BillingClient
        initialData={billingData}
        contractors={contractors}
      />
    </div>
  );
}
