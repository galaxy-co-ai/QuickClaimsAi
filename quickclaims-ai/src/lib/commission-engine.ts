/**
 * QuickClaims AI - Commission Engine
 *
 * Determines commission type and calculates contractor billing and estimator
 * commissions based on job type and whether roof squares increased.
 *
 * Business Rules (from Rise Roofing):
 * - Reinspection (roof squares increase): 5% contractor, 1% estimator
 * - Supplement (squares unchanged): Tiered contractor rates, 5% estimator
 * - Final Invoice: Flat fees + supplement % on RCV difference
 * - Estimate Only: Flat fees based on residential/commercial
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { JobType } from "@prisma/client";

// Commission type determined by roof squares change or job type
export type CommissionType = "reinspection" | "supplement" | "final_invoice" | "estimate";

// Property type affects rates for supplements and estimates
export type PropertyType = "residential" | "commercial";

// Rate structure from contractor/estimator profiles
export interface RateProfile {
  // Legacy single rate (fallback)
  defaultRate: number;
  // Job-type specific rates
  residentialRate: number | null;
  commercialRate: number | null;
  reinspectionRate: number | null;
  // Flat fee for estimates
  estimateFlatFee: number | null;
}

// Input for commission calculation
export interface CommissionInput {
  jobType: JobType;
  propertyType: PropertyType;
  // Roof squares for reinspection detection
  previousRoofSquares: number | null;
  newRoofSquares: number | null;
  // Amount to calculate commission on (typically totalIncrease)
  commissionableAmount: number;
  // Rate profiles
  contractorRates: RateProfile;
  estimatorRates: RateProfile;
}

// Result of commission calculation
export interface CommissionResult {
  commissionType: CommissionType;
  contractorAmount: number;
  contractorRate: number;
  estimatorAmount: number;
  estimatorRate: number;
  // Breakdown for transparency
  breakdown: {
    baseAmount: number;
    flatFees: {
      contractor: number;
      estimator: number;
    };
    percentageAmount: {
      contractor: number;
      estimator: number;
    };
  };
}

/**
 * Determine commission type based on roof squares change and job type
 *
 * Logic:
 * - If job type is 'estimate' → estimate
 * - If job type is 'final_invoice' → final_invoice
 * - If new roof squares > previous roof squares → reinspection
 * - Otherwise → supplement
 */
export function determineCommissionType(
  jobType: JobType,
  previousRoofSquares: number | null,
  newRoofSquares: number | null
): CommissionType {
  // Explicit job types take precedence
  if (jobType === "estimate") {
    return "estimate";
  }

  if (jobType === "final_invoice") {
    return "final_invoice";
  }

  // For supplement/reinspection job types, check roof squares to determine actual type
  if (
    previousRoofSquares !== null &&
    newRoofSquares !== null &&
    newRoofSquares > previousRoofSquares
  ) {
    return "reinspection";
  }

  return "supplement";
}

/**
 * Get the appropriate rate from a rate profile based on commission type and property type
 */
export function selectRate(
  rates: RateProfile,
  commissionType: CommissionType,
  propertyType: PropertyType
): number {
  switch (commissionType) {
    case "reinspection":
      return rates.reinspectionRate ?? rates.defaultRate;

    case "supplement":
      if (propertyType === "commercial") {
        return rates.commercialRate ?? rates.defaultRate;
      }
      return rates.residentialRate ?? rates.defaultRate;

    case "estimate":
      // Estimates use flat fees, not percentage rates
      // Return 0 for rate, flat fee will be used
      return 0;

    case "final_invoice":
      // Final invoice uses a combination of flat fees and supplement rate
      if (propertyType === "commercial") {
        return rates.commercialRate ?? rates.defaultRate;
      }
      return rates.residentialRate ?? rates.defaultRate;

    default:
      return rates.defaultRate;
  }
}

/**
 * Get flat fee for estimates and final invoices
 */
