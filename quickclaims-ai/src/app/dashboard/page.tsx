export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { getDashboardStats, getClaimsRequiringAction } from "@/actions/claims";
import { formatCurrency, getComplianceStatus, hoursSince } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";

export default async function DashboardPage() {
  const [stats, claimsRequiringAction] = await Promise.all([
    getDashboardStats(),
    getClaimsRequiringAction(10),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back! Here&apos;s an overview of your claims.
          </p>
        </div>
        <Link href="/dashboard/claims/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Claims
            </CardTitle>
            <div className="rounded-lg p-2 bg-blue-100">
              <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClaims}</div>
            <p className="text-xs text-slate-500">
              +{stats.newThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Increase
            </CardTitle>
            <div className="rounded-lg p-2 bg-green-100">
              <DollarSign
                className="h-4 w-4 text-green-600"
                aria-hidden="true"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIncreaseThisMonth)}
            </div>
            <p className="text-xs text-slate-500">This month (approved)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Avg $/Square
            </CardTitle>
            <div className="rounded-lg p-2 bg-purple-100">
              <TrendingUp
                className="h-4 w-4 text-purple-600"
                aria-hidden="true"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgDollarPerSquare)}
            </div>
            <p className="text-xs text-slate-500">Active claims average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Requires Action
            </CardTitle>
            <div className="rounded-lg p-2 bg-orange-100">
              <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {claimsRequiringAction.length}
            </div>
            <p className="text-xs text-slate-500">48-hour compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims Requiring Action */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Claims Requiring Action
          </CardTitle>
          {claimsRequiringAction.length > 0 && (
            <Link
              href="/dashboard/claims"
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {claimsRequiringAction.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-3" />
              <p className="text-slate-600 font-medium">All caught up!</p>
              <p className="text-sm text-slate-500">
                No claims require immediate attention.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {claimsRequiringAction.map((claim) => (
                <ClaimActionRow key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/claims/new">
            <Button>+ New Claim</Button>
          </Link>
          <Link href="/dashboard/contractors">
            <Button variant="outline">Manage Contractors</Button>
          </Link>
          <Link href="/dashboard/estimators">
            <Button variant="outline">Manage Estimators</Button>
          </Link>
          <Link href="/dashboard/carriers">
            <Button variant="outline">Manage Carriers</Button>
          </Link>
          <Link href="/dashboard/adjusters">
            <Button variant="outline">Manage Adjusters</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function ClaimActionRow({
  claim,
}: {
  claim: {
    id: string;
    policyholderName: string;
    lossAddress: string;
    lossCity: string;
    status: string;
    lastActivityAt: Date;
    contractor: { companyName: string };
    estimator: { firstName: string; lastName: string };
  };
}) {
  const complianceStatus = getComplianceStatus(claim.lastActivityAt);
  const hours = Math.floor(hoursSince(claim.lastActivityAt));

  const ComplianceIcon = {
    compliant: CheckCircle2,
    warning: Clock,
    overdue: AlertCircle,
  }[complianceStatus];

  const complianceColor = {
    compliant: "text-green-500",
    warning: "text-yellow-500",
    overdue: "text-red-500",
  }[complianceStatus];

  const complianceBg = {
    compliant: "bg-green-50",
    warning: "bg-yellow-50",
    overdue: "bg-red-50",
  }[complianceStatus];

  return (
    <Link
      href={`/dashboard/claims/${claim.id}`}
      className={`flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all ${complianceBg}`}
    >
      <div className="flex items-center gap-4">
        <ComplianceIcon className={`h-5 w-5 ${complianceColor}`} />
        <div>
          <p className="font-medium text-slate-900">{claim.policyholderName}</p>
          <p className="text-sm text-slate-500">
            {claim.lossAddress}, {claim.lossCity} · {claim.contractor.companyName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            CLAIM_STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status] || claim.status}
        </span>
        <span className={`text-sm font-medium ${complianceColor}`}>
          {hours}h ago
        </span>
      </div>
    </Link>
  );
}
