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
import { ScopeUpload } from "@/components/claims/scope-upload";
import { claimInputSchema, type ClaimInput } from "@/lib/validations/claim";
import { createClaim, updateClaim } from "@/actions/claims";
import { US_STATES, LOSS_TYPE_LABELS } from "@/lib/constants";
import type { ExtractedScopeData } from "@/actions/scope-parser";
import type { AdjusterType } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

interface ClaimFormProps {
  claim?: {
    id: string;
    policyholderName: string;
    policyholderEmail: string | null;
    policyholderPhone: string | null;
    policyholderWorkPhone: string | null;
    policyholderFax: string | null;
    lossAddress: string;
    lossAddressLine2: string | null;
    lossCity: string;
    lossState: string;
    lossZip: string;
    claimNumber: string | null;
    policyNumber: string | null;
    dateOfLoss: Date | null;
    lossType: string | null;
    contractorId: string;
    estimatorId: string;
    carrierId: string;
    adjusterId: string | null;
    adjusterNameOverride: string | null;
    adjusterPhoneOverride: string | null;
    adjusterEmailOverride: string | null;
    supervisorName: string | null;
    supervisorPhone: string | null;
    contractorCrmId: string | null;
    externalJobNumber: string | null;
    jobType: string;
    totalSquares: number | string | Decimal;
    roofRCV: number | string | Decimal;
    initialRCV: number | string | Decimal;
    dollarPerSquare: number | string | Decimal;
    finalRoofRCV: number | string | Decimal | null;
    finalTotalRCV: number | string | Decimal | null;
    finalDollarPerSquare: number | string | Decimal | null;
    moneyReleasedAmount: number | string | Decimal | null;
  };
  contractors: { id: string; companyName: string }[];
  estimators: { id: string; firstName: string; lastName: string }[];
  carriers: { id: string; name: string }[];
  adjusters: { id: string; name: string; carrierId: string; type: AdjusterType }[];
}

