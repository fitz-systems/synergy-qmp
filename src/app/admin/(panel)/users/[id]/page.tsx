import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Check, CircleAlert, Download, KeyRound, Pencil, RefreshCw, RotateCcw, Undo2, UserCheck, UserX, X } from "lucide-react";
import { clearPass, markPassed, reissueCertificate, resetAttempts, sendPasswordReset, setPaid, setUserActive } from "@/app/admin/(panel)/users/actions";
import { AdminActionButton, AdminConfirmAction } from "@/components/admin/admin-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge, ToggleBadge } from "@/components/admin/admin-table-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminAttemptParam, adminRoutes, statusToneIconStyles, statusToneStyles, welcomeFailedParam } from "@/constants/admin";
import { getAdminAttemptAnswers, getAdminUserDetail } from "@/lib/admin-users";
import { cn } from "@/lib/helpers/class-names";
import { adminCertificateHref, adminCompanyHref, adminDistributorHref, adminUserAttemptHref, adminUserEditHref, attemptsUsedLabel, enrollmentLabel, formatAdminDate, formatAdminDateTime, formatAdminTimestampDate, fullName, languageLabel, scoreLabel, searchParamValue, selectedAttemptId, todayInputValue } from "@/lib/helpers/admin";
import type { AdminUserAttempt } from "@/types/admin";

export const metadata: Metadata = {
  title: "User"
}

interface DetailListProps {
  rows: [string, React.ReactNode][];
}

interface AttemptResultProps {
  attempt: AdminUserAttempt;
}

