import Link from "next/link";

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
  className?: string;
  children: React.ReactNode;
}

interface AdminSwitchFieldProps {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
  className?: string;
}

interface AdminFormActionsProps {
  submitLabel: string;
  cancelHref: string;
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

export function AdminField({ id, label, hint, className, children }: AdminFieldProps) {
  return (
    <div className={className ?? "grid gap-2"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AdminSwitchField({ name, label, hint, checked, className = "" }: AdminSwitchFieldProps) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-lg border p-4 ${className}`}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch name={name} defaultChecked={checked} aria-label={label}/>
    </div>
  );
}

// Todo: Submit through a server action
export function AdminFormActions({ submitLabel, cancelHref }: AdminFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" asChild><Link href={cancelHref}>Cancel</Link></Button>
      <Button type="button">{submitLabel}</Button>
    </div>
  );
}
