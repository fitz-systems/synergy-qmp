import { contactInfoIcons } from "@/constants/contact";
import { contactSocialIcons } from "@/constants/links";
import { contactInfoItems } from "@/lib/helpers/contact";
import type { ContactInfoLabels } from "@/types/contact";

interface ContactInfoProps {
  labels: ContactInfoLabels;
}

export function ContactInfo({ labels }: ContactInfoProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-ink sm:text-4xl">{labels.title}</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink-muted">{labels.body}</p>

      <dl className="mt-10 border-t border-line">
        {contactInfoItems(labels).map(({ key, label, value, href }) => {
          const Icon = contactInfoIcons[key];
          return (
            <div key={key} className="flex gap-4 border-b border-line py-6">
              <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-ink">
                <Icon className="size-5" strokeWidth={1.75}/>
              </span>
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
                <dd className="mt-1 break-words text-lg font-semibold text-ink">
                  {href ? (
                    <a href={href} className="tabular-nums underline decoration-transparent decoration-2 underline-offset-[0.3em] transition-colors hover:decoration-brand">
                      {value}
                    </a>
                  ) : value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>

      <ul aria-hidden className="mt-8 flex gap-2">
        {contactSocialIcons.map((Icon, index) => (
          <li key={index} className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink-subtle">
            <Icon className="size-4"/>
          </li>
        ))}
      </ul>
    </div>
  );
}
