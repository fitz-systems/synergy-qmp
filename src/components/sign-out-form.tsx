import { LogOut } from "lucide-react";
import { signOutStudent } from "@/app/[lang]/(student)/actions";
import { formLocaleField } from "@/constants/forms";
import type { Locale } from "@/i18n/config";

interface SignOutFormProps {
  locale: Locale;
  label: string;
  className: string;
  iconClassName?: string;
}

export function SignOutForm({ locale, label, className, iconClassName = "size-4" }: SignOutFormProps) {
  return (
    <form action={signOutStudent}>
      <input type="hidden" name={formLocaleField} value={locale}/>
      <button type="submit" className={className}>
        <LogOut aria-hidden className={iconClassName} strokeWidth={1.75}/>
        {label}
      </button>
    </form>
  );
}
