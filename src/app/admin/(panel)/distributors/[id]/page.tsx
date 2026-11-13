import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Equal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { adjustSeats, deleteDistributor } from "@/app/admin/(panel)/distributors/actions";
import { AdminConfirmAction } from "@/components/admin/admin-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, seatAdjustmentLimit, statusToneIconStyles } from "@/constants/admin";
import { getAdminDistributor } from "@/lib/admin-distributors";
import { adminCompanyHref, adminDistributorUsersHref, adminNewCompanyHref, adminUserHref, formatAdminDateTime, formatAdminTimestampDate } from "@/lib/helpers/admin";
import { distributorDeleteDescription, seatBalanceTone, seatCountLabel } from "@/lib/helpers/admin-distributors";
import { cn } from "@/lib/helpers/class-names";
import type { SeatAdjustment } from "@/types/admin";

export const metadata: Metadata = {
  title: "Distributor"
}

interface SeatFieldsProps {
  adjustment: SeatAdjustment;
  current: number;
}

function SeatFields({ adjustment, current }: SeatFieldsProps) {
  const add = adjustment === "add";
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`seats-${adjustment}`}>{add ? "Seats to add" : "New balance"}</Label>
        <Input
          id={`seats-${adjustment}`}
          name="amount"
          type="number"
          inputMode="numeric"
          step={1}
          min={add ? 1 : -seatAdjustmentLimit}
          max={seatAdjustmentLimit}
          defaultValue={add ? undefined : current}
          autoFocus
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`seats-${adjustment}-note`}>Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id={`seats-${adjustment}-note`} name="note" maxLength={200} placeholder={add ? "Invoice or PO number" : "Why the balance changed"} autoComplete="off"/>
      </div>
    </div>
  );
}

export default async function AdminDistributorPage({ params }: PageProps<"/admin/distributors/[id]">) {
  const { id } = await params;
  const distributor = await getAdminDistributor(Number(id));
  if (!distributor) notFound();
  const tone = seatBalanceTone(distributor.seatBalance);

  return (
    <>
      <AdminPageHeader
        title={distributor.name}
        description={distributor.notes || undefined}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Distributors", href: adminRoutes.distributors }, { label: distributor.name }]}
        actions={(
          <>
            <AdminConfirmAction
              action={deleteDistributor.bind(null, distributor.id)}
              trigger={<Button variant="outline"><Trash2/>Delete</Button>}
              title={`Delete ${distributor.name}?`}
              description={distributorDeleteDescription(distributor.companyCount)}
              confirmLabel="Delete distributor"
              destructive
            />
            <Button asChild><Link href={`${adminRoutes.distributors}/${distributor.id}/edit`}><Pencil/>Edit</Link></Button>
          </>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Seats</CardTitle>
            <CardDescription>Used automatically when a student is enrolled at one of these companies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className={cn("text-4xl font-semibold tabular-nums tracking-tight", tone !== "success" && statusToneIconStyles[tone])}>{distributor.seatBalance.toLocaleString("en-CA")}</p>
              <p className="text-sm text-muted-foreground">
                {distributor.seatBalance < 0 ? `${seatCountLabel(-distributor.seatBalance)} used beyond what they've paid for` : "seats left"}
                {" · "}{distributor.seatsUsed.toLocaleString("en-CA")} used so far
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminConfirmAction
                action={adjustSeats.bind(null, distributor.id, "add")}
                trigger={<Button size="sm"><Plus/>Add seats</Button>}
                title="Add seats"
                description={`Use this when ${distributor.name} pays for more seats. The new seats are added to the current balance.`}
                confirmLabel="Add seats"
              >
                <SeatFields adjustment="add" current={distributor.seatBalance}/>
              </AdminConfirmAction>
              <AdminConfirmAction
                action={adjustSeats.bind(null, distributor.id, "set")}
                trigger={<Button size="sm" variant="outline"><Equal/>Set balance</Button>}
                title="Set seat balance"
                description="Replaces the balance with an exact number, for corrections. To record a purchase, use Add seats instead."
                confirmLabel="Set balance"
              >
                <SeatFields adjustment="set" current={distributor.seatBalance}/>
              </AdminConfirmAction>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden pb-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Companies</CardTitle>
            <CardDescription>{distributor.companyCount === 0 ? "No companies yet." : `${distributor.companyCount.toLocaleString("en-CA")} ${distributor.companyCount === 1 ? "company" : "companies"}`}</CardDescription>
            <CardAction><Button variant="outline" size="sm" asChild><Link href={adminNewCompanyHref(distributor.id)}><Plus/>Add company</Link></Button></CardAction>
          </CardHeader>
          {distributor.companies.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Company</TableHead>
                  <TableHead className="pr-6 text-right">Enrollments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributor.companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="pl-6"><Link href={adminCompanyHref(company.id)} className="font-medium hover:underline">{company.name}</Link></TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">{company.studentCount.toLocaleString("en-CA")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden pb-0">
          <CardHeader className="pb-4">
            <CardTitle>Recent seat use</CardTitle>
            <CardDescription>The latest students who used one of these seats.</CardDescription>
            <CardAction><Button variant="outline" size="sm" asChild><Link href={adminDistributorUsersHref(distributor.id)}><Users/>All students</Link></Button></CardAction>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Student</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="pr-6">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributor.recentSeats.map((seat) => (
                <TableRow key={seat.enrollmentId}>
                  <TableCell className="pl-6"><Link href={adminUserHref(seat.userId)} className="font-medium hover:underline">{seat.userName}</Link></TableCell>
                  <TableCell>{seat.company ?? "—"}</TableCell>
                  <TableCell className="pr-6 text-muted-foreground">{formatAdminTimestampDate(seat.enrolledOn)}</TableCell>
                </TableRow>
              ))}
              {distributor.recentSeats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No seats used yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="gap-0 overflow-hidden pb-0">
          <CardHeader className="pb-4">
            <CardTitle>History</CardTitle>
            <CardDescription>Seat purchases, corrections and edits.</CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">When</TableHead>
                <TableHead className="pr-6">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributor.history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-6 align-top whitespace-nowrap text-muted-foreground">{formatAdminDateTime(entry.at)}</TableCell>
                  <TableCell className="pr-6 whitespace-normal">
                    <p className="font-medium">{entry.action} <span className="font-normal text-muted-foreground">by {entry.admin}</span></p>
                    {entry.details && <p className="text-muted-foreground">{entry.details}</p>}
                  </TableCell>
                </TableRow>
              ))}
              {distributor.history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">No changes yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
