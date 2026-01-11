/**
 * QuickClaims AI - Auto-Calculation Engine
 * 
 * Core formulas from Rise Roofing workflow:
 * - Dollar Per Square = Roof RCV / Total Squares
 * - Total Increase = Current RCV - Initial RCV
 * - Estimator Commission = Total Increase × Commission %
 * - Contractor Billing = Total Increase × Billing %
 */

import { Decimal } from "@prisma/client/runtime/library";

export interface ClaimFinancials {
  initialRCV: number;
  roofRCV: number;
  totalSquares: number;
  supplementAmounts: number[];
  contractorBillingPercentage: number;
  estimatorCommissionPercentage: number;
}

export interface CalculatedMetrics {
  currentTotalRCV: number;
  totalIncrease: number;
  percentageIncrease: number;
  dollarPerSquare: number;
  contractorBillingAmount: number;
  estimatorCommission: number;
}

/**
 * Calculate all claim metrics based on financials
 */
export function calculateClaimMetrics(
  financials: ClaimFinancials
): CalculatedMetrics {
  const {
    initialRCV,
    roofRCV,
    totalSquares,
    supplementAmounts,
    contractorBillingPercentage,
    estimatorCommissionPercentage,
  } = financials;

  // Sum of all approved supplements
  const totalSupplements = supplementAmounts.reduce((sum, amt) => sum + amt, 0);

  // Current total RCV after supplements
  const currentTotalRCV = initialRCV + totalSupplements;

  // Total increase value (what Rise bills on)
  const totalIncrease = currentTotalRCV - initialRCV;

  // Percentage increase
  const percentageIncrease =
    initialRCV > 0 ? (totalIncrease / initialRCV) * 100 : 0;

  // Dollar per square (key performance metric)
  const dollarPerSquare = totalSquares > 0 ? roofRCV / totalSquares : 0;

  // Contractor billing amount
  const contractorBillingAmount = totalIncrease * contractorBillingPercentage;

  // Estimator commission
  const estimatorCommission = totalIncrease * estimatorCommissionPercentage;

  return {
    currentTotalRCV: round(currentTotalRCV),
    totalIncrease: round(totalIncrease),
    percentageIncrease: round(percentageIncrease, 4),
    dollarPerSquare: round(dollarPerSquare),
    contractorBillingAmount: round(contractorBillingAmount),
    estimatorCommission: round(estimatorCommission),
  };
}

/**
 * Calculate metrics for a new supplement being added
 */
export function calculateSupplementImpact(
  currentRCV: number,
  supplementAmount: number
): { previousRCV: number; newRCV: number } {
  return {
    previousRCV: currentRCV,
    newRCV: currentRCV + supplementAmount,
  };
}

/**
 * Round to specified decimal places (default 2)
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert Prisma Decimal to number for calculations
 */
export function decimalToNumber(value: Decimal | number | string): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return value.toNumber();
}

/**
 * Calculate initial dollar per square on claim creation
 */
export function calculateInitialDollarPerSquare(
  roofRCV: number,
  totalSquares: number
): number {
  if (totalSquares <= 0) return 0;
  return round(roofRCV / totalSquares);
}

// Decimal fields in different models
const CLAIM_DECIMAL_FIELDS = [
  "totalSquares",
  "roofRCV",
  "initialRCV",
  "dollarPerSquare",
  "finalRoofRCV",
  "finalTotalRCV",
  "finalDollarPerSquare",
  "currentTotalRCV",
  "totalIncrease",
  "percentageIncrease",
  "contractorBillingAmount",
  "estimatorCommission",
  "moneyReleasedAmount",
];

const SUPPLEMENT_DECIMAL_FIELDS = [
  "amount",
  "previousRCV",
  "newRCV",
  "previousRoofRCV",
  "newRoofRCV",
  "roofIncrease",
  "approvedAmount",
];

const CONTRACTOR_DECIMAL_FIELDS = ["billingPercentage"];
const ESTIMATOR_DECIMAL_FIELDS = ["commissionPercentage"];

/**
 * Generic serialization helper that converts Decimal fields to numbers
 */
function serializeDecimalFields<T extends Record<string, unknown>>(
  obj: T, 
  decimalFields: string[]
): T {
  const serialized = { ...obj } as Record<string, unknown>;
  
  for (const field of decimalFields) {
    if (field in serialized && serialized[field] != null) {
      serialized[field] = decimalToNumber(serialized[field] as Decimal | number | string);
    }
  }
  
  return serialized as T;
}

/**
 * Serialize a claim object by converting Decimal fields to numbers.
 * This is required when passing claims from Server Components to Client Components.
 */
export function serializeClaim<T extends Record<string, unknown>>(claim: T): T {
  const serialized = serializeDecimalFields(claim, CLAIM_DECIMAL_FIELDS) as Record<string, unknown>;
  
  // Also serialize nested supplements if present
  if ("supplements" in serialized && Array.isArray(serialized.supplements)) {
    serialized.supplements = (serialized.supplements as Record<string, unknown>[]).map(
      (s) => serializeDecimalFields(s, SUPPLEMENT_DECIMAL_FIELDS)
    );
  }
  
  // Serialize nested contractor if present
  if ("contractor" in serialized && serialized.contractor && typeof serialized.contractor === "object") {
    serialized.contractor = serializeDecimalFields(
      serialized.contractor as Record<string, unknown>,
      CONTRACTOR_DECIMAL_FIELDS
    );
  }
  
  // Serialize nested estimator if present
  if ("estimator" in serialized && serialized.estimator && typeof serialized.estimator === "object") {
    serialized.estimator = serializeDecimalFields(
      serialized.estimator as Record<string, unknown>,
      ESTIMATOR_DECIMAL_FIELDS
    );
  }
  
  return serialized as T;
}

/**
 * Serialize an array of claims
 */
export function serializeClaims<T extends Record<string, unknown>>(claims: T[]): T[] {
  return claims.map(serializeClaim);
}

/**
 * Serialize a supplement object by converting Decimal fields to numbers.
 */
export function serializeSupplement<T extends Record<string, unknown>>(supplement: T): T {
  const serialized = serializeDecimalFields(supplement, SUPPLEMENT_DECIMAL_FIELDS) as Record<string, unknown>;
  
  // Also serialize nested claim if present
  if ("claim" in serialized && serialized.claim && typeof serialized.claim === "object") {
    serialized.claim = serializeDecimalFields(
      serialized.claim as Record<string, unknown>,
      CLAIM_DECIMAL_FIELDS
    );
  }
  
  return serialized as T;
}

/**
 * Serialize an array of supplements
 */
export function serializeSupplements<T extends Record<string, unknown>>(supplements: T[]): T[] {
  return supplements.map(serializeSupplement);
}