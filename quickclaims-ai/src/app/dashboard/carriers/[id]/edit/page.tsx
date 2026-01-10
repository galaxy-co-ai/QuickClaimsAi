import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarrierForm } from "@/components/carriers/carrier-form";
import { getCarrier } from "@/actions/carriers";

interface EditCarrierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarrierPage({ params }: EditCarrierPageProps) {
  const { id } = await params;
  const carrier = await getCarrier(id);

  if (!carrier) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/carriers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Carrier</h1>
          <p className="text-slate-600">{carrier.name}</p>
        </div>
      </div>

      <CarrierForm
        carrier={{
          id: carrier.id,
          name: carrier.name,
          phone: carrier.phone,
          email: carrier.email,
          website: carrier.website,
          notes: carrier.notes,
        }}
      />
    </div>
  );
}
