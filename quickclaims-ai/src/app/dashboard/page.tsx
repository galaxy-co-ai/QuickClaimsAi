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

      {/* Primary Metrics - The numbers that matter most */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Claims - Large featured card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Active Claims</p>
                <p className="text-4xl font-bold mt-1">{stats.activeClaims}</p>
                <p className="text-slate-400 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">+{stats.newThisWeek}</span> this week
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Increase - Money earned */}
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Revenue This Month</p>
                <p className="text-4xl font-bold mt-1">{formatCurrency(stats.totalIncreaseThisMonth)}</p>
                <p className="text-emerald-200 text-sm mt-2">
                  From approved supplements
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score - Manager only, else show Avg $/SQ */}
        {isManager && managerStats ? (
          <Card className={`bg-gradient-to-br ${
            managerStats.compliancePercentage >= 90 
              ? 'from-emerald-500 to-teal-600' 
              : managerStats.compliancePercentage >= 70 
                ? 'from-amber-500 to-orange-600' 
                : 'from-red-500 to-rose-600'
          } text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">48hr Compliance</p>
                  <p className="text-4xl font-bold mt-1">{managerStats.compliancePercentage}%</p>
                  <p className="text-white/70 text-sm mt-2">
                    {managerStats.overdueCount === 0 ? 'All claims on track' : `${managerStats.overdueCount} overdue`}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-violet-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">Avg $/Square</p>
                  <p className="text-4xl font-bold mt-1">{formatCurrency(stats.avgDollarPerSquare)}</p>
                  <p className="text-violet-200 text-sm mt-2">
                    {stats.updatesPerJob} updates/job avg
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Stats - Compact row for additional context */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.supplementCount}</p>
            <p className="text-xs text-slate-500">Supplements</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.supplementTotalAmount)}</p>
            <p className="text-xs text-slate-500">Supplement Value</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.avgDollarPerSquare)}</p>
            <p className="text-xs text-slate-500">Avg $/Square</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.updatesPerJob}</p>
            <p className="text-xs text-slate-500">Updates/Job</p>
          </div>
        </div>
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