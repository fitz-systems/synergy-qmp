import { auditActionLabels, userActionMessages } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import type { Prisma } from "@/generated/prisma/client";
import { withEnrollmentLock } from "@/lib/attempts";
import { recordAudit } from "@/lib/audit";
import { formatAdminDate, fullName, userChanges } from "@/lib/helpers/admin";
import { certificateNumber } from "@/lib/helpers/certificate";
import { businessDate } from "@/lib/helpers/exam";
import { resolveLocale } from "@/lib/helpers/locale";
import { prisma } from "@/lib/prisma";
import { requestPasswordResetLink } from "@/lib/session";
import type { AdminActionResult, UserFormState, UserFormValues } from "@/types/admin";

type SaveResult = { id: number } | { errors: UserFormState["errors"] } | null;

const currentEnrollmentSelect = {
  id: true,
  courseId: true,
  locale: true,
  organizationId: true,
  paid: true,
  notes: true,
  passedOn: true,
  certificateNumber: true,
  attemptsResetAt: true,
  organization: { select: { name: true } },
  courseLocale: { select: { name: true, course: { select: { code: true } } } },
  attempts: { select: { startedAt: true } }
} satisfies Prisma.EnrollmentSelect;

function findStudent(tx: Prisma.TransactionClient, userId: number) {
  return tx.user.findFirst({
    where: { id: userId, role: { not: adminRole } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      active: true,
      preferredLocale: true,
      enrollments: { select: currentEnrollmentSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1 }
    }
  });
}

async function organizationIdFor(tx: Prisma.TransactionClient, company: string) {
  if (!company) return null;
  const existing = await tx.organization.findFirst({ where: { name: { equals: company, mode: "insensitive" } }, select: { id: true } });
  return existing?.id ?? (await tx.organization.create({ data: { name: company }, select: { id: true } })).id;
}

async function courseLocaleFor(tx: Prisma.TransactionClient, values: UserFormValues) {
  return tx.courseLocale.findFirstOrThrow({ where: { locale: values.locale, course: { code: values.course } }, select: { courseId: true, name: true } });
}

async function isEmailTaken(tx: Prisma.TransactionClient, email: string, userId?: number) {
  const user = await tx.user.findFirst({ where: { email, ...(userId ? { NOT: { id: userId } } : {}) }, select: { id: true } });
  return user !== null;
}

function profileData(values: UserFormValues) {
  return {
    name: `${values.firstName} ${values.lastName}`,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    preferredLocale: values.locale,
    active: values.active
  }
}

export async function createStudent(adminId: number, values: UserFormValues): Promise<SaveResult> {
  return prisma.$transaction(async (tx) => {
    if (await isEmailTaken(tx, values.email)) return { errors: { email: "emailTaken" } }
    const courseLocale = await courseLocaleFor(tx, values);
    const organizationId = await organizationIdFor(tx, values.company);
    const user = await tx.user.create({
      data: {
        ...profileData(values),
        enrollments: { create: { courseId: courseLocale.courseId, locale: values.locale, organizationId, paid: values.paid, notes: values.notes || null } }
      },
      select: { id: true }
    });
    await recordAudit(tx, { adminId, action: "userCreated", entity: "user", entityId: user.id, entityLabel: fullName(values), details: `Enrolled in ${courseLocale.name}` });
    return { id: user.id }
  });
}

export async function updateStudent(adminId: number, userId: number, values: UserFormValues): Promise<SaveResult> {
  return prisma.$transaction(async (tx) => {
    const user = await findStudent(tx, userId);
    if (!user) return null;
    if (await isEmailTaken(tx, values.email, userId)) return { errors: { email: "emailTaken" } }

    const current = user.enrollments[0];
    const courseChanged = current && (current.courseLocale.course.code !== values.course || current.locale !== values.locale);
    if (courseChanged && current.attempts.length > 0) return { errors: { course: "courseLocked", locale: "courseLocked" } }

    const courseLocale = await courseLocaleFor(tx, values);
    const organizationId = await organizationIdFor(tx, values.company);
    const enrollment = { courseId: courseLocale.courseId, locale: values.locale, organizationId, paid: values.paid, notes: values.notes || null };

    await tx.user.update({ where: { id: userId }, data: profileData(values) });
    if (current) await tx.enrollment.update({ where: { id: current.id }, data: enrollment });
    else await tx.enrollment.create({ data: { ...enrollment, userId } });
    if (user.active && !values.active) await tx.session.deleteMany({ where: { userId } });

    const changes = userChanges(user, current, values);
    if (changes.length > 0) await recordAudit(tx, { adminId, action: "userUpdated", entity: "user", entityId: userId, entityLabel: fullName(values), details: `Changed ${changes.join(", ")}` });
    return { id: userId }
  });
}

export async function sendStudentPasswordReset(adminId: number, userId: number): Promise<AdminActionResult> {
  const user = await findStudent(prisma, userId);
  if (!user) return { ok: false, error: userActionMessages.notFound }

  try {
    await requestPasswordResetLink(user.email, resolveLocale(user.preferredLocale));
  } catch (error) {
    console.error("Admin password reset email failed", error);
    return { ok: false, error: userActionMessages.emailFailed }
  }

  await recordAudit(prisma, { adminId, action: "passwordResetSent", entity: "user", entityId: userId, entityLabel: fullName(user), details: `Sent to ${user.email}` });
  return { ok: true, message: userActionMessages.resetSent }
}

