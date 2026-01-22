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
    <div className="space-y-[var(--rr-space-6)]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--rr-font-size-2xl)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-primary)]">Dashboard</h1>
          <p className="text-[var(--rr-color-text-secondary)]">
            Welcome back! Here&apos;s an overview of your claims.
          </p>
        </div>
        <Link href="/dashboard/claims/new">
          <Button className="gap-[var(--rr-space-2)]">
            <Plus className="h-4 w-4" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* Alert Banner - Show if there are overdue claims */}
      {isManager && managerStats && (managerStats.overdueCount > 0 || claimsRequiringAction.length > 0) && (
        <div className="rounded-[var(--rr-radius-lg)] border-l-4 border-[var(--rr-color-warning)] bg-[var(--rr-color-status-warning-bg)] p-[var(--rr-space-4)]">
          <div className="flex items-center gap-[var(--rr-space-3)]">
            <AlertCircle className="h-5 w-5 text-[var(--rr-color-warning)] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)]">
                {claimsRequiringAction.length} claim{claimsRequiringAction.length !== 1 ? 's' : ''} need attention
              </p>
              <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
                {managerStats.overdueCount > 0 && `${managerStats.overdueCount} overdue for 48-hour compliance. `}
                Review and update to maintain compliance.
              </p>
            </div>
            <Link href="/dashboard/claims?filter=action" className="flex-shrink-0">
              <Button size="sm" variant="outline" className="border-[var(--rr-color-warning)] text-[var(--rr-color-warning)] hover:bg-[var(--rr-color-status-warning-bg)]">
                View All
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid - Compact horizontal layout */}
      <div className="grid gap-[var(--rr-space-3)] grid-cols-2 lg:grid-cols-4">
        {/* Active Claims */}
        <Card className="px-[var(--rr-space-4)] py-[var(--rr-space-3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <FileText className="h-4 w-4 text-[var(--rr-color-text-tertiary)]" />
              <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">Active</span>
            </div>
            <div className="text-right">
              <p className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-primary)]">{stats.activeClaims}</p>
              <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-success)]">+{stats.newThisWeek} this week</p>
            </div>
          </div>
        </Card>

        {/* Revenue This Month */}
        <Card className="px-[var(--rr-space-4)] py-[var(--rr-space-3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <DollarSign className="h-4 w-4 text-[var(--rr-color-success)]" />
              <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">Revenue</span>
            </div>
            <div className="text-right">
              <p className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-success)]">{formatCurrency(stats.totalIncreaseThisMonth)}</p>
              <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-tertiary)]">this month</p>
            </div>
          </div>
        </Card>

        {/* Supplements */}
        <Card className="px-[var(--rr-space-4)] py-[var(--rr-space-3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <TrendingUp className="h-4 w-4 text-[var(--rr-color-warning)]" />
              <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">Supplements</span>
            </div>
            <div className="text-right">
              <p className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-primary)]">{stats.supplementCount}</p>
              <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-tertiary)]">{formatCurrency(stats.supplementTotalAmount)}</p>
            </div>
          </div>
        </Card>

        {/* Compliance or Avg $/SQ */}
        {isManager && managerStats ? (
          <Card className={`px-[var(--rr-space-4)] py-[var(--rr-space-3)] ${managerStats.compliancePercentage < 70 ? 'border-[var(--rr-color-error)] bg-[var(--rr-color-status-error-bg)]' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--rr-space-2)]">
                <ShieldCheck className={`h-4 w-4 ${
                  managerStats.compliancePercentage >= 90 ? 'text-[var(--rr-color-success)]' :
                  managerStats.compliancePercentage >= 70 ? 'text-[var(--rr-color-warning)]' : 'text-[var(--rr-color-error)]'
                }`} />
                <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">Compliance</span>
              </div>
              <div className="text-right">
                <p className={`text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] ${
                  managerStats.compliancePercentage >= 90 ? 'text-[var(--rr-color-success)]' :
                  managerStats.compliancePercentage >= 70 ? 'text-[var(--rr-color-warning)]' : 'text-[var(--rr-color-error)]'
                }`}>{managerStats.compliancePercentage}%</p>
                <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-tertiary)]">
                  {managerStats.overdueCount === 0 ? 'on track' : `${managerStats.overdueCount} overdue`}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="px-[var(--rr-space-4)] py-[var(--rr-space-3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--rr-space-2)]">
                <BarChart3 className="h-4 w-4 text-[var(--rr-color-info)]" />
                <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">Avg $/SQ</span>
              </div>
              <div className="text-right">
                <p className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-semibold)] text-[var(--rr-color-text-primary)]">{formatCurrency(stats.avgDollarPerSquare)}</p>
                <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-tertiary)]">{stats.updatesPerJob} updates/job</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Claims Requiring Action */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-[var(--rr-space-2)]">
            <AlertCircle className="h-5 w-5 text-[var(--rr-color-warning)]" />
            Claims Requiring Action
          </CardTitle>
          {claimsRequiringAction.length > 0 && (
            <Link
              href="/dashboard/claims"
              className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-link)] hover:underline"
            >
              View all
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {claimsRequiringAction.length === 0 ? (
            <div className="text-center py-[var(--rr-space-8)]">
              <CheckCircle2 className="h-12 w-12 mx-auto text-[var(--rr-color-success)] mb-[var(--rr-space-3)]" />
              <p className="text-[var(--rr-color-text-primary)] font-[var(--rr-font-weight-medium)]">All caught up!</p>
              <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
                No claims require immediate attention.
              </p>
            </div>
          ) : (
            <div className="space-y-[var(--rr-space-3)]">
              {claimsRequiringAction.map((claim) => (
                <ClaimActionRow key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager-Only: Status Distribution & Activity */}
      {isManager && managerStats && (
        <div className="grid gap-[var(--rr-space-6)] md:grid-cols-2">
          {/* Status Distribution Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-[var(--rr-space-2)]">
                <BarChart3 className="h-5 w-5 text-[var(--rr-color-brand-primary)]" />
                Claims by Status
              </CardTitle>
              <Link
                href="/dashboard/claims/kanban"
                className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-link)] hover:underline"
              >
                Kanban view
              </Link>
            </CardHeader>
            <CardContent>
              <StatusChart data={managerStats.statusChartData} />
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-[var(--rr-space-2)]">
                <Activity className="h-5 w-5 text-[var(--rr-color-info)]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {managerStats.recentActivity.length === 0 ? (
                <div className="text-center py-[var(--rr-space-8)]">
                  <Activity className="h-12 w-12 mx-auto text-[var(--rr-color-text-tertiary)] mb-[var(--rr-space-3)]" />
                  <p className="text-[var(--rr-color-text-secondary)]">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-[var(--rr-space-3)] max-h-80 overflow-y-auto pr-[var(--rr-space-2)]">
                  {managerStats.recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/claims/${activity.claim.id}`}
                      className="flex items-start gap-[var(--rr-space-3)] p-[var(--rr-space-3)] rounded-[var(--rr-radius-lg)] hover:bg-[var(--rr-color-surface-hover)] transition-colors"
                    >
                      <div className="mt-1 h-2 w-2 rounded-[var(--rr-radius-full)] bg-[var(--rr-color-brand-primary)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)] truncate">
                          {activity.claim.policyholderName}
                        </p>
                        <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-secondary)] truncate">
                          {activity.content}
                        </p>
                        <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-text-tertiary)] mt-[var(--rr-space-1)]">
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
    compliant: "text-[var(--rr-color-success)]",
    warning: "text-[var(--rr-color-warning)]",
    overdue: "text-[var(--rr-color-error)]",
  }[complianceStatus];

  const complianceBg = {
    compliant: "bg-[var(--rr-color-status-success-bg)]",
    warning: "bg-[var(--rr-color-status-warning-bg)]",
    overdue: "bg-[var(--rr-color-status-error-bg)]",
  }[complianceStatus];

  return (
    <Link
      href={`/dashboard/claims/${claim.id}`}
      className={`flex items-center justify-between p-[var(--rr-space-4)] rounded-[var(--rr-radius-lg)] border border-[var(--rr-color-border-default)] hover:shadow-[var(--rr-shadow-md)] transition-all ${complianceBg}`}
    >
      <div className="flex items-center gap-[var(--rr-space-4)]">
        <ComplianceIcon className={`h-5 w-5 ${complianceColor}`} />
        <div>
          <p className="font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)]">{claim.policyholderName}</p>
          <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
            {claim.lossAddress}, {claim.lossCity} · {claim.contractor.companyName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-[var(--rr-space-4)]">
        <span
          className={`inline-flex rounded-[var(--rr-radius-full)] px-[var(--rr-space-2)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)] ${
            CLAIM_STATUS_COLORS[claim.status] || "bg-[var(--rr-color-bg-tertiary)] text-[var(--rr-color-text-primary)]"
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status] || claim.status}
        </span>
        <span className={`text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] ${complianceColor}`}>
          {hours}h ago
        </span>
      </div>
    </Link>
  );
}
