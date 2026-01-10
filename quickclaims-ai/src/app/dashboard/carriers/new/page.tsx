import { CarrierForm } from "@/components/carriers/carrier-form";

export default function NewCarrierPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Carrier</h1>
        <p className="text-slate-600">
          Add a new insurance carrier to associate with claims
        </p>
      </div>

      <CarrierForm />
    </div>
  );
}