export function getFlatFee(
  rates: RateProfile,
  commissionType: CommissionType,
  propertyType: PropertyType
): number {
  if (commissionType === "estimate") {
    // Use estimateFlatFee from profile
    return rates.estimateFlatFee ?? 0;
  }

  if (commissionType === "final_invoice") {
    // Final invoice flat fees (from business rules)
    // These could be configurable in the future
    return rates.estimateFlatFee ?? 0;
  }

  return 0;
}

/**
 * Calculate commissions for a claim based on job type and rate profiles
 */
export function calculateCommission(input: CommissionInput): CommissionResult {
  const {
    jobType,
    propertyType,
    previousRoofSquares,
    newRoofSquares,
    commissionableAmount,
    contractorRates,
    estimatorRates,
  } = input;

  // Determine the commission type
  const commissionType = determineCommissionType(
    jobType,
    previousRoofSquares,
    newRoofSquares
  );

  // Get rates for contractor and estimator
  const contractorRate = selectRate(contractorRates, commissionType, propertyType);
  const estimatorRate = selectRate(estimatorRates, commissionType, propertyType);

  // Get flat fees
  const contractorFlatFee = getFlatFee(contractorRates, commissionType, propertyType);
  const estimatorFlatFee = getFlatFee(estimatorRates, commissionType, propertyType);

  // Calculate amounts
  let contractorPercentageAmount = 0;
  let estimatorPercentageAmount = 0;

  if (commissionType === "estimate") {
    // Estimates are flat fee only - no percentage
    contractorPercentageAmount = 0;
    estimatorPercentageAmount = 0;
  } else {
    // Apply percentage to commissionable amount
    contractorPercentageAmount = round(commissionableAmount * contractorRate);
    estimatorPercentageAmount = round(commissionableAmount * estimatorRate);
  }

  // Total amounts = flat fees + percentage amounts
  const contractorAmount = round(contractorFlatFee + contractorPercentageAmount);
  const estimatorAmount = round(estimatorFlatFee + estimatorPercentageAmount);

  return {
    commissionType,
    contractorAmount,
    contractorRate,
    estimatorAmount,
    estimatorRate,
    breakdown: {
      baseAmount: commissionableAmount,
      flatFees: {
        contractor: contractorFlatFee,
        estimator: estimatorFlatFee,
      },
      percentageAmount: {
        contractor: contractorPercentageAmount,
        estimator: estimatorPercentageAmount,
      },
    },
  };
}

/**
 * Convert Prisma Decimal or null to number
 */
export function decimalToNumberOrNull(
  value: Decimal | number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || null;
  return value.toNumber();
}

/**
 * Build a RateProfile from contractor or estimator model data
 */
export function buildRateProfile(data: {
  billingPercentage?: Decimal | number | null;
  commissionPercentage?: Decimal | number | null;
  residentialRate?: Decimal | number | null;
  commercialRate?: Decimal | number | null;
  reinspectionRate?: Decimal | number | null;
  estimateFlatFee?: Decimal | number | null;
}): RateProfile {
  // Default rate comes from billingPercentage (contractor) or commissionPercentage (estimator)
  const defaultRate =
    decimalToNumberOrNull(data.billingPercentage) ??
    decimalToNumberOrNull(data.commissionPercentage) ??
    0;

  return {
    defaultRate,
    residentialRate: decimalToNumberOrNull(data.residentialRate),
    commercialRate: decimalToNumberOrNull(data.commercialRate),
    reinspectionRate: decimalToNumberOrNull(data.reinspectionRate),
    estimateFlatFee: decimalToNumberOrNull(data.estimateFlatFee),
  };
}

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Determine property type from claim data
 *
 * This is a placeholder - in the future, property type should be stored on the claim.
 * For now, we'll default to residential.
 */
export function determinePropertyType(claimData: {
  propertyType?: string | null;
  // Could add heuristics based on address, squares, etc.
}): PropertyType {
  if (claimData.propertyType === "commercial") {
    return "commercial";
  }
  return "residential";
}
