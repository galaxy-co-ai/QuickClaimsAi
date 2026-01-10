"use client";

import { useState } from "react";
import { Download, FileText, MessageSquare, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { decimalToNumber } from "@/lib/calculations";
import { addContractorComment } from "@/actions/contractor-portal";
import { cn } from "@/lib/utils";
import type { Decimal } from "@prisma/client/runtime/library";

interface Supplement {
  id: string;
  amount: Decimal;
  description: string;
  status: string;
  createdAt: Date;
  approvedAmount: Decimal | null;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

interface Note {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Claim {
  id: string;
  supplements: Supplement[];
  documents: Document[];
  notes: Note[];
}

interface ContractorClaimTabsProps {
  claim: Claim;
}

const SUPPLEMENT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800",
  submitted: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  partial: "bg-orange-100 text-orange-800",
};

const SUPPLEMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  partial: "Partial",
};

export function ContractorClaimTabs({ claim }: ContractorClaimTabsProps) {
  const [activeTab, setActiveTab] = useState<"supplements" | "documents" | "timeline">("supplements");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "supplements" as const, label: "Supplements", icon: FileText, count: claim.supplements.length },
    { id: "documents" as const, label: "Documents", icon: Download, count: claim.documents.length },
    { id: "timeline" as const, label: "Timeline", icon: Clock, count: claim.notes.length },
  ];

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addContractorComment(claim.id, comment);
      setComment("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "supplements" && (
          <div className="space-y-4">
            {claim.supplements.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No supplements yet</p>
            ) : (
              claim.supplements.map((supp) => (
                <div key={supp.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{supp.description}</p>
                      <p className="text-sm text-slate-500">
                        Added by {supp.createdBy.firstName} {supp.createdBy.lastName} on{" "}
                        {new Date(supp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={SUPPLEMENT_STATUS_COLORS[supp.status]}>
                      {SUPPLEMENT_STATUS_LABELS[supp.status]}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-500">Amount: </span>
                      <span className="font-medium">
                        {"$" + decimalToNumber(supp.amount).toLocaleString()}
                      </span>
                    </div>
                    {supp.approvedAmount && (
                      <div>
                        <span className="text-slate-500">Approved: </span>
                        <span className="font-medium text-green-600">
                          {"$" + decimalToNumber(supp.approvedAmount).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2">
            {claim.documents.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No documents yet</p>
            ) : (
              claim.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium">{doc.originalFilename}</p>
                      <p className="text-sm text-slate-500">
                        {DOCUMENT_TYPE_LABELS[doc.type] || doc.type} |{" "}
                        {(doc.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-slate-400" />
                </a>
              ))
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            {/* Comment Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !comment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Comment"}
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="border-t pt-4">
              {claim.notes.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {claim.notes.map((note) => (
                    <div key={note.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {note.user.firstName} {note.user.lastName}
                          </span>
                          <span className="text-sm text-slate-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
