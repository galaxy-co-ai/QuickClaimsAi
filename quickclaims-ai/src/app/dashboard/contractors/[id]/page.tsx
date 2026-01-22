export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getContractor } from "@/actions/contractors";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";

interface ContractorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractorDetailPage({
  params,
}: ContractorDetailPageProps) {
  const { id } = await params;
  const contractor = await getContractor(id);

  if (!contractor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contractors">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">
              {contractor.companyName}
            </h1>
            {contractor.contactName && (
              <p className="text-[var(--rr-color-text-secondary)]">{contractor.contactName}</p>
            )}
          </div>
        </div>
        <Link href={`/dashboard/contractors/${id}/edit`}>
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
              <Mail className="h-4 w-4 text-[var(--rr-color-stone)]" />
              <a
                href={`mailto:${contractor.email}`}
                className="text-[var(--rr-color-brand-primary)] hover:underline"
              >
                {contractor.email}
              </a>
            </div>
            {contractor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[var(--rr-color-stone)]" />
                <a
                  href={`tel:${contractor.phone}`}
                  className="text-[var(--rr-color-brand-primary)] hover:underline"
                >
                  {contractor.phone}
                </a>
              </div>
            )}
            {contractor.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[var(--rr-color-stone)] mt-0.5" />
                <span className="text-[var(--rr-color-text-secondary)]">{contractor.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Billing Rate</span>
              <span className="font-semibold text-lg">
                {(Number(contractor.billingPercentage) * 100).toFixed(1)}%
              </span>
            </div>
            {contractor.paymentTerms && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--rr-color-text-secondary)]">Payment Terms</span>
                <span className="font-medium">{contractor.paymentTerms}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Total Claims</span>
              <span className="font-semibold text-lg">
                {contractor._count.claims}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--rr-color-text-secondary)]">Status</span>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {contractor.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--rr-color-text-secondary)] whitespace-pre-wrap">{contractor.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Claims</CardTitle>
          {contractor.claims.length > 0 && (
            <Link
              href={`/dashboard/claims?contractor=${id}`}
              className="text-sm text-[var(--rr-color-brand-primary)] hover:underline"
            >
              View all →
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {contractor.claims.length === 0 ? (
            <div className="text-center py-8 text-[var(--rr-color-stone)]">
              <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--rr-color-stone)]" />
              <p>No claims yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contractor.claims.map((claim) => (
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
                        CLAIM_STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-800"
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
