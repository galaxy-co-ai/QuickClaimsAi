export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstimatorForm } from "@/components/estimators/estimator-form";
import { getEstimator } from "@/actions/estimators";

interface EditEstimatorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEstimatorPage({
  params,
}: EditEstimatorPageProps) {
  const { id } = await params;
  const estimator = await getEstimator(id);

  if (!estimator) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/estimators/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Estimator</h1>
          <p className="text-slate-600">
            {estimator.firstName} {estimator.lastName}
          </p>
        </div>
      </div>

      <EstimatorForm
        estimator={{
          id: estimator.id,
          firstName: estimator.firstName,
          lastName: estimator.lastName,
          email: estimator.email,
          phone: estimator.phone,
          commissionPercentage: Number(estimator.commissionPercentage),
        }}
      />
    </div>
  );
}
