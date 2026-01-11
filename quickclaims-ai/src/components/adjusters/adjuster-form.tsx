"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adjusterInputSchema, type AdjusterInput } from "@/lib/validations/adjuster";
import { createAdjuster, updateAdjuster } from "@/actions/adjusters";

interface AdjusterFormProps {
  adjuster?: {
    id: string;
    name: string;
    carrierId: string;
    email: string | null;
    phone: string | null;
    type: string;
  };
  carriers: { id: string; name: string }[];
  defaultCarrierId?: string;
}

export function AdjusterForm({ adjuster, carriers, defaultCarrierId }: AdjusterFormProps) {
  const router = useRouter();
  const isEditing = !!adjuster;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdjusterInput>({
    resolver: zodResolver(adjusterInputSchema),
    defaultValues: adjuster
      ? {
          name: adjuster.name,
          carrierId: adjuster.carrierId,
          email: adjuster.email ?? "",
          phone: adjuster.phone ?? "",
          type: adjuster.type as AdjusterInput["type"],
        }
      : {
          carrierId: defaultCarrierId ?? "",
          type: "desk",
        },
  });

  async function onSubmit(data: AdjusterInput) {
    try {
      if (isEditing) {
        await updateAdjuster(adjuster.id, data);
        toast.success("Adjuster updated successfully");
      } else {
        await createAdjuster(data);
        toast.success("Adjuster created successfully");
      }
      router.push("/dashboard/adjusters");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adjuster Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Carrier */}
          <div className="space-y-2">
            <Label htmlFor="carrierId">
              Insurance Carrier <span className="text-red-500">*</span>
            </Label>
            <select
              id="carrierId"
              {...register("carrierId")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200"
              aria-invalid={!!errors.carrierId}
            >
              <option value="">Select carrier...</option>
              {carriers.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </option>
              ))}
            </select>
            {errors.carrierId && (
              <p className="text-sm text-red-500">{errors.carrierId.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Adjuster Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Adjuster Type</Label>
            <select
              id="type"
              {...register("type")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200"
            >
              <option value="desk">Desk Adjuster</option>
              <option value="field">Field Adjuster</option>
              <option value="independent">Independent Adjuster</option>
            </select>
          </div>

          {/* Email & Phone Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="adjuster@insurance.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                {...register("phone")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Adjuster"}
        </Button>
      </div>
    </form>
  );
}
