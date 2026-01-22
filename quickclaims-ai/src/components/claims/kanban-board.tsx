"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CLAIM_STATUS_LABELS, STATUS_TRANSITIONS } from "@/lib/constants";
import { updateClaimStatus } from "@/actions/claims";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
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

interface KanbanBoardProps {
  initialClaims: Claim[];
}

// Active statuses for Kanban (exclude terminal states)
const KANBAN_STATUSES: ClaimStatus[] = [
  "missing_info",
  "contractor_review",
  "supplement_sent",
  "supplement_received",
  "counterargument_submitted",
  "escalated",
  "contractor_advance",
  "waiting_on_build",
  "line_items_confirmed",
  "rebuttal_posted",
  "final_invoice_sent",
  "final_invoice_received",
  "money_released",
];

export function KanbanBoard({ initialClaims }: KanbanBoardProps) {
  const [claims, setClaims] = useState(initialClaims);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group claims by status
  const claimsByStatus = useMemo(() => {
    const grouped: Record<ClaimStatus, Claim[]> = {} as Record<ClaimStatus, Claim[]>;
    KANBAN_STATUSES.forEach((status) => {
      grouped[status] = [];
    });
    claims.forEach((claim) => {
      if (grouped[claim.status]) {
        grouped[claim.status].push(claim);
      }
    });
    return grouped;
  }, [claims]);

  const activeClaim = activeId
    ? claims.find((c) => c.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setError(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const claimId = active.id as string;
    const newStatus = over.id as ClaimStatus;

    const claim = claims.find((c) => c.id === claimId);
    if (!claim || claim.status === newStatus) return;

    // Check if transition is valid
    const validTransitions = STATUS_TRANSITIONS[claim.status] || [];
    if (!validTransitions.includes(newStatus)) {
      setError(
        `Cannot move from "${CLAIM_STATUS_LABELS[claim.status]}" to "${CLAIM_STATUS_LABELS[newStatus]}"`
      );
      return;
    }

    // Optimistically update UI
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId ? { ...c, status: newStatus } : c
      )
    );

    try {
      await updateClaimStatus(claimId, newStatus);
    } catch (err) {
      // Revert on error
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: claim.status } : c
        )
      );
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[var(--rr-radius-lg)] bg-[var(--rr-color-error)]/10 border border-[var(--rr-color-error)]/20 p-[var(--rr-space-3)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-error)]">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-[var(--rr-space-4)] overflow-x-auto pb-[var(--rr-space-4)]">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              claims={claimsByStatus[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeClaim ? (
            <KanbanCard claim={activeClaim} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
