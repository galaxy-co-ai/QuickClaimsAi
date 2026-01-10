import Link from "next/link";
import { Plus, Users, Mail, Phone, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEstimators } from "@/actions/estimators";

export default async function EstimatorsPage() {
  const estimators = await getEstimators();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimators</h1>
          <p className="text-slate-600">
            Manage estimator profiles and commission rates
          </p>
        </div>
        <Link href="/dashboard/estimators/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Estimator
          </Button>
        </Link>
      </div>

      {/* Estimators Grid */}
      {estimators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No estimators yet
            </h3>
            <p className="text-slate-500 mb-4 text-center max-w-sm">
              Add your first estimator to start assigning claims and tracking commissions.
            </p>
            <Link href="/dashboard/estimators/new">
              <Button>Add First Estimator</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {estimators.map((estimator) => (
            <Link
              key={estimator.id}
              href={`/dashboard/estimators/${estimator.id}`}
            >
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {estimator.firstName} {estimator.lastName}
                      </CardTitle>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span className="truncate">{estimator.email}</span>
                    </div>
                    {estimator.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        <span>{estimator.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      <Percent className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      <span className="font-medium">
                        {(Number(estimator.commissionPercentage) * 100).toFixed(1)}%
                      </span>
                      <span className="text-slate-500">commission</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {estimator._count.claims} claims
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
