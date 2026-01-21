"use server";

import { db } from "@/lib/db";
import {
  contractorBillingReportSchema,
  estimatorCommissionReportSchema,
  type ContractorBillingReportInput,
  type ContractorBillingReportData,
  type EstimatorCommissionReportInput,
  type EstimatorCommissionReportData,
} from "@/lib/validations/report";
import { auth } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/auth";
import { decimalToNumber } from "@/lib/calculations";
import { CLAIM_STATUS_LABELS } from "@/lib/constants";

/**
 * Generate contractor billing report
 */
export async function generateContractorBillingReport(
  input: ContractorBillingReportInput
): Promise<{ success: true; data: ContractorBillingReportData } | { success: true; csv: string }> {
  await requireRole(["admin", "manager"]);

  // Validate input
  const validated = contractorBillingReportSchema.parse(input);

  // Get contractor
  const contractor = await db.contractor.findUnique({
    where: { id: validated.contractorId },
    select: {
      id: true,
      companyName: true,
      billingPercentage: true,
    },
  });

  if (!contractor) {
    throw new Error("Contractor not found");
  }

  // Get claims for this contractor in the date range
  // Include claims that were completed OR approved during the period
  const claims = await db.claim.findMany({
    where: {
      contractorId: validated.contractorId,
      OR: [
        // Claims completed in the date range
        {
          completedAt: {
            gte: validated.startDate,
            lte: validated.endDate,
          },
        },
        // Claims approved in the date range (for claims not yet completed)
        {
          status: { in: ["final_invoice_sent", "final_invoice_received", "money_released", "completed"] },
          statusChangedAt: {
            gte: validated.startDate,
            lte: validated.endDate,
          },
        },
      ],
    },
    orderBy: { completedAt: "desc" },
    include: {
      supplements: {
        orderBy: { sequenceNumber: "asc" },
        select: {
          id: true,
          sequenceNumber: true,
          amount: true,
          description: true,
          status: true,
          omApproved: true,
        },
      },
    },
  });

  // Transform claims data with supplements
  const claimsData = claims.map((claim) => ({
    id: claim.id,
    policyholderName: claim.policyholderName,
    lossAddress: `${claim.lossAddress}, ${claim.lossCity}, ${claim.lossState}`,
    initialRCV: decimalToNumber(claim.initialRCV),
    finalRCV: claim.finalTotalRCV ? decimalToNumber(claim.finalTotalRCV) : null,
    totalIncrease: decimalToNumber(claim.totalIncrease),
    billingAmount: decimalToNumber(claim.contractorBillingAmount),
    status: CLAIM_STATUS_LABELS[claim.status] || claim.status,
    completedAt: claim.completedAt,
    supplements: claim.supplements.map((supp) => ({
      id: supp.id,
      sequenceNumber: supp.sequenceNumber,
      amount: decimalToNumber(supp.amount),
      description: supp.description,
      status: supp.status,
      omApproved: supp.omApproved,
    })),
  }));

  // Calculate totals including supplement count
  const supplementCount = claimsData.reduce((sum, c) => sum + c.supplements.length, 0);
  const totals = {
    claimCount: claimsData.length,
    totalIncrease: claimsData.reduce((sum, c) => sum + c.totalIncrease, 0),
    totalBilling: claimsData.reduce((sum, c) => sum + c.billingAmount, 0),
    supplementCount,
  };

  const reportData: ContractorBillingReportData = {
    contractor: {
      id: contractor.id,
      companyName: contractor.companyName,
      billingPercentage: decimalToNumber(contractor.billingPercentage),
    },
    period: {
      start: validated.startDate,
      end: validated.endDate,
    },
    claims: claimsData,
    totals,
  };

  // Return CSV if requested
  if (validated.format === "csv") {
    const csv = generateContractorBillingCSV(reportData);
    return { success: true, csv };
  }

  return { success: true, data: reportData };
}

/**
 * Generate estimator commission report
 */
