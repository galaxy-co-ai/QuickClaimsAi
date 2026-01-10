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
    compliant: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    overdue: "bg-red-50 border-red-200",
  }[complianceStatus];

  const complianceText = {
    compliant: "text-green-700",
    warning: "text-yellow-700",
    overdue: "text-red-700",
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
              <h1 className="text-2xl font-bold text-slate-900">
                {claim.policyholderName}
              </h1>
              <ClaimStatusDropdown claimId={claim.id} currentStatus={claim.status} />
            </div>
            <p className="text-slate-600 mt-1">
              {claim.lossAddress}, {claim.lossCity}, {claim.lossState} {claim.lossZip}
            </p>
            {claim.claimNumber && (
              <p className="text-sm text-slate-500 mt-1">
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
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Contractor</p>
                <Link
                  href={`/dashboard/contractors/${claim.contractor.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {claim.contractor.companyName}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Estimator</p>
                <Link
                  href={`/dashboard/estimators/${claim.estimator.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {claim.estimator.firstName} {claim.estimator.lastName}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Carrier</p>
                <Link
                  href={`/dashboard/carriers/${claim.carrier.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {claim.carrier.name}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Adjuster</p>
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
              <div className="p-2 bg-slate-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Initial RCV</p>
                <p className="text-2xl font-bold">{formatCurrency(initialRCV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Current RCV</p>
                <p className="text-2xl font-bold">{formatCurrency(currentTotalRCV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Increase</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncrease)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Percent className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-indigo-600">$/Square</p>
                <p className="text-2xl font-bold text-indigo-700">
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
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Contractor Billing</p>
                <p className="text-xl font-bold">{formatCurrency(contractorBillingAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Rate</p>
                <p className="font-medium">{(contractorBillingPct * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Estimator Commission</p>
                <p className="text-xl font-bold">{formatCurrency(estimatorCommission)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Rate</p>
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
