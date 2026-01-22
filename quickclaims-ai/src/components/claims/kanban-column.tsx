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
          "rounded-[var(--rr-radius-lg)] border-2 border-dashed p-[var(--rr-space-2)] min-h-[600px] transition-colors",
          isOver ? "border-[var(--rr-color-brand-primary)] bg-[var(--rr-color-brand-primary)]/5" : "border-[var(--rr-color-border-default)] bg-[var(--rr-color-sand-light)]"
        )}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-[var(--rr-space-3)] p-[var(--rr-space-2)]">
          <div className="flex items-center gap-[var(--rr-space-2)]">
            <span
              className={cn(
                "inline-flex items-center rounded-[var(--rr-radius-full)] px-[var(--rr-space-2)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)]",
                CLAIM_STATUS_COLORS[status]
              )}
            >
              {CLAIM_STATUS_LABELS[status]}
            </span>
          </div>
          <span className="text-[var(--rr-font-size-sm)] font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-secondary)]">
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
            <div className="py-[var(--rr-space-8)] text-center text-[var(--rr-font-size-sm)] text-[var(--rr-color-stone)]">
              No claims
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
