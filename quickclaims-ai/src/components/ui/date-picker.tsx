"use client";

import * as React from "react";
import ReactDatePicker from "react-datepicker";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  id,
  className,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <ReactDatePicker
        id={id}
        selected={value}
        onChange={(date) => onChange?.(date ?? undefined)}
        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="MMM d, yyyy"
        aria-label={ariaLabel || placeholder}
        aria-invalid={ariaInvalid}
        className={cn(
          "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40",
          "placeholder:text-slate-500",
          ariaInvalid && "border-red-500 focus:ring-red-500/40",
          disabled && "cursor-not-allowed opacity-50"
        )}
        calendarClassName="!rounded-xl !border-slate-200/80 !shadow-lg !shadow-black/10 !font-sans"
        dayClassName={() => "!rounded-lg hover:!bg-slate-100"}
        popperClassName="!z-50"
        showPopperArrow={false}
        wrapperClassName="w-full"
      />
      <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// DatePicker variant that works with string values (YYYY-MM-DD format)
interface DatePickerStringProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function DatePickerString({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
}: DatePickerStringProps) {
  const dateValue = value ? parseISO(value) : null;

  return (
    <div className={cn("relative", className)}>
      <ReactDatePicker
        id={id}
        selected={dateValue}
        onChange={(date) => onChange?.(date ? format(date, "yyyy-MM-dd") : "")}
        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="MMM d, yyyy"
        aria-label={ariaLabel || placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40",
          "placeholder:text-slate-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
        calendarClassName="!rounded-xl !border-slate-200/80 !shadow-lg !shadow-black/10 !font-sans"
        dayClassName={() => "!rounded-lg hover:!bg-slate-100"}
        popperClassName="!z-50"
        showPopperArrow={false}
        wrapperClassName="w-full"
      />
      <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
