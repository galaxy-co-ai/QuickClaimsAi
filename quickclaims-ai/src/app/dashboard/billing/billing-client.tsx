"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  DollarSign,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBillingClaims,
  markClaimPaid,
  markClaimUnpaid,
  markClaimsPaid,
} from "@/actions/billing";
import { formatCurrency, formatDate } from "@/lib/utils";

type BillingClaim = {
  id: string;
  policyholderName: string;
  lossAddress: string;
  contractorId: string;
  contractorName: string;
  estimatorName: string;
  totalIncrease: number;
  billingAmount: number;
  status: string;
  statusChangedAt: Date;
  isPaid: boolean;
  billingPaidAt: Date | null;
};

interface BillingClientProps {
  initialData: {
    claims: BillingClaim[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    totals: {
      count: number;
      totalIncrease: number;
      totalBilling: number;
    };
  };
  contractors: { id: string; companyName: string }[];
}

export function BillingClient({ initialData, contractors }: BillingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [contractorId, setContractorId] = useState<string>("");
  const [paidFilter, setPaidFilter] = useState<string>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [data, setData] = useState(initialData);

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all unpaid
  const selectAllUnpaid = () => {
    const unpaidIds = data.claims.filter((c) => !c.isPaid).map((c) => c.id);
    setSelectedIds(new Set(unpaidIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Apply filters
  const handleApplyFilters = () => {
    startTransition(async () => {
      try {
        const result = await getBillingClaims({
          contractorId: contractorId || undefined,
          isPaid: paidFilter === "paid" ? true : paidFilter === "unpaid" ? false : undefined,
        });
        setData(result);
        setSelectedIds(new Set());
      } catch {
        toast.error("Failed to load billing data");
      }
    });
  };

  // Mark single claim paid/unpaid
  const handleTogglePaid = (claim: BillingClaim) => {
    startTransition(async () => {
      try {
        if (claim.isPaid) {
          await markClaimUnpaid(claim.id);
          toast.success("Marked as unpaid");
        } else {
          await markClaimPaid(claim.id);
          toast.success("Marked as paid");
        }
        // Refresh data
        const result = await getBillingClaims({
          contractorId: contractorId || undefined,
          isPaid: paidFilter === "paid" ? true : paidFilter === "unpaid" ? false : undefined,
        });
        setData(result);
        router.refresh();
      } catch {
        toast.error("Failed to update payment status");
      }
    });
  };

  // Mark selected as paid
  const handleMarkSelectedPaid = () => {
    if (selectedIds.size === 0) {
      toast.error("No claims selected");
      return;
    }

    startTransition(async () => {
      try {
        const result = await markClaimsPaid(Array.from(selectedIds));
        toast.success(`Marked ${result.count} claims as paid`);
        setSelectedIds(new Set());
        // Refresh data
        const newData = await getBillingClaims({
          contractorId: contractorId || undefined,
          isPaid: paidFilter === "paid" ? true : paidFilter === "unpaid" ? false : undefined,
        });
        setData(newData);
        router.refresh();
      } catch {
        toast.error("Failed to update payment status");
      }
    });
  };

  // Calculate selected totals
  const selectedClaims = data.claims.filter((c) => selectedIds.has(c.id));
  const selectedTotal = selectedClaims.reduce((sum, c) => sum + c.billingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--rr-color-text-secondary)]">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totals.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--rr-color-text-secondary)]">Total Increase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--rr-color-success)]">
              {formatCurrency(data.totals.totalIncrease)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--rr-color-text-secondary)]">Total Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--rr-color-info)]">
              {formatCurrency(data.totals.totalBilling)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="contractor-filter">Contractor</Label>
              <Select
                value={contractorId || "all"}
                onValueChange={(val) => setContractorId(val === "all" ? "" : val)}
              >
                <SelectTrigger id="contractor-filter" className="w-48 mt-1" aria-label="Filter by contractor">
                  <SelectValue placeholder="All contractors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contractors</SelectItem>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paid-filter">Payment Status</Label>
              <Select value={paidFilter} onValueChange={setPaidFilter}>
                <SelectTrigger id="paid-filter" className="w-36 mt-1" aria-label="Filter by payment status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleApplyFilters} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions */}
      {selectedIds.size > 0 && (
        <Card className="bg-[var(--rr-color-info)]/10 border-[var(--rr-color-info)]/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-[var(--rr-color-info)]">
                  {selectedIds.size} claim(s) selected
                </span>
                <span className="text-[var(--rr-color-info)]/80">
                  Total: {formatCurrency(selectedTotal)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleMarkSelectedPaid}
                  disabled={isPending}
                  className="bg-[var(--rr-color-success)] hover:bg-[var(--rr-color-success)]/90"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Mark Selected as Paid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--rr-color-success)]" />
            Billing Claims
          </CardTitle>
          <Button variant="outline" size="sm" onClick={selectAllUnpaid}>
            Select All Unpaid
          </Button>
        </CardHeader>
        <CardContent>
          {data.claims.length === 0 ? (
            <div className="text-center py-12 text-[var(--rr-color-stone)]">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-[var(--rr-color-stone)]/50" />
              <p>No billing claims found</p>
              <p className="text-sm">Adjust filters to see more results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[var(--rr-color-sand-light)]">
                    <th className="text-left p-3 w-10">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="text-left p-3 font-medium">Policyholder</th>
                    <th className="text-left p-3 font-medium">Contractor</th>
                    <th className="text-right p-3 font-medium">Increase</th>
                    <th className="text-right p-3 font-medium">Billing</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Paid</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.claims.map((claim) => (
                    <tr key={claim.id} className={`border-b hover:bg-[var(--rr-color-surface-hover)] ${claim.isPaid ? "bg-[var(--rr-color-success)]/5" : ""}`}>
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelection(claim.id)}
                          className="p-1 rounded hover:bg-[var(--rr-color-sand)]"
                          aria-label={selectedIds.has(claim.id) ? "Deselect claim" : "Select claim"}
                        >
                          {selectedIds.has(claim.id) ? (
                            <CheckCircle className="h-5 w-5 text-[var(--rr-color-info)]" />
                          ) : (
                            <Circle className="h-5 w-5 text-[var(--rr-color-stone)]" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/dashboard/claims/${claim.id}`}
                          className="font-medium text-[var(--rr-color-brand-primary)] hover:underline"
                        >
                          {claim.policyholderName}
                        </Link>
                        <p className="text-xs text-[var(--rr-color-stone)]">{claim.lossAddress}</p>
                      </td>
                      <td className="p-3 text-[var(--rr-color-text-secondary)]">{claim.contractorName}</td>
                      <td className="p-3 text-right text-[var(--rr-color-success)]">
                        {formatCurrency(claim.totalIncrease)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(claim.billingAmount)}
                      </td>
                      <td className="p-3">
                        <span className="text-xs">{claim.status}</span>
                      </td>
                      <td className="p-3 text-center">
                        {claim.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[var(--rr-color-success)]">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">{formatDate(claim.billingPaidAt!)}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--rr-color-stone)] text-xs">Unpaid</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePaid(claim)}
                          disabled={isPending}
                        >
                          {claim.isPaid ? "Mark Unpaid" : "Mark Paid"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
