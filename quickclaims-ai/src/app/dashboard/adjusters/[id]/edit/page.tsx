export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { AdjusterForm } from "@/components/adjusters/adjuster-form";
import { getAdjuster } from "@/actions/adjusters";
import { db } from "@/lib/db";

interface EditAdjusterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdjusterPage({ params }: EditAdjusterPageProps) {
  const { id } = await params;

  const [adjuster, carriers] = await Promise.all([
    getAdjuster(id),
    db.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!adjuster) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Adjuster</h1>
        <p className="text-slate-600">Update adjuster information for {adjuster.name}</p>
      </div>

      <AdjusterForm
        adjuster={{
          id: adjuster.id,
          name: adjuster.name,
          carrierId: adjuster.carrierId,
          email: adjuster.email,
          phone: adjuster.phone,
          type: adjuster.type,
        }}
        carriers={carriers}
      />
    </div>
  );
}
