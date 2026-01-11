"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/calculations";
import { useState, useCallback, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Decimal } from "@prisma/client/runtime/library";

interface Claim {
  id: string;
  policyholderName: string;
  lossAddress: string;
  lossCity: string;
  lossState: string;
  status: string;
  totalIncrease: Decimal;
  dollarPerSquare: Decimal;
  currentTotalRCV: Decimal;
  lastActivityAt: Date;
  estimator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carrier: {
    id: string;
    name: string;
  };
  _count: {
    supplements: number;
  };
}

interface ContractorClaimsTableProps {
  claims: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentFilters: {
    status?: string;
    search?: string;
  };
}

export function ContractorClaimsTable({
  claims,
  pagination,
  currentFilters,
}: ContractorClaimsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

  const updateFilters = useCallback(
    (newFilters: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (!newFilters.hasOwnProperty("page")) {
        params.delete("page");
      }

      router.push("?" + params.toString());
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentFilters.search) {
        updateFilters({ search: searchInput || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, currentFilters.search, updateFilters]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search claims..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={currentFilters.status || "all"}
          onValueChange={(value) => updateFilters({ status: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(CLAIM_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Policyholder
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Estimator
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Current RCV
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Increase
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                $/Square
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {claims.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No claims found
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push("/contractor/claims/" + claim.id)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {claim.policyholderName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {claim.lossAddress}, {claim.lossCity}, {claim.lossState}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={CLAIM_STATUS_COLORS[claim.status]}>
                      {CLAIM_STATUS_LABELS[claim.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {claim.estimator.firstName} {claim.estimator.lastName}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {"$" + decimalToNumber(claim.currentTotalRCV).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {"$" + decimalToNumber(claim.totalIncrease).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    {"$" + decimalToNumber(claim.dollarPerSquare).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} claims
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateFilters({ page: String(pagination.page - 1) })
              }
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateFilters({ page: String(pagination.page + 1) })
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
