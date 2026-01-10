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
  "new_supplement",
  "missing_info",
  "supplement_in_progress",
  "contractor_review",
  "supplement_sent",
  "awaiting_carrier_response",
  "reinspection_requested",
  "reinspection_scheduled",
  "approved",
  "final_invoice_pending",
  "final_invoice_sent",
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
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
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
