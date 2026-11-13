import Link from "next/link";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

interface AdminFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

interface AdminSwitchFieldProps {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  className?: string;
}

interface AdminFormActionsProps {
  submitLabel: string;
  cancelHref: string;
  pending?: boolean;
}

export function AdminFormSection({ title, description, children }: AdminFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function AdminField({ id, label, hint, error, className, children }: AdminFieldProps) {
  return (
    <div className={className ?? "grid content-start gap-2"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AdminSwitchField({ name, label, hint, checked, onCheckedChange, error, className = "" }: AdminSwitchFieldProps) {
  const errorId = `${name}-error`;
  const state = onCheckedChange ? { checked, onCheckedChange } : { defaultChecked: checked }
  return (
    <div className={`grid gap-2 rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Switch name={name} {...state} aria-label={label} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}/>
      </div>
      {error && <p id={errorId} className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function AdminFormActions({ submitLabel, cancelHref, pending = false }: AdminFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" asChild><Link href={cancelHref}>Cancel</Link></Button>
      <Button type="submit" disabled={pending}>
        {pending && <LoaderCircle aria-hidden className="animate-spin"/>}
        {submitLabel}
      </Button>
    </div>
  );
}
