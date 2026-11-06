import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Download, KeyRound, Pencil, RefreshCw, RotateCcw, UserX, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge, ToggleBadge } from "@/components/admin/admin-table-parts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminRoutes, statusToneIconStyles, statusToneStyles } from "@/constants/admin";
import { getAdminAttempts, getAdminUser, getAttemptAnswers } from "@/lib/admin";
import { cn } from "@/lib/helpers/class-names";
import { adminUserEditHref, attemptScorePct, courseLabel, formatAdminDate, formatAdminDateTime, fullName, languageLabel } from "@/lib/helpers/admin";

export const metadata: Metadata = {
  title: "User"
}

interface DetailListProps {
  rows: [string, React.ReactNode][];
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

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const user = await getAdminUser(Number(id));
  if (!user) notFound();
  const [attempts, answers] = await Promise.all([getAdminAttempts(user.id), getAttemptAnswers()]);
  const name = fullName(user);

  return (
    <>
      <AdminPageHeader
        title={name}
        description={user.email}
        crumbs={[{ label: "Dashboard", href: adminRoutes.dashboard }, { label: "Users", href: adminRoutes.users }, { label: name }]}
        actions={(
          <>
            <Button variant="outline"><KeyRound/>Send password reset</Button>
            <Button asChild><Link href={adminUserEditHref(user.id)}><Pencil/>Edit</Link></Button>
          </>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList rows={[
              ["Company", user.company],
              ["Language", languageLabel(user.locale)],
              ["Account", <ToggleBadge key="account" on={user.active} onLabel="Active" offLabel="Deactivated"/>],
              ["Notes", user.notes ?? "—"]
            ]}/>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList rows={[
              ["Course", `${courseLabel(user.courseCode)} · ${languageLabel(user.locale)}`],
              ["Enrolled", formatAdminDate(user.enrolledOn)],
              ["Status", <StatusBadge key="status" status={user.status}/>],
              ["Attempts used", user.attemptsUsed]
            ]}/>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Certificate</CardTitle>
            <CardDescription>{user.certificateNumber ? `Passed ${formatAdminDate(user.passedOn ?? user.enrolledOn)}` : "Issued when the student passes"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.certificateNumber ? (
              <>
                <p className="font-mono text-lg font-semibold">{user.certificateNumber}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm"><Download/>Download PDF</Button>
                  <Button variant="outline" size="sm"><RefreshCw/>Reissue</Button>
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
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={user.attemptsUsed === 0}><RotateCcw/>Reset attempts</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset {name}&apos;s attempts?</AlertDialogTitle>
                  <AlertDialogDescription>Their attempt count goes back to 0 so they can take the exam again. Past attempts and answers stay on record.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Reset attempts</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
        {attempts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Submitted</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="pr-6 text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="pl-6">{formatAdminDateTime(attempt.submittedAt)}</TableCell>
                  <TableCell>{courseLabel(attempt.courseCode)} · {languageLabel(attempt.locale)}</TableCell>
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
        ) : (
          <p className="px-6 py-8 text-sm text-muted-foreground">No exam attempts yet.</p>
        )}
      </Card>

      {attempts.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Answers from the latest attempt</CardTitle>
          </CardHeader>
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
                <TableRow key={answer.question}>
                  <TableCell className="max-w-md pl-6 whitespace-normal">{answer.question}</TableCell>
                  <TableCell>{answer.answer}</TableCell>
                  <TableCell className="pr-6 text-right">
                    {answer.correct
                      ? <Check aria-label="Correct" className={cn("ml-auto size-4", statusToneIconStyles.success)}/>
                      : <X aria-label="Incorrect" className={cn("ml-auto size-4", statusToneIconStyles.danger)}/>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle>{user.active ? "Deactivate account" : "Reactivate account"}</CardTitle>
          <CardDescription>{user.active ? "The student can no longer log in. Their records and certificate stay on file." : "The student can log in again."}</CardDescription>
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={user.active ? "destructive" : "outline"}><UserX/>{user.active ? "Deactivate" : "Reactivate"}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{user.active ? `Deactivate ${name}?` : `Reactivate ${name}?`}</AlertDialogTitle>
                  <AlertDialogDescription>{user.active ? "They'll be signed out and can't log in until you reactivate the account." : "They'll be able to log in with their existing password."}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>{user.active ? "Deactivate" : "Reactivate"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
      </Card>
    </>
  );
}
