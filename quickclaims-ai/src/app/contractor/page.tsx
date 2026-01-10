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
      color: "bg-blue-500",
    },
    {
      title: "Completed This Month",
      value: stats.completedThisMonth.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Total Increase (MTD)",
      value: "$" + stats.totalIncreaseThisMonth.toLocaleString(),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "Avg $/Square",
      value: "$" + stats.avgDollarPerSquare.toFixed(2),
      icon: DollarSign,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contractor Portal</h1>
        <p className="text-slate-600">View your claims and track progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={"rounded-lg " + stat.color + " p-3 text-white"}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Claims */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Claims</h2>
          <Link
            href="/contractor/claims"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y">
          {recentClaims.claims.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No claims found
            </div>
          ) : (
            recentClaims.claims.map((claim) => (
              <Link
                key={claim.id}
                href={"/contractor/claims/" + claim.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{claim.policyholderName}</p>
                  <p className="text-sm text-slate-500">
                    {claim.lossAddress}, {claim.lossCity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {"$" + decimalToNumber(claim.totalIncrease).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">
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
