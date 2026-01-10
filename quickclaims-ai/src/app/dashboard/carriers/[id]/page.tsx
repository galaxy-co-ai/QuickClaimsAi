export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail, Phone, Globe, Users, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarrier } from "@/actions/carriers";

interface CarrierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarrierDetailPage({
  params,
}: CarrierDetailPageProps) {
  const { id } = await params;
  const carrier = await getCarrier(id);

  if (!carrier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/carriers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{carrier.name}</h1>
            <p className="text-slate-600">Insurance Carrier</p>
          </div>
        </div>
        <Link href={`/dashboard/carriers/${id}/edit`}>
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
            {carrier.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <a
                  href={`mailto:${carrier.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {carrier.email}
                </a>
              </div>
            )}
            {carrier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <a
                  href={`tel:${carrier.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {carrier.phone}
                </a>
              </div>
            )}
            {carrier.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <a
                  href={carrier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {carrier.website}
                </a>
              </div>
            )}
            {!carrier.email && !carrier.phone && !carrier.website && (
              <p className="text-slate-500 text-sm">No contact info added</p>
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
              <span className="text-slate-600">Total Claims</span>
              <span className="font-semibold text-lg">
                {carrier._count.claims}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Adjusters</span>
              <span className="font-semibold text-lg">
                {carrier._count.adjusters}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success" className="text-sm">Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {carrier.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">{carrier.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Adjusters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Adjusters</CardTitle>
          <Link href={`/dashboard/carriers/${id}/adjusters/new`}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Adjuster
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {carrier.adjusters.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p>No adjusters yet</p>
              <p className="text-sm">Add adjusters to track claim contacts</p>
            </div>
          ) : (
            <div className="divide-y">
              {carrier.adjusters.map((adjuster) => (
                <div
                  key={adjuster.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{adjuster.name}</p>
                    <p className="text-sm text-slate-500">
                      {adjuster.type === "desk"
                        ? "Desk Adjuster"
                        : adjuster.type === "field"
                        ? "Field Adjuster"
                        : "Independent Adjuster"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {adjuster.email && (
                      <a
                        href={`mailto:${adjuster.email}`}
                        className="hover:text-blue-600"
                      >
                        {adjuster.email}
                      </a>
                    )}
                    {adjuster.phone && (
                      <a
                        href={`tel:${adjuster.phone}`}
                        className="hover:text-blue-600"
                      >
                        {adjuster.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
