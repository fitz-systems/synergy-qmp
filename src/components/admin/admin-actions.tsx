"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/helpers/class-names";
import type { AdminActionResult } from "@/types/admin";

type ButtonProps = React.ComponentProps<typeof Button>;

interface AdminConfirmActionProps {
  action: (formData: FormData) => Promise<AdminActionResult>;
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  children?: React.ReactNode;
}

interface AdminActionButtonProps {
  action: () => Promise<AdminActionResult>;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  children: React.ReactNode;
}

export function AdminConfirmAction({ action, trigger, title, description, confirmLabel, destructive = false, children }: AdminConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeOpen(next: boolean) {
    if (pending) return;
    setOpen(next);
    setError(null);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={pending}>
              {pending && <LoaderCircle aria-hidden className="animate-spin"/>}
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminActionButton({ action, variant = "outline", size, disabled = false, children }: AdminActionButtonProps) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setResult(null);
    startTransition(async () => setResult(await action()));
  }

  const message = result ? (result.ok ? result.message : result.error) : undefined;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" variant={variant} size={size} disabled={disabled || pending} onClick={run}>
        {pending && <LoaderCircle aria-hidden className="animate-spin"/>}
        {children}
      </Button>
      <span role="status" className={cn("text-sm", result?.ok ? "text-muted-foreground" : "text-destructive")}>{message}</span>
    </span>
  );
}
