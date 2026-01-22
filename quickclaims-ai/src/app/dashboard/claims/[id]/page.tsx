export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Building2,
  User,
  Shield,
  UserCheck,
  DollarSign,
  TrendingUp,
  Calculator,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClaim } from "@/actions/claims";
import { formatCurrency, formatDate, getComplianceStatus, hoursSince } from "@/lib/utils";
import { CLAIM_STATUS_LABELS } from "@/lib/constants";
import { ClaimStatusDropdown } from "@/components/claims/claim-status-dropdown";
import { ClaimDetailTabs } from "@/components/claims/claim-detail-tabs";
import { decimalToNumber } from "@/lib/calculations";

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;
  const claim = await getClaim(id);

  if (!claim) {
    notFound();
  }

  // Convert decimal values for display
  const initialRCV = decimalToNumber(claim.initialRCV);
  const currentTotalRCV = decimalToNumber(claim.currentTotalRCV);
  const totalIncrease = decimalToNumber(claim.totalIncrease);
  const dollarPerSquare = decimalToNumber(claim.dollarPerSquare);
  const contractorBillingAmount = decimalToNumber(claim.contractorBillingAmount);
  const estimatorCommission = decimalToNumber(claim.estimatorCommission);
  const contractorBillingPct = decimalToNumber(claim.contractor.billingPercentage);
  const estimatorCommissionPct = decimalToNumber(claim.estimator.commissionPercentage);

  const complianceStatus = getComplianceStatus(claim.lastActivityAt);
  const hoursSinceActivity = Math.floor(hoursSince(claim.lastActivityAt));

  const complianceBg = {
    compliant: "bg-[var(--rr-color-success)]/10 border-[var(--rr-color-success)]",
    warning: "bg-[var(--rr-color-warning)]/10 border-[var(--rr-color-warning)]",
    overdue: "bg-[var(--rr-color-error)]/10 border-[var(--rr-color-error)]",
  }[complianceStatus];

  const complianceText = {
    compliant: "text-[var(--rr-color-success)]",
    warning: "text-[var(--rr-color-warning)]",
    overdue: "text-[var(--rr-color-error)]",
  }[complianceStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/claims">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">
                {claim.policyholderName}
              </h1>
              <ClaimStatusDropdown claimId={claim.id} currentStatus={claim.status} />
            </div>
            <p className="text-[var(--rr-color-text-secondary)] mt-1">
              {claim.lossAddress}, {claim.lossCity}, {claim.lossState} {claim.lossZip}
            </p>
            {claim.claimNumber && (
              <p className="text-sm text-[var(--rr-color-stone)] mt-1">
                Claim #{claim.claimNumber}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-md border text-sm ${complianceBg} ${complianceText}`}>
            {hoursSinceActivity}h since activity
          </div>
          <Link href={`/dashboard/claims/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Association Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[var(--rr-color-stone)]" />
              <div>
                <p className="text-xs text-[var(--rr-color-stone)]">Contractor</p>
                <Link
                  href={`/dashboard/contractors/${claim.contractor.id}`}
                  className="font-medium text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {claim.contractor.companyName}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[var(--rr-color-stone)]" />
              <div>
                <p className="text-xs text-[var(--rr-color-stone)]">Estimator</p>
                <Link
                  href={`/dashboard/estimators/${claim.estimator.id}`}
                  className="font-medium text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {claim.estimator.firstName} {claim.estimator.lastName}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[var(--rr-color-stone)]" />
              <div>
                <p className="text-xs text-[var(--rr-color-stone)]">Carrier</p>
                <Link
                  href={`/dashboard/carriers/${claim.carrier.id}`}
                  className="font-medium text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {claim.carrier.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-[var(--rr-color-stone)]" />
              <div>
                <p className="text-xs text-[var(--rr-color-stone)]">Adjuster</p>
                <p className="font-medium">
                  {claim.adjuster ? claim.adjuster.name : "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--rr-color-sand)] rounded-lg">
                <DollarSign className="h-5 w-5 text-[var(--rr-color-text-secondary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--rr-color-stone)]">Initial RCV</p>
                <p className="text-2xl font-bold">{formatCurrency(initialRCV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--rr-color-info)]/10 rounded-lg">
                <Calculator className="h-5 w-5 text-[var(--rr-color-brand-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--rr-color-stone)]">Current RCV</p>
                <p className="text-2xl font-bold">{formatCurrency(currentTotalRCV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--rr-color-success)]/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[var(--rr-color-success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--rr-color-stone)]">Total Increase</p>
                <p className="text-2xl font-bold text-[var(--rr-color-success)]">
                  {formatCurrency(totalIncrease)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--rr-color-brand-accent)]/10 border-[var(--rr-color-brand-accent)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--rr-color-brand-accent)]/20 rounded-lg">
                <Percent className="h-5 w-5 text-[var(--rr-color-brand-accent)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--rr-color-brand-accent)]">$/Square</p>
                <p className="text-2xl font-bold text-[var(--rr-color-brand-accent)]">
                  {formatCurrency(dollarPerSquare)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing & Commission Row */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-4 bg-[var(--rr-color-sand-light)] rounded-lg">
              <div>
                <p className="text-sm text-[var(--rr-color-stone)]">Contractor Billing</p>
                <p className="text-xl font-bold">{formatCurrency(contractorBillingAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--rr-color-stone)]">Rate</p>
                <p className="font-medium">{(contractorBillingPct * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--rr-color-sand-light)] rounded-lg">
              <div>
                <p className="text-sm text-[var(--rr-color-stone)]">Estimator Commission</p>
                <p className="text-xl font-bold">{formatCurrency(estimatorCommission)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--rr-color-stone)]">Rate</p>
                <p className="font-medium">{(estimatorCommissionPct * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <ClaimDetailTabs
        claim={claim}
        supplements={claim.supplements}
        notes={claim.notes}
        documents={claim.documents}
      />
    </div>
  );
}
