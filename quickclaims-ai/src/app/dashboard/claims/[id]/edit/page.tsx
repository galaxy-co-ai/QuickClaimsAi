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
    // Policyholder Info
    policyholderName: claim.policyholderName,
    policyholderEmail: claim.policyholderEmail,
    policyholderPhone: claim.policyholderPhone,
    policyholderWorkPhone: claim.policyholderWorkPhone,
    policyholderFax: claim.policyholderFax,
    // Address
    lossAddress: claim.lossAddress,
    lossAddressLine2: claim.lossAddressLine2,
    lossCity: claim.lossCity,
    lossState: claim.lossState,
    lossZip: claim.lossZip,
    // Claim Info
    claimNumber: claim.claimNumber,
    policyNumber: claim.policyNumber,
    dateOfLoss: claim.dateOfLoss,
    lossType: claim.lossType,
    // Relationships
    contractorId: claim.contractorId,
    estimatorId: claim.estimatorId,
    carrierId: claim.carrierId,
    adjusterId: claim.adjusterId,
    // Direct Adjuster Info
    adjusterNameOverride: claim.adjusterNameOverride,
    adjusterPhoneOverride: claim.adjusterPhoneOverride,
    adjusterEmailOverride: claim.adjusterEmailOverride,
    // Supervisor Info
    supervisorName: claim.supervisorName,
    supervisorPhone: claim.supervisorPhone,
    // External References
    contractorCrmId: claim.contractorCrmId,
    externalJobNumber: claim.externalJobNumber,
    // Job Type & Property Type
    jobType: claim.jobType,
    propertyType: claim.propertyType,
    // Financial - Initial
    totalSquares: decimalToNumber(claim.totalSquares),
    roofRCV: decimalToNumber(claim.roofRCV),
    initialRCV: decimalToNumber(claim.initialRCV),
    dollarPerSquare: decimalToNumber(claim.dollarPerSquare),
    // Financial - Final
    finalRoofRCV: claim.finalRoofRCV ? decimalToNumber(claim.finalRoofRCV) : null,
    finalTotalRCV: claim.finalTotalRCV ? decimalToNumber(claim.finalTotalRCV) : null,
    finalDollarPerSquare: claim.finalDollarPerSquare ? decimalToNumber(claim.finalDollarPerSquare) : null,
    // Money Released
    moneyReleasedAmount: claim.moneyReleasedAmount ? decimalToNumber(claim.moneyReleasedAmount) : null,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Edit Claim</h1>
        <p className="text-[var(--rr-color-text-secondary)]">
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
