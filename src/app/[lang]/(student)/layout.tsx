import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizedHref } from "@/lib/helpers/routes";
import { headerAccount } from "@/lib/helpers/student";
import { getStudentAccount } from "@/lib/student";

// Todo: Redirect to the login page when there's no session
export default async function StudentLayout({ children }: LayoutProps<"/[lang]">) {
  const [dict, locale, account] = await Promise.all([getDictionary(), getLocale(), getStudentAccount()]);
  const accountMenu = {
    account: headerAccount(account),
    myCourseHref: localizedHref(locale, "myCourse"),
    labels: dict.student.account
  }

  return (
    <>
      <SiteHeader accountMenu={accountMenu}/>
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter/>
    </>
  );
}
