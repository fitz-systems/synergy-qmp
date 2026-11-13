import Link from "next/link";

import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SeatBalanceBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes } from "@/constants/admin";
import { getAdminDistributors } from "@/lib/admin-distributors";
import { adminDistributorHref } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Distributors"
}

export default async function AdminDistributorsPage() {
  const distributors = await getAdminDistributors();

  return (
    <>
      <AdminPageHeader
        title="Distributors"
        description="Distributors buy seats for the companies they bring in. Each student enrolled at one of their companies uses a seat. Balances can go below zero."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Distributors" }]}
        actions={<Button asChild><Link href={adminRoutes.newDistributor}><Plus/>Add distributor</Link></Button>}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Distributor</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead className="text-right">Seats used</TableHead>
              <TableHead className="text-right">Companies</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributors.map((distributor) => (
              <TableRow key={distributor.id}>
                <TableCell className="pl-4">
                  <Link href={adminDistributorHref(distributor.id)} className="font-medium hover:underline">{distributor.name}</Link>
                </TableCell>
                <TableCell><SeatBalanceBadge balance={distributor.seatBalance}/></TableCell>
                <TableCell className="text-right tabular-nums">{distributor.seatsUsed.toLocaleString("en-CA")}</TableCell>
                <TableCell className="text-right tabular-nums">{distributor.companyCount.toLocaleString("en-CA")}</TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminDistributorHref(distributor.id)}>View</Link></Button>
                </TableCell>
              </TableRow>
            ))}
            {distributors.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No distributors yet. Add one, then assign companies to it.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
