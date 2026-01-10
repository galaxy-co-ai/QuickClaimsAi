export const dynamic = "force-dynamic";

import { AdjusterForm } from "@/components/adjusters/adjuster-form";
import { db } from "@/lib/db";

interface NewAdjusterPageProps {
  searchParams: Promise<{ carrier?: string }>;
}

export default async function NewAdjusterPage({ searchParams }: NewAdjusterPageProps) {
  const params = await searchParams;

  const carriers = await db.carrier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Adjuster</h1>
        <p className="text-slate-600">
          Create a new adjuster profile linked to a carrier
        </p>
      </div>

      <AdjusterForm carriers={carriers} defaultCarrierId={params.carrier} />
    </div>
  );
}
