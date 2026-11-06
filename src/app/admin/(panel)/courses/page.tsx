import Link from "next/link";

import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ToggleBadge } from "@/components/admin/admin-table-parts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes } from "@/constants/admin";
import { getAdminCourses } from "@/lib/admin";
import { adminCourseHref } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "Courses"
}

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();

  return (
    <>
      <AdminPageHeader
        title="Courses"
        description="Course names, material and certificate codes, in English and French."
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Courses" }]}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Course</TableHead>
              <TableHead>Course material</TableHead>
              <TableHead>Certificate code</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.code}>
                <TableCell className="pl-4">
                  <Link href={adminCourseHref(course.code)} className="font-medium hover:underline">{course.names.en}</Link>
                  <p className="text-xs text-muted-foreground">{course.names.fr}</p>
                </TableCell>
                <TableCell>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(course.materialFiles).map(([locale, file]) => (
                      <li key={locale} className="flex items-center gap-1.5">
                        <FileText aria-hidden className="size-3.5 text-muted-foreground"/>
                        <span className="uppercase text-muted-foreground">{locale}</span>
                        {file ?? <span className="text-red-700 dark:text-red-400">Missing</span>}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="font-mono text-sm">{course.certificateCode}</TableCell>
                <TableCell className="text-right tabular-nums">{course.questionsPerAttempt}</TableCell>
                <TableCell><ToggleBadge on={course.active} onLabel="Active" offLabel="Inactive"/></TableCell>
                <TableCell className="pr-4 text-right">
                  <Button variant="ghost" size="sm" asChild><Link href={adminCourseHref(course.code)}>Edit</Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
