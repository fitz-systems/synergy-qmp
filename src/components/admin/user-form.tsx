import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { courseOptions, languageOptions } from "@/constants/admin";
import type { AdminUser } from "@/types/admin";

interface UserFormProps {
  user?: AdminUser;
  submitLabel: string;
  cancelHref: string;
}

export function UserForm({ user, submitLabel, cancelHref }: UserFormProps) {
  return (
    <form className="space-y-6">
      <AdminFormSection title="Student" description="The name appears on the certificate exactly as entered.">
        <AdminField id="first-name" label="First name">
          <Input id="first-name" name="firstName" defaultValue={user?.firstName} required/>
        </AdminField>
        <AdminField id="last-name" label="Last name">
          <Input id="last-name" name="lastName" defaultValue={user?.lastName} required/>
        </AdminField>
        <AdminField id="email" label="Email" hint="Used to log in. Must be unique.">
          <Input id="email" name="email" type="email" defaultValue={user?.email} required/>
        </AdminField>
        <AdminField id="company" label="Company">
          <Input id="company" name="company" defaultValue={user?.company}/>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection title="Enrollment" description="The course and language decide which material and exam the student gets.">
        <AdminField id="course" label="Course">
          <Select name="course" defaultValue={user?.courseCode ?? "ground"}>
            <SelectTrigger id="course" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>
              {courseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField id="language" label="Language">
          <Select name="locale" defaultValue={user?.locale ?? "en"}>
            <SelectTrigger id="language" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField id="notes" label="Notes" hint="Only visible to admins." className="grid gap-2 sm:col-span-2">
          <Textarea id="notes" name="notes" rows={3} defaultValue={user?.notes}/>
        </AdminField>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">Deactivated students can&apos;t log in. Their records are kept.</p>
          </div>
          <Switch name="active" defaultChecked={user?.active ?? true} aria-label="Active"/>
        </div>
        {!user && (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Send welcome email</p>
              <p className="text-xs text-muted-foreground">Emails a link to set a password. Passwords are never sent by email.</p>
            </div>
            <Switch name="sendWelcome" defaultChecked aria-label="Send welcome email"/>
          </div>
        )}
      </AdminFormSection>

      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref}/>
    </form>
  );
}
