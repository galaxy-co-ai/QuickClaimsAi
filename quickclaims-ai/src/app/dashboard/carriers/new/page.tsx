export const dynamic = "force-dynamic";

import { CarrierForm } from "@/components/carriers/carrier-form";

export default function NewCarrierPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Add Carrier</h1>
        <p className="text-[var(--rr-color-text-secondary)]">
          Add a new insurance carrier to associate with claims
        </p>
      </div>

      <CarrierForm />
    </div>
  );
}
