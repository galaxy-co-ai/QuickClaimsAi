import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function DashboardPage() {
  // TODO: Fetch real data from database
  const stats = [
    {
      title: "Active Claims",
      value: "142",
      icon: FileText,
      description: "Claims in progress",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Increase",
      value: "$1.2M",
      icon: DollarSign,
      description: "This month",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Avg $/Square",
      value: "$714",
      icon: TrendingUp,
      description: "Performance metric",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "48hr Compliance",
      value: "94%",
      icon: Clock,
      description: "Update frequency",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          Welcome back! Here&apos;s an overview of your claims.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a
            href="/dashboard/claims/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            + New Claim
          </a>
          <a
            href="/dashboard/reports/commission"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View Commission
          </a>
          <a
            href="/dashboard/reports/billing"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Billing Report
          </a>
        </CardContent>
      </Card>

      {/* Getting Started Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">🚀 Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-3">
            QuickClaims AI is ready to use! To complete setup:
          </p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Add your Clerk API keys to <code className="rounded bg-blue-100 px-1">.env.local</code></li>
            <li>Add your Neon database URL</li>
            <li>Run <code className="rounded bg-blue-100 px-1">npx prisma db push</code> to create tables</li>
            <li>Start adding contractors and estimators</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
