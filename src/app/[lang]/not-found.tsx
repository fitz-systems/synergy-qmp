import type { Metadata } from "next";
import { NotFoundView } from "@/components/shared/not-found-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { notFoundLinks } from "@/lib/helpers/not-found";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.notFound.metaTitle }
}

export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <SiteHeader/>
      <main id="main" className="flex-1 bg-canvas-alt">
        <div className="container-site py-24 md:py-32">
          <NotFoundView copy={dict.notFound} links={notFoundLinks(locale)}/>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}
