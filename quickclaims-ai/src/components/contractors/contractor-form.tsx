"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractorInputSchema, type ContractorInput } from "@/lib/validations/contractor";
import { createContractor, updateContractor } from "@/actions/contractors";

interface ContractorFormProps {
  contractor?: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    billingPercentage: number | string;
    paymentTerms: string | null;
    notes: string | null;
  };
}

export function ContractorForm({ contractor }: ContractorFormProps) {
  const router = useRouter();
  const isEditing = !!contractor;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContractorInput>({
    resolver: zodResolver(contractorInputSchema),
    defaultValues: contractor
      ? {
          companyName: contractor.companyName,
          contactName: contractor.contactName ?? undefined,
          email: contractor.email,
          phone: contractor.phone ?? undefined,
          address: contractor.address ?? undefined,
          billingPercentage: Number(contractor.billingPercentage),
          paymentTerms: contractor.paymentTerms ?? undefined,
          notes: contractor.notes ?? undefined,
        }
      : {
          billingPercentage: 0.125, // Default 12.5%
        },
  });

  async function onSubmit(data: ContractorInput) {
    try {
      if (isEditing) {
        await updateContractor(contractor.id, data);
        toast.success("Contractor updated successfully");
      } else {
        await createContractor(data);
        toast.success("Contractor created successfully");
      }
      router.push("/dashboard/contractors");
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
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Renegade Roofing"
              {...register("companyName")}
              aria-invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              placeholder="John Smith"
              {...register("contactName")}
            />
          </div>

          {/* Email & Phone Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                {...register("email")}
                aria-invalid={!!errors.email}
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

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State ZIP"
              {...register("address")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Billing Percentage */}
          <div className="space-y-2">
            <Label htmlFor="billingPercentage">
              Billing Percentage <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="billingPercentage"
                type="number"
                step="0.001"
                min="0.05"
                max="0.20"
                placeholder="0.125"
                {...register("billingPercentage", { valueAsNumber: true })}
                aria-invalid={!!errors.billingPercentage}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                (e.g., 0.125 = 12.5%)
              </span>
            </div>
            {errors.billingPercentage && (
              <p className="text-sm text-red-500">{errors.billingPercentage.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Enter as decimal: 0.10 = 10%, 0.125 = 12.5%, 0.15 = 15%
            </p>
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              placeholder="Net 30"
              {...register("paymentTerms")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this contractor..."
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
          {isEditing ? "Save Changes" : "Create Contractor"}
        </Button>
      </div>
    </form>
  );
}
