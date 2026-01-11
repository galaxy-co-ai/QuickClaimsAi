"use client";

import { useState, useTransition } from "react";
import { Download, FileText, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerString } from "@/components/ui/date-picker";
import {
  generateContractorBillingReport,
  generateEstimatorCommissionReport,
  generateContractorOwnBillingReport,
} from "@/actions/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ContractorBillingReportData, EstimatorCommissionReportData } from "@/lib/validations/report";
import type { UserRole } from "@/lib/auth";

interface ReportsClientProps {
  contractors: { id: string; companyName: string }[];
  estimators: { id: string; firstName: string; lastName: string }[];
  userRole: UserRole;
  contractorInfo: { id: string; companyName: string; billingPercentage: unknown } | null;
}

export function ReportsClient({ contractors, estimators, userRole, contractorInfo }: ReportsClientProps) {
  const isAdminOrManager = userRole === "admin" || userRole === "manager";
  const isContractor = userRole === "contractor";

  // Contractors see their own billing report only
  if (isContractor && contractorInfo) {
    return <ContractorOwnBillingReport contractorInfo={contractorInfo} />;
  }

  // Estimators only see commission reports - no tabs needed
  if (!isAdminOrManager) {
    return <EstimatorCommissionReport estimators={estimators} />;
  }

  // Admin/Manager see both tabs
  return (
    <Tabs defaultValue="contractor" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="contractor" className="gap-2">
          <FileText className="h-4 w-4" />
          Contractor Billing
        </TabsTrigger>
        <TabsTrigger value="estimator" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Estimator Commission
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contractor">
        <ContractorBillingReport contractors={contractors} />
      </TabsContent>

      <TabsContent value="estimator">
        <EstimatorCommissionReport estimators={estimators} />
      </TabsContent>
    </Tabs>
  );
}

