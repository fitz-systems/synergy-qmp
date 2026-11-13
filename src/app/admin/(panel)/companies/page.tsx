import Link from "next/link";

import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination } from "@/components/admin/admin-table-parts";
import { AdminTableToolbar } from "@/components/admin/admin-table-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, companyListFilterParam, companyPickerLabels, noDistributorValue } from "@/constants/admin";
import { getAdminCompanyPage, getDistributorOptions } from "@/lib/admin-distributors";
import { adminCompanyHref, adminDistributorHref, adminListHref } from "@/lib/helpers/admin";
import { companyListFilterValues, parseCompanyListQuery } from "@/lib/helpers/admin-distributors";

export const metadata: Metadata = {
  title: "Companies"
}

export default async function AdminCompaniesPage({ searchParams }: PageProps<"/admin/companies">) {
  const query = parseCompanyListQuery(await searchParams);
  const [result, distributors] = await Promise.all([getAdminCompanyPage(query), getDistributorOptions()]);
  const values = companyListFilterValues(query);
  const filtered = query.search !== "" || query.distributor !== undefined;
  const filters = [{
    param: companyListFilterParam,
    label: "Distributor",
    allLabel: "All distributors",
    options: [{ value: noDistributorValue, label: companyPickerLabels.noDistributor }, ...distributors.map((distributor) => ({ value: String(distributor.id), label: distributor.name }))]
  }];

  return (
    <>
      <AdminPageHeader
        title="Companies"
        description="Students are linked to a company from this list. A company's distributor decides whose seats its new students use."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Companies" }]}
        actions={<Button asChild><Link href={adminRoutes.newCompany}><Plus/>Add company</Link></Button>}
      />
      <AdminTableToolbar searchLabel="Search companies" filters={filters} values={values}/>
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Company</TableHead>
              <TableHead>Distributor</TableHead>
              <TableHead className="text-right">Enrollments</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="pl-4"><Link href={adminCompanyHref(company.id)} className="font-medium hover:underline">{company.name}</Link></TableCell>
                <TableCell>
                  {company.distributorId
                    ? <Link href={adminDistributorHref(company.distributorId)} className="hover:underline">{company.distributor}</Link>
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">{company.studentCount.toLocaleString("en-CA")}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminCompanyHref(company.id)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
            {result.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {filtered ? "No companies match these filters." : "No companies yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminTablePagination
          from={result.from}
          to={result.to}
          total={result.total}
          noun="companies"
          previousHref={result.page > 1 ? adminListHref(adminRoutes.companies, values, result.page - 1) : undefined}
          nextHref={result.page < result.pageCount ? adminListHref(adminRoutes.companies, values, result.page + 1) : undefined}
        />
      </Card>
    </>
  );
}
