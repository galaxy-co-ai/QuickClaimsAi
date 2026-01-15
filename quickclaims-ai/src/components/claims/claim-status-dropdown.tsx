"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";
import { updateClaimStatus } from "@/actions/claims";
import type { ClaimStatus } from "@prisma/client";

// All possible statuses for flexible transitions
const ALL_STATUSES: ClaimStatus[] = [
  "new_supplement",
  "missing_info",
  "contractor_review",
  "supplement_in_progress",
  "supplement_sent",
  "awaiting_carrier_response",
  "reinspection_requested",
  "reinspection_scheduled",
  "approved",
  "final_invoice_pending",
  "final_invoice_sent",
  "completed",
  "closed_lost",
];

interface ClaimStatusDropdownProps {
  claimId: string;
  currentStatus: ClaimStatus;
}

export function ClaimStatusDropdown({
  claimId,
  currentStatus,
}: ClaimStatusDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Allow all status transitions (client requested full flexibility)
  const availableTransitions = ALL_STATUSES.filter((s) => s !== currentStatus);

  const handleStatusChange = (newStatus: ClaimStatus) => {
    setOpen(false);
    startTransition(async () => {
      try {
        await updateClaimStatus(claimId, newStatus);
        toast.success(`Status updated to ${CLAIM_STATUS_LABELS[newStatus]}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update status";
        toast.error(message);
      }
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <Button
          variant="outline"
          className={`gap-2 ${CLAIM_STATUS_COLORS[currentStatus]} border-0`}
          aria-label="Change claim status"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            CLAIM_STATUS_LABELS[currentStatus] || currentStatus
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-slate-500">
          Change Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTransitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            className="cursor-pointer"
          >
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${CLAIM_STATUS_COLORS[status]}`}
            >
              {CLAIM_STATUS_LABELS[status]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
