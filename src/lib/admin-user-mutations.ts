import { auditActionLabels, userActionMessages } from "@/constants/admin";
import { adminRole } from "@/constants/auth";
import type { Prisma } from "@/generated/prisma/client";
import { withEnrollmentLock } from "@/lib/attempts";
import { hasPassword } from "@/lib/accounts";
import { applySeatMove } from "@/lib/admin-distributor-mutations";
import { recordAudit } from "@/lib/audit";
import { changeDetails, formatAdminDate, fullName, positiveIdOf, userChanges } from "@/lib/helpers/admin";
import { seatMove } from "@/lib/helpers/admin-distributors";
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
  seatDistributorId: true,
  paid: true,
  notes: true,
  passedOn: true,
  certificateNumber: true,
  attemptsResetAt: true,
  organization: { select: { distributorId: true } },
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

async function companyFor(tx: Prisma.TransactionClient, value: string) {
  const id = positiveIdOf(value);
  if (id === undefined) return null;
  return await tx.organization.findUnique({ where: { id }, select: { id: true, distributorId: true } }) ?? undefined;
}

async function courseLocaleFor(tx: Prisma.TransactionClient, values: UserFormValues) {
  return tx.courseLocale.findFirstOrThrow({ where: { locale: values.locale, course: { code: values.course } }, select: { courseId: true, name: true, course: { select: { active: true } } } });
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
    if (!courseLocale.course.active) return { errors: { course: "inactiveCourse" } }
    const company = await companyFor(tx, values.company);
    if (company === undefined) return { errors: { company: "invalidCompany" } }
    const seatDistributorId = company?.distributorId ?? null;
    const user = await tx.user.create({
      data: {
        ...profileData(values),
        enrollments: { create: { courseId: courseLocale.courseId, locale: values.locale, organizationId: company?.id ?? null, seatDistributorId, paid: values.paid, notes: values.notes || null } }
      },
      select: { id: true }
    });
    const seats = await applySeatMove(tx, { charge: seatDistributorId, refund: null });
    await recordAudit(tx, { adminId, action: "userCreated", entity: "user", entityId: user.id, entityLabel: fullName(values), details: [`Enrolled in ${courseLocale.name}`, ...seats].join("; ") });
    return { id: user.id }
  });
}

export async function updateStudent(adminId: number, userId: number, values: UserFormValues): Promise<SaveResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "synergy"."users" WHERE id = ${userId} FOR UPDATE`;
    const user = await findStudent(tx, userId);
    if (!user) return null;
    if (await isEmailTaken(tx, values.email, userId)) return { errors: { email: "emailTaken" } }

    const current = user.enrollments[0];
    const courseChanged = current && (current.courseLocale.course.code !== values.course || current.locale !== values.locale);
    if (courseChanged && current.attempts.length > 0) return { errors: { course: "courseLocked", locale: "courseLocked" } }

    const courseLocale = await courseLocaleFor(tx, values);
    if ((courseChanged || !current) && !courseLocale.course.active) return { errors: { course: "inactiveCourse" } }
    const company = await companyFor(tx, values.company);
    if (company === undefined) return { errors: { company: "invalidCompany" } }
    const holder = current ? { companyId: current.organizationId, seatDistributorId: current.seatDistributorId, companyDistributorId: current.organization?.distributorId ?? null } : null;
    const move = seatMove(holder, { companyId: company?.id ?? null, distributorId: company?.distributorId ?? null });
    const seatDistributorId = move.moved ? move.charge : current?.seatDistributorId ?? null;
    const enrollment = { courseId: courseLocale.courseId, locale: values.locale, organizationId: company?.id ?? null, seatDistributorId, paid: values.paid, notes: values.notes || null };

    await tx.user.update({ where: { id: userId }, data: profileData(values) });
    if (current) await tx.enrollment.update({ where: { id: current.id }, data: enrollment });
    else await tx.enrollment.create({ data: { ...enrollment, userId } });
    if (user.active && !values.active) await tx.session.deleteMany({ where: { userId } });

    const seats = await applySeatMove(tx, move);
    const details = changeDetails(userChanges(user, current, values), seats.join("; ") || undefined);
    if (details) await recordAudit(tx, { adminId, action: "userUpdated", entity: "user", entityId: userId, entityLabel: fullName(values), details });
    return { id: userId }
  });
}

export async function sendStudentPasswordReset(adminId: number, userId: number): Promise<AdminActionResult> {
  const user = await findStudent(prisma, userId);
  if (!user) return { ok: false, error: userActionMessages.notFound }
  const welcome = !await hasPassword(userId);

  try {
    await requestPasswordResetLink(user.email, resolveLocale(user.preferredLocale));
  } catch (error) {
    console.error("Admin password reset email failed", error);
    return { ok: false, error: userActionMessages.emailFailed }
  }

  await recordAudit(prisma, { adminId, action: "passwordResetSent", entity: "user", entityId: userId, entityLabel: fullName(user), details: `${welcome ? "Welcome email" : "Password reset"} sent to ${user.email}` });
  return { ok: true, message: welcome ? userActionMessages.welcomeSent : userActionMessages.resetSent }
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
