"use client";

import { useState } from "react";
import { DollarSign, Percent, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateOrganizationSettings } from "@/actions/settings";
import { toast } from "sonner";

interface BillingDefaultsProps {
  settings: {
    defaultBillingPct: number;
    defaultCommissionPct: number;
  } | null;
}

export function BillingDefaults({ settings }: BillingDefaultsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Store as percentages for display (e.g., 12.5 instead of 0.125)
    defaultBillingPct: (settings?.defaultBillingPct ?? 0.125) * 100,
    defaultCommissionPct: (settings?.defaultCommissionPct ?? 0.05) * 100,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert back to decimals for storage
      const result = await updateOrganizationSettings({
        defaultBillingPct: formData.defaultBillingPct / 100,
        defaultCommissionPct: formData.defaultCommissionPct / 100,
      });
      if (result.success) {
        toast.success("Billing defaults saved");
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
        <h2 className="text-lg font-semibold text-slate-900">Billing Defaults</h2>
        <p className="text-sm text-slate-500">
          Set default percentages for new contractors and estimators
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
        <div className="flex gap-3">
          <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              These are default values only
            </p>
            <p className="text-sm text-blue-700 mt-1">
              When creating new contractors or estimators, these percentages will
              be pre-filled. You can always adjust them for individual records.
            </p>
          </div>
        </div>
      </div>

      {/* Billing Percentage */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="billingPct" className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-slate-400" />
            Default Contractor Billing Percentage
          </Label>
          <div className="flex items-center gap-2 max-w-xs">
            <Input
              id="billingPct"
              type="number"
              min="5"
              max="30"
              step="0.5"
              value={formData.defaultBillingPct}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultBillingPct: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-24"
            />
            <span className="text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-500">
            Rise charges contractors this percentage of the claim increase value.
            Typically 10-15%.
          </p>
        </div>

        {/* Commission Percentage */}
        <div className="space-y-2">
          <Label htmlFor="commissionPct" className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-slate-400" />
            Default Estimator Commission Percentage
          </Label>
          <div className="flex items-center gap-2 max-w-xs">
            <Input
              id="commissionPct"
              type="number"
              min="1"
              max="15"
              step="0.5"
              value={formData.defaultCommissionPct}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultCommissionPct: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-24"
            />
            <span className="text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-500">
            Rise pays estimators this percentage of the claim increase value as
            commission. Typically 5%.
          </p>
        </div>
      </div>

      {/* Current Values Preview */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">On a $10,000 increase:</span>
          </div>
          <div></div>
          <div className="flex justify-between">
            <span className="text-slate-600">Contractor Bill:</span>
            <span className="font-medium text-slate-900">
              ${((10000 * formData.defaultBillingPct) / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Estimator Commission:</span>
            <span className="font-medium text-slate-900">
              ${((10000 * formData.defaultCommissionPct) / 100).toFixed(2)}
            </span>
          </div>
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
