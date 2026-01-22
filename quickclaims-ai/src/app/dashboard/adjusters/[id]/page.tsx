export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdjuster, getAdjusterStats } from "@/actions/adjusters";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";

const TYPE_LABELS: Record<string, string> = {
  desk: "Desk Adjuster",
  field: "Field Adjuster",
  independent: "Independent Adjuster",
};

interface AdjusterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdjusterDetailPage({
  params,
}: AdjusterDetailPageProps) {
  const { id } = await params;

  const [adjuster, stats] = await Promise.all([
    getAdjuster(id),
    getAdjusterStats(id),
  ]);

  if (!adjuster) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/adjusters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">
              {adjuster.name}
            </h1>
            <p className="text-[var(--rr-color-text-secondary)]">
              {TYPE_LABELS[adjuster.type] || adjuster.type}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/adjusters/${id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-[var(--rr-color-stone)]" />
              <Link
                href={`/dashboard/carriers/${adjuster.carrier.id}`}
                className="text-[var(--rr-color-brand-primary)] hover:underline"
              >
                {adjuster.carrier.name}
              </Link>
            </div>
            {adjuster.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[var(--rr-color-stone)]" />
                <a
                  href={`mailto:${adjuster.email}`}
                  className="text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {adjuster.email}
                </a>
              </div>
            )}
            {adjuster.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[var(--rr-color-stone)]" />
                <a
                  href={`tel:${adjuster.phone}`}
                  className="text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {adjuster.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Total Claims</span>
              <span className="font-semibold text-lg">
                {adjuster._count.claims}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Avg Increase</span>
              <span className="font-semibold text-lg text-[var(--rr-color-success)]">
                {formatCurrency(stats.avgIncrease)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Avg $/Square</span>
              <span className="font-semibold text-lg">
                {formatCurrency(stats.avgDollarPerSquare)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Active</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Type</span>
              <span className="font-medium">
                {TYPE_LABELS[adjuster.type] || adjuster.type}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Claims</CardTitle>
          {adjuster.claims.length > 0 && (
            <Link
              href={`/dashboard/claims?adjuster=${id}`}
              className="text-sm text-[var(--rr-color-brand-primary)] hover:underline"
            >
              View all →
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {adjuster.claims.length === 0 ? (
            <div className="text-center py-8 text-[var(--rr-color-stone)]">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--rr-color-stone)]" />
              <p>No claims yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adjuster.claims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/dashboard/claims/${claim.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-[var(--rr-color-surface-hover)] transition-colors"
                >
                  <div>
                    <p className="font-medium">{claim.policyholderName}</p>
                    <p className="text-sm text-[var(--rr-color-stone)]">
                      {formatDate(claim.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[var(--rr-color-success)]">
                      {formatCurrency(Number(claim.totalIncrease))}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        CLAIM_STATUS_COLORS[claim.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {CLAIM_STATUS_LABELS[claim.status] || claim.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
