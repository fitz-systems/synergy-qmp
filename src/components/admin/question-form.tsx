"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminField, AdminFormActions } from "@/components/admin/admin-form-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { questionTypeLabels } from "@/constants/admin";
import { defaultQuestionOptions, optionLetter } from "@/lib/helpers/admin";
import type { AdminQuestion, AdminQuestionOption, QuestionType } from "@/types/admin";

interface QuestionFormProps {
  question?: AdminQuestion;
  cancelHref: string;
}

export function QuestionForm({ question, cancelHref }: QuestionFormProps) {
  const [type, setType] = useState<QuestionType>(question?.type ?? "multipleChoice");
  const [options, setOptions] = useState<AdminQuestionOption[]>(question?.options ?? defaultQuestionOptions("multipleChoice"));

  const changeType = (next: QuestionType) => {
    setType(next);
    setOptions(defaultQuestionOptions(next));
  }

  const update = (index: number, change: Partial<AdminQuestionOption>) => {
    setOptions((current) => current.map((option, i) => (i === index ? { ...option, ...change } : change.correct ? { ...option, correct: false } : option)));
  }

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <CardDescription>Editing a question never changes answers already recorded for past attempts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <AdminField id="question-type" label="Type">
            <Select value={type} onValueChange={(value) => changeType(value as QuestionType)}>
              <SelectTrigger id="question-type" className="w-full sm:w-60"><SelectValue/></SelectTrigger>
              <SelectContent>
                {Object.entries(questionTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </AdminField>
          <AdminField id="question-prompt" label="Question">
            <Textarea id="question-prompt" name="prompt" rows={4} defaultValue={question?.prompt} required/>
          </AdminField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
          <CardDescription>Select the correct answer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <fieldset className="space-y-3">
            <legend className="sr-only">Answers and correct answer</legend>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/10">
                <input
                  type="radio"
                  name="correct"
                  checked={option.correct}
                  onChange={() => update(index, { correct: true })}
                  aria-label={`Answer ${optionLetter(index)} is correct`}
                  className="size-4 shrink-0 accent-foreground"
                />
                <span className="w-5 text-sm font-semibold text-muted-foreground">{optionLetter(index)}</span>
                <Input
                  aria-label={`Answer ${optionLetter(index)}`}
                  value={option.text}
                  onChange={(event) => update(index, { text: event.target.value })}
                  readOnly={type === "trueFalse"}
                  className="bg-background"
                />
                {type === "multipleChoice" && options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove answer ${optionLetter(index)}`} onClick={() => setOptions((current) => current.filter((_, i) => i !== index))}>
                    <Trash2/>
                  </Button>
                )}
              </div>
            ))}
          </fieldset>
          {type === "multipleChoice" && options.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOptions((current) => [...current, { text: "", correct: false }])}>
              <Plus/>Add answer
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <AdminField id="question-explanation" label="Explanation" hint="Shown to admins only, to explain why the answer is correct.">
            <Textarea id="question-explanation" name="explanation" rows={3} defaultValue={question?.explanation}/>
          </AdminField>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Hidden questions are never drawn for new attempts.</p>
            </div>
            <Switch name="active" defaultChecked={question?.active ?? true} aria-label="Active"/>
          </div>
        </CardContent>
      </Card>

      <AdminFormActions submitLabel={question ? "Save question" : "Add question"} cancelHref={cancelHref}/>
    </form>
  );
}
