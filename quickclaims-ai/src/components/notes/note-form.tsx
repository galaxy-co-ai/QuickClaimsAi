"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNote } from "@/actions/notes";

const noteFormSchema = z.object({
  content: z.string().min(1, "Note content is required").max(10000, "Note is too long"),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

// Updated note types per client request
type NoteTypeValue = "general" | "call" | "email" | "document";

interface NoteFormProps {
  claimId: string;
}

export function NoteForm({ claimId }: NoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [noteType, setNoteType] = useState<NoteTypeValue>("general");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data: NoteFormValues) => {
    startTransition(async () => {
      try {
        await createNote({
          claimId,
          content: data.content,
          type: noteType,
          isInternal: false,
        });
        toast.success("Note added");
        reset();
        setNoteType("general");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add note";
        toast.error(message);
      }
    });
  };

  // Updated type buttons per client request: General, Call, Email, Document
  const typeButtons: Array<{ value: NoteTypeValue; label: string; color: string }> = [
    { value: "general", label: "General", color: "bg-[var(--rr-color-sand)] hover:bg-[var(--rr-color-sand-light)] border-[var(--rr-color-border-default)]" },
    { value: "call", label: "Call", color: "bg-[var(--rr-color-success)]/10 hover:bg-[var(--rr-color-success)]/20 border-[var(--rr-color-success)]/30" },
    { value: "email", label: "Email", color: "bg-[var(--rr-color-info)]/10 hover:bg-[var(--rr-color-info)]/20 border-[var(--rr-color-info)]/30" },
    { value: "document", label: "Document", color: "bg-[var(--rr-color-warning)]/10 hover:bg-[var(--rr-color-warning)]/20 border-[var(--rr-color-warning)]/30" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--rr-space-3)]">
      <div>
        <Label className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)] mb-[var(--rr-space-2)] block">Add a note</Label>
        <Textarea
          {...register("content")}
          placeholder="Type your note here..."
          rows={3}
          className="resize-none"
          disabled={isPending}
        />
        {errors.content && (
          <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-error)] mt-[var(--rr-space-1)]">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-[var(--rr-space-2)]">
          {typeButtons.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setNoteType(type.value)}
              aria-pressed={noteType === type.value}
              aria-label={`Set note type to ${type.label}`}
              className={`px-[var(--rr-space-3)] py-[var(--rr-space-1)] text-[var(--rr-font-size-xs)] font-[var(--rr-font-weight-medium)] rounded-[var(--rr-radius-full)] border transition-colors ${
                noteType === type.value
                  ? `${type.color} ring-2 ring-offset-1 ring-[var(--rr-color-stone)]`
                  : "bg-[var(--rr-color-bg-secondary)] border-[var(--rr-color-border-default)] hover:bg-[var(--rr-color-surface-hover)]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-[var(--rr-space-1)]" />
              Add Note
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
