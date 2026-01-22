export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Shield } from "lucide-react";
import { getAuditLogs, getAuditLogUsers } from "@/actions/audit";
import { AuditLogClient } from "./audit-log-client";

interface AuditPageProps {
  searchParams: Promise<{
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;

  const filters = {
    userId: params.userId,
    action: params.action as "create" | "update" | "delete" | "status_change" | "approve" | "submit" | "login" | undefined,
    entityType: params.entityType as "claim" | "supplement" | "note" | "document" | "contractor" | "estimator" | "carrier" | "adjuster" | "user" | undefined,
    entityId: params.entityId,
    dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: 50,
  };

  const [{ logs, pagination }, users] = await Promise.all([
    getAuditLogs(filters),
    getAuditLogUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--rr-color-info)]/10">
          <Shield className="h-5 w-5 text-[var(--rr-color-brand-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Audit Log</h1>
          <p className="text-[var(--rr-color-text-secondary)]">
            Immutable record of all system changes for compliance
          </p>
        </div>
      </div>

      <Suspense fallback={<AuditLogSkeleton />}>
        <AuditLogClient
          logs={logs}
          pagination={pagination}
          users={users}
          currentFilters={params}
        />
      </Suspense>
    </div>
  );
}

function AuditLogSkeleton() {
  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b">
        <div className="h-6 w-32 bg-[var(--rr-color-sand)] rounded animate-pulse" />
      </div>
      <div className="divide-y">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-5 w-24 bg-[var(--rr-color-sand)] rounded animate-pulse" />
            <div className="h-5 flex-1 bg-[var(--rr-color-sand)] rounded animate-pulse" />
            <div className="h-5 w-32 bg-[var(--rr-color-sand)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
