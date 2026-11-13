import Link from "next/link";

import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { DashboardFilters } from "@/components/admin/dashboard-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, companyListFilterParam, statusToneStyles, userCompanyParam } from "@/constants/admin";
import { getAdminDashboard } from "@/lib/admin-dashboard";
import { getCompanyPickerData } from "@/lib/admin-distributors";
import { adminUserHref, dashboardFilterValues, dashboardUsersHref, enrollmentLabel, formatAdminDateTime, isDashboardFiltered, parseDashboardQuery, scoreLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Dashboard"
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  const query = parseDashboardQuery(await searchParams);
  const [{ stats, registrations, passRates, recentAttempts }, pickerData] = await Promise.all([getAdminDashboard(query), getCompanyPickerData()]);
  const values = dashboardFilterValues(query);
  const filtered = isDashboardFiltered(query);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Students, exam attempts and certificates at a glance."
        actions={<Button asChild><Link href={adminRoutes.newUser}>Add user</Link></Button>}
      />

      <DashboardFilters data={{ ...pickerData, distributor: values[companyListFilterParam], company: values[userCompanyParam] }}/>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
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
            <CardDescription className="mt-1">{filtered ? "The latest submitted exams for this selection" : "The latest submitted exams across all courses"}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild><Link href={dashboardUsersHref(query)}>View users</Link></Button>
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
            {recentAttempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell className="pl-6 font-medium">
                  <Link href={adminUserHref(attempt.userId)} className="hover:underline">{attempt.userName}</Link>
                </TableCell>
                <TableCell>{enrollmentLabel(attempt.courseCode, attempt.locale)}</TableCell>
                <TableCell className="text-muted-foreground">{formatAdminDateTime(attempt.submittedAt)}</TableCell>
                <TableCell className="text-right tabular-nums">{scoreLabel(attempt.correctCount, attempt.questionCount)}</TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge variant="outline" className={attempt.passed ? statusToneStyles.success : statusToneStyles.danger}>
                    {attempt.passed ? "Passed" : "Failed"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {recentAttempts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{filtered ? "No exams submitted for this selection." : "No exams submitted yet."}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
