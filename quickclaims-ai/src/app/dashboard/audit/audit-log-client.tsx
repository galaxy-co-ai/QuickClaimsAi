"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  metadata: unknown;
  createdAt: Date;
}

interface AuditLogClientProps {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  users: { userId: string; userEmail: string }[];
  currentFilters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  };
}

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  status_change: "Status Changed",
  approve: "Approved",
  submit: "Submitted",
  login: "Logged In",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  status_change: "bg-purple-100 text-purple-800",
  approve: "bg-emerald-100 text-emerald-800",
  submit: "bg-amber-100 text-amber-800",
  login: "bg-slate-100 text-slate-800",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  claim: "Claim",
  supplement: "Supplement",
  note: "Note",
  document: "Document",
  contractor: "Contractor",
  estimator: "Estimator",
  carrier: "Carrier",
  adjuster: "Adjuster",
  user: "User",
};

export function AuditLogClient({
  logs,
  pagination,
  users,
  currentFilters,
}: AuditLogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/dashboard/audit?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push("/dashboard/audit");
    });
  }, [router]);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      startTransition(() => {
        router.push(`/dashboard/audit?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const hasActiveFilters =
    currentFilters.userId ||
    currentFilters.action ||
    currentFilters.entityType ||
    currentFilters.entityId ||
    currentFilters.dateFrom ||
    currentFilters.dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* User Filter */}
            <select
              value={currentFilters.userId || ""}
              onChange={(e) => updateFilter("userId", e.target.value)}
              disabled={isPending}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.userEmail}
                </option>
              ))}
            </select>

            {/* Action Filter */}
            <select
              value={currentFilters.action || ""}
              onChange={(e) => updateFilter("action", e.target.value)}
              disabled={isPending}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Entity Type Filter */}
            <select
              value={currentFilters.entityType || ""}
              onChange={(e) => updateFilter("entityType", e.target.value)}
              disabled={isPending}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Entity Types</option>
              {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              value={currentFilters.dateFrom || ""}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              disabled={isPending}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Date from"
            />

            {/* Date To */}
            <input
              type="date"
              value={currentFilters.dateTo || ""}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              disabled={isPending}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Date to"
            />

            {/* Entity ID Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search entity ID..."
                value={currentFilters.entityId || ""}
                onChange={(e) => updateFilter("entityId", e.target.value)}
                disabled={isPending}
                className="h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                aria-label="Search by entity ID"
              />
            </div>

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

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Activity Log ({pagination.total.toLocaleString()} entries)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No audit log entries found matching your filters.
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-800"}`}
                        >
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                        <Badge variant="outline">
                          {ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                        </Badge>
                        {log.fieldName && (
                          <span className="text-sm text-slate-500">
                            Field: <code className="bg-slate-100 px-1 rounded">{log.fieldName}</code>
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">{log.userEmail}</span>
                        {log.oldValue && log.newValue && (
                          <span className="ml-2">
                            changed from{" "}
                            <code className="bg-red-50 text-red-700 px-1 rounded">
                              {log.oldValue.length > 50
                                ? log.oldValue.substring(0, 50) + "..."
                                : log.oldValue}
                            </code>{" "}
                            to{" "}
                            <code className="bg-green-50 text-green-700 px-1 rounded">
                              {log.newValue.length > 50
                                ? log.newValue.substring(0, 50) + "..."
                                : log.newValue}
                            </code>
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Entity ID: {log.entityId}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
