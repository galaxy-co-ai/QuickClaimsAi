"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createSupplement } from "@/actions/supplements";

// Form-specific schema that uses valueAsNumber pattern
const supplementFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Line items description is required"),
  omApproved: z.boolean(),
  // Increase breakdown for price per square calculation
  roofingIncrease: z.number().nonnegative().optional(),
  nonRoofingIncrease: z.number().nonnegative().optional(),
  // Roof squares for reinspection detection
  previousRoofSquares: z.number().nonnegative().optional(),
  newRoofSquares: z.number().nonnegative().optional(),
});

type SupplementFormData = z.infer<typeof supplementFormSchema>;

interface SupplementFormModalProps {
  claimId: string;
  policyholderName: string;
  // Current claim's roof squares (to pre-populate previous)
  currentRoofSquares?: number;
}

export function SupplementFormModal({
  claimId,
  policyholderName,
  currentRoofSquares,
}: SupplementFormModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplementFormData>({
    resolver: zodResolver(supplementFormSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      omApproved: false,
      roofingIncrease: undefined,
      nonRoofingIncrease: undefined,
      previousRoofSquares: currentRoofSquares,
      newRoofSquares: undefined,
    },
  });

  // Watch for roof squares changes to show reinspection indicator
  const previousSquares = watch("previousRoofSquares");
  const newSquares = watch("newRoofSquares");
  const isReinspection = newSquares !== undefined && previousSquares !== undefined && newSquares > previousSquares;

  async function onSubmit(data: SupplementFormData) {
    try {
      await createSupplement({
        claimId,
        amount: data.amount,
        description: data.description,
        omApproved: data.omApproved,
        roofingIncrease: data.roofingIncrease,
        nonRoofingIncrease: data.nonRoofingIncrease,
        previousRoofSquares: data.previousRoofSquares,
        newRoofSquares: data.newRoofSquares,
      });
      const message = isReinspection 
        ? "Reinspection supplement created (roof squares increased)"
        : "Supplement created successfully";
      toast.success(message);
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create supplement. Please try again.");
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supplement</DialogTitle>
          <DialogDescription>
            Create a new supplement for {policyholderName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-[var(--rr-color-error)]">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--rr-color-text-secondary)]">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-7"
                {...register("amount", { valueAsNumber: true })}
                aria-invalid={!!errors.amount}
              />
            </div>
            {errors.amount && (
              <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-error)]">{errors.amount.message}</p>
            )}
          </div>

          {/* Line Items (formerly Description) */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Line Items <span className="text-[var(--rr-color-error)]">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter line items for this supplement..."
              rows={3}
              {...register("description")}
              aria-invalid={!!errors.description}
              aria-label="Line items description"
            />
            {errors.description && (
              <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-error)]">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* O&P Approved Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="omApproved"
              className="h-4 w-4 rounded border-[var(--rr-color-border-default)] text-[var(--rr-color-brand-primary)] focus:ring-[var(--rr-color-brand-primary)]"
              {...register("omApproved")}
              aria-label="O&P (Overhead & Profit) was approved"
            />
            <Label htmlFor="omApproved" className="text-sm font-normal cursor-pointer">
              O&P Approved (Overhead & Profit)
            </Label>
          </div>

          {/* Increase Breakdown Section */}
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-[var(--rr-color-text-secondary)] mb-3">
              Increase Breakdown (for price per square calculation)
            </p>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roofingIncrease">Roofing Increase</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--rr-color-text-secondary)]">
                    $
                  </span>
                  <Input
                    id="roofingIncrease"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    {...register("roofingIncrease", { valueAsNumber: true })}
                    aria-label="Roofing-related increase amount"
                  />
                </div>
                <p className="text-xs text-[var(--rr-color-text-secondary)]">Roof-related items only</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nonRoofingIncrease">Non-Roofing Increase</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--rr-color-text-secondary)]">
                    $
                  </span>
                  <Input
                    id="nonRoofingIncrease"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    {...register("nonRoofingIncrease", { valueAsNumber: true })}
                    aria-label="Non-roofing increase amount"
                  />
                </div>
                <p className="text-xs text-[var(--rr-color-text-secondary)]">Siding, gutters, etc.</p>
              </div>
            </div>
          </div>

          {/* Roof Squares Section */}
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-[var(--rr-color-text-secondary)] mb-3">
              Roof Squares (optional - enter if squares changed)
            </p>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="previousRoofSquares">Previous Squares</Label>
                <Input
                  id="previousRoofSquares"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 25.5"
                  {...register("previousRoofSquares", { valueAsNumber: true })}
                  aria-label="Previous roof squares from original scope"
                />
                <p className="text-xs text-[var(--rr-color-text-secondary)]">From original scope</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRoofSquares">New Squares</Label>
                <Input
                  id="newRoofSquares"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 28.0"
                  {...register("newRoofSquares", { valueAsNumber: true })}
                  aria-label="New roof squares after reinspection"
                />
                <p className="text-xs text-[var(--rr-color-text-secondary)]">After reinspection</p>
              </div>
            </div>
            {isReinspection && (
              <div className="mt-[var(--rr-space-3)] p-[var(--rr-space-2)] bg-[var(--rr-color-warning)]/10 border border-[var(--rr-color-warning)]/20 rounded-[var(--rr-radius-lg)]">
                <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-warning)] font-[var(--rr-font-weight-medium)]">
                  Reinspection Detected: Squares increased from {previousSquares} to {newSquares}
                </p>
                <p className="text-[var(--rr-font-size-xs)] text-[var(--rr-color-warning)]/80 mt-[var(--rr-space-1)]">
                  This supplement will use reinspection commission rates (5% contractor, 1% estimator)
                </p>
              </div>
            )}
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Supplement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
