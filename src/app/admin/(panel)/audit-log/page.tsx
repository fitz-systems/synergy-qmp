import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination, AdminTableToolbar } from "@/components/admin/admin-table-parts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, auditEntityOptions } from "@/constants/admin";
import { getAuditLog } from "@/lib/admin";
import { formatAdminDateTime } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Audit log"
}

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every change made by an admin, newest first. Entries can't be edited or deleted."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Audit log" }]}
      />
      <AdminTableToolbar searchLabel="Search actions or records" filters={[{ label: "Record type", options: auditEntityOptions }]}/>
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
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="pl-4 whitespace-nowrap text-muted-foreground">{formatAdminDateTime(entry.at)}</TableCell>
                <TableCell>{entry.admin}</TableCell>
                <TableCell className="font-medium">{entry.action}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="mr-2">{entry.entity}</Badge>
                  {entry.entityLabel}
                </TableCell>
                <TableCell className="max-w-sm pr-4 whitespace-normal text-muted-foreground">{entry.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminTablePagination from={1} to={entries.length} total={entries.length} noun="entries"/>
      </Card>
    </>
  );
}
