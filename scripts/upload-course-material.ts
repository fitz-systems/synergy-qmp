import pg from "pg";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { legacyCourseMaterialFiles } from "../src/constants/course-material.ts";
import { courseMaterialKey } from "../src/lib/helpers/course-material.ts";

const usage = "Usage: npm run storage:upload-course-material -- <folder with the course PDFs> [--write]";

const args = process.argv.slice(2);
const folder = args.find((arg) => !arg.startsWith("--"));
if (!folder) {
  console.error(usage);
  process.exit(1);
}

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const uploads = Object.entries(legacyCourseMaterialFiles).map(([fileName, { code, locale }]) => {
  const path = join(folder, fileName);
  return { fileName, code, locale, path, key: courseMaterialKey(code, locale), found: existsSync(path) }
});

for (const upload of uploads) {
  console.log(`${upload.found ? "found  " : "MISSING"}  ${upload.fileName.padEnd(24)} → ${upload.key}`);
}

if (uploads.some((upload) => !upload.found)) {
  console.error(`\nPut all four PDFs in ${folder} with their original names.`);
  process.exit(1);
}

if (!args.includes("--write")) {
  console.log("\nDry run: nothing was uploaded. Add --write to upload.");
  process.exit(0);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL (e.g. in .env.local).");
  process.exit(1);
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  for (const upload of uploads) {
    await put(upload.key, readFileSync(upload.path), { access: "private", contentType: "application/pdf", allowOverwrite: true });
    const { rowCount } = await client.query(
      `UPDATE "synergy"."course_locales" SET material_file_key = $1 WHERE locale = $2 AND course_id = (SELECT id FROM "synergy"."courses" WHERE code = $3)`,
      [upload.key, upload.locale, upload.code]
    );
    console.log(`uploaded ${upload.key}${rowCount === 1 ? "" : " (no matching course locale to update)"}`);
  }
} finally {
  await client.end();
}