export function ClaimForm({
  claim,
  contractors,
  estimators,
  carriers,
  adjusters,
}: ClaimFormProps) {
  const router = useRouter();
  const isEditing = !!claim;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimInputSchema),
    defaultValues: claim
      ? {
          policyholderName: claim.policyholderName,
          policyholderEmail: claim.policyholderEmail ?? "",
          policyholderPhone: claim.policyholderPhone ?? "",
          policyholderWorkPhone: claim.policyholderWorkPhone ?? "",
          policyholderFax: claim.policyholderFax ?? "",
          lossAddress: claim.lossAddress,
          lossAddressLine2: claim.lossAddressLine2 ?? "",
          lossCity: claim.lossCity,
          lossState: claim.lossState,
          lossZip: claim.lossZip,
          claimNumber: claim.claimNumber ?? "",
          policyNumber: claim.policyNumber ?? "",
          dateOfLoss: claim.dateOfLoss ?? undefined,
          lossType: claim.lossType as ClaimInput["lossType"] ?? undefined,
          contractorId: claim.contractorId,
          estimatorId: claim.estimatorId,
          carrierId: claim.carrierId,
          adjusterId: claim.adjusterId ?? "",
          adjusterNameOverride: claim.adjusterNameOverride ?? "",
          adjusterPhoneOverride: claim.adjusterPhoneOverride ?? "",
          adjusterEmailOverride: claim.adjusterEmailOverride ?? "",
          supervisorName: claim.supervisorName ?? "",
          supervisorPhone: claim.supervisorPhone ?? "",
          contractorCrmId: claim.contractorCrmId ?? "",
          externalJobNumber: claim.externalJobNumber ?? "",
          jobType: claim.jobType as ClaimInput["jobType"],
          totalSquares: Number(claim.totalSquares),
          roofRCV: Number(claim.roofRCV),
          initialRCV: Number(claim.initialRCV),
          finalRoofRCV: claim.finalRoofRCV ? Number(claim.finalRoofRCV) : undefined,
          finalTotalRCV: claim.finalTotalRCV ? Number(claim.finalTotalRCV) : undefined,
          moneyReleasedAmount: claim.moneyReleasedAmount ? Number(claim.moneyReleasedAmount) : undefined,
        }
      : {
          jobType: "supplement",
          lossState: "TX",
        },
  });

  // Watch carrier to filter adjusters
  const selectedCarrierId = watch("carrierId");
  const filteredAdjusters = adjusters.filter(
    (adj) => adj.carrierId === selectedCarrierId
  );

  // Watch financial fields for display calculations
  const totalSquares = watch("totalSquares");
  const roofRCV = watch("roofRCV");
  const initialRCV = watch("initialRCV");
  const finalRoofRCV = watch("finalRoofRCV");
  const finalTotalRCV = watch("finalTotalRCV");

  // Calculate dollar per square values for display
  const initialDollarPerSquare = totalSquares && roofRCV
    ? (roofRCV / totalSquares).toFixed(2)
    : "0.00";
  const finalDollarPerSquare = totalSquares && finalRoofRCV
    ? (finalRoofRCV / totalSquares).toFixed(2)
    : null;
  const totalIncrease = finalTotalRCV && initialRCV
    ? (finalTotalRCV - initialRCV).toFixed(2)
    : null;

  // Handle extracted data from scope PDF upload
  const handleScopeDataExtracted = (data: ExtractedScopeData) => {
    // Policyholder info
    if (data.policyholderName) {
      setValue("policyholderName", data.policyholderName, { shouldValidate: true });
    }
    if (data.policyholderEmail) {
      setValue("policyholderEmail", data.policyholderEmail);
    }
    if (data.policyholderPhone) {
      setValue("policyholderPhone", data.policyholderPhone);
    }

    // Address
    if (data.lossAddress) {
      setValue("lossAddress", data.lossAddress, { shouldValidate: true });
    }
    if (data.lossCity) {
      setValue("lossCity", data.lossCity, { shouldValidate: true });
    }
    if (data.lossState) {
      setValue("lossState", data.lossState, { shouldValidate: true });
    }
    if (data.lossZip) {
      setValue("lossZip", data.lossZip, { shouldValidate: true });
    }

    // Claim info
    if (data.claimNumber) {
      setValue("claimNumber", data.claimNumber);
    }
    if (data.policyNumber) {
      setValue("policyNumber", data.policyNumber);
    }
    if (data.dateOfLoss) {
      setValue("dateOfLoss", new Date(data.dateOfLoss));
    }
    if (data.lossType) {
      setValue("lossType", data.lossType);
    }

    // Adjuster info (use override fields since adjuster may not be in system)
    if (data.adjusterName) {
      setValue("adjusterNameOverride", data.adjusterName);
    }
    if (data.adjusterPhone) {
      setValue("adjusterPhoneOverride", data.adjusterPhone);
    }
    if (data.adjusterEmail) {
      setValue("adjusterEmailOverride", data.adjusterEmail);
    }

    // Roof details
    if (data.totalSquares !== null) {
      setValue("totalSquares", data.totalSquares, { shouldValidate: true });
    }
    if (data.roofRCV !== null) {
      setValue("roofRCV", data.roofRCV, { shouldValidate: true });
    }
    if (data.initialRCV !== null) {
      setValue("initialRCV", data.initialRCV, { shouldValidate: true });
    }

    // Try to match carrier by name (case-insensitive partial match)
    if (data.carrierName) {
      const carrierNameLower = data.carrierName.toLowerCase();
      const matchedCarrier = carriers.find((c) =>
        carrierNameLower.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(carrierNameLower.split(" ")[0])
      );
      if (matchedCarrier) {
        setValue("carrierId", matchedCarrier.id, { shouldValidate: true });
      }
    }

    // Show success message with extraction notes
    const notesMessage = data.extractionNotes.length > 0
      ? ` Notes: ${data.extractionNotes.join(", ")}`
      : "";
    toast.success(`Form populated from PDF (${data.confidence} confidence).${notesMessage}`);
  };

  async function onSubmit(data: ClaimInput) {
    try {
      if (isEditing) {
        await updateClaim(claim.id, data);
        toast.success("Claim updated successfully");
        router.push(`/dashboard/claims/${claim.id}`);
      } else {
        const result = await createClaim(data);
        toast.success("Claim created successfully");
        router.push(`/dashboard/claims/${result.claim.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Scope Upload - Only show for new claims */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <ScopeUpload
              onDataExtracted={handleScopeDataExtracted}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Policyholder Information */}
      <Card>
        <CardHeader>
          <CardTitle>Policyholder Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="policyholderName">
              Policyholder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="policyholderName"
              placeholder="John Smith"
              {...register("policyholderName")}
              aria-invalid={!!errors.policyholderName}
            />
            {errors.policyholderName && (
              <p className="text-sm text-red-500">
                {errors.policyholderName.message}
              </p>
            )}
          </div>

          {/* Contact Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="policyholderEmail">Email</Label>
              <Input
                id="policyholderEmail"
                type="email"
                placeholder="john@example.com"
                {...register("policyholderEmail")}
              />
              {errors.policyholderEmail && (
                <p className="text-sm text-red-500">
                  {errors.policyholderEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="policyholderPhone">Home Phone</Label>
              <Input
                id="policyholderPhone"
                type="tel"
                placeholder="(555) 123-4567"
                {...register("policyholderPhone")}
              />
            </div>
          </div>

          {/* Additional Contact Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="policyholderWorkPhone">Work Phone</Label>
              <Input
                id="policyholderWorkPhone"
                type="tel"
                placeholder="(555) 987-6543"
                {...register("policyholderWorkPhone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policyholderFax">Fax Number</Label>
              <Input
                id="policyholderFax"
                type="tel"
                placeholder="(555) 456-7890"
                {...register("policyholderFax")}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="lossAddress">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lossAddress"
              placeholder="123 Main Street"
              {...register("lossAddress")}
              aria-invalid={!!errors.lossAddress}
            />
            {errors.lossAddress && (
              <p className="text-sm text-red-500">{errors.lossAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lossAddressLine2">Address Line 2</Label>
            <Input
              id="lossAddressLine2"
              placeholder="Apt, Suite, Unit, etc."
              {...register("lossAddressLine2")}
            />
          </div>

          {/* City, State, ZIP Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lossCity">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lossCity"
                placeholder="Austin"
                {...register("lossCity")}
                aria-invalid={!!errors.lossCity}
              />
              {errors.lossCity && (
                <p className="text-sm text-red-500">{errors.lossCity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lossState">
                State <span className="text-red-500">*</span>
              </Label>
              <select
                id="lossState"
                {...register("lossState")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-invalid={!!errors.lossState}
              >
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              {errors.lossState && (
                <p className="text-sm text-red-500">{errors.lossState.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lossZip">
                Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lossZip"
                placeholder="78701"
                {...register("lossZip")}
                aria-invalid={!!errors.lossZip}
              />
              {errors.lossZip && (
                <p className="text-sm text-red-500">{errors.lossZip.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Carrier */}
            <div className="space-y-2">
              <Label htmlFor="carrierId">
                Insurance Company <span className="text-red-500">*</span>
              </Label>
              <select
                id="carrierId"
                {...register("carrierId")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-invalid={!!errors.carrierId}
              >
                <option value="">Select carrier...</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.carrierId && (
                <p className="text-sm text-red-500">{errors.carrierId.message}</p>
              )}
            </div>

            {/* Date of Loss */}
            <div className="space-y-2">
              <Label htmlFor="dateOfLoss">
                Date of Loss <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfLoss"
                type="date"
                {...register("dateOfLoss", { valueAsDate: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Claim Number */}
            <div className="space-y-2">
              <Label htmlFor="claimNumber">
                Claim Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="claimNumber"
                placeholder="CLM-2024-00123"
                {...register("claimNumber")}
              />
            </div>

            {/* Policy Number */}
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy #</Label>
              <Input
                id="policyNumber"
                placeholder="POL-12345678"
                {...register("policyNumber")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Adjuster Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="adjusterId">Adjuster (from system)</Label>
              <select
                id="adjusterId"
                {...register("adjusterId")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!selectedCarrierId}
              >
                <option value="">
                  {selectedCarrierId
                    ? "Select adjuster..."
                    : "Select carrier first"}
                </option>
                {filteredAdjusters.map((adj) => (
                  <option key={adj.id} value={adj.id}>
                    {adj.name} ({adj.type})
                  </option>
                ))}
              </select>
              {!selectedCarrierId && (
                <p className="text-xs text-slate-500">
                  Select a carrier to see available adjusters
                </p>
              )}
            </div>

            {/* Loss Type */}
            <div className="space-y-2">
              <Label htmlFor="lossType">Loss Type</Label>
              <select
                id="lossType"
                {...register("lossType")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {Object.entries(LOSS_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adjuster Override Fields */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Or enter adjuster details manually:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="adjusterNameOverride">Adjuster Name</Label>
                <Input
                  id="adjusterNameOverride"
                  placeholder="Jane Doe"
                  {...register("adjusterNameOverride")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjusterPhoneOverride">Adjuster Phone</Label>
                <Input
                  id="adjusterPhoneOverride"
                  type="tel"
                  placeholder="(800) 555-1234"
                  {...register("adjusterPhoneOverride")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjusterEmailOverride">Adjuster Email</Label>
                <Input
                  id="adjusterEmailOverride"
                  type="email"
                  placeholder="adjuster@insurance.com"
                  {...register("adjusterEmailOverride")}
                />
              </div>
            </div>
          </div>

          {/* Supervisor Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supervisorName">Supervisor Name</Label>
              <Input
                id="supervisorName"
                placeholder="Supervisor name"
                {...register("supervisorName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisorPhone">Supervisor Phone</Label>
              <Input
                id="supervisorPhone"
                type="tel"
                placeholder="(800) 555-9999"
                {...register("supervisorPhone")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contractor */}
            <div className="space-y-2">
              <Label htmlFor="contractorId">
                Contractor <span className="text-red-500">*</span>
              </Label>
              <select
                id="contractorId"
                {...register("contractorId")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-invalid={!!errors.contractorId}
              >
                <option value="">Select contractor...</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
              {errors.contractorId && (
                <p className="text-sm text-red-500">
                  {errors.contractorId.message}
                </p>
              )}
            </div>

            {/* Estimator/Salesperson */}
            <div className="space-y-2">
              <Label htmlFor="estimatorId">
                Salesperson <span className="text-red-500">*</span>
              </Label>
              <select
                id="estimatorId"
                {...register("estimatorId")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-invalid={!!errors.estimatorId}
              >
                <option value="">Select salesperson...</option>
                {estimators.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
              {errors.estimatorId && (
                <p className="text-sm text-red-500">
                  {errors.estimatorId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Job Type */}
            <div className="space-y-2">
              <Label htmlFor="jobType">
                Supplement/Estimate/ReInspect <span className="text-red-500">*</span>
              </Label>
              <select
                id="jobType"
                {...register("jobType")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="supplement">Supplement</option>
                <option value="reinspection">Reinspection</option>
                <option value="estimate">Estimate</option>
                <option value="final_invoice">Final Invoice</option>
              </select>
            </div>

            {/* Contractor CRM */}
            <div className="space-y-2">
              <Label htmlFor="contractorCrmId">Contractor CRM</Label>
              <Input
                id="contractorCrmId"
                placeholder="CRM Reference"
                {...register("contractorCrmId")}
              />
            </div>

            {/* External Job # */}
            <div className="space-y-2">
              <Label htmlFor="externalJobNumber">Job #</Label>
              <Input
                id="externalJobNumber"
                placeholder="External job number"
                {...register("externalJobNumber")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial - Initial Values */}
      <Card>
        <CardHeader>
          <CardTitle>Initial Values (from Insurance Scope)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Total Squares */}
            <div className="space-y-2">
              <Label htmlFor="totalSquares">
                Squares <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalSquares"
                type="number"
                step="0.01"
                placeholder="25.5"
                {...register("totalSquares", { valueAsNumber: true })}
                aria-invalid={!!errors.totalSquares}
              />
              {errors.totalSquares && (
                <p className="text-sm text-red-500">
                  {errors.totalSquares.message}
                </p>
              )}
            </div>

            {/* Initial Roof RCV */}
            <div className="space-y-2">
              <Label htmlFor="roofRCV">
                Initial Roof RCV <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="roofRCV"
                  type="number"
                  step="0.01"
                  placeholder="15000.00"
                  className="pl-7"
                  {...register("roofRCV", { valueAsNumber: true })}
                  aria-invalid={!!errors.roofRCV}
                />
              </div>
              {errors.roofRCV && (
                <p className="text-sm text-red-500">{errors.roofRCV.message}</p>
              )}
            </div>

            {/* Initial Total RCV */}
            <div className="space-y-2">
              <Label htmlFor="initialRCV">
                Initial Total RCV <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="initialRCV"
                  type="number"
                  step="0.01"
                  placeholder="18500.00"
                  className="pl-7"
                  {...register("initialRCV", { valueAsNumber: true })}
                  aria-invalid={!!errors.initialRCV}
                />
              </div>
              {errors.initialRCV && (
                <p className="text-sm text-red-500">{errors.initialRCV.message}</p>
              )}
            </div>

            {/* Initial $ Per SQ (calculated) */}
            <div className="space-y-2">
              <Label>Initial $ Per SQ</Label>
              <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md border border-slate-200 text-sm">
                ${initialDollarPerSquare}
              </div>
              <p className="text-xs text-slate-500">Auto-calculated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial - Final Values (only show when editing) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Final Values (After Supplements)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Final Roof RCV */}
              <div className="space-y-2">
                <Label htmlFor="finalRoofRCV">Final Roof RCV</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <Input
                    id="finalRoofRCV"
                    type="number"
                    step="0.01"
                    placeholder="20000.00"
                    className="pl-7"
                    {...register("finalRoofRCV", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Final Total RCV */}
              <div className="space-y-2">
                <Label htmlFor="finalTotalRCV">Final Total RCV</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <Input
                    id="finalTotalRCV"
                    type="number"
                    step="0.01"
                    placeholder="25000.00"
                    className="pl-7"
                    {...register("finalTotalRCV", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Final $ Per SQ (calculated) */}
              <div className="space-y-2">
                <Label>Final $ Per SQ</Label>
                <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md border border-slate-200 text-sm">
                  {finalDollarPerSquare ? `$${finalDollarPerSquare}` : "-"}
                </div>
                <p className="text-xs text-slate-500">Auto-calculated</p>
              </div>

              {/* Total Increase (calculated) */}
              <div className="space-y-2">
                <Label>Total Increase</Label>
                <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md border border-slate-200 text-sm">
                  {totalIncrease ? `$${totalIncrease}` : "-"}
                </div>
                <p className="text-xs text-slate-500">Final - Initial</p>
              </div>
            </div>

            {/* Money Released */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="moneyReleasedAmount">Money Released Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <Input
                    id="moneyReleasedAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    {...register("moneyReleasedAmount", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {isEditing ? "Save Changes" : "Create Claim"}
        </Button>
      </div>
    </form>
  );
}
