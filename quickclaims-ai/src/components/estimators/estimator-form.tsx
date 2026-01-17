"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimator, updateEstimator } from "@/actions/estimators";

// Shared rate validation
const rateSchema = z
  .number()
  .min(0, "Rate must be at least 0%")
  .max(0.5, "Rate cannot exceed 50%")
  .optional();

const flatFeeSchema = z
  .number()
  .min(0, "Fee must be positive")
  .max(10000, "Fee cannot exceed $10,000")
  .optional();

const estimatorFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  managerId: z.string().optional().nullable(),
  commissionPercentage: z
    .number()
    .min(0.01, "Commission must be at least 1%")
    .max(0.20, "Commission cannot exceed 20%"),
  residentialRate: rateSchema,
  commercialRate: rateSchema,
  reinspectionRate: rateSchema,
  estimateFlatFee: flatFeeSchema,
});

type EstimatorFormData = z.infer<typeof estimatorFormSchema>;

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EstimatorFormProps {
  estimator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    managerId: string | null;
    commissionPercentage: number | string;
    residentialRate: number | string | null;
    commercialRate: number | string | null;
    reinspectionRate: number | string | null;
    estimateFlatFee: number | string | null;
  };
  managers?: Manager[];
}

export function EstimatorForm({ estimator, managers = [] }: EstimatorFormProps) {
  const router = useRouter();
  const isEditing = !!estimator;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EstimatorFormData>({
    resolver: zodResolver(estimatorFormSchema),
    defaultValues: estimator
      ? {
          firstName: estimator.firstName,
          lastName: estimator.lastName,
          email: estimator.email,
          phone: estimator.phone ?? undefined,
          managerId: estimator.managerId ?? undefined,
          commissionPercentage: Number(estimator.commissionPercentage),
          residentialRate: estimator.residentialRate ? Number(estimator.residentialRate) : undefined,
          commercialRate: estimator.commercialRate ? Number(estimator.commercialRate) : undefined,
          reinspectionRate: estimator.reinspectionRate ? Number(estimator.reinspectionRate) : undefined,
          estimateFlatFee: estimator.estimateFlatFee ? Number(estimator.estimateFlatFee) : undefined,
        }
      : {
          commissionPercentage: 0.05, // Default 5%
          residentialRate: 0.05,
          commercialRate: 0.05,
          reinspectionRate: 0.05,
          estimateFlatFee: 40,
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

          {/* Manager Assignment */}
          {managers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="managerId">Assigned Manager</Label>
              <Controller
                name="managerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  >
                    <SelectTrigger id="managerId" className="w-full" aria-label="Select manager">
                      <SelectValue placeholder="Select a manager..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No manager assigned</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-slate-500">
                The manager who oversees this estimator
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            Set commission rates by job type. Enter as decimal (e.g., 0.05 = 5%).
          </p>
          
          {/* Rate Grid - 2x2 */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Residential Rate */}
            <div className="space-y-2">
              <Label htmlFor="residentialRate">
                Residential Supplement Rate
              </Label>
              <div className="relative">
                <Input
                  id="residentialRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="0.50"
                  placeholder="0.05"
                  {...register("residentialRate", { valueAsNumber: true })}
                  aria-invalid={!!errors.residentialRate}
                  aria-label="Residential supplement commission rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  %
                </span>
              </div>
              {errors.residentialRate && (
                <p className="text-sm text-red-500">
                  {errors.residentialRate.message}
                </p>
              )}
            </div>

            {/* Commercial Rate */}
            <div className="space-y-2">
              <Label htmlFor="commercialRate">
                Commercial Supplement Rate
              </Label>
              <div className="relative">
                <Input
                  id="commercialRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="0.50"
                  placeholder="0.05"
                  {...register("commercialRate", { valueAsNumber: true })}
                  aria-invalid={!!errors.commercialRate}
                  aria-label="Commercial supplement commission rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  %
                </span>
              </div>
              {errors.commercialRate && (
                <p className="text-sm text-red-500">
                  {errors.commercialRate.message}
                </p>
              )}
            </div>

            {/* Reinspection Rate */}
            <div className="space-y-2">
              <Label htmlFor="reinspectionRate">
                Reinspection Rate
              </Label>
              <div className="relative">
                <Input
                  id="reinspectionRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="0.50"
                  placeholder="0.05"
                  {...register("reinspectionRate", { valueAsNumber: true })}
                  aria-invalid={!!errors.reinspectionRate}
                  aria-label="Reinspection commission rate"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  %
                </span>
              </div>
              {errors.reinspectionRate && (
                <p className="text-sm text-red-500">
                  {errors.reinspectionRate.message}
                </p>
              )}
            </div>

            {/* Estimate Flat Fee */}
            <div className="space-y-2">
              <Label htmlFor="estimateFlatFee">
                Estimate Fee (Flat $)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="estimateFlatFee"
                  type="number"
                  step="1"
                  min="0"
                  max="10000"
                  placeholder="40"
                  className="pl-7"
                  {...register("estimateFlatFee", { valueAsNumber: true })}
                  aria-invalid={!!errors.estimateFlatFee}
                  aria-label="Estimate flat fee amount"
                />
              </div>
              {errors.estimateFlatFee && (
                <p className="text-sm text-red-500">
                  {errors.estimateFlatFee.message}
                </p>
              )}
            </div>
          </div>

          {/* Legacy Default Rate - hidden but still submitted */}
          <input
            type="hidden"
            {...register("commissionPercentage", { valueAsNumber: true })}
            value={0.05}
          />
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
