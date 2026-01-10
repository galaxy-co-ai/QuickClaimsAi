"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

interface Claim {
  id: string;
  policyholderName: string;
  lossCity: string;
  lossState: string;
  status: ClaimStatus;
  dollarPerSquare: Decimal;
  lastActivityAt: Date;
  contractor: {
    id: string;
    companyName: string;
  };
  estimator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface KanbanColumnProps {
  status: ClaimStatus;
  claims: Claim[];
}

export function KanbanColumn({ status, claims }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-shrink-0 w-72">
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-2 min-h-[600px] transition-colors",
          isOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50"
        )}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3 p-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                CLAIM_STATUS_COLORS[status]
              )}
            >
              {CLAIM_STATUS_LABELS[status]}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {claims.length}
          </span>
        </div>

        {/* Claims */}
        <div
          ref={setNodeRef}
          className="space-y-2"
        >
          <SortableContext
            items={claims.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {claims.map((claim) => (
              <KanbanCard key={claim.id} claim={claim} />
            ))}
          </SortableContext>

          {claims.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No claims
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
