import Link from "next/link";

import type { Metadata } from "next";
import { MoreHorizontal } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination, RenewalBadge } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, renewalListFilters, renewalStatusTones, renewalSummaries, renewalWindowDays, statusToneIconStyles } from "@/constants/admin";
import { getAdminRenewalPage } from "@/lib/admin-renewals";
import { adminCertificateHref, adminListHref, adminUserHref, enrollmentLabel, formatAdminDate, fullName, parseRenewalQuery, renewalFilterValues, renewalTimingLabel } from "@/lib/helpers/admin";
import { cn } from "@/lib/helpers/class-names";

export const metadata: Metadata = {
  title: "Renewals"
}

export default async function AdminRenewalsPage({ searchParams }: PageProps<"/admin/renewals">) {
  const query = parseRenewalQuery(await searchParams);
  const result = await getAdminRenewalPage(query);
  const values = renewalFilterValues(query);
  const filtered = query.search !== "" || query.course !== undefined || query.status !== undefined;

  return (
    <>
      <AdminPageHeader
        title="Renewals"
        description={`Students whose certificate has expired or expires within ${renewalWindowDays} days. Soonest first.`}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Renewals" }]}
      />
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {renewalSummaries.map((summary) => (
          <li key={summary.status} className="flex items-center gap-1.5">
            <summary.icon className={cn("size-4 shrink-0", statusToneIconStyles[renewalStatusTones[summary.status]])} aria-hidden="true"/>
            <span className="font-semibold text-foreground tabular-nums">{result.counts[summary.status].toLocaleString("en-CA")}</span>
            {summary.label.toLowerCase()}
          </li>
        ))}
      </ul>
      <AdminTableToolbar searchLabel="Search name, email or company" filters={renewalListFilters} values={values}/>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Certificate expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12 pr-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row) => (
              <TableRow key={row.enrollmentId}>
                <TableCell className="pl-4">
                  <Link href={adminUserHref(row.userId)} className="font-medium hover:underline">{fullName(row)}</Link>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </TableCell>
                <TableCell>{row.company ?? "—"}</TableCell>
                <TableCell>{enrollmentLabel(row.courseCode, row.locale)}</TableCell>
                <TableCell>
                  <p className="tabular-nums">{formatAdminDate(row.validUntil)}</p>
                  <p className={cn("text-xs", statusToneIconStyles[renewalStatusTones[row.status]])}>{renewalTimingLabel(row.daysLeft)}</p>
                </TableCell>
                <TableCell><RenewalBadge status={row.status}/></TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${fullName(row)}`}><MoreHorizontal/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={adminUserHref(row.userId)}>View student</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><a href={adminCertificateHref(row.enrollmentId)} download>Download certificate</a></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {result.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {filtered ? "No certificates match these filters." : `No certificates have expired or expire within ${renewalWindowDays} days.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminTablePagination
          from={result.from}
          to={result.to}
          total={result.total}
          noun="certificates"
          previousHref={result.page > 1 ? adminListHref(adminRoutes.renewals, values, result.page - 1) : undefined}
          nextHref={result.page < result.pageCount ? adminListHref(adminRoutes.renewals, values, result.page + 1) : undefined}
        />
      </Card>
    </>
  );
}
