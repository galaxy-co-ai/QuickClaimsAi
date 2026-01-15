export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, UserCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdjusters } from "@/actions/adjusters";
import { AdjusterListByCarrier } from "./adjuster-list-by-carrier";

export default async function AdjustersPage() {
  const { adjusters } = await getAdjusters();

  // Group adjusters by carrier alphabetically
  const carrierMap: Map<string, { id: string; name: string; adjusters: typeof adjusters }> = new Map();
  
  for (const adjuster of adjusters) {
    const carrierId = adjuster.carrier.id;
    const carrierName = adjuster.carrier.name;
    
    if (!carrierMap.has(carrierId)) {
      carrierMap.set(carrierId, { id: carrierId, name: carrierName, adjusters: [] });
    }
    carrierMap.get(carrierId)!.adjusters.push(adjuster);
  }

  // Sort carriers alphabetically
  const sortedCarriers = Array.from(carrierMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Group by first letter
  const groupedByLetter: Record<string, typeof sortedCarriers> = {};
  for (const carrier of sortedCarriers) {
    const firstLetter = carrier.name.charAt(0).toUpperCase();
    if (!groupedByLetter[firstLetter]) {
      groupedByLetter[firstLetter] = [];
    }
    groupedByLetter[firstLetter].push(carrier);
  }

  const sortedLetters = Object.keys(groupedByLetter).sort();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adjusters</h1>
          <p className="text-slate-600">
            Manage insurance adjusters grouped by carrier
          </p>
        </div>
        <Link href="/dashboard/adjusters/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Adjuster
          </Button>
        </Link>
      </div>

      {/* Adjusters List */}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              {adjusters.length} Adjuster(s) across {sortedCarriers.length} Carrier(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sortedLetters.map((letter) => (
              <div key={letter} className="space-y-3">
                {/* Letter Header */}
                <div className="sticky top-0 bg-white z-10 py-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {letter}
                  </span>
                </div>
                {/* Carriers in this letter */}
                <div className="space-y-2 pl-2">
                  {groupedByLetter[letter].map((carrier) => (
                    <AdjusterListByCarrier 
                      key={carrier.id} 
                      carrier={carrier}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
