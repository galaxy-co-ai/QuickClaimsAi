"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Mail, Phone, UserCheck, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdjusterInfo = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
};

type CarrierWithAdjusters = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  adjusters: AdjusterInfo[];
  _count: {
    adjusters: number;
    claims: number;
  };
};

interface CarrierListItemProps {
  carrier: CarrierWithAdjusters;
}

const TYPE_COLORS: Record<string, string> = {
  desk: "bg-[var(--rr-color-info)]/10 text-[var(--rr-color-info)]",
  field: "bg-[var(--rr-color-success)]/10 text-[var(--rr-color-success)]",
  independent: "bg-[var(--rr-color-brand-accent)]/10 text-[var(--rr-color-brand-accent)]",
};

export function CarrierListItem({ carrier }: CarrierListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAdjusters = carrier._count.adjusters > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Carrier Row */}
      <div
        className="flex items-center justify-between p-3 hover:bg-[var(--rr-color-surface-hover)] cursor-pointer"
        onClick={() => hasAdjusters && setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${carrier.name}, ${carrier._count.adjusters} adjusters`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            hasAdjusters && setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Expand Toggle */}
          <button
            className={`p-1 rounded hover:bg-[var(--rr-color-sand)] ${!hasAdjusters && "invisible"}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? "Collapse adjusters" : "Expand adjusters"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--rr-color-stone)]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--rr-color-stone)]" />
            )}
          </button>

          {/* Carrier Info */}
          <div>
            <div className="font-medium text-[var(--rr-color-text-primary)]">{carrier.name}</div>
            <div className="flex items-center gap-3 text-sm text-[var(--rr-color-stone)]">
              {carrier.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {carrier.email}
                </span>
              )}
              {carrier.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {carrier.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--rr-color-stone)]">
            {carrier._count.adjusters} adjusters · {carrier._count.claims} claims
          </span>
          <Link
            href={`/dashboard/carriers/${carrier.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit carrier</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Expandable Adjusters List */}
      {expanded && hasAdjusters && (
        <div className="border-t bg-[var(--rr-color-sand-light)] p-3 pl-12 space-y-2">
          {carrier.adjusters.map((adjuster) => (
            <Link
              key={adjuster.id}
              href={`/dashboard/adjusters/${adjuster.id}`}
              className="flex items-center justify-between p-2 rounded hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-[var(--rr-color-stone)]" />
                <div>
                  <span className="font-medium text-sm text-[var(--rr-color-text-secondary)]">{adjuster.name}</span>
                  <div className="flex items-center gap-2 text-xs text-[var(--rr-color-stone)]">
                    {adjuster.email && <span>{adjuster.email}</span>}
                    {adjuster.phone && <span>{adjuster.phone}</span>}
                  </div>
                </div>
              </div>
              <Badge className={TYPE_COLORS[adjuster.type] || TYPE_COLORS.desk} variant="secondary">
                {adjuster.type}
              </Badge>
            </Link>
          ))}
          <Link
            href={`/dashboard/adjusters/new?carrierId=${carrier.id}`}
            className="inline-flex items-center gap-1 text-xs text-[var(--rr-color-brand-primary)] hover:underline mt-2"
          >
            + Add adjuster to {carrier.name}
          </Link>
        </div>
      )}
    </div>
  );
}
