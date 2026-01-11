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

      {/* Stats Grid - Compact Design */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-1.5 bg-blue-50">
              <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">Active Claims</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-900">{stats.activeClaims}</span>
                <span className="text-xs text-slate-400">+{stats.newThisWeek} this week</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-1.5 bg-green-50">
              <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">Total Increase</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-green-600">{formatCurrency(stats.totalIncreaseThisMonth)}</span>
                <span className="text-xs text-slate-400">this month</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-1.5 bg-purple-50">
              <TrendingUp className="h-4 w-4 text-purple-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">Avg $/Square</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-900">{formatCurrency(stats.avgDollarPerSquare)}</span>
                <span className="text-xs text-slate-400">active avg</span>
              </div>
            </div>
          </div>
        </Card>

        {isManager && managerStats ? (
          <Card className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-1.5 bg-emerald-50">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">Compliance</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-semibold ${managerStats.compliancePercentage >= 90 ? "text-emerald-600" : managerStats.compliancePercentage >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                    {managerStats.compliancePercentage}%
                  </span>
                  <span className="text-xs text-slate-400">{managerStats.overdueCount} overdue</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md p-1.5 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">Requires Action</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-orange-600">{claimsRequiringAction.length}</span>
                  <span className="text-xs text-slate-400">48hr compliance</span>
                </div>
              </div>
            </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {managerStats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
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