export async function generateEstimatorCommissionReport(
  input: EstimatorCommissionReportInput
): Promise<{ success: true; data: EstimatorCommissionReportData } | { success: true; csv: string }> {
  const clerkId = await requireRole(["admin", "manager", "estimator"]);

  // Validate input
  const validated = estimatorCommissionReportSchema.parse(input);

  // If estimator role, verify they're viewing their own report
  const currentUser = await db.user.findFirst({
    where: { clerkId },
    select: { role: true, estimatorProfile: { select: { id: true } } },
  });

  if (currentUser?.role === "estimator") {
    if (!currentUser.estimatorProfile || currentUser.estimatorProfile.id !== validated.estimatorId) {
      throw new Error("You can only view your own commission report");
    }
  }

  // Get estimator
  const estimator = await db.estimator.findUnique({
    where: { id: validated.estimatorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      commissionPercentage: true,
    },
  });

  if (!estimator) {
    throw new Error("Estimator not found");
  }

  // Get claims for this estimator in the date range
  const claims = await db.claim.findMany({
    where: {
      estimatorId: validated.estimatorId,
      OR: [
        {
          completedAt: {
            gte: validated.startDate,
            lte: validated.endDate,
          },
        },
        {
          status: { in: ["final_invoice_sent", "final_invoice_received", "money_released", "completed"] },
          statusChangedAt: {
            gte: validated.startDate,
            lte: validated.endDate,
          },
        },
      ],
    },
    orderBy: { completedAt: "desc" },
    include: {
      contractor: {
        select: { companyName: true },
      },
    },
  });

  // Transform claims data
  const claimsData = claims.map((claim) => ({
    id: claim.id,
    policyholderName: claim.policyholderName,
    lossAddress: `${claim.lossAddress}, ${claim.lossCity}, ${claim.lossState}`,
    contractorName: claim.contractor.companyName,
    totalIncrease: decimalToNumber(claim.totalIncrease),
    commission: decimalToNumber(claim.estimatorCommission),
    dollarPerSquare: decimalToNumber(claim.dollarPerSquare),
    status: CLAIM_STATUS_LABELS[claim.status] || claim.status,
    completedAt: claim.completedAt,
  }));

  // Calculate totals
  const totalIncrease = claimsData.reduce((sum, c) => sum + c.totalIncrease, 0);
  const totalCommission = claimsData.reduce((sum, c) => sum + c.commission, 0);
  const avgDollarPerSquare =
    claimsData.length > 0
      ? claimsData.reduce((sum, c) => sum + c.dollarPerSquare, 0) / claimsData.length
      : 0;

  const reportData: EstimatorCommissionReportData = {
    estimator: {
      id: estimator.id,
      firstName: estimator.firstName,
      lastName: estimator.lastName,
      commissionPercentage: decimalToNumber(estimator.commissionPercentage),
    },
    period: {
      start: validated.startDate,
      end: validated.endDate,
    },
    claims: claimsData,
    totals: {
      claimCount: claimsData.length,
      totalIncrease,
      totalCommission,
      avgDollarPerSquare,
    },
  };

  // Return CSV if requested
  if (validated.format === "csv") {
    const csv = generateEstimatorCommissionCSV(reportData);
    return { success: true, csv };
  }

  return { success: true, data: reportData };
}

/**
 * Get all contractors for report dropdown
 */
export async function getContractorsForReport() {
  await requireRole(["admin", "manager"]);

  return db.contractor.findMany({
    where: { isActive: true },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
    },
  });
}

/**
 * Get contractor's own info for their billing report
 */
export async function getContractorOwnInfo() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: {
      role: true,
      contractor: {
        select: {
          id: true,
          companyName: true,
          billingPercentage: true,
        },
      },
    },
  });

  if (user?.role !== "contractor" || !user.contractor) {
    throw new Error("Not a contractor user");
  }

  return user.contractor;
}

/**
 * Generate contractor's own billing report (for contractor users)
 */
