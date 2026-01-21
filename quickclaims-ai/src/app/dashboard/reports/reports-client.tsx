"use client";

import { useState, useTransition } from "react";
import { Download, FileText, Loader2, DollarSign, ChevronDown, ChevronRight, CheckCircle, FileDown } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!reportData) {
      toast.error("Generate a report first");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Contractor Billing Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Contractor: ${reportData.contractor.companyName}`, 14, 32);
    doc.text(`Billing Rate: ${(reportData.contractor.billingPercentage * 100).toFixed(1)}%`, 14, 38);
    doc.text(`Period: ${formatDate(reportData.period.start)} - ${formatDate(reportData.period.end)}`, 14, 44);
    
    // Summary
    doc.setFontSize(12);
    doc.text("Summary", 14, 56);
    doc.setFontSize(10);
    doc.text(`Total Claims: ${reportData.totals.claimCount}`, 14, 64);
    doc.text(`Total Supplements: ${reportData.totals.supplementCount}`, 14, 70);
    doc.text(`Total Increase: ${formatCurrency(reportData.totals.totalIncrease)}`, 14, 76);
    doc.text(`Total Billing: ${formatCurrency(reportData.totals.totalBilling)}`, 14, 82);
    
    // Claims table
    const tableData = reportData.claims.map((claim) => [
      claim.policyholderName,
      formatCurrency(claim.initialRCV),
      claim.finalRCV ? formatCurrency(claim.finalRCV) : "-",
      formatCurrency(claim.totalIncrease),
      formatCurrency(claim.billingAmount),
      claim.supplements.length.toString(),
    ]);
    
    autoTable(doc, {
      startY: 92,
      head: [["Policyholder", "Initial RCV", "Final RCV", "Increase", "Billing", "Supps"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    
    doc.save(`contractor-billing-${startDate}-${endDate}.pdf`);
    toast.success("PDF downloaded");
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
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleGenerateReport} disabled={isPending} className="w-full">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={handleDownloadCSV} disabled={isPending} className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} disabled={isPending || !reportData} className="flex-1">
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
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
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-100">
                <p className="text-sm text-slate-600">Total Claims</p>
                <p className="text-2xl font-bold">{reportData.totals.claimCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-100">
                <p className="text-sm text-amber-700">Total Supplements</p>
                <p className="text-2xl font-bold text-amber-800">{reportData.totals.supplementCount}</p>
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

            {/* Claims Table - Enhanced with Initial/Final RCV and supplements */}
            {reportData.claims.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No claims found for this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium w-8"></th>
                      <th className="text-left p-3 font-medium">Policyholder</th>
                      <th className="text-right p-3 font-medium">Initial RCV</th>
                      <th className="text-right p-3 font-medium">Final RCV</th>
                      <th className="text-right p-3 font-medium">Increase</th>
                      <th className="text-right p-3 font-medium">Billing</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.claims.map((claim) => (
                      <ClaimRowWithSupplements key={claim.id} claim={claim} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-medium">
                      <td colSpan={4} className="p-3">Totals</td>
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

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!reportData) {
      toast.error("Generate a report first");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Estimator Commission Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Estimator: ${reportData.estimator.firstName} ${reportData.estimator.lastName}`, 14, 32);
    doc.text(`Commission Rate: ${(reportData.estimator.commissionPercentage * 100).toFixed(1)}%`, 14, 38);
    doc.text(`Period: ${formatDate(reportData.period.start)} - ${formatDate(reportData.period.end)}`, 14, 44);
    
    // Summary
    doc.setFontSize(12);
    doc.text("Summary", 14, 56);
    doc.setFontSize(10);
    doc.text(`Total Claims: ${reportData.totals.claimCount}`, 14, 64);
    doc.text(`Total Increase: ${formatCurrency(reportData.totals.totalIncrease)}`, 14, 70);
    doc.text(`Total Commission: ${formatCurrency(reportData.totals.totalCommission)}`, 14, 76);
    doc.text(`Avg $/Sq: ${formatCurrency(reportData.totals.avgDollarPerSquare)}`, 14, 82);
    
    // Claims table
    const tableData = reportData.claims.map((claim) => [
      claim.policyholderName,
      claim.contractorName,
      formatCurrency(claim.totalIncrease),
      formatCurrency(claim.commission),
      formatCurrency(claim.dollarPerSquare),
    ]);
    
    autoTable(doc, {
      startY: 92,
      head: [["Policyholder", "Contractor", "Increase", "Commission", "$/Sq"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
    });
    
    doc.save(`estimator-commission-${startDate}-${endDate}.pdf`);
    toast.success("PDF downloaded");
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
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isPending || !reportData}>
                <FileText className="h-4 w-4 mr-1" />
                PDF
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

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!reportData) {
      toast.error("Generate a report first");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Billing Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Contractor: ${contractorInfo.companyName}`, 14, 32);
    doc.text(`Billing Rate: ${(reportData.contractor.billingPercentage * 100).toFixed(1)}%`, 14, 38);
    doc.text(`Period: ${formatDate(reportData.period.start)} - ${formatDate(reportData.period.end)}`, 14, 44);
    
    // Summary
    doc.setFontSize(12);
    doc.text("Summary", 14, 56);
    doc.setFontSize(10);
    doc.text(`Total Claims: ${reportData.totals.claimCount}`, 14, 64);
    doc.text(`Total Increase: ${formatCurrency(reportData.totals.totalIncrease)}`, 14, 70);
    doc.text(`Amount Owed: ${formatCurrency(reportData.totals.totalBilling)}`, 14, 76);
    
    // Claims table
    const tableData = reportData.claims.map((claim) => [
      claim.policyholderName,
      formatCurrency(claim.initialRCV),
      claim.finalRCV ? formatCurrency(claim.finalRCV) : "-",
      formatCurrency(claim.totalIncrease),
      formatCurrency(claim.billingAmount),
    ]);
    
    autoTable(doc, {
      startY: 86,
      head: [["Policyholder", "Initial RCV", "Final RCV", "Increase", "Amount Owed"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    
    doc.save(`billing-report-${startDate}-${endDate}.pdf`);
    toast.success("PDF downloaded");
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
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isPending || !reportData}>
                <FileText className="h-4 w-4 mr-1" />
                PDF
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

// Expandable claim row with supplements for billing reports
function ClaimRowWithSupplements({
  claim,
}: {
  claim: {
    id: string;
    policyholderName: string;
    lossAddress: string;
    initialRCV: number;
    finalRCV: number | null;
    totalIncrease: number;
    billingAmount: number;
    status: string;
    supplements: {
      id: string;
      sequenceNumber: number;
      amount: number;
      description: string;
      status: string;
      omApproved: boolean;
    }[];
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSupplements = claim.supplements.length > 0;

  return (
    <>
      <tr className="border-b hover:bg-slate-50">
        <td className="p-3">
          {hasSupplements && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-slate-200 rounded"
              aria-label={expanded ? "Collapse supplements" : "Expand supplements"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
            </button>
          )}
        </td>
        <td className="p-3">
          <div className="font-medium">{claim.policyholderName}</div>
          {hasSupplements && (
            <div className="text-xs text-slate-500">{claim.supplements.length} supplement(s)</div>
          )}
        </td>
        <td className="p-3 text-right text-slate-600">{formatCurrency(claim.initialRCV)}</td>
        <td className="p-3 text-right text-slate-600">
          {claim.finalRCV ? formatCurrency(claim.finalRCV) : "-"}
        </td>
        <td className="p-3 text-right text-green-600">{formatCurrency(claim.totalIncrease)}</td>
        <td className="p-3 text-right font-medium">{formatCurrency(claim.billingAmount)}</td>
        <td className="p-3">{claim.status}</td>
      </tr>
      {/* Supplement sub-rows */}
      {expanded &&
        claim.supplements.map((supp) => (
          <tr key={supp.id} className="bg-slate-50 border-b">
            <td className="p-3"></td>
            <td className="p-3 pl-8" colSpan={2}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  SOL #{supp.sequenceNumber}
                </span>
                {supp.omApproved && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    O&P
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1 max-w-md truncate" title={supp.description}>
                {supp.description}
              </div>
            </td>
            <td className="p-3 text-right text-green-600">+{formatCurrency(supp.amount)}</td>
            <td className="p-3"></td>
            <td className="p-3 text-xs text-slate-500">{supp.status}</td>
          </tr>
        ))}
    </>
  );
}
