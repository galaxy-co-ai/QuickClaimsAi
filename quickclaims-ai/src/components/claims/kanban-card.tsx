"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";
import { decimalToNumber } from "@/lib/calculations";
import { COMPLIANCE_WARNING_HOURS, COMPLIANCE_OVERDUE_HOURS } from "@/lib/constants";
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

interface KanbanCardProps {
  claim: Claim;
  isDragging?: boolean;
}

export function KanbanCard({ claim, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: claim.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate hours since last activity
  const hoursSinceActivity = useMemo(() => {
    const now = new Date();
    const lastActivity = new Date(claim.lastActivityAt);
    return (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  }, [claim.lastActivityAt]);

  // Determine compliance status
  const complianceStatus = useMemo(() => {
    if (hoursSinceActivity >= COMPLIANCE_OVERDUE_HOURS) {
      return "overdue";
    }
    if (hoursSinceActivity >= COMPLIANCE_WARNING_HOURS) {
      return "warning";
    }
    return "ok";
  }, [hoursSinceActivity]);

  const formatDaysInStatus = () => {
    const days = Math.floor(hoursSinceActivity / 24);
    const hours = Math.floor(hoursSinceActivity % 24);
    if (days === 0) {
      return hours + "h";
    }
    return days + "d " + hours + "h";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-[var(--rr-radius-lg)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] p-[var(--rr-space-3)] shadow-[var(--rr-shadow-sm)] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-[var(--rr-shadow-md)]",
        (isDragging || isSortableDragging) && "opacity-50 shadow-[var(--rr-shadow-lg)]",
        complianceStatus === "overdue" && "border-[var(--rr-color-error)]/30 bg-[var(--rr-color-error)]/5",
        complianceStatus === "warning" && "border-[var(--rr-color-warning)]/30 bg-[var(--rr-color-warning)]/5"
      )}
    >
      {/* Compliance Indicator */}
      <div className="flex items-center justify-between mb-[var(--rr-space-2)]">
        <Link
          href={"/dashboard/claims/" + claim.id}
          className="font-[var(--rr-font-weight-medium)] text-[var(--rr-color-text-primary)] hover:text-[var(--rr-color-brand-primary)] truncate flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          {claim.policyholderName}
        </Link>
        {complianceStatus === "overdue" && (
          <AlertCircle className="h-4 w-4 text-[var(--rr-color-error)] shrink-0" />
        )}
        {complianceStatus === "warning" && (
          <AlertTriangle className="h-4 w-4 text-[var(--rr-color-warning)] shrink-0" />
        )}
      </div>

      <div className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)] truncate">
        {claim.contractor.companyName}
      </div>

      <div className="flex items-center justify-between mt-[var(--rr-space-2)] text-[var(--rr-font-size-xs)]">
        <div className="flex items-center gap-[var(--rr-space-1)] text-[var(--rr-color-stone)]">
          <Clock className="h-3 w-3" />
          <span>{formatDaysInStatus()}</span>
        </div>
        <div className="font-[var(--rr-font-weight-bold)] text-[var(--rr-color-brand-primary)]">
          {"$" + decimalToNumber(claim.dollarPerSquare).toFixed(2)}/sq
        </div>
      </div>
    </div>
  );
}
