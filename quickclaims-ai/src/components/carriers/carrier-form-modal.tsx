"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCarrier } from "@/actions/carriers";

const carrierFormSchema = z.object({
  name: z.string().min(1, "Carrier name is required").max(200),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type CarrierFormData = z.infer<typeof carrierFormSchema>;

interface CarrierFormModalProps {
  onCarrierCreated: (carrier: { id: string; name: string }) => void;
}

export function CarrierFormModal({ onCarrierCreated }: CarrierFormModalProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarrierFormData>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      website: "",
      notes: "",
    },
  });

  async function onSubmit(data: CarrierFormData) {
    try {
      const result = await createCarrier(data);
      if (result.success && result.carrier) {
        toast.success("Carrier created successfully");
        onCarrierCreated({ id: result.carrier.id, name: result.carrier.name });
        reset();
        setOpen(false);
      }
    } catch (error) {
      toast.error("Failed to create carrier. Please try again.");
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-[var(--rr-color-brand-primary)] hover:text-[var(--rr-color-brand-primary)] hover:underline"
          aria-label="Add new carrier"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Add New
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Carrier</DialogTitle>
          <DialogDescription>
            Create a new insurance carrier to associate with this claim
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Carrier Name */}
          <div className="space-y-2">
            <Label htmlFor="carrier-name">
              Carrier Name <span className="text-[var(--rr-color-error)]">*</span>
            </Label>
            <Input
              id="carrier-name"
              placeholder="State Farm"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-[var(--rr-color-error)]">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone Row */}
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="carrier-email">Email</Label>
              <Input
                id="carrier-email"
                type="email"
                placeholder="claims@carrier.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[var(--rr-color-error)]">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier-phone">Phone</Label>
              <Input
                id="carrier-phone"
                type="tel"
                placeholder="1-800-555-0100"
                {...register("phone")}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="carrier-website">Website</Label>
            <Input
              id="carrier-website"
              type="url"
              placeholder="https://www.carrier.com"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-[var(--rr-color-error)]">{errors.website.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="carrier-notes">Notes</Label>
            <Textarea
              id="carrier-notes"
              placeholder="Additional notes about this carrier..."
              rows={2}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Create Carrier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
