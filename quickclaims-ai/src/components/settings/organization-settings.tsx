"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Clock,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateOrganizationSettings } from "@/actions/settings";
import { toast } from "sonner";

interface OrganizationSettingsProps {
  settings: {
    companyName: string | null;
    logoUrl: string | null;
    primaryContactEmail: string | null;
    businessAddress: string | null;
    complianceHours: number;
    reportHeader: string | null;
    reportFooter: string | null;
  } | null;
}

export function OrganizationSettings({ settings }: OrganizationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: settings?.companyName ?? "",
    primaryContactEmail: settings?.primaryContactEmail ?? "",
    businessAddress: settings?.businessAddress ?? "",
    complianceHours: settings?.complianceHours ?? 48,
    reportHeader: settings?.reportHeader ?? "",
    reportFooter: settings?.reportFooter ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "complianceHours" ? parseInt(value) || 48 : value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateOrganizationSettings({
        companyName: formData.companyName || undefined,
        primaryContactEmail: formData.primaryContactEmail || undefined,
        businessAddress: formData.businessAddress || undefined,
        complianceHours: formData.complianceHours,
        reportHeader: formData.reportHeader || undefined,
        reportFooter: formData.reportFooter || undefined,
      });
      if (result.success) {
        toast.success("Organization settings saved");
      }
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Organization</h2>
        <p className="text-sm text-slate-500">
          Configure your company information and settings
        </p>
      </div>

      {/* Company Information Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-800 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          Company Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Rise Roofing Supplements"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              name="primaryContactEmail"
              type="email"
              value={formData.primaryContactEmail}
              onChange={handleChange}
              placeholder="contact@company.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address</Label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder="123 Main Street&#10;Suite 100&#10;Austin, TX 78701"
            rows={3}
            className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          />
          <p className="text-xs text-slate-500">
            This address will appear on generated reports and invoices
          </p>
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="font-medium text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          Compliance Settings
        </h3>

        <div className="space-y-2 max-w-xs">
          <Label htmlFor="complianceHours">Compliance Threshold (Hours)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="complianceHours"
              name="complianceHours"
              type="number"
              min="12"
              max="168"
              value={formData.complianceHours}
              onChange={handleChange}
              className="w-24"
            />
            <span className="text-slate-500">hours</span>
          </div>
          <p className="text-xs text-slate-500">
            Claims without activity beyond this threshold will be flagged.
            Default is 48 hours per Rise&apos;s commitment.
          </p>
        </div>
      </div>

      {/* Report Customization */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="font-medium text-slate-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Report Customization
        </h3>

        <div className="space-y-2">
          <Label htmlFor="reportHeader">Report Header Text</Label>
          <textarea
            id="reportHeader"
            name="reportHeader"
            value={formData.reportHeader}
            onChange={handleChange}
            placeholder="Optional header text that appears at the top of generated reports..."
            rows={2}
            className="flex min-h-[60px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportFooter">Report Footer Text</Label>
          <textarea
            id="reportFooter"
            name="reportFooter"
            value={formData.reportFooter}
            onChange={handleChange}
            placeholder="Payment terms, disclaimers, or other footer content..."
            rows={2}
            className="flex min-h-[60px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          />
          <p className="text-xs text-slate-500">
            Example: &quot;Payment due within 30 days of invoice date.&quot;
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
