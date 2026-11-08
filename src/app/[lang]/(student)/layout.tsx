import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/session";

export const instant = false;

export default async function StudentLayout({ children }: LayoutProps<"/[lang]">) {
  await requireUser();

  return (
    <>
      <SiteHeader/>
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter/>
    </>
  );
}
