export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractorForm } from "@/components/contractors/contractor-form";
import { getContractor } from "@/actions/contractors";

interface EditContractorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContractorPage({
  params,
}: EditContractorPageProps) {
  const { id } = await params;
  const contractor = await getContractor(id);

  if (!contractor) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/contractors/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Contractor</h1>
          <p className="text-slate-600">{contractor.companyName}</p>
        </div>
      </div>

      <ContractorForm
        contractor={{
          id: contractor.id,
          companyName: contractor.companyName,
          contactName: contractor.contactName,
          email: contractor.email,
          phone: contractor.phone,
          address: contractor.address,
          billingPercentage: Number(contractor.billingPercentage),
          paymentTerms: contractor.paymentTerms,
          notes: contractor.notes,
        }}
      />
    </div>
  );
}