function ContractorBillingReport({
  contractors,
}: {
  contractors: { id: string; companyName: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [contractorId, setContractorId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First of current month
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [reportData, setReportData] = useState<ContractorBillingReportData | null>(null);

  const handleGenerateReport = () => {
    if (!contractorId) {
      toast.error("Please select a contractor");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateContractorBillingReport({
          contractorId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "json",
        });

        if ("data" in result) {
          setReportData(result.data);
          toast.success("Report generated");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate report";
        toast.error(message);
      }
    });
  };

  const handleDownloadCSV = () => {
    if (!contractorId) {
      toast.error("Please select a contractor");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateContractorBillingReport({
          contractorId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "csv",
        });

        if ("csv" in result) {
          // Create and download file
          const blob = new Blob([result.csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contractor-billing-${startDate}-${endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("CSV downloaded");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to download CSV";
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Contractor Billing Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="contractor">Contractor</Label>
              <Select
                value={contractorId || "none"}
                onValueChange={(value) => setContractorId(value === "none" ? "" : value)}
              >
                <SelectTrigger id="contractor" className="w-full mt-1" aria-label="Select contractor">
                  <SelectValue placeholder="Select contractor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select contractor...</SelectItem>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <DatePickerString
                id="startDate"
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
                aria-label="Start date"
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <DatePickerString
                id="endDate"
                value={endDate}
                onChange={setEndDate}
                placeholder="End date"
                aria-label="End date"
                className="w-full mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerateReport} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV} disabled={isPending}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{reportData.contractor.companyName} - Billing Report</CardTitle>
              <span className="text-sm text-slate-500">
                {formatDate(reportData.period.start)} - {formatDate(reportData.period.end)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-slate-100">
                <p className="text-sm text-slate-600">Total Claims</p>
                <p className="text-2xl font-bold">{reportData.totals.claimCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-100">
                <p className="text-sm text-green-700">Total Increase</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(reportData.totals.totalIncrease)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-100">
                <p className="text-sm text-blue-700">
                  Total Billing ({(reportData.contractor.billingPercentage * 100).toFixed(1)}%)
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(reportData.totals.totalBilling)}
                </p>
              </div>
            </div>

            {/* Claims Table */}
            {reportData.claims.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No claims found for this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium">Policyholder</th>
                      <th className="text-left p-3 font-medium">Address</th>
                      <th className="text-right p-3 font-medium">Total Increase</th>
                      <th className="text-right p-3 font-medium">Billing</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.claims.map((claim) => (
                      <tr key={claim.id} className="border-b">
                        <td className="p-3 font-medium">{claim.policyholderName}</td>
                        <td className="p-3 text-slate-600">{claim.lossAddress}</td>
                        <td className="p-3 text-right text-green-600">
                          {formatCurrency(claim.totalIncrease)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(claim.billingAmount)}
                        </td>
                        <td className="p-3">{claim.status}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-medium">
                      <td colSpan={2} className="p-3">Totals</td>
                      <td className="p-3 text-right text-green-600">
                        {formatCurrency(reportData.totals.totalIncrease)}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(reportData.totals.totalBilling)}
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EstimatorCommissionReport({
  estimators,
}: {
  estimators: { id: string; firstName: string; lastName: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [estimatorId, setEstimatorId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [reportData, setReportData] = useState<EstimatorCommissionReportData | null>(null);

  const handleGenerateReport = () => {
    if (!estimatorId) {
      toast.error("Please select an estimator");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateEstimatorCommissionReport({
          estimatorId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "json",
        });

        if ("data" in result) {
          setReportData(result.data);
          toast.success("Report generated");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate report";
        toast.error(message);
      }
    });
  };

  const handleDownloadCSV = () => {
    if (!estimatorId) {
      toast.error("Please select an estimator");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateEstimatorCommissionReport({
          estimatorId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "csv",
        });

        if ("csv" in result) {
          const blob = new Blob([result.csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `estimator-commission-${startDate}-${endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("CSV downloaded");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to download CSV";
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Estimator Commission Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="estimator">Estimator</Label>
              <Select
                value={estimatorId || "none"}
                onValueChange={(value) => setEstimatorId(value === "none" ? "" : value)}
              >
                <SelectTrigger id="estimator" className="w-full mt-1" aria-label="Select estimator">
                  <SelectValue placeholder="Select estimator..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select estimator...</SelectItem>
                  {estimators.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estStartDate">Start Date</Label>
              <DatePickerString
                id="estStartDate"
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
                aria-label="Start date"
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="estEndDate">End Date</Label>
              <DatePickerString
                id="estEndDate"
                value={endDate}
                onChange={setEndDate}
                placeholder="End date"
                aria-label="End date"
                className="w-full mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerateReport} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV} disabled={isPending}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {reportData.estimator.firstName} {reportData.estimator.lastName} - Commission Report
              </CardTitle>
              <span className="text-sm text-slate-500">
                {formatDate(reportData.period.start)} - {formatDate(reportData.period.end)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-100">
                <p className="text-sm text-slate-600">Total Claims</p>
                <p className="text-2xl font-bold">{reportData.totals.claimCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-100">
                <p className="text-sm text-green-700">Total Increase</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(reportData.totals.totalIncrease)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-100">
                <p className="text-sm text-blue-700">
                  Total Commission ({(reportData.estimator.commissionPercentage * 100).toFixed(1)}%)
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(reportData.totals.totalCommission)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-100">
                <p className="text-sm text-purple-700">Avg $/Square</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatCurrency(reportData.totals.avgDollarPerSquare)}
                </p>
              </div>
            </div>

            {/* Claims Table */}
            {reportData.claims.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No claims found for this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium">Policyholder</th>
                      <th className="text-left p-3 font-medium">Contractor</th>
                      <th className="text-right p-3 font-medium">Total Increase</th>
                      <th className="text-right p-3 font-medium">Commission</th>
                      <th className="text-right p-3 font-medium">$/Sq</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.claims.map((claim) => (
                      <tr key={claim.id} className="border-b">
                        <td className="p-3 font-medium">{claim.policyholderName}</td>
                        <td className="p-3 text-slate-600">{claim.contractorName}</td>
                        <td className="p-3 text-right text-green-600">
                          {formatCurrency(claim.totalIncrease)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(claim.commission)}
                        </td>
                        <td className="p-3 text-right">{formatCurrency(claim.dollarPerSquare)}</td>
                        <td className="p-3">{claim.status}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-medium">
                      <td colSpan={2} className="p-3">Totals</td>
                      <td className="p-3 text-right text-green-600">
                        {formatCurrency(reportData.totals.totalIncrease)}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(reportData.totals.totalCommission)}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(reportData.totals.avgDollarPerSquare)}
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContractorOwnBillingReport({
  contractorInfo,
}: {
  contractorInfo: { id: string; companyName: string; billingPercentage: unknown };
}) {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First of current month
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [reportData, setReportData] = useState<ContractorBillingReportData | null>(null);

  const handleGenerateReport = () => {
    startTransition(async () => {
      try {
        const result = await generateContractorOwnBillingReport({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "json",
        });

        if ("data" in result) {
          setReportData(result.data);
          toast.success("Report generated");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate report";
        toast.error(message);
      }
    });
  };

  const handleDownloadCSV = () => {
    startTransition(async () => {
      try {
        const result = await generateContractorOwnBillingReport({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          format: "csv",
        });

        if ("csv" in result) {
          // Create and download file
          const blob = new Blob([result.csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `billing-report-${startDate}-${endDate}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("CSV downloaded");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to download CSV";
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Report - {contractorInfo.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <DatePickerString
                id="startDate"
                value={startDate}
                onChange={setStartDate}
                placeholder="Start date"
                aria-label="Start date"
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <DatePickerString
                id="endDate"
                value={endDate}
                onChange={setEndDate}
                placeholder="End date"
                aria-label="End date"
                className="w-full mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerateReport} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV} disabled={isPending}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Amount Owed to Rise Roofing</CardTitle>
              <span className="text-sm text-slate-500">
                {formatDate(reportData.period.start)} - {formatDate(reportData.period.end)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-slate-100">
                <p className="text-sm text-slate-600">Total Claims</p>
                <p className="text-2xl font-bold">{reportData.totals.claimCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-100">
                <p className="text-sm text-green-700">Total Increase</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(reportData.totals.totalIncrease)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-100">
                <p className="text-sm text-blue-700">
                  Amount Owed ({(reportData.contractor.billingPercentage * 100).toFixed(1)}%)
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(reportData.totals.totalBilling)}
                </p>
              </div>
            </div>

            {/* Claims Table */}
            {reportData.claims.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No claims found for this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium">Policyholder</th>
                      <th className="text-left p-3 font-medium">Address</th>
                      <th className="text-right p-3 font-medium">Total Increase</th>
                      <th className="text-right p-3 font-medium">Amount Owed</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.claims.map((claim) => (
                      <tr key={claim.id} className="border-b">
                        <td className="p-3 font-medium">{claim.policyholderName}</td>
                        <td className="p-3 text-slate-600">{claim.lossAddress}</td>
                        <td className="p-3 text-right text-green-600">
                          {formatCurrency(claim.totalIncrease)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(claim.billingAmount)}
                        </td>
                        <td className="p-3">{claim.status}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-medium">
                      <td colSpan={2} className="p-3">Totals</td>
                      <td className="p-3 text-right text-green-600">
                        {formatCurrency(reportData.totals.totalIncrease)}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrency(reportData.totals.totalBilling)}
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
