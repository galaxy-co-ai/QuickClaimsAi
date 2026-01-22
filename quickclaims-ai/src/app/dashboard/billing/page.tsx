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
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Billing Management</h1>
        <p className="text-[var(--rr-color-text-secondary)]">
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
