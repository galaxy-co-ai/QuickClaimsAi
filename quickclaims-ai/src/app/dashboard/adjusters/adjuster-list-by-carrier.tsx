"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Shield, Mail, Phone, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdjusterInfo = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  carrier: { id: string; name: string };
  _count: { claims: number };
};

interface AdjusterListByCarrierProps {
  carrier: {
    id: string;
    name: string;
    adjusters: AdjusterInfo[];
  };
}

const TYPE_LABELS: Record<string, string> = {
  desk: "Desk",
  field: "Field",
  independent: "Independent",
};

const TYPE_COLORS: Record<string, string> = {
  desk: "bg-[var(--rr-color-info)]/10 text-[var(--rr-color-info)]",
  field: "bg-[var(--rr-color-success)]/10 text-[var(--rr-color-success)]",
  independent: "bg-[var(--rr-color-brand-accent)]/10 text-[var(--rr-color-brand-accent)]",
};

export function AdjusterListByCarrier({ carrier }: AdjusterListByCarrierProps) {
  const [expanded, setExpanded] = useState(true); // Start expanded

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Carrier Header */}
      <div
        className="flex items-center justify-between p-3 bg-[var(--rr-color-sand-light)] hover:bg-[var(--rr-color-sand)] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${carrier.name}, ${carrier.adjusters.length} adjusters`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="p-1 rounded hover:bg-[var(--rr-color-sand)]"
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
          <Shield className="h-5 w-5 text-[var(--rr-color-brand-primary)]" />
          <span className="font-medium text-[var(--rr-color-text-primary)]">{carrier.name}</span>
          <Badge variant="secondary" className="ml-2">
            {carrier.adjusters.length} adjuster(s)
          </Badge>
        </div>
        <Link
          href={`/dashboard/carriers/${carrier.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="sm">
            View Carrier
          </Button>
        </Link>
      </div>

      {/* Adjusters List */}
      {expanded && (
        <div className="divide-y">
          {carrier.adjusters.map((adjuster) => (
            <Link
              key={adjuster.id}
              href={`/dashboard/adjusters/${adjuster.id}`}
              className="flex items-center justify-between p-3 pl-12 hover:bg-[var(--rr-color-surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-[var(--rr-color-text-secondary)]">{adjuster.name}</div>
                  <div className="flex items-center gap-3 text-sm text-[var(--rr-color-stone)]">
                    {adjuster.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {adjuster.email}
                      </span>
                    )}
                    {adjuster.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {adjuster.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--rr-color-stone)]">
                  {adjuster._count.claims} claims
                </span>
                <Badge className={TYPE_COLORS[adjuster.type] || TYPE_COLORS.desk}>
                  {TYPE_LABELS[adjuster.type] || adjuster.type}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
          {/* Add adjuster link */}
          <div className="p-3 pl-12">
            <Link
              href={`/dashboard/adjusters/new?carrierId=${carrier.id}`}
              className="inline-flex items-center gap-1 text-sm text-[var(--rr-color-brand-primary)] hover:underline"
            >
              + Add adjuster to {carrier.name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
