import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEstimator } from "@/actions/estimators";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from "@/lib/constants";

interface EstimatorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EstimatorDetailPage({
  params,
}: EstimatorDetailPageProps) {
  const { id } = await params;
  const estimator = await getEstimator(id);

  if (!estimator) {
    notFound();
  }

  // Calculate total commission earned
  const totalCommission = estimator.claims.reduce((sum, claim) => {
    return sum + Number(claim.totalIncrease) * Number(estimator.commissionPercentage);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/estimators">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {estimator.firstName} {estimator.lastName}
            </h1>
            <p className="text-slate-600">Estimator</p>
          </div>
        </div>
        <Link href={`/dashboard/estimators/${id}/edit`}>
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
              <Mail className="h-4 w-4 text-slate-400" />
              <a
                href={`mailto:${estimator.email}`}
                className="text-blue-600 hover:underline"
              >
                {estimator.email}
              </a>
            </div>
            {estimator.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a
                  href={`tel:${estimator.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {estimator.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Commission Rate</span>
              <span className="font-semibold text-lg">
                {(Number(estimator.commissionPercentage) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Recent Earnings</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalCommission)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Claims</span>
              <span className="font-semibold text-lg">
                {estimator._count.claims}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Status</span>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Claims</CardTitle>
          {estimator.claims.length > 0 && (
            <Link
              href={`/dashboard/claims?estimator=${id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {estimator.claims.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p>No claims yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {estimator.claims.map((claim) => {
                const commission =
                  Number(claim.totalIncrease) * Number(estimator.commissionPercentage);
                return (
                  <Link
                    key={claim.id}
                    href={`/dashboard/claims/${claim.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{claim.policyholderName}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(commission)}
                        </p>
                        <p className="text-xs text-slate-500">commission</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          CLAIM_STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {CLAIM_STATUS_LABELS[claim.status] || claim.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
