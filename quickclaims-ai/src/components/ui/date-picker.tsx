"use client";

import * as React from "react";
import ReactDatePicker from "react-datepicker";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";

// Custom input component with proper ARIA support
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      value,
      onClick,
      onChange,
      placeholder,
      disabled,
      id,
      className,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
    },
    ref
  ) => (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        autoComplete="off"
        readOnly
        className={cn(
          "h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40",
          "placeholder:text-slate-500",
          ariaInvalid && "border-red-500 focus:ring-red-500/40",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      />
      <CalendarIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  )
);
CustomDateInput.displayName = "CustomDateInput";

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
        onChange={(date: Date | null) => onChange?.(date ?? undefined)}
        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="MMM d, yyyy"
        customInput={
          <CustomDateInput
            aria-invalid={ariaInvalid}
            aria-label={ariaLabel || placeholder}
          />
        }
        calendarClassName="!rounded-xl !border-slate-200/80 !shadow-lg !shadow-black/10 !font-sans"
        dayClassName={() => "!rounded-lg hover:!bg-slate-100"}
        popperClassName="!z-50"
        showPopperArrow={false}
        wrapperClassName="w-full"
      />
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
        onChange={(date: Date | null) => onChange?.(date ? format(date, "yyyy-MM-dd") : "")}
        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="MMM d, yyyy"
        customInput={
          <CustomDateInput aria-label={ariaLabel || placeholder} />
        }
        calendarClassName="!rounded-xl !border-slate-200/80 !shadow-lg !shadow-black/10 !font-sans"
        dayClassName={() => "!rounded-lg hover:!bg-slate-100"}
        popperClassName="!z-50"
        showPopperArrow={false}
        wrapperClassName="w-full"
      />
    </div>
  );
}
