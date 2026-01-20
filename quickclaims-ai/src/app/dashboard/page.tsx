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
  BarChart3,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { getDashboardStats, getClaimsRequiringAction, getManagerDashboardStats } from "@/actions/claims";
import { hasPermission } from "@/lib/auth";
import { StatusChart } from "@/components/dashboard/status-chart";
import { formatCurrency, getComplianceStatus, hoursSince } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";

export default async function DashboardPage() {
  const isManager = await hasPermission(["admin", "manager"]);

  const [stats, claimsRequiringAction, managerStats] = await Promise.all([
    getDashboardStats(),
    getClaimsRequiringAction(10),
    isManager ? getManagerDashboardStats() : Promise.resolve(null),
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

      {/* Alert Banner - Show if there are overdue claims */}
      {isManager && managerStats && (managerStats.overdueCount > 0 || claimsRequiringAction.length > 0) && (
        <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">
                {claimsRequiringAction.length} claim{claimsRequiringAction.length !== 1 ? 's' : ''} need attention
              </p>
              <p className="text-sm text-orange-600">
                {managerStats.overdueCount > 0 && `${managerStats.overdueCount} overdue for 48-hour compliance. `}
                Review and update to maintain compliance.
              </p>
            </div>
            <Link href="/dashboard/claims?filter=action" className="flex-shrink-0">
              <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                View All
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid - Clean compact design */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Active Claims */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Active Claims</p>
              <p className="text-xl font-semibold text-slate-900">{stats.activeClaims}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            +{stats.newThisWeek} this week
          </p>
        </Card>

        {/* Revenue This Month */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(stats.totalIncreaseThisMonth)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Approved this month</p>
        </Card>

        {/* Supplements */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Supplements</p>
              <p className="text-xl font-semibold text-slate-900">{stats.supplementCount}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{formatCurrency(stats.supplementTotalAmount)} total</p>
        </Card>

        {/* Compliance or Avg $/SQ */}
        {isManager && managerStats ? (
          <Card className={`p-4 ${managerStats.compliancePercentage < 70 ? 'border-red-200 bg-red-50/30' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                managerStats.compliancePercentage >= 90 ? 'bg-green-50' : 
                managerStats.compliancePercentage >= 70 ? 'bg-amber-50' : 'bg-red-50'
              }`}>
                <ShieldCheck className={`h-4 w-4 ${
                  managerStats.compliancePercentage >= 90 ? 'text-green-600' : 
                  managerStats.compliancePercentage >= 70 ? 'text-amber-600' : 'text-red-600'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Compliance</p>
                <p className={`text-xl font-semibold ${
                  managerStats.compliancePercentage >= 90 ? 'text-green-600' : 
                  managerStats.compliancePercentage >= 70 ? 'text-amber-600' : 'text-red-600'
                }`}>{managerStats.compliancePercentage}%</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {managerStats.overdueCount === 0 ? 'All on track' : `${managerStats.overdueCount} overdue`}
            </p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Avg $/Square</p>
                <p className="text-xl font-semibold text-slate-900">{formatCurrency(stats.avgDollarPerSquare)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{stats.updatesPerJob} updates/job</p>
          </Card>
        )}
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

      {/* Manager-Only: Status Distribution & Activity */}
      {isManager && managerStats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Distribution Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Claims by Status
              </CardTitle>
              <Link
                href="/dashboard/claims/kanban"
                className="text-sm text-blue-600 hover:underline"
              >
                Kanban view →
              </Link>
            </CardHeader>
            <CardContent>
              <StatusChart data={managerStats.statusChartData} />
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {managerStats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {managerStats.recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/claims/${activity.claim.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.claim.policyholderName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {activity.content}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {activity.user.firstName} {activity.user.lastName} ·{" "}
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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