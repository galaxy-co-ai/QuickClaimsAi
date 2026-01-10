import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClaimsPage() {
  // TODO: Fetch claims from database with filters
  const claims = [
    {
      id: "1",
      policyholderName: "John Smith",
      lossAddress: "123 Main St, Austin, TX",
      contractor: "Renegade Roofing",
      status: "approved",
      initialRCV: 18500,
      totalIncrease: 4200,
      dollarPerSquare: 714,
    },
    {
      id: "2",
      policyholderName: "Mary Johnson",
      lossAddress: "456 Oak Ave, Dallas, TX",
      contractor: "Mitchell Roofing",
      status: "supplement_sent",
      initialRCV: 22000,
      totalIncrease: 2800,
      dollarPerSquare: 689,
    },
    {
      id: "3",
      policyholderName: "Tom Davis",
      lossAddress: "789 Pine Rd, Houston, TX",
      contractor: "Renegade Roofing",
      status: "awaiting_carrier_response",
      initialRCV: 15000,
      totalIncrease: 0,
      dollarPerSquare: 428,
    },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      supplement_sent: "bg-cyan-100 text-cyan-800",
      awaiting_carrier_response: "bg-orange-100 text-orange-800",
      new_supplement: "bg-blue-100 text-blue-800",
    };
    const labels: Record<string, string> = {
      approved: "Approved",
      supplement_sent: "Sent",
      awaiting_carrier_response: "Awaiting",
      new_supplement: "New",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims</h1>
          <p className="text-slate-600">
            Manage and track all supplement claims
          </p>
        </div>
        <Link href="/dashboard/claims/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name, address, claim #..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Search claims"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters
          </Button>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b text-left text-sm text-slate-500">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Policyholder</th>
                  <th className="pb-3 font-medium">Contractor</th>
                  <th className="pb-3 font-medium text-right">Initial RCV</th>
                  <th className="pb-3 font-medium text-right">Increase</th>
                  <th className="pb-3 font-medium text-right">$/SQ</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-4">{getStatusBadge(claim.status)}</td>
                    <td className="py-4">
                      <div className="font-medium text-slate-900">
                        {claim.policyholderName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {claim.lossAddress}
                      </div>
                    </td>
                    <td className="py-4 text-slate-700">{claim.contractor}</td>
                    <td className="py-4 text-right text-slate-700">
                      {formatCurrency(claim.initialRCV)}
                    </td>
                    <td className="py-4 text-right font-medium text-green-600">
                      {claim.totalIncrease > 0
                        ? formatCurrency(claim.totalIncrease)
                        : "-"}
                    </td>
                    <td className="py-4 text-right text-slate-700">
                      {formatCurrency(claim.dollarPerSquare)}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/dashboard/claims/${claim.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {claims.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500">No claims found.</p>
              <Link
                href="/dashboard/claims/new"
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create your first claim →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