export async function generateContractorOwnBillingReport(
  input: Omit<ContractorBillingReportInput, "contractorId">
): Promise<{ success: true; data: ContractorBillingReportData } | { success: true; csv: string }> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Get the contractor's own ID
  const user = await db.user.findFirst({
    where: { clerkId: userId },
    select: {
      role: true,
      contractor: {
        select: {
          id: true,
          companyName: true,
          billingPercentage: true,
        },
      },
    },
  });

  if (user?.role !== "contractor" || !user.contractor) {
    throw new Error("You must be a contractor to view this report");
  }

  const contractor = user.contractor;

  // Validate dates
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  // Get claims for this contractor in the date range
  const claims = await db.claim.findMany({
    where: {
      contractorId: contractor.id,
      OR: [
        {
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          status: { in: ["final_invoice_sent", "final_invoice_received", "money_released", "completed"] },
          statusChangedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    orderBy: { completedAt: "desc" },
    include: {
      supplements: {
        orderBy: { sequenceNumber: "asc" },
        select: {
          id: true,
          sequenceNumber: true,
          amount: true,
          description: true,
          status: true,
          omApproved: true,
        },
      },
    },
  });

  // Transform claims data with supplements
  const claimsData = claims.map((claim) => ({
    id: claim.id,
    policyholderName: claim.policyholderName,
    lossAddress: `${claim.lossAddress}, ${claim.lossCity}, ${claim.lossState}`,
    initialRCV: decimalToNumber(claim.initialRCV),
    finalRCV: claim.finalTotalRCV ? decimalToNumber(claim.finalTotalRCV) : null,
    totalIncrease: decimalToNumber(claim.totalIncrease),
    billingAmount: decimalToNumber(claim.contractorBillingAmount),
    status: CLAIM_STATUS_LABELS[claim.status] || claim.status,
    completedAt: claim.completedAt,
    supplements: claim.supplements.map((supp) => ({
      id: supp.id,
      sequenceNumber: supp.sequenceNumber,
      amount: decimalToNumber(supp.amount),
      description: supp.description,
      status: supp.status,
      omApproved: supp.omApproved,
    })),
  }));

  // Calculate totals including supplement count
  const supplementCount = claimsData.reduce((sum, c) => sum + c.supplements.length, 0);
  const totals = {
    claimCount: claimsData.length,
    totalIncrease: claimsData.reduce((sum, c) => sum + c.totalIncrease, 0),
    totalBilling: claimsData.reduce((sum, c) => sum + c.billingAmount, 0),
    supplementCount,
  };

  const reportData: ContractorBillingReportData = {
    contractor: {
      id: contractor.id,
      companyName: contractor.companyName,
      billingPercentage: decimalToNumber(contractor.billingPercentage),
    },
    period: {
      start: startDate,
      end: endDate,
    },
    claims: claimsData,
    totals,
  };

  // Return CSV if requested
  if (input.format === "csv") {
    const csv = generateContractorBillingCSV(reportData);
    return { success: true, csv };
  }

  return { success: true, data: reportData };
}

/**
 * Get all estimators for report dropdown
 */
export async function getEstimatorsForReport() {
  const clerkId = await requireRole(["admin", "manager", "estimator"]);

  // If estimator, only return themselves
  const currentUser = await db.user.findFirst({
    where: { clerkId },
    select: { role: true, estimatorProfile: { select: { id: true, firstName: true, lastName: true } } },
  });

  if (currentUser?.role === "estimator" && currentUser.estimatorProfile) {
    return [currentUser.estimatorProfile];
  }

  return db.estimator.findMany({
    where: { isActive: true },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

// Helper: Generate CSV for contractor billing report
function generateContractorBillingCSV(data: ContractorBillingReportData): string {
  const lines: string[] = [];

  // Header info
  lines.push(`Contractor Billing Report`);
  lines.push(`Contractor,${data.contractor.companyName}`);
  lines.push(`Billing Rate,${(data.contractor.billingPercentage * 100).toFixed(1)}%`);
  lines.push(`Period,${formatDateForCSV(data.period.start)} - ${formatDateForCSV(data.period.end)}`);
  lines.push(``);

  // Column headers (updated per client request)
  lines.push(`Policyholder,Initial RCV,Final RCV,Total Increase,Billing Amount,Status,Completed,Supplements`);

  // Data rows with supplements
  for (const claim of data.claims) {
    // Claim row
    lines.push(
      [
        escapeCSV(claim.policyholderName),
        claim.initialRCV.toFixed(2),
        claim.finalRCV ? claim.finalRCV.toFixed(2) : "-",
        claim.totalIncrease.toFixed(2),
        claim.billingAmount.toFixed(2),
        claim.status,
        claim.completedAt ? formatDateForCSV(claim.completedAt) : "-",
        claim.supplements.length.toString(),
      ].join(",")
    );

    // Supplement sub-rows (indented with empty first column)
    for (const supp of claim.supplements) {
      lines.push(
        [
          `  SOL #${supp.sequenceNumber}`,
          "",
          "",
          supp.amount.toFixed(2),
          "",
          supp.status,
          supp.omApproved ? "O&P Yes" : "O&P No",
          escapeCSV(supp.description.substring(0, 50) + (supp.description.length > 50 ? "..." : "")),
        ].join(",")
      );
    }
  }

  // Totals
  lines.push(``);
  lines.push(`Total Claims,${data.totals.claimCount}`);
  lines.push(`Total Supplements,${data.totals.supplementCount}`);
  lines.push(`Total Increase,$${data.totals.totalIncrease.toFixed(2)}`);
  lines.push(`Total Billing,$${data.totals.totalBilling.toFixed(2)}`);

  return lines.join("\n");
}

// Helper: Generate CSV for estimator commission report
function generateEstimatorCommissionCSV(data: EstimatorCommissionReportData): string {
  const lines: string[] = [];

  // Header info
  lines.push(`Estimator Commission Report`);
  lines.push(`Estimator,${data.estimator.firstName} ${data.estimator.lastName}`);
  lines.push(`Commission Rate,${(data.estimator.commissionPercentage * 100).toFixed(1)}%`);
  lines.push(`Period,${formatDateForCSV(data.period.start)} - ${formatDateForCSV(data.period.end)}`);
  lines.push(``);

  // Column headers
  lines.push(`Policyholder,Address,Contractor,Total Increase,Commission,$/Sq,Status,Completed`);

  // Data rows
  for (const claim of data.claims) {
    lines.push(
      [
        escapeCSV(claim.policyholderName),
        escapeCSV(claim.lossAddress),
        escapeCSV(claim.contractorName),
        claim.totalIncrease.toFixed(2),
        claim.commission.toFixed(2),
        claim.dollarPerSquare.toFixed(2),
        claim.status,
        claim.completedAt ? formatDateForCSV(claim.completedAt) : "-",
      ].join(",")
    );
  }

  // Totals
  lines.push(``);
  lines.push(`Total Claims,${data.totals.claimCount}`);
  lines.push(`Total Increase,$${data.totals.totalIncrease.toFixed(2)}`);
  lines.push(`Total Commission,$${data.totals.totalCommission.toFixed(2)}`);
  lines.push(`Avg $/Sq,$${data.totals.avgDollarPerSquare.toFixed(2)}`);

  return lines.join("\n");
}

// Helper: Escape CSV value
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Helper: Format date for CSV
function formatDateForCSV(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
