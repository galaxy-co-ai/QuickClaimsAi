"use client";

import { FileText, FolderOpen, Clock, Info, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplementFormModal } from "@/components/supplements/supplement-form-modal";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { NoteForm } from "@/components/notes/note-form";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { decimalToNumber } from "@/lib/calculations";
import { LOSS_TYPE_LABELS, DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import type { Claim, Supplement, Note, Document, User } from "@prisma/client";

type SupplementWithUser = Supplement & {
  createdBy: Pick<User, "firstName" | "lastName">;
};

type NoteWithUser = Note & {
  user: Pick<User, "firstName" | "lastName">;
};

interface ClaimDetailTabsProps {
  claim: Claim;
  supplements: SupplementWithUser[];
  notes: NoteWithUser[];
  documents: Document[];
}

export function ClaimDetailTabs({
  claim,
  supplements,
  notes,
  documents,
}: ClaimDetailTabsProps) {
  // Separate manual notes (Updates) from system-generated notes (Timeline)
  // Updates: general, call, email, document - these are estimator-entered notes
  // Timeline: status_change and all other activity
  const manualNoteTypes = ["general", "call", "email", "document"];
  const manualNotes = notes.filter((note) => manualNoteTypes.includes(note.type));
  const allActivityNotes = notes; // Timeline shows everything

  return (
    <Tabs defaultValue="updates" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="updates" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Updates ({manualNotes.length})
        </TabsTrigger>
        <TabsTrigger value="supplements" className="gap-2">
          <FileText className="h-4 w-4" />
          Supplements ({supplements.length})
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Documents ({documents.length})
        </TabsTrigger>
        <TabsTrigger value="timeline" className="gap-2">
          <Clock className="h-4 w-4" />
          Timeline ({allActivityNotes.length})
        </TabsTrigger>
        <TabsTrigger value="details" className="gap-2">
          <Info className="h-4 w-4" />
          Details
        </TabsTrigger>
      </TabsList>

      {/* Updates Tab - Manual notes entered by estimators */}
      <TabsContent value="updates">
        <Card>
          <CardHeader>
            <CardTitle>Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Note Input Form */}
            <div className="p-4 rounded-lg border bg-slate-50">
              <NoteForm claimId={claim.id} />
            </div>

            {/* Manual Notes */}
            {manualNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No updates yet</p>
                <p className="text-sm">Add a note above to track your updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {manualNotes.map((note) => (
                  <UpdateItem key={note.id} note={note} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Supplements Tab */}
      <TabsContent value="supplements">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Supplements</CardTitle>
            <SupplementFormModal
              claimId={claim.id}
              policyholderName={claim.policyholderName}
              currentRoofSquares={decimalToNumber(claim.totalSquares)}
            />
          </CardHeader>
          <CardContent>
            {supplements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No supplements yet</p>
                <p className="text-sm">Supplements will appear here when added</p>
              </div>
            ) : (
              <div className="space-y-3">
                {supplements.map((supplement, index) => (
                  <SupplementRow
                    key={supplement.id}
                    supplement={supplement}
                    index={supplements.length - index}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Documents Tab */}
      <TabsContent value="documents">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <DocumentUploadModal
              claimId={claim.id}
              policyholderName={claim.policyholderName}
            />
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No documents yet</p>
                <p className="text-sm">Documents will appear here when uploaded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentRow key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Timeline Tab - Full Activity Log */}
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Complete history of all activity including status changes, supplements, and documents
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline Entries - All activity */}
            {allActivityNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No activity yet</p>
                <p className="text-sm">Activity will appear here as the claim progresses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allActivityNotes.map((note) => (
                  <TimelineItem key={note.id} note={note} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Insurance Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Insurance Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Claim Number</span>
                    <span className="font-medium">{claim.claimNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Loss</span>
                    <span className="font-medium">
                      {claim.dateOfLoss ? formatDate(claim.dateOfLoss) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loss Type</span>
                    <span className="font-medium">
                      {claim.lossType ? LOSS_TYPE_LABELS[claim.lossType] : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Job Type</span>
                    <span className="font-medium capitalize">
                      {claim.jobType.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roof Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Roof Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Squares</span>
                    <span className="font-medium">
                      {decimalToNumber(claim.totalSquares)} sq
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roof RCV</span>
                    <span className="font-medium">
                      {formatCurrency(decimalToNumber(claim.roofRCV))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">$/Square</span>
                    <span className="font-medium">
                      {formatCurrency(decimalToNumber(claim.dollarPerSquare))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">
                      {claim.policyholderEmail || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium">
                      {claim.policyholderPhone || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Timestamps</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-medium">{formatDateTime(claim.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Activity</span>
                    <span className="font-medium">
                      {formatDateTime(claim.lastActivityAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Changed</span>
                    <span className="font-medium">
                      {formatDateTime(claim.statusChangedAt)}
                    </span>
                  </div>
                  {claim.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Completed</span>
                      <span className="font-medium">
                        {formatDateTime(claim.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function SupplementRow({
  supplement,
  index,
}: {
  supplement: SupplementWithUser;
  index: number;
}) {
  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    denied: "bg-red-100 text-red-700",
    partial: "bg-orange-100 text-orange-700",
  };

  const amount = decimalToNumber(supplement.amount);
  const approvedAmount = supplement.approvedAmount
    ? decimalToNumber(supplement.approvedAmount)
    : null;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium">
          #{index}
        </div>
        <div>
          <p className="font-medium">{supplement.description}</p>
          <p className="text-sm text-slate-500">
            by {supplement.createdBy.firstName} {supplement.createdBy.lastName} on{" "}
            {formatDate(supplement.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium text-green-600">+{formatCurrency(amount)}</p>
          {approvedAmount !== null && approvedAmount !== amount && (
            <p className="text-sm text-slate-500">
              Approved: {formatCurrency(approvedAmount)}
            </p>
          )}
        </div>
        <Badge className={statusColors[supplement.status] || statusColors.draft}>
          {supplement.status.charAt(0).toUpperCase() + supplement.status.slice(1)}
        </Badge>
      </div>
    </div>
  );
}

function DocumentRow({ document }: { document: Document }) {
  const typeLabel = DOCUMENT_TYPE_LABELS[document.type] || document.type;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
      <div className="flex items-center gap-4">
        <FolderOpen className="h-5 w-5 text-slate-400" />
        <div>
          <p className="font-medium">{document.originalFilename}</p>
          <p className="text-sm text-slate-500">
            {typeLabel} - {formatDate(document.uploadedAt)}
          </p>
        </div>
      </div>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        View
      </a>
    </div>
  );
}

// UpdateItem - for the Updates tab (manual notes only)
function UpdateItem({ note }: { note: NoteWithUser }) {
  const typeColors: Record<string, string> = {
    general: "bg-slate-100 border-slate-300",
    call: "bg-green-100 border-green-300",
    email: "bg-blue-100 border-blue-300",
    document: "bg-amber-100 border-amber-300",
  };

  const typeLabels: Record<string, string> = {
    general: "General",
    call: "Call",
    email: "Email",
    document: "Document",
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${typeColors[note.type] || typeColors.general}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {note.user.firstName} {note.user.lastName}
          </span>
          <Badge variant="outline" className="text-xs">
            {typeLabels[note.type] || note.type}
          </Badge>
        </div>
        <span className="text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}

// TimelineItem - for the full activity timeline
function TimelineItem({ note }: { note: NoteWithUser }) {
  const typeColors: Record<string, string> = {
    general: "bg-slate-100 border-slate-300",
    status_change: "bg-blue-100 border-blue-300",
    call: "bg-green-100 border-green-300",
    email: "bg-blue-100 border-blue-300",
    document: "bg-amber-100 border-amber-300",
  };

  const typeLabels: Record<string, string> = {
    general: "Note",
    status_change: "Status Change",
    call: "Call",
    email: "Email",
    document: "Document",
  };

  const isSystemGenerated = note.type === "status_change";

  return (
    <div className={`p-4 rounded-lg border-l-4 ${typeColors[note.type] || typeColors.general}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSystemGenerated && <CheckCircle className="h-4 w-4 text-blue-500" />}
          <span className="text-sm font-medium">
            {note.user.firstName} {note.user.lastName}
          </span>
          <Badge variant={isSystemGenerated ? "secondary" : "outline"} className="text-xs">
            {typeLabels[note.type] || note.type}
          </Badge>
        </div>
        <span className="text-xs text-slate-500">{formatDateTime(note.createdAt)}</span>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
