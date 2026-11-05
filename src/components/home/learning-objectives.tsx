import { Atom, ClipboardCheck, Package, Siren, Tag, Truck } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/dictionaries";

const objectiveIcons = {
  transport: Truck,
  classification: Atom,
  packaging: Package,
  marking: Tag,
  shipping: ClipboardCheck,
  emergency: Siren
}

export async function LearningObjectives() {
  const dict = await getDictionary();

  return (
    <section aria-labelledby="objectives-title" className="bg-canvas-alt">
      <div className="container-site py-20 md:py-28">
        <SectionHeading id="objectives-title" title={dict.objectives.title} subtitle={dict.objectives.subtitle}/>
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-14">
          {dict.objectives.items.map((item) => {
            const Icon = objectiveIcons[item.icon as keyof typeof objectiveIcons];
            return (
              <li key={item.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-ink">
                  <Icon aria-hidden className="size-5" strokeWidth={1.75}/>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
