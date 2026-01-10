import { z } from "zod";

/**
 * Contractor billing report input schema
 */
export const contractorBillingReportSchema = z.object({
  contractorId: z.string().min(1, "Contractor is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  format: z.enum(["json", "csv"]).default("json"),
});

export type ContractorBillingReportInput = z.infer<typeof contractorBillingReportSchema>;

/**
 * Estimator commission report input schema
 */
export const estimatorCommissionReportSchema = z.object({
  estimatorId: z.string().min(1, "Estimator is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  format: z.enum(["json", "csv"]).default("json"),
});

export type EstimatorCommissionReportInput = z.infer<typeof estimatorCommissionReportSchema>;

/**
 * Report summary types
 */
export type ContractorBillingReportData = {
  contractor: {
    id: string;
    companyName: string;
    billingPercentage: number;
  };
  period: {
    start: Date;
    end: Date;
  };
  claims: {
    id: string;
    policyholderName: string;
    lossAddress: string;
    totalIncrease: number;
    billingAmount: number;
    status: string;
    completedAt: Date | null;
  }[];
  totals: {
    claimCount: number;
    totalIncrease: number;
    totalBilling: number;
  };
};

export type EstimatorCommissionReportData = {
  estimator: {
    id: string;
    firstName: string;
    lastName: string;
    commissionPercentage: number;
  };
  period: {
    start: Date;
    end: Date;
  };
  claims: {
    id: string;
    policyholderName: string;
    lossAddress: string;
    contractorName: string;
    totalIncrease: number;
    commission: number;
    dollarPerSquare: number;
    status: string;
    completedAt: Date | null;
  }[];
  totals: {
    claimCount: number;
    totalIncrease: number;
    totalCommission: number;
    avgDollarPerSquare: number;
  };
};
