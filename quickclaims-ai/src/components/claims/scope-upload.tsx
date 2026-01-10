"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseInsuranceScope, type ExtractedScopeData } from "@/actions/scope-parser";

interface ScopeUploadProps {
  onDataExtracted: (data: ExtractedScopeData) => void;
  disabled?: boolean;
}

export function ScopeUpload({ onDataExtracted, disabled }: ScopeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setSuccess(false);
    setFileName(file.name);
    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Call the server action
      const result = await parseInsuranceScope(formData);

      if (result.success && result.data) {
        setSuccess(true);
        onDataExtracted(result.data);

        // Reset success state after a delay
        setTimeout(() => {
          setSuccess(false);
          setFileName(null);
        }, 3000);
      } else {
        setError(result.error || "Failed to extract data from PDF");
      }
    } catch (err) {
      console.error("Error uploading scope:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="w-full border-dashed border-2 h-auto py-4 hover:bg-slate-50"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Extracting data...</p>
                <p className="text-sm text-slate-500">
                  AI is reading {fileName || "the PDF"}
                </p>
              </div>
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Data extracted successfully!</p>
                <p className="text-sm text-slate-500">
                  Review and edit the fields below
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-slate-400" />
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Upload Insurance Scope PDF</p>
                <p className="text-sm text-slate-500">
                  Auto-fill form fields from adjuster&apos;s estimate
                </p>
              </div>
            </>
          )}
        </div>
      </Button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800">Failed to extract data</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
