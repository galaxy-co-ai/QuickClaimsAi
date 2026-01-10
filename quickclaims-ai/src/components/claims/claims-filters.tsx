"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CLAIM_STATUS_LABELS } from "@/lib/constants";

interface ClaimsFiltersProps {
  contractors: { id: string; companyName: string }[];
  estimators: { id: string; firstName: string; lastName: string }[];
  carriers: { id: string; name: string }[];
  currentFilters: {
    status?: string;
    contractor?: string;
    estimator?: string;
    carrier?: string;
    search?: string;
  };
}

export function ClaimsFilters({
  contractors,
  estimators,
  carriers,
  currentFilters,
}: ClaimsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      startTransition(() => {
        router.push(`/dashboard/claims?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    startTransition(() => {
      router.push("/dashboard/claims");
    });
  }, [router]);

  const handleSearch = useCallback(() => {
    updateFilter("search", searchValue);
  }, [updateFilter, searchValue]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    currentFilters.status ||
    currentFilters.contractor ||
    currentFilters.estimator ||
    currentFilters.carrier ||
    currentFilters.search;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name, address, claim #..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearch}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Search claims"
            />
          </div>

          {/* Status Filter */}
          <select
            value={currentFilters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            disabled={isPending}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(CLAIM_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Contractor Filter */}
          <select
            value={currentFilters.contractor || ""}
            onChange={(e) => updateFilter("contractor", e.target.value)}
            disabled={isPending}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Contractors</option>
            {contractors.map((contractor) => (
              <option key={contractor.id} value={contractor.id}>
                {contractor.companyName}
              </option>
            ))}
          </select>

          {/* Estimator Filter */}
          <select
            value={currentFilters.estimator || ""}
            onChange={(e) => updateFilter("estimator", e.target.value)}
            disabled={isPending}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Estimators</option>
            {estimators.map((estimator) => (
              <option key={estimator.id} value={estimator.id}>
                {estimator.firstName} {estimator.lastName}
              </option>
            ))}
          </select>

          {/* Carrier Filter */}
          <select
            value={currentFilters.carrier || ""}
            onChange={(e) => updateFilter("carrier", e.target.value)}
            disabled={isPending}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Carriers</option>
            {carriers.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.name}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isPending}
              className="gap-1 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
