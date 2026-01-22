export const dynamic = "force-dynamic";

import Link from "next/link";
import { FileText, TrendingUp, CheckCircle, DollarSign } from "lucide-react";
import { getContractorDashboardStats, getContractorClaims } from "@/actions/contractor-portal";
import { Badge } from "@/components/ui/badge";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/calculations";

export default async function ContractorDashboardPage() {
  const [stats, recentClaims] = await Promise.all([
    getContractorDashboardStats(),
    getContractorClaims({ limit: 5 }),
  ]);

  const statCards = [
    {
      title: "Active Claims",
      value: stats.activeClaims.toString(),
      icon: FileText,
      color: "bg-[var(--rr-color-brand-primary)]",
    },
    {
      title: "Completed This Month",
      value: stats.completedThisMonth.toString(),
      icon: CheckCircle,
      color: "bg-[var(--rr-color-success)]",
    },
    {
      title: "Total Increase (MTD)",
      value: "$" + stats.totalIncreaseThisMonth.toLocaleString(),
      icon: TrendingUp,
      color: "bg-[var(--rr-color-brand-accent)]",
    },
    {
      title: "Avg $/Square",
      value: "$" + stats.avgDollarPerSquare.toFixed(2),
      icon: DollarSign,
      color: "bg-[var(--rr-color-warning)]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Contractor Portal</h1>
        <p className="text-[var(--rr-color-text-secondary)]">View your claims and track progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border bg-[var(--rr-color-surface-primary)] p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={"rounded-lg " + stat.color + " p-3 text-white"}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[var(--rr-color-text-secondary)]">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Claims */}
      <div className="rounded-lg border bg-[var(--rr-color-surface-primary)] shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Claims</h2>
          <Link
            href="/contractor/claims"
            className="text-sm text-[var(--rr-color-brand-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y">
          {recentClaims.claims.length === 0 ? (
            <div className="p-8 text-center text-[var(--rr-color-stone)]">
              No claims found
            </div>
          ) : (
            recentClaims.claims.map((claim) => (
              <Link
                key={claim.id}
                href={"/contractor/claims/" + claim.id}
                className="flex items-center justify-between p-4 hover:bg-[var(--rr-color-surface-hover)]"
              >
                <div>
                  <p className="font-medium">{claim.policyholderName}</p>
                  <p className="text-sm text-[var(--rr-color-stone)]">
                    {claim.lossAddress}, {claim.lossCity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-[var(--rr-color-success)]">
                      {"$" + decimalToNumber(claim.totalIncrease).toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--rr-color-stone)]">
                      {"$" + decimalToNumber(claim.dollarPerSquare).toFixed(2) + "/sq"}
                    </p>
                  </div>
                  <Badge className={CLAIM_STATUS_COLORS[claim.status]}>
                    {CLAIM_STATUS_LABELS[claim.status]}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