function DetailList({ rows }: DetailListProps) {
  return (
    <dl className="divide-y text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AttemptResult({ attempt }: AttemptResultProps) {
  if (!attempt.submittedAt) return <Badge variant="outline" className={statusToneStyles.warning}>In progress</Badge>;
  return (
    <Badge variant="outline" className={attempt.passed ? statusToneStyles.success : statusToneStyles.danger}>
      {attempt.passed ? "Passed" : "Failed"}
    </Badge>
  );
}

export default async function AdminUserPage({ params, searchParams }: PageProps<"/admin/users/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await getAdminUserDetail(Number(id));
  if (!user) notFound();

  const name = fullName(user);
  const { current } = user;
  const answersFor = selectedAttemptId(user.attempts, searchParamValue(query, adminAttemptParam));
  const answers = answersFor ? await getAdminAttemptAnswers(user.id, answersFor) : [];
  const shownAttempt = user.attempts.find((attempt) => attempt.id === answersFor);
  const passed = current?.status === "passed";

  return (
    <>
      <AdminPageHeader
        title={name}
        description={user.email}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users", href: adminRoutes.users }, { label: name }]}
        actions={(
          <>
            <AdminActionButton action={sendPasswordReset.bind(null, user.id)} disabled={!user.active}><KeyRound/>Send password reset</AdminActionButton>
            <Button asChild><Link href={adminUserEditHref(user.id)}><Pencil/>Edit</Link></Button>
          </>
        )}
      />

      {searchParamValue(query, welcomeFailedParam) && (
        <div role="alert" className={cn("flex gap-2 rounded-md border px-4 py-3 text-sm", statusToneStyles.warning)}>
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0"/>
          The account was created, but the welcome email couldn&apos;t be sent. Use Send password reset to send it again.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList rows={[
              ["Company", current?.companyId ? <Link key="company" href={adminCompanyHref(current.companyId)} className="hover:underline">{current.company}</Link> : "—"],
              ["Language", languageLabel(user.preferredLocale)],
              ["Account", <ToggleBadge key="account" on={user.active} onLabel="Active" offLabel="Deactivated"/>],
              ["Created", formatAdminTimestampDate(user.createdAt)],
              ["Notes", current?.notes || "—"]
            ]}/>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
            {!current && <CardDescription>Not enrolled in a course. Edit the user to enroll them.</CardDescription>}
          </CardHeader>
          {current && (
            <CardContent className="space-y-4">
              <DetailList rows={[
                ["Course", enrollmentLabel(current.courseCode, current.locale)],
                ["Enrolled", formatAdminTimestampDate(current.enrolledOn)],
                ["Status", <StatusBadge key="status" status={current.status}/>],
                ["Attempts used", attemptsUsedLabel(current.attemptsUsed, current.maxAttempts)],
                ["Payment", <ToggleBadge key="paid" on={current.paid} onLabel="Paid" offLabel="Unpaid"/>],
                ["Seat", current.seatDistributorId ? <Link key="seat" href={adminDistributorHref(current.seatDistributorId)} className="hover:underline">{current.seatDistributor}</Link> : "—"]
              ]}/>
              <div className="flex flex-wrap gap-2">
                <AdminActionButton action={setPaid.bind(null, user.id, !current.paid)} size="sm">{current.paid ? "Mark unpaid" : "Mark paid"}</AdminActionButton>
                {passed ? (
                  <AdminConfirmAction
                    action={clearPass.bind(null, user.id)}
                    trigger={<Button variant="outline" size="sm"><Undo2/>Clear pass</Button>}
                    title={`Clear ${name}'s pass?`}
                    description={current.certificateNumber ? `The enrollment goes back to not passed and certificate ${current.certificateNumber} is withdrawn. Exam attempts stay on record.` : "The enrollment goes back to not passed. Exam attempts stay on record."}
                    confirmLabel="Clear pass"
                    destructive
                  />
                ) : (
                  <AdminConfirmAction
                    action={markPassed.bind(null, user.id)}
                    trigger={<Button variant="outline" size="sm"><Award/>Mark passed</Button>}
                    title={`Mark ${name} as passed?`}
                    description="Use this when the student passed outside the online exam. Their certificate becomes available right away."
                    confirmLabel="Mark passed"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="passed-on">Pass date</Label>
                      <Input id="passed-on" name="passedOn" type="date" defaultValue={todayInputValue()} max={todayInputValue()} required/>
                    </div>
                  </AdminConfirmAction>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Certificate</CardTitle>
            <CardDescription>{passed && current.passedOn ? `Passed ${formatAdminDate(current.passedOn)}` : "Issued when the student passes"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passed ? (
              <>
                {current.certificateNumber
                  ? <p className="font-mono text-lg font-semibold">{current.certificateNumber}</p>
                  : <p className="text-sm text-muted-foreground">A certificate number is assigned the first time it&apos;s downloaded.</p>}
                {current.certificateIssuedAt && <p className="text-xs text-muted-foreground">Issued {formatAdminDateTime(current.certificateIssuedAt)}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild><a href={adminCertificateHref(current.id)} download><Download/>Download PDF</a></Button>
                  <AdminConfirmAction
                    action={reissueCertificate.bind(null, user.id)}
                    trigger={<Button variant="outline" size="sm"><RefreshCw/>Reissue</Button>}
                    title="Reissue the certificate?"
                    description="The certificate number is regenerated from the pass date and the issue date is set to now. The PDF always uses the student's current name."
                    confirmLabel="Reissue"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No certificate yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Exam attempts</CardTitle>
          <CardDescription>Answers are stored as they were shown, so later edits to questions don&apos;t change them.</CardDescription>
          {current && (
            <CardAction>
              <AdminConfirmAction
                action={resetAttempts.bind(null, user.id)}
                trigger={<Button variant="outline" size="sm" disabled={current.attemptsUsed === 0}><RotateCcw/>Reset attempts</Button>}
                title={`Reset ${name}'s attempts?`}
                description="Their attempt count goes back to 0 so they can take the exam again. Past attempts and answers stay on record."
                confirmLabel="Reset attempts"
              />
            </CardAction>
          )}
        </CardHeader>
        {user.attempts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Started</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Result</TableHead>
                <TableHead className="pr-6 text-right"><span className="sr-only">Answers</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.attempts.map((attempt) => (
                <TableRow key={attempt.id} data-state={attempt.id === answersFor ? "selected" : undefined}>
                  <TableCell className="pl-6">
                    {formatAdminDateTime(attempt.startedAt)}
                    {!attempt.counted && <Badge variant="outline" className={cn("ml-2", statusToneStyles.neutral)}>Reset</Badge>}
                  </TableCell>
                  <TableCell>{enrollmentLabel(attempt.courseCode, attempt.locale)}</TableCell>
                  <TableCell className="text-right tabular-nums">{scoreLabel(attempt.correctCount, attempt.questionCount)}</TableCell>
                  <TableCell className="text-right"><AttemptResult attempt={attempt}/></TableCell>
                  <TableCell className="pr-6 text-right">
                    {attempt.submittedAt && attempt.id !== answersFor && (
                      <Button variant="ghost" size="sm" asChild><Link href={adminUserAttemptHref(user.id, attempt.id)} scroll={false}>View answers</Link></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-6 py-8 text-sm text-muted-foreground">No exam attempts yet.</p>
        )}
      </Card>

      {shownAttempt?.submittedAt && (
        <Card id="answers" className="scroll-mt-6 gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Answers</CardTitle>
            <CardDescription>Submitted {formatAdminDateTime(shownAttempt.submittedAt)} · {scoreLabel(shownAttempt.correctCount, shownAttempt.questionCount)}</CardDescription>
          </CardHeader>
          {answers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="pr-6 text-right">Correct</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answers.map((answer) => (
                  <TableRow key={answer.id}>
                    <TableCell className="max-w-md pl-6 whitespace-normal">{answer.question}</TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      {answer.answer ?? <span className="text-muted-foreground">No answer</span>}
                      {!answer.correct && answer.correctAnswer && <p className="mt-1 text-xs text-muted-foreground">Correct: {answer.correctAnswer}</p>}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {answer.correct
                        ? <Check aria-label="Correct" className={cn("ml-auto size-4", statusToneIconStyles.success)}/>
                        : <X aria-label="Incorrect" className={cn("ml-auto size-4", statusToneIconStyles.danger)}/>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-6 py-8 text-sm text-muted-foreground">No answers were recorded for this attempt.</p>
          )}
        </Card>
      )}

      {user.enrollments.length > 1 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Enrollment history</CardTitle>
            <CardDescription>Earlier enrollments, such as recertifications. Actions above apply to the newest one.</CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Enrolled</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="pr-6 text-right"><span className="sr-only">Download</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="pl-6">{formatAdminTimestampDate(enrollment.enrolledOn)}</TableCell>
                  <TableCell>{enrollment.courseName}</TableCell>
                  <TableCell><StatusBadge status={enrollment.status}/></TableCell>
                  <TableCell className="font-mono text-xs">{enrollment.certificateNumber ?? "—"}</TableCell>
                  <TableCell className="pr-6 text-right">
                    {enrollment.status === "passed" && (
                      <Button variant="ghost" size="sm" asChild><a href={adminCertificateHref(enrollment.id)} download><Download/>PDF</a></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className={user.active ? "border-red-200 dark:border-red-900" : undefined}>
        <CardHeader>
          <CardTitle>{user.active ? "Deactivate account" : "Reactivate account"}</CardTitle>
          <CardDescription>{user.active ? "The student can no longer log in. Their records and certificate stay on file." : "The student can log in again."}</CardDescription>
          <CardAction>
            <AdminConfirmAction
              action={setUserActive.bind(null, user.id, !user.active)}
              trigger={<Button variant={user.active ? "destructive" : "outline"}>{user.active ? <UserX/> : <UserCheck/>}{user.active ? "Deactivate" : "Reactivate"}</Button>}
              title={user.active ? `Deactivate ${name}?` : `Reactivate ${name}?`}
              description={user.active ? "They'll be signed out and can't log in until you reactivate the account." : "They'll be able to log in with their existing password."}
              confirmLabel={user.active ? "Deactivate" : "Reactivate"}
              destructive={user.active}
            />
          </CardAction>
        </CardHeader>
      </Card>
    </>
  );
}
