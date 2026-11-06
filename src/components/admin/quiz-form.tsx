import { AdminField, AdminFormActions, AdminFormSection } from "@/components/admin/admin-form-parts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { courseOptions, languageOptions } from "@/constants/admin";
import type { AdminQuiz } from "@/types/admin";

interface QuizFormProps {
  quiz?: AdminQuiz;
  submitLabel: string;
  cancelHref: string;
}

interface SettingSwitchProps {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
}

function SettingSwitch({ name, label, hint, checked }: SettingSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch name={name} defaultChecked={checked} aria-label={label}/>
    </div>
  );
}

export function QuizForm({ quiz, submitLabel, cancelHref }: QuizFormProps) {
  return (
    <form className="space-y-6">
      <AdminFormSection title="Quiz">
        <AdminField id="quiz-title" label="Title" className="grid gap-2 sm:col-span-2">
          <Input id="quiz-title" name="title" defaultValue={quiz?.title} required/>
        </AdminField>
        <AdminField id="quiz-course" label="Course">
          <Select name="course" defaultValue={quiz?.courseCode ?? "ground"}>
            <SelectTrigger id="quiz-course" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>{courseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
        <AdminField id="quiz-language" label="Language">
          <Select name="locale" defaultValue={quiz?.locale ?? "en"}>
            <SelectTrigger id="quiz-language" className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>{languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AdminField>
      </AdminFormSection>

      <AdminFormSection title="Exam settings" description="Applies to new attempts. Past attempts keep the settings they were taken with.">
        <AdminField id="quiz-pass-mark" label="Pass mark (%)">
          <Input id="quiz-pass-mark" name="passMarkPct" type="number" min={1} max={100} defaultValue={quiz?.passMarkPct ?? 75}/>
        </AdminField>
        <AdminField id="quiz-shown" label="Questions per attempt" hint={quiz ? `Drawn at random from ${quiz.questionCount} questions` : undefined}>
          <Input id="quiz-shown" name="questionsShown" type="number" min={1} defaultValue={quiz?.questionsShown ?? 20}/>
        </AdminField>
        <AdminField id="quiz-time" label="Time limit (minutes)">
          <Input id="quiz-time" name="timeLimitMinutes" type="number" min={1} defaultValue={quiz?.timeLimitMinutes ?? 120}/>
        </AdminField>
        <AdminField id="quiz-attempts" label="Maximum attempts">
          <Input id="quiz-attempts" name="maxAttempts" type="number" min={1} defaultValue={quiz?.maxAttempts ?? 3}/>
        </AdminField>
        <SettingSwitch name="shuffleQuestions" label="Shuffle questions" hint="Each attempt shows the questions in a new order." checked={quiz?.shuffleQuestions ?? true}/>
        <SettingSwitch name="shuffleAnswers" label="Shuffle answers" hint="Answer options appear in a new order." checked={quiz?.shuffleAnswers ?? true}/>
        <div className="sm:col-span-2">
          <SettingSwitch name="active" label="Active" hint="Students enrolled in this course and language take this quiz." checked={quiz?.active ?? false}/>
        </div>
      </AdminFormSection>

      <AdminFormActions submitLabel={submitLabel} cancelHref={cancelHref}/>
    </form>
  );
}
