import Link from "next/link";

import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, auditEntityLabels, auditLogFilters } from "@/constants/admin";
import { getAuditLogPage } from "@/lib/admin-audit-log";
import { adminListHref, auditLogFilterValues, formatAdminDateTime, parseAuditLogQuery } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Audit log"
}

export default async function AdminAuditLogPage({ searchParams }: PageProps<"/admin/audit-log">) {
  const query = parseAuditLogQuery(await searchParams);
  const result = await getAuditLogPage(query);
  const values = auditLogFilterValues(query);
  const filtered = query.search !== "" || query.entity !== undefined;

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every change made by an admin, newest first. Entries can't be edited or deleted."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Audit log" }]}
      />
      <AdminTableToolbar searchLabel="Search actions, records or admins" filters={auditLogFilters} values={values}/>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">When</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Record</TableHead>
              <TableHead className="pr-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">{formatAdminDateTime(entry.at)}</TableCell>
                <TableCell>{entry.admin}</TableCell>
                <TableCell className="font-medium">{entry.action}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="mr-2">{auditEntityLabels[entry.entity]}</Badge>
                  {entry.href ? <Link href={entry.href} className="hover:underline">{entry.entityLabel}</Link> : entry.entityLabel}
                </TableCell>
                <TableCell className="max-w-sm pr-4 whitespace-normal text-muted-foreground">{entry.details ?? "—"}</TableCell>
              </TableRow>
            ))}
            {result.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {filtered ? "No entries match these filters." : "No admin changes yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminTablePagination
          from={result.from}
          to={result.to}
          total={result.total}
          noun="entries"
          previousHref={result.page > 1 ? adminListHref(adminRoutes.auditLog, values, result.page - 1) : undefined}
          nextHref={result.page < result.pageCount ? adminListHref(adminRoutes.auditLog, values, result.page + 1) : undefined}
        />
      </Card>
    </>
  );
}
