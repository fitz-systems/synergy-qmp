import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveCourse } from "@/app/admin/(panel)/courses/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseForm } from "@/components/admin/course-form";
import { adminRoutes } from "@/constants/admin";
import { getAdminCourse } from "@/lib/admin-courses";
import { initialCourseFormState } from "@/lib/helpers/admin-courses";

export const metadata: Metadata = {
  title: "Edit course"
}

export default async function AdminCoursePage({ params }: PageProps<"/admin/courses/[code]">) {
  const { code } = await params;
  const course = await getAdminCourse(code);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={course.names.en}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Courses", href: adminRoutes.courses }, { label: course.names.en }]}
      />
      <CourseForm action={saveCourse.bind(null, course.code)} initialState={initialCourseFormState(course)} course={course} cancelHref={adminRoutes.courses}/>
    </div>
  );
}
