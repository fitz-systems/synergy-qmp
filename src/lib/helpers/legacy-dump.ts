import type { DumpRow, LegacyAnswer, LegacyDump, LegacyUser } from "@/types/legacy-migration";

const mysqlEscapes: Record<string, string> = { n: "\n", r: "\r", t: "\t", "0": "\0", Z: "\x1a" }

export function readDumpRows(sql: string, table: string): DumpRow[] {
  const rows: DumpRow[] = [];
  const header = new RegExp("INSERT INTO `" + table + "` \\(([^)]*)\\) VALUES\\s*", "g");
  let match: RegExpExecArray | null;
  while ((match = header.exec(sql))) {
    const columns = match[1].split(",").map((column) => column.trim().replace(/`/g, ""));
    let i = header.lastIndex;
    while (true) {
      i = skipWhitespace(sql, i);
      if (sql[i] !== "(") throw new Error(`Unexpected dump syntax in ${table} at offset ${i}`);
      const tuple = readTuple(sql, i + 1);
      if (tuple.values.length !== columns.length) throw new Error(`Column count mismatch in ${table} at offset ${i}`);
      rows.push(Object.fromEntries(columns.map((column, index) => [column, tuple.values[index]])));
      i = skipWhitespace(sql, tuple.end);
      if (sql[i] === ",") {
        i++;
        continue;
      }
      if (sql[i] === ";") break;
      throw new Error(`Unexpected dump syntax in ${table} at offset ${i}`);
    }
    header.lastIndex = i;
  }
  return rows;
}

function skipWhitespace(sql: string, i: number) {
  while (/\s/.test(sql[i] ?? "")) i++;
  return i;
}

function readTuple(sql: string, start: number) {
  const values: (string | null)[] = [];
  let i = start;
  while (true) {
    i = skipWhitespace(sql, i);
    if (sql[i] === "'") {
      const quoted = readQuoted(sql, i + 1);
      values.push(quoted.value);
      i = quoted.end;
    } else {
      let raw = "";
      while (sql[i] !== "," && sql[i] !== ")") raw += sql[i++];
      raw = raw.trim();
      values.push(raw === "NULL" ? null : raw);
    }
    i = skipWhitespace(sql, i);
    if (sql[i] === ")") return { values, end: i + 1 }
    i++;
  }
}

function readQuoted(sql: string, start: number) {
  let value = "";
  let i = start;
  while (i < sql.length) {
    const char = sql[i];
    if (char === "\\") {
      const next = sql[i + 1];
      value += mysqlEscapes[next] ?? next;
      i += 2;
    } else if (char === "'" && sql[i + 1] === "'") {
      value += "'";
      i += 2;
    } else if (char === "'") {
      return { value, end: i + 1 }
    } else {
      value += char;
      i++;
    }
  }
  throw new Error("Unterminated string in dump");
}

function text(row: DumpRow, column: string) {
  return row[column] ?? "";
}

function optionalText(row: DumpRow, column: string) {
  const value = row[column]?.trim();
  return value ? value : null;
}

function realDate(value: string | null) {
  return value && !value.startsWith("0000") ? value : null;
}

export function readLegacyDump(sql: string): LegacyDump {
  const users: LegacyUser[] = readDumpRows(sql, "users").map((row) => ({
    id: Number(row.id),
    firstName: text(row, "first_name"),
    lastName: text(row, "last_name"),
    email: text(row, "email"),
    password: text(row, "password"),
    company: optionalText(row, "company"),
    course: text(row, "course"),
    paid: Number(row.paid ?? 0) > 0,
    passedOn: realDate(row.passed_on),
    created: text(row, "created"),
    notes: optionalText(row, "notes")
  }));
  const answers: LegacyAnswer[] = readDumpRows(sql, "user_exam_answers").map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    question: text(row, "question"),
    answer: text(row, "answer"),
    isCorrect: row.is_correct === "1",
    createdAt: text(row, "created_at")
  }));
  const certificateCodes = Object.fromEntries(readDumpRows(sql, "RCEEM").map((row) => [text(row, "course"), text(row, "code")]));
  return { users, answers, certificateCodes }
}

export function legacyTimestamp(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`);
}
