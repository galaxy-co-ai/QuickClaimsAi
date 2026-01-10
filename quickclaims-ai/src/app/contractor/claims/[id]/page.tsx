export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, User, Shield, Download } from "lucide-react";
import { getContractorClaim } from "@/actions/contractor-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS, DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/calculations";
import { ContractorClaimTabs } from "@/components/contractor/contractor-claim-tabs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractorClaimDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  let claim;
  try {
    claim = await getContractorClaim(id);
  } catch {
    notFound();
  }

  if (!claim) {
    notFound();
  }

  const metrics = [
    {
      label: "Initial RCV",
      value: "$" + decimalToNumber(claim.initialRCV).toLocaleString(),
      color: "text-slate-900",
    },
    {
      label: "Current RCV",
      value: "$" + decimalToNumber(claim.currentTotalRCV).toLocaleString(),
      color: "text-slate-900",
    },
    {
      label: "Total Increase",
      value: "$" + decimalToNumber(claim.totalIncrease).toLocaleString(),
      color: "text-green-600",
    },
    {
      label: "$/Square",
      value: "$" + decimalToNumber(claim.dollarPerSquare).toFixed(2),
      color: "text-blue-600 font-bold text-xl",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contractor/claims">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {claim.policyholderName}
              </h1>
              <Badge className={CLAIM_STATUS_COLORS[claim.status]}>
                {CLAIM_STATUS_LABELS[claim.status]}
              </Badge>
            </div>
            <p className="text-slate-600">
              {claim.lossAddress}, {claim.lossCity}, {claim.lossState} {claim.lossZip}
            </p>
            {claim.claimNumber && (
              <p className="text-sm text-slate-500">
                Claim #: {claim.claimNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Carrier</p>
              <p className="font-medium">{claim.carrier.name}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Estimator</p>
              <p className="font-medium">
                {claim.estimator.firstName} {claim.estimator.lastName}
              </p>
            </div>
          </div>
        </div>
        {claim.adjuster && (
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Adjuster</p>
                <p className="font-medium">{claim.adjuster.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Metrics */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Financial Summary</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className={"text-lg font-medium " + metric.color}>{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Supplements, Documents, Timeline */}
      <ContractorClaimTabs claim={claim} />
    </div>
  );
}
