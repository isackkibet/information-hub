import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, className, id, ...props }: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        className={cn(error && "border-rose-500 focus-visible:ring-rose-500/40", className)}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormTextarea({ label, error, hint, className, id, ...props }: FormTextareaProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <textarea
        id={fieldId}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-rose-500 focus-visible:ring-rose-500/40",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormSelect({ label, error, hint, className, id, children, ...props }: FormSelectProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        className={cn(
          "flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          error && "border-rose-500 focus-visible:ring-rose-500/40",
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
