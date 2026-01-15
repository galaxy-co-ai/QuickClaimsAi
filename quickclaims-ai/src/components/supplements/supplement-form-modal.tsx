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
});

type SupplementFormData = z.infer<typeof supplementFormSchema>;

interface SupplementFormModalProps {
  claimId: string;
  policyholderName: string;
}

export function SupplementFormModal({
  claimId,
  policyholderName,
}: SupplementFormModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplementFormData>({
    resolver: zodResolver(supplementFormSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      omApproved: false,
    },
  });

  async function onSubmit(data: SupplementFormData) {
    try {
      await createSupplement({
        claimId,
        amount: data.amount,
        description: data.description,
        omApproved: data.omApproved,
      });
      toast.success("Supplement created successfully");
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
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
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
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Line Items (formerly Description) */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Line Items <span className="text-red-500">*</span>
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
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* O&M Approved Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="omApproved"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              {...register("omApproved")}
              aria-label="O&M (Overhead & Margin) was approved"
            />
            <Label htmlFor="omApproved" className="text-sm font-normal cursor-pointer">
              O&M Approved (Overhead & Margin)
            </Label>
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
