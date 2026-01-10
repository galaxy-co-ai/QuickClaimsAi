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
} from "@/components/ui/dropdown-menu";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS, STATUS_TRANSITIONS } from "@/lib/constants";
import { updateClaimStatus } from "@/actions/claims";
import type { ClaimStatus } from "@prisma/client";

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

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  const isTerminal = availableTransitions.length === 0;

  const handleStatusChange = (newStatus: ClaimStatus) => {
    setOpen(false);
    startTransition(async () => {
      try {
        await updateClaimStatus(claimId, newStatus);
        toast.success(`Status updated to ${CLAIM_STATUS_LABELS[newStatus]}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update status";
        toast.error(message);
        console.error(error);
      }
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={isTerminal || isPending}>
        <Button
          variant="outline"
          className={`gap-2 ${CLAIM_STATUS_COLORS[currentStatus]} border-0`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            CLAIM_STATUS_LABELS[currentStatus] || currentStatus
          )}
          {!isTerminal && <ChevronDown className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {availableTransitions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status as ClaimStatus)}
            className="cursor-pointer"
          >
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${CLAIM_STATUS_COLORS[status]}`}
            >
              {CLAIM_STATUS_LABELS[status]}
            </span>
          </DropdownMenuItem>
        ))}
        {availableTransitions.length === 0 && (
          <DropdownMenuItem disabled>No transitions available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
