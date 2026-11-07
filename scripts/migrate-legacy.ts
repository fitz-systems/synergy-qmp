import { existsSync, readFileSync } from "node:fs";

import { courses } from "../src/content/courses.ts";
import { readLegacyDump } from "../src/lib/helpers/legacy-dump.ts";
import { buildMigrationPlan } from "../src/lib/helpers/legacy-migration.ts";
import { readQuestionCsv } from "../src/lib/helpers/legacy-questions.ts";
import { formatMigrationReport } from "../src/lib/helpers/legacy-report.ts";
import { countMigratedRows, writeMigrationPlan } from "../src/lib/legacy-migration.ts";

const usage = "Usage: npm run db:migrate-legacy -- <synergy_custom.sql> [--questions <quiz-data.csv>] [--write] [--verbose] [--force]";

const args = process.argv.slice(2);
const questionsFlag = args.indexOf("--questions");
const questionsPath = questionsFlag === -1 ? null : args[questionsFlag + 1];
const dumpPath = args.find((arg, index) => !arg.startsWith("--") && index !== questionsFlag + 1);

if (!dumpPath || (questionsFlag !== -1 && (!questionsPath || questionsPath.startsWith("--")))) {
  console.error(usage);
  process.exit(1);
}

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const questionRows = questionsPath ? readQuestionCsv(readFileSync(questionsPath)) : null;
const plan = buildMigrationPlan(readLegacyDump(readFileSync(dumpPath, "utf8")), courses, questionRows);
console.log(formatMigrationReport(plan.report, args.includes("--verbose")));

if (!args.includes("--write")) {
  console.log("\nDry run: nothing was written. Add --write to migrate.");
  process.exit(0);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL (e.g. in .env.local).");
  process.exit(1);
}

console.log(`\nWriting to ${new URL(connectionString).host} …`);
const { removedUsers } = await writeMigrationPlan(connectionString, plan, { force: args.includes("--force") });
if (removedUsers) console.log(`Replaced ${removedUsers} students from an earlier run.`);
console.log("Migrated rows:", await countMigratedRows(connectionString));
