"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getComplianceStatus, hoursSince } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS, JOB_TYPE_LABELS } from "@/lib/constants";
import type { Claim, Contractor, Estimator, Carrier, JobType } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

type ClaimWithRelations = Claim & {
  contractor: Pick<Contractor, "id" | "companyName">;
  estimator: Pick<Estimator, "id" | "firstName" | "lastName">;
  carrier: Pick<Carrier, "id" | "name">;
  _count: { supplements: number };
  // Commission fields
  jobType: JobType;
  estimatorCommission: Decimal;
  statusChangedAt: Date;
};

interface ClaimsTableProps {
  claims: ClaimWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ClaimsTable({ claims, pagination }: ClaimsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/claims?${params.toString()}`);
  };

  if (claims.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-[var(--rr-space-12)]">
          <FileText className="h-12 w-12 text-[var(--rr-color-stone)] mb-[var(--rr-space-4)]" />
          <h3 className="text-[var(--rr-font-size-lg)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)] mb-[var(--rr-space-2)]">
            No claims found
          </h3>
          <p className="text-[var(--rr-color-text-secondary)] mb-[var(--rr-space-4)] text-center max-w-sm">
            No claims match your current filters. Try adjusting your search or create a new claim.
          </p>
          <Link href="/dashboard/claims/new">
            <Button>Create New Claim</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-[var(--rr-space-4)]">
        <CardTitle>All Claims</CardTitle>
        <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
          {pagination.total} claim{pagination.total !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-[var(--rr-color-border-default)] text-left text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)] w-8"></th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Status</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Claim #</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Policyholder</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Carrier</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Contractor</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Job Type</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)]">Estimator</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)] text-right">Increase</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)] text-right">Commission</th>
                <th className="pb-[var(--rr-space-3)] font-[var(--rr-font-weight-medium)] text-right">Days in Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <ClaimRow key={claim.id} claim={claim} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-[var(--rr-space-4)] border-t border-[var(--rr-color-border-default)] mt-[var(--rr-space-4)]">
            <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total}
            </div>
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-[var(--rr-space-1)]">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClaimRow({ claim }: { claim: ClaimWithRelations }) {
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

  const totalIncrease = Number(claim.totalIncrease);
  const estimatorCommission = Number(claim.estimatorCommission);

  // Calculate days in current status
  const daysInStatus = Math.floor(
    (Date.now() - new Date(claim.statusChangedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <tr className="border-b border-[var(--rr-color-border-default)] last:border-0 hover:bg-[var(--rr-color-surface-hover)] cursor-pointer">
      <td className="py-[var(--rr-space-4)]">
        <ComplianceIcon
          className={`h-4 w-4 ${complianceColor}`}
          aria-label={`${complianceStatus}: ${hours}h since last activity`}
        />
      </td>
      <td className="py-[var(--rr-space-4)]">
        <span
          className={`inline-flex rounded-[var(--rr-radius-full)] px-[var(--rr-space-2)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)] ${
            CLAIM_STATUS_COLORS[claim.status] || "bg-[var(--rr-color-sand)] text-[var(--rr-color-text-primary)]"
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status] || claim.status}
        </span>
      </td>
      <td className="py-[var(--rr-space-4)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
        {claim.claimNumber || "-"}
      </td>
      <td className="py-[var(--rr-space-4)]">
        <Link
          href={`/dashboard/claims/${claim.id}`}
          className="block hover:text-[var(--rr-color-brand-primary)]"
        >
          <div className="font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)]">
            {claim.policyholderName}
          </div>
          <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
            {claim.lossAddress}, {claim.lossCity}
          </div>
        </Link>
      </td>
      <td className="py-[var(--rr-space-4)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
        {claim.carrier.name}
      </td>
      <td className="py-[var(--rr-space-4)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">
        {claim.contractor.companyName}
      </td>
      <td className="py-[var(--rr-space-4)]">
        <span className="inline-flex rounded-[var(--rr-radius-md)] bg-[var(--rr-color-sand)] px-[var(--rr-space-2)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-secondary)]">
          {JOB_TYPE_LABELS[claim.jobType] || claim.jobType}
        </span>
      </td>
      <td className="py-[var(--rr-space-4)] text-[var(--rr-color-text-secondary)]">
        {claim.estimator.firstName} {claim.estimator.lastName}
      </td>
      <td className="py-[var(--rr-space-4)] text-right font-[var(--rr-font-weight-medium)] text-[var(--rr-color-success)]">
        {totalIncrease > 0 ? formatCurrency(totalIncrease) : "-"}
      </td>
      <td className="py-[var(--rr-space-4)] text-right font-[var(--rr-font-weight-medium)] text-[var(--rr-color-brand-primary)]">
        {estimatorCommission > 0 ? formatCurrency(estimatorCommission) : "-"}
      </td>
      <td className="py-[var(--rr-space-4)] text-right text-[var(--rr-font-size-sm)]">
        <span className={daysInStatus > 3 ? "text-[var(--rr-color-error)] font-[var(--rr-font-weight-medium)]" : "text-[var(--rr-color-text-secondary)]"}>
          {daysInStatus === 0 ? "Today" : daysInStatus === 1 ? "1 day" : `${daysInStatus} days`}
        </span>
      </td>
    </tr>
  );
}