export async function setStudentActive(adminId: number, userId: number, active: boolean): Promise<AdminActionResult> {
  return prisma.$transaction(async (tx) => {
    const user = await findStudent(tx, userId);
    if (!user) return { ok: false, error: userActionMessages.notFound }
    if (user.active === active) return { ok: true }

    await tx.user.update({ where: { id: userId }, data: { active } });
    if (!active) await tx.session.deleteMany({ where: { userId } });
    await recordAudit(tx, { adminId, action: active ? "userReactivated" : "userDeactivated", entity: "user", entityId: userId, entityLabel: fullName(user) });
    return { ok: true }
  });
}

type CurrentEnrollment = NonNullable<Awaited<ReturnType<typeof findStudent>>>["enrollments"][number];

type Student = NonNullable<Awaited<ReturnType<typeof findStudent>>>;

async function withCurrentEnrollment(userId: number, work: (tx: Prisma.TransactionClient, user: Student, enrollment: CurrentEnrollment) => Promise<AdminActionResult>): Promise<AdminActionResult> {
  const found = await findStudent(prisma, userId);
  if (!found) return { ok: false, error: userActionMessages.notFound }
  const enrollmentId = found.enrollments[0]?.id;
  if (!enrollmentId) return { ok: false, error: userActionMessages.noEnrollment }

  return withEnrollmentLock(enrollmentId, async (tx) => {
    const user = await findStudent(tx, userId);
    const enrollment = user?.enrollments[0];
    if (!user || enrollment?.id !== enrollmentId) return { ok: false, error: userActionMessages.failed }
    return work(tx, user, enrollment);
  });
}

export async function resetStudentAttempts(adminId: number, userId: number): Promise<AdminActionResult> {
  return withCurrentEnrollment(userId, async (tx, user, enrollment) => {
    const { attemptsResetAt } = enrollment;
    const counted = enrollment.attempts.filter((attempt) => attemptsResetAt === null || attempt.startedAt > attemptsResetAt).length;
    if (counted === 0) return { ok: false, error: userActionMessages.noAttempts }

    await tx.enrollment.update({ where: { id: enrollment.id }, data: { attemptsResetAt: new Date() } });
    await recordAudit(tx, { adminId, action: "attemptsReset", entity: "user", entityId: userId, entityLabel: fullName(user), details: `Attempts reset from ${counted} to 0 (${enrollment.courseLocale.name})` });
    return { ok: true }
  });
}

export async function setStudentPaid(adminId: number, userId: number, paid: boolean): Promise<AdminActionResult> {
  return withCurrentEnrollment(userId, async (tx, user, enrollment) => {
    if (enrollment.paid === paid) return { ok: true }
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { paid } });
    await recordAudit(tx, { adminId, action: paid ? "markedPaid" : "markedUnpaid", entity: "user", entityId: userId, entityLabel: fullName(user), details: enrollment.courseLocale.name });
    return { ok: true }
  });
}

export async function markStudentPassed(adminId: number, userId: number, passedOn: Date | null): Promise<AdminActionResult> {
  if (!passedOn || passedOn > businessDate(new Date())) return { ok: false, error: userActionMessages.invalidDate }

  return withCurrentEnrollment(userId, async (tx, user, enrollment) => {
    if (enrollment.passedOn) return { ok: false, error: userActionMessages.alreadyPassed }
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { passedOn } });
    await recordAudit(tx, { adminId, action: "markedPassed", entity: "user", entityId: userId, entityLabel: fullName(user), details: `${enrollment.courseLocale.name}, passed ${formatAdminDate(passedOn.toISOString())}` });
    return { ok: true }
  });
}

export async function clearStudentPass(adminId: number, userId: number): Promise<AdminActionResult> {
  return withCurrentEnrollment(userId, async (tx, user, enrollment) => {
    if (!enrollment.passedOn) return { ok: false, error: userActionMessages.notPassed }
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { passedOn: null, certificateNumber: null, certificateIssuedAt: null } });
    const withdrawn = enrollment.certificateNumber ? `; certificate ${enrollment.certificateNumber} withdrawn` : "";
    await recordAudit(tx, { adminId, action: "passCleared", entity: "user", entityId: userId, entityLabel: fullName(user), details: `${enrollment.courseLocale.name}${withdrawn}` });
    return { ok: true }
  });
}

export async function reissueStudentCertificate(adminId: number, userId: number): Promise<AdminActionResult> {
  return withCurrentEnrollment(userId, async (tx, user, enrollment) => {
    if (!enrollment.passedOn) return { ok: false, error: userActionMessages.notPassed }
    const number = certificateNumber(enrollment.id, enrollment.passedOn);
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { certificateNumber: number, certificateIssuedAt: new Date() } });
    const details = enrollment.certificateNumber && enrollment.certificateNumber !== number ? `Replaces ${enrollment.certificateNumber}` : `Issued to ${fullName(user)}`;
    await recordAudit(tx, { adminId, action: "certificateReissued", entity: "certificate", entityId: enrollment.id, entityLabel: number, details });
    return { ok: true, message: `${auditActionLabels.certificateReissued}: ${number}` }
  });
}
