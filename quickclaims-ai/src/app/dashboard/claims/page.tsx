export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClaims, getClaimFormOptions } from "@/actions/claims";
import { ClaimsTable } from "@/components/claims/claims-table";
import { ClaimsFilters } from "@/components/claims/claims-filters";

interface ClaimsPageProps {
  searchParams: Promise<{
    status?: string;
    contractor?: string;
    estimator?: string;
    carrier?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = await searchParams;

  const filters = {
    status: params.status,
    contractorId: params.contractor,
    estimatorId: params.estimator,
    carrierId: params.carrier,
    search: params.search,
    dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };

  const [{ claims, pagination }, options] = await Promise.all([
    getClaims(filters),
    getClaimFormOptions(),
  ]);

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
        <div className="flex gap-2">
          <Link href="/dashboard/claims/kanban">
            <Button variant="outline" className="gap-2">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Kanban
            </Button>
          </Link>
          <Link href="/dashboard/claims/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <ClaimsFilters
        contractors={options.contractors}
        estimators={options.estimators}
        carriers={options.carriers}
        currentFilters={params}
      />

      {/* Claims Table */}
      <Suspense fallback={<ClaimsTableSkeleton />}>
        <ClaimsTable claims={claims} pagination={pagination} />
      </Suspense>
    </div>
  );
}

function ClaimsTableSkeleton() {
  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b">
        <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 flex-1 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
