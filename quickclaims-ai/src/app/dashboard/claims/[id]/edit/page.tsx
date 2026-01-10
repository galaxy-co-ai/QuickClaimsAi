export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ClaimForm } from "@/components/claims/claim-form";
import { getClaim, getClaimFormOptions } from "@/actions/claims";
import { decimalToNumber } from "@/lib/calculations";

interface EditClaimPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClaimPage({ params }: EditClaimPageProps) {
  const { id } = await params;

  const [claim, options] = await Promise.all([
    getClaim(id),
    getClaimFormOptions(),
  ]);

  if (!claim) {
    notFound();
  }

  // Convert claim data for the form
  const formData = {
    id: claim.id,
    policyholderName: claim.policyholderName,
    policyholderEmail: claim.policyholderEmail,
    policyholderPhone: claim.policyholderPhone,
    lossAddress: claim.lossAddress,
    lossCity: claim.lossCity,
    lossState: claim.lossState,
    lossZip: claim.lossZip,
    claimNumber: claim.claimNumber,
    dateOfLoss: claim.dateOfLoss,
    lossType: claim.lossType,
    contractorId: claim.contractorId,
    estimatorId: claim.estimatorId,
    carrierId: claim.carrierId,
    adjusterId: claim.adjusterId,
    jobType: claim.jobType,
    totalSquares: decimalToNumber(claim.totalSquares),
    roofRCV: decimalToNumber(claim.roofRCV),
    initialRCV: decimalToNumber(claim.initialRCV),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Claim</h1>
        <p className="text-slate-600">
          Update claim information for {claim.policyholderName}
        </p>
      </div>

      <ClaimForm
        claim={formData}
        contractors={options.contractors}
        estimators={options.estimators}
        carriers={options.carriers}
        adjusters={options.adjusters}
      />
    </div>
  );
}
