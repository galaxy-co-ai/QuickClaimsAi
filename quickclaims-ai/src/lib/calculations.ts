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
