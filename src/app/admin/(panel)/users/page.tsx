import Link from "next/link";

import type { Metadata } from "next";
import { FileUp, MoreHorizontal, Plus, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination, StatusBadge, ToggleBadge } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFilterAll, adminRoutes, companyListFilterParam, userCompanyParam, userListFilters } from "@/constants/admin";
import { getAdminCompany, getDistributorOptions } from "@/lib/admin-distributors";
import { getAdminUserPage } from "@/lib/admin-users";
import { adminCompanyHref, adminListHref, adminUserEditHref, adminUserHref, enrollmentLabel, formatAdminTimestampDate, fullName, parseUserListQuery, userListFilterValues } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Users"
}

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const query = parseUserListQuery(await searchParams);
  const [result, distributors, company] = await Promise.all([getAdminUserPage(query), getDistributorOptions(), query.company ? getAdminCompany(query.company) : null]);
  const values = userListFilterValues(query);
  const filtered = query.search !== "" || query.course !== undefined || query.status !== undefined || query.distributor !== undefined || query.company !== undefined;
  const filters = [
    ...userListFilters,
    ...(distributors.length > 0 ? [{ param: companyListFilterParam, label: "Distributor", allLabel: "All distributors", options: distributors.map((distributor) => ({ value: String(distributor.id), label: distributor.name })) }] : [])
  ];

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
      <AdminTableToolbar searchLabel="Search name, email or company" filters={filters} values={values}/>
      {query.company && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Company:</span>
          {company ? <Link href={adminCompanyHref(company.id)} className="font-medium hover:underline">{company.name}</Link> : <span className="font-medium">Removed company</span>}
          <Button variant="ghost" size="sm" asChild>
            <Link href={adminListHref(adminRoutes.users, { ...values, [userCompanyParam]: adminFilterAll })} aria-label="Clear company filter"><X/>Clear</Link>
          </Button>
        </div>
      )}
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
            {result.rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-4">
                  <Link href={adminUserHref(user.id)} className="font-medium hover:underline">{fullName(user)}</Link>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>{user.company ?? "—"}</TableCell>
                <TableCell>{user.courseCode && user.locale ? enrollmentLabel(user.courseCode, user.locale) : "—"}</TableCell>
                <TableCell>{user.status ? <StatusBadge status={user.status}/> : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{user.enrolledOn ? formatAdminTimestampDate(user.enrolledOn) : "—"}</TableCell>
                <TableCell><ToggleBadge on={user.active} onLabel="Active" offLabel="Deactivated"/></TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${fullName(user)}`}><MoreHorizontal/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={adminUserHref(user.id)}>View</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={adminUserEditHref(user.id)}>Edit</Link></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {result.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {filtered ? "No students match these filters." : "No students yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminTablePagination
          from={result.from}
          to={result.to}
          total={result.total}
          noun="students"
          previousHref={result.page > 1 ? adminListHref(adminRoutes.users, values, result.page - 1) : undefined}
          nextHref={result.page < result.pageCount ? adminListHref(adminRoutes.users, values, result.page + 1) : undefined}
        />
      </Card>
    </>
  );
}
