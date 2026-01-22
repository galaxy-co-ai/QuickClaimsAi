export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Shield, Mail, Phone, Users, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCarriers } from "@/actions/carriers";
import { CarrierListItem } from "./carrier-list-item";

export default async function CarriersPage() {
  const carriers = await getCarriers();

  // Group carriers alphabetically
  const groupedCarriers: Record<string, typeof carriers> = {};
  for (const carrier of carriers) {
    const firstLetter = carrier.name.charAt(0).toUpperCase();
    if (!groupedCarriers[firstLetter]) {
      groupedCarriers[firstLetter] = [];
    }
    groupedCarriers[firstLetter].push(carrier);
  }

  // Sort letters
  const sortedLetters = Object.keys(groupedCarriers).sort();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--rr-color-text-primary)]">Insurance Carriers</h1>
          <p className="text-[var(--rr-color-text-secondary)]">
            Manage insurance carrier profiles and adjusters (alphabetical list)
          </p>
        </div>
        <Link href="/dashboard/carriers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Carrier
          </Button>
        </Link>
      </div>

      {/* Carriers List */}
      {carriers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-[var(--rr-color-stone)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--rr-color-text-primary)] mb-2">
              No carriers yet
            </h3>
            <p className="text-[var(--rr-color-stone)] mb-4 text-center max-w-sm">
              Add insurance carriers to associate with claims and track adjusters.
            </p>
            <Link href="/dashboard/carriers/new">
              <Button>Add First Carrier</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--rr-color-brand-primary)]" />
              {carriers.length} Carrier(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedLetters.map((letter) => (
              <div key={letter} className="space-y-2">
                {/* Letter Header */}
                <div className="sticky top-0 bg-white z-10 py-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--rr-color-sand)] text-sm font-bold text-[var(--rr-color-text-secondary)]">
                    {letter}
                  </span>
                </div>
                {/* Carriers in this letter */}
                <div className="space-y-1 pl-2">
                  {groupedCarriers[letter].map((carrier) => (
                    <CarrierListItem key={carrier.id} carrier={carrier} />
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
