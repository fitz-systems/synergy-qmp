"use client";

import { useState } from "react";
import { Merge } from "lucide-react";
import { AdminConfirmAction } from "@/components/admin/admin-actions";
import { CompanyPicker } from "@/components/admin/company-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminActionResult, CompanyPickerData } from "@/types/admin";

interface MergeCompanyActionProps {
  action: (formData: FormData) => Promise<AdminActionResult>;
  companyId: number;
  companyName: string;
  studentCount: number;
  data: CompanyPickerData;
}

export function MergeCompanyAction({ action, companyId, companyName, studentCount, data }: MergeCompanyActionProps) {
  const [target, setTarget] = useState("");

  return (
    <AdminConfirmAction
      action={action}
      trigger={<Button variant="outline"><Merge/>Merge</Button>}
      title={`Merge ${companyName} into another company`}
      description={`Use this to clean up duplicates. Its ${studentCount === 1 ? "enrollment moves" : `${studentCount.toLocaleString("en-CA")} enrollments move`} to the company you choose, then ${companyName} is deleted. Seats already used aren't changed.`}
      confirmLabel="Merge companies"
      destructive
    >
      <div className="grid gap-2">
        <Label htmlFor="merge-target">Keep this company</Label>
        <CompanyPicker id="merge-target" name="target" data={data} value={target} onValueChange={setTarget} allowNone={false} allowCreate={false} excludeId={companyId}/>
      </div>
    </AdminConfirmAction>
  );
}
