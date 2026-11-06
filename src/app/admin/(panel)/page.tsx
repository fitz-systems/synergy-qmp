import Link from "next/link";

import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, statusToneStyles } from "@/constants/admin";
import { getAdminAttempts, getAdminUsers, getMonthlyRegistrations, getPassRates } from "@/lib/admin";
import { adminUserHref, attemptScorePct, courseLabel, dashboardStats, formatAdminDateTime, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Dashboard"
}

export default async function AdminDashboardPage() {
  const [users, attempts, registrations, passRates] = await Promise.all([getAdminUsers(), getAdminAttempts(), getMonthlyRegistrations(), getPassRates()]);
  const recent = attempts.toSorted((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Students, exam attempts and certificates at a glance."
        actions={<Button asChild><Link href={adminRoutes.newUser}>Add user</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats(users, attempts).map((stat) => (
          <Card key={stat.label} className="gap-2">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts registrations={registrations} passRates={passRates}/>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <div>
            <CardTitle>Recent exam attempts</CardTitle>
            <CardDescription className="mt-1">The latest submitted exams across all courses</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link href={adminRoutes.users}>View users</Link></Button>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="pr-6 text-right">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell className="pl-6 font-medium">
                  <Link href={adminUserHref(attempt.userId)} className="hover:underline">{attempt.userName}</Link>
                </TableCell>
                <TableCell>{courseLabel(attempt.courseCode)} · {languageLabel(attempt.locale)}</TableCell>
                <TableCell className="text-muted-foreground">{formatAdminDateTime(attempt.submittedAt)}</TableCell>
                <TableCell className="text-right tabular-nums">{attempt.correctCount}/{attempt.questionCount} ({attemptScorePct(attempt)}%)</TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge variant="outline" className={attempt.passed ? statusToneStyles.success : statusToneStyles.danger}>
                    {attempt.passed ? "Passed" : "Failed"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
