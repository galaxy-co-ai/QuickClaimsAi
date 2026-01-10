"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCarrier, updateCarrier } from "@/actions/carriers";

const carrierFormSchema = z.object({
  name: z.string().min(1, "Carrier name is required").max(200),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type CarrierFormData = z.infer<typeof carrierFormSchema>;

interface CarrierFormProps {
  carrier?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    notes: string | null;
  };
}

export function CarrierForm({ carrier }: CarrierFormProps) {
  const router = useRouter();
  const isEditing = !!carrier;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CarrierFormData>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: carrier
      ? {
          name: carrier.name,
          phone: carrier.phone ?? "",
          email: carrier.email ?? "",
          website: carrier.website ?? "",
          notes: carrier.notes ?? "",
        }
      : {},
  });

  async function onSubmit(data: CarrierFormData) {
    try {
      if (isEditing) {
        await updateCarrier(carrier.id, data);
        toast.success("Carrier updated successfully");
      } else {
        await createCarrier(data);
        toast.success("Carrier created successfully");
      }
      router.push("/dashboard/carriers");
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
          <CardTitle>Carrier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Carrier Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Carrier Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="State Farm"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="claims@carrier.com"
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
                placeholder="1-800-555-0100"
                {...register("phone")}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.carrier.com"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this carrier..."
              rows={3}
              {...register("notes")}
            />
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
          {isEditing ? "Save Changes" : "Create Carrier"}
        </Button>
      </div>
    </form>
  );
}
