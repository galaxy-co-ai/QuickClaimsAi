import Link from "next/link";
import { Plus, Building2, Mail, Phone, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getContractors } from "@/actions/contractors";
import { formatCurrency } from "@/lib/utils";

export default async function ContractorsPage() {
  const contractors = await getContractors();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contractors</h1>
          <p className="text-slate-600">
            Manage contractor profiles and billing rates
          </p>
        </div>
        <Link href="/dashboard/contractors/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Contractor
          </Button>
        </Link>
      </div>

      {/* Contractors Grid */}
      {contractors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No contractors yet
            </h3>
            <p className="text-slate-500 mb-4 text-center max-w-sm">
              Add your first contractor to start creating claims and tracking billing.
            </p>
            <Link href="/dashboard/contractors/new">
              <Button>Add First Contractor</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contractors.map((contractor) => (
            <Link
              key={contractor.id}
              href={`/dashboard/contractors/${contractor.id}`}
            >
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {contractor.companyName}
                      </CardTitle>
                      {contractor.contactName && (
                        <p className="text-sm text-slate-500 mt-1">
                          {contractor.contactName}
                        </p>
                      )}
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span className="truncate">{contractor.email}</span>
                    </div>
                    {contractor.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>{contractor.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      <Percent className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <span className="font-medium">
                        {(Number(contractor.billingPercentage) * 100).toFixed(1)}%
                      </span>
                      <span className="text-slate-500">billing</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {contractor._count.claims} claims
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
