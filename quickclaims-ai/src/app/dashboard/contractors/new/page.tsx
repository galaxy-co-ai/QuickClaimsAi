import { ContractorForm } from "@/components/contractors/contractor-form";

export default function NewContractorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Contractor</h1>
        <p className="text-slate-600">
          Create a new contractor profile for billing and claims management
        </p>
      </div>

      <ContractorForm />
    </div>
  );
}
