import Link from "next/link";
import { Plus, Shield, Mail, Phone, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarriers } from "@/actions/carriers";

export default async function CarriersPage() {
  const carriers = await getCarriers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insurance Carriers</h1>
          <p className="text-slate-600">
            Manage insurance carrier profiles and adjusters
          </p>
        </div>
        <Link href="/dashboard/carriers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Carrier
          </Button>
        </Link>
      </div>

      {/* Carriers Grid */}
      {carriers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No carriers yet
            </h3>
            <p className="text-slate-500 mb-4 text-center max-w-sm">
              Add insurance carriers to associate with claims and track adjusters.
            </p>
            <Link href="/dashboard/carriers/new">
              <Button>Add First Carrier</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {carriers.map((carrier) => (
            <Link key={carrier.id} href={`/dashboard/carriers/${carrier.id}`}>
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{carrier.name}</CardTitle>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {carrier.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span className="truncate">{carrier.email}</span>
                      </div>
                    )}
                    {carrier.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>{carrier.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <span className="font-medium">
                        {carrier._count.adjusters}
                      </span>
                      <span className="text-slate-500">adjusters</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {carrier._count.claims} claims
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
