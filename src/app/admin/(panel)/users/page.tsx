import Link from "next/link";

import type { Metadata } from "next";
import { FileUp, MoreHorizontal, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination, AdminTableToolbar, StatusBadge, ToggleBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminPageSize, adminRoutes, courseOptions, enrollmentStatusOptions } from "@/constants/admin";
import { getAdminUsers } from "@/lib/admin";
import { adminUserEditHref, adminUserHref, courseLabel, formatAdminDate, fullName, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Users"
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  const page = users.slice(0, adminPageSize);

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Every student account, created by Synergy QMP staff."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users" }]}
        actions={(
          <>
            <Button variant="outline" asChild><Link href={adminRoutes.importData}><FileUp/>Import CSV</Link></Button>
            <Button asChild><Link href={adminRoutes.newUser}><Plus/>Add user</Link></Button>
          </>
        )}
      />
      <AdminTableToolbar
        searchLabel="Search name, email or company"
        filters={[{ label: "Course", options: courseOptions }, { label: "Status", options: enrollmentStatusOptions }]}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="w-12 pr-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-4">
                  <Link href={adminUserHref(user.id)} className="font-medium hover:underline">{fullName(user)}</Link>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>{courseLabel(user.courseCode)} · {languageLabel(user.locale)}</TableCell>
                <TableCell><StatusBadge status={user.status}/></TableCell>
                <TableCell className="text-muted-foreground">{formatAdminDate(user.enrolledOn)}</TableCell>
                <TableCell><ToggleBadge on={user.active} onLabel="Active" offLabel="Deactivated"/></TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${fullName(user)}`}><MoreHorizontal/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={adminUserHref(user.id)}>View</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={adminUserEditHref(user.id)}>Edit</Link></DropdownMenuItem>
                      <DropdownMenuItem>Send password reset email</DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem variant="destructive">{user.active ? "Deactivate" : "Reactivate"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminTablePagination from={1} to={page.length} total={users.length} noun="users"/>
      </Card>
    </>
  );
}
