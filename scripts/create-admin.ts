import pg from "pg";

import { existsSync } from "node:fs";
import { hashPassword } from "better-auth/crypto";
import { passwordMinLength } from "../src/constants/auth.ts";

const usage = "Usage: ADMIN_PASSWORD=<password> npm run admin:create -- --email <email> --first <first name> --last <last name>";

const args = process.argv.slice(2);

function option(name: string) {
  const index = args.indexOf(`--${name}`);
  const value = index === -1 ? undefined : args[index + 1];
  return value && !value.startsWith("--") ? value.trim() : "";
}

const email = option("email").toLowerCase();
const firstName = option("first");
const lastName = option("last");

if (!email || !firstName || !lastName) {
  console.error(usage);
  process.exit(1);
}

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const password = process.env.ADMIN_PASSWORD ?? "";
if (password.length < passwordMinLength) {
  console.error(`Set ADMIN_PASSWORD to a password of at least ${passwordMinLength} characters.\n${usage}`);
  process.exit(1);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL (e.g. in .env.local).");
  process.exit(1);
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  const existing = await client.query(`SELECT id FROM "synergy"."users" WHERE email = $1`, [email]);
  if (existing.rowCount) {
    console.error(`${email} already has an account. Use a different email.`);
    process.exit(1);
  }

  const hash = await hashPassword(password);
  await client.query("BEGIN");
  const { rows } = await client.query<{ id: number }>(
    `INSERT INTO "synergy"."users" (name, email, email_verified, first_name, last_name, role, active, updated_at) VALUES ($1, $2, true, $3, $4, 'admin', true, now()) RETURNING id`,
    [`${firstName} ${lastName}`, email, firstName, lastName]
  );
  const userId = rows[0].id;
  await client.query(
    `INSERT INTO "synergy"."accounts" (user_id, account_id, provider_id, password, updated_at) VALUES ($1, $2, 'credential', $3, now())`,
    [userId, String(userId), hash]
  );
  await client.query("COMMIT");
  console.log(`Created admin ${firstName} ${lastName} <${email}> (user ${userId}). Sign in at /admin/login.`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
