export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, UserCheck, Mail, Phone, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdjusters } from "@/actions/adjusters";

const TYPE_LABELS: Record<string, string> = {
  desk: "Desk",
  field: "Field",
  independent: "Independent",
};

const TYPE_COLORS: Record<string, string> = {
  desk: "bg-blue-100 text-blue-700",
  field: "bg-green-100 text-green-700",
  independent: "bg-purple-100 text-purple-700",
};

export default async function AdjustersPage() {
  const { adjusters } = await getAdjusters();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adjusters</h1>
          <p className="text-slate-600">
            Manage insurance adjusters by carrier
          </p>
        </div>
        <Link href="/dashboard/adjusters/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Adjuster
          </Button>
        </Link>
      </div>

      {/* Adjusters Grid */}
      {adjusters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No adjusters yet
            </h3>
            <p className="text-slate-500 mb-4 text-center max-w-sm">
              Add your first adjuster to track carrier contacts and improve your negotiation history.
            </p>
            <Link href="/dashboard/adjusters/new">
              <Button>Add First Adjuster</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adjusters.map((adjuster) => (
            <Link
              key={adjuster.id}
              href={`/dashboard/adjusters/${adjuster.id}`}
            >
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{adjuster.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          {adjuster.carrier.name}
                        </span>
                      </div>
                    </div>
                    <Badge className={TYPE_COLORS[adjuster.type] || TYPE_COLORS.desk}>
                      {TYPE_LABELS[adjuster.type] || adjuster.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {adjuster.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span className="truncate">{adjuster.email}</span>
                      </div>
                    )}
                    {adjuster.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>{adjuster.phone}</span>
                      </div>
                    )}
                    {!adjuster.email && !adjuster.phone && (
                      <p className="text-slate-400 italic">No contact info</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-slate-500">
                      {adjuster._count.claims} claims
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
