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
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No claims found
          </h3>
          <p className="text-slate-500 mb-4 text-center max-w-sm">
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
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>All Claims</CardTitle>
        <span className="text-sm text-slate-500">
          {pagination.total} claim{pagination.total !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b text-left text-sm text-slate-500">
                <th className="pb-3 font-medium w-8"></th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Policyholder</th>
                <th className="pb-3 font-medium">Job Type</th>
                <th className="pb-3 font-medium">Estimator</th>
                <th className="pb-3 font-medium text-right">Increase</th>
                <th className="pb-3 font-medium text-right">Commission</th>
                <th className="pb-3 font-medium text-right">Days in Status</th>
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
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
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
    compliant: "text-green-500",
    warning: "text-yellow-500",
    overdue: "text-red-500",
  }[complianceStatus];

  const totalIncrease = Number(claim.totalIncrease);
  const estimatorCommission = Number(claim.estimatorCommission);
  
  // Calculate days in current status
  const daysInStatus = Math.floor(
    (Date.now() - new Date(claim.statusChangedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <tr className="border-b last:border-0 hover:bg-slate-50 cursor-pointer">
      <td className="py-4">
        <ComplianceIcon
          className={`h-4 w-4 ${complianceColor}`}
          aria-label={`${complianceStatus}: ${hours}h since last activity`}
        />
      </td>
      <td className="py-4">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            CLAIM_STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status] || claim.status}
        </span>
      </td>
      <td className="py-4">
        <Link
          href={`/dashboard/claims/${claim.id}`}
          className="block hover:text-blue-600"
        >
          <div className="font-medium text-slate-900">
            {claim.policyholderName}
          </div>
          <div className="text-sm text-slate-500">
            {claim.lossAddress}, {claim.lossCity}
          </div>
        </Link>
      </td>
      <td className="py-4">
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {JOB_TYPE_LABELS[claim.jobType] || claim.jobType}
        </span>
      </td>
      <td className="py-4 text-slate-700">
        {claim.estimator.firstName} {claim.estimator.lastName}
      </td>
      <td className="py-4 text-right font-medium text-green-600">
        {totalIncrease > 0 ? formatCurrency(totalIncrease) : "-"}
      </td>
      <td className="py-4 text-right font-medium text-blue-600">
        {estimatorCommission > 0 ? formatCurrency(estimatorCommission) : "-"}
      </td>
      <td className="py-4 text-right text-sm">
        <span className={daysInStatus > 3 ? "text-red-500 font-medium" : "text-slate-500"}>
          {daysInStatus === 0 ? "Today" : daysInStatus === 1 ? "1 day" : `${daysInStatus} days`}
        </span>
      </td>
    </tr>
  );
}

