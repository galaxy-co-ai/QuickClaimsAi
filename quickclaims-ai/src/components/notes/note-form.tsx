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

interface NoteFormProps {
  claimId: string;
}

export function NoteForm({ claimId }: NoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [noteType, setNoteType] = useState<"general" | "carrier_communication" | "internal">("general");

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
          isInternal: noteType === "internal",
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

  const typeButtons = [
    { value: "general" as const, label: "Note", color: "bg-slate-100 hover:bg-slate-200 border-slate-300" },
    { value: "carrier_communication" as const, label: "Carrier", color: "bg-purple-100 hover:bg-purple-200 border-purple-300" },
    { value: "internal" as const, label: "Internal", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label className="text-sm text-slate-600 mb-2 block">Add a note</Label>
        <Textarea
          {...register("content")}
          placeholder="Type your note here..."
          rows={3}
          className="resize-none"
          disabled={isPending}
        />
        {errors.content && (
          <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {typeButtons.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setNoteType(type.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                noteType === type.value
                  ? `${type.color} ring-2 ring-offset-1 ring-slate-400`
                  : "bg-white border-slate-200 hover:bg-slate-50"
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
              <Send className="h-4 w-4 mr-1" />
              Add Note
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
