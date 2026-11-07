import { ButtonLink } from "@/components/ui/button-link";
import { FormNotice } from "@/components/ui/form-notice";
import type { ResetPasswordCopy } from "@/types/auth";

interface ResetLinkExpiredProps {
  labels: ResetPasswordCopy["expired"];
  forgotPasswordHref: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function ResetLinkExpired({ labels, forgotPasswordHref, ref }: ResetLinkExpiredProps) {
  return (
    <div className="mt-8">
      <FormNotice ref={ref} notice={{ title: labels.title, body: labels.body }}/>
      <ButtonLink href={forgotPasswordHref} arrow className="mt-6 w-full">{labels.action}</ButtonLink>
    </div>
  );
}
