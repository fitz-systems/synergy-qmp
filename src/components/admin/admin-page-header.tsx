import Link from "next/link";

import { Fragment } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { AdminCrumb } from "@/types/admin";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  crumbs?: AdminCrumb[];
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, crumbs = [], actions }: AdminPageHeaderProps) {
  return (
    <div className="space-y-3">
      {crumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 && <BreadcrumbSeparator/>}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild><Link href={crumb.href}>{crumb.label}</Link></BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
