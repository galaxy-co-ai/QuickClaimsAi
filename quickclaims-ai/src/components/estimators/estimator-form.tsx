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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEstimator, updateEstimator } from "@/actions/estimators";

const estimatorFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  commissionPercentage: z.coerce
    .number()
    .min(0.01, "Commission must be at least 1%")
    .max(0.20, "Commission cannot exceed 20%"),
});

type EstimatorFormData = z.infer<typeof estimatorFormSchema>;

interface EstimatorFormProps {
  estimator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    commissionPercentage: number | string;
  };
}

export function EstimatorForm({ estimator }: EstimatorFormProps) {
  const router = useRouter();
  const isEditing = !!estimator;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EstimatorFormData>({
    resolver: zodResolver(estimatorFormSchema),
    defaultValues: estimator
      ? {
          firstName: estimator.firstName,
          lastName: estimator.lastName,
          email: estimator.email,
          phone: estimator.phone ?? undefined,
          commissionPercentage: Number(estimator.commissionPercentage),
        }
      : {
          commissionPercentage: 0.05, // Default 5%
        },
  });

  async function onSubmit(data: EstimatorFormData) {
    try {
      if (isEditing) {
        await updateEstimator(estimator.id, data);
        toast.success("Estimator updated successfully");
      } else {
        await createEstimator(data);
        toast.success("Estimator created successfully");
      }
      router.push("/dashboard/estimators");
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
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Smith"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
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
                placeholder="john@example.com"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Commission Percentage */}
          <div className="space-y-2">
            <Label htmlFor="commissionPercentage">
              Commission Percentage <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="commissionPercentage"
                type="number"
                step="0.001"
                min="0.01"
                max="0.20"
                placeholder="0.05"
                {...register("commissionPercentage", { valueAsNumber: true })}
                aria-invalid={!!errors.commissionPercentage}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                (e.g., 0.05 = 5%)
              </span>
            </div>
            {errors.commissionPercentage && (
              <p className="text-sm text-red-500">
                {errors.commissionPercentage.message}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Enter as decimal: 0.05 = 5%, 0.075 = 7.5%, 0.10 = 10%
            </p>
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
          {isEditing ? "Save Changes" : "Create Estimator"}
        </Button>
      </div>
    </form>
  );
}
