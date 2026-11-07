-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "synergy";

-- CreateTable
CREATE TABLE "synergy"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "preferred_locale" TEXT NOT NULL DEFAULT 'en',
    "role" TEXT NOT NULL DEFAULT 'student',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "password" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(6),
    "refresh_token_expires_at" TIMESTAMPTZ(6),
    "scope" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."verifications" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."courses" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "certificate_valid_months" INTEGER NOT NULL DEFAULT 36,
    "pass_mark_pct" INTEGER NOT NULL DEFAULT 75,
    "questions_per_attempt" INTEGER NOT NULL,
    "time_limit_minutes" INTEGER NOT NULL DEFAULT 120,
    "max_attempts" INTEGER DEFAULT 3,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT true,
    "shuffle_answers" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."course_locales" (
    "course_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "material_file_key" TEXT,
    "certificate_code" TEXT NOT NULL,

    CONSTRAINT "course_locales_pkey" PRIMARY KEY ("course_id","locale")
);

-- CreateTable
CREATE TABLE "synergy"."enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "organization_id" INTEGER,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "passed_on" DATE,
    "certificate_number" TEXT,
    "certificate_issued_at" TIMESTAMPTZ(6),
    "attempts_reset_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "legacy_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."questions" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'multipleChoice',
    "prompt" TEXT NOT NULL,
    "options" TEXT[],
    "correct_index" INTEGER NOT NULL,
    "explanation" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."attempts" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "submitted_at" TIMESTAMPTZ(6),
    "pass_mark_pct" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,
    "correct_count" INTEGER,
    "passed" BOOLEAN,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."attempt_answers" (
    "id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "question_text" TEXT NOT NULL,
    "options" TEXT[],
    "selected_index" INTEGER,
    "answer_text" TEXT,
    "correct_answer_text" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."reviews" (
    "id" SERIAL NOT NULL,
    "locale" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "role_company" TEXT,
    "body" TEXT NOT NULL,
    "rating" INTEGER,
    "photo_key" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synergy"."audit_log" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "entity_label" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "synergy"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "synergy"."sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "synergy"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "synergy"."accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "synergy"."verifications"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "synergy"."organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "synergy"."courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_certificate_number_key" ON "synergy"."enrollments"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_legacy_user_id_key" ON "synergy"."enrollments"("legacy_user_id");

-- CreateIndex
CREATE INDEX "enrollments_user_id_idx" ON "synergy"."enrollments"("user_id");

-- CreateIndex
CREATE INDEX "enrollments_organization_id_idx" ON "synergy"."enrollments"("organization_id");

-- CreateIndex
CREATE INDEX "questions_course_id_locale_idx" ON "synergy"."questions"("course_id", "locale");

-- CreateIndex
CREATE INDEX "attempts_enrollment_id_idx" ON "synergy"."attempts"("enrollment_id");

-- CreateIndex
CREATE INDEX "attempt_answers_attempt_id_idx" ON "synergy"."attempt_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "synergy"."audit_log"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_entity_entity_id_idx" ON "synergy"."audit_log"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_admin_id_idx" ON "synergy"."audit_log"("admin_id");

-- AddForeignKey
ALTER TABLE "synergy"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "synergy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "synergy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."course_locales" ADD CONSTRAINT "course_locales_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "synergy"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "synergy"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."enrollments" ADD CONSTRAINT "enrollments_course_id_locale_fkey" FOREIGN KEY ("course_id", "locale") REFERENCES "synergy"."course_locales"("course_id", "locale") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."enrollments" ADD CONSTRAINT "enrollments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "synergy"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."questions" ADD CONSTRAINT "questions_course_id_locale_fkey" FOREIGN KEY ("course_id", "locale") REFERENCES "synergy"."course_locales"("course_id", "locale") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."attempts" ADD CONSTRAINT "attempts_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "synergy"."enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "synergy"."attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "synergy"."questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synergy"."audit_log" ADD CONSTRAINT "audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "synergy"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Checks Prisma can't express in schema.prisma
ALTER TABLE "synergy"."users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN ('student', 'admin'));
ALTER TABLE "synergy"."courses" ADD CONSTRAINT "courses_pass_mark_pct_check" CHECK ("pass_mark_pct" BETWEEN 1 AND 100);
ALTER TABLE "synergy"."courses" ADD CONSTRAINT "courses_exam_settings_check" CHECK ("questions_per_attempt" > 0 AND "time_limit_minutes" > 0 AND ("max_attempts" IS NULL OR "max_attempts" > 0));
ALTER TABLE "synergy"."questions" ADD CONSTRAINT "questions_type_check" CHECK ("type" IN ('multipleChoice', 'trueFalse'));
ALTER TABLE "synergy"."questions" ADD CONSTRAINT "questions_options_count_check" CHECK (cardinality("options") BETWEEN 2 AND 6);
ALTER TABLE "synergy"."questions" ADD CONSTRAINT "questions_correct_index_check" CHECK ("correct_index" >= 0 AND "correct_index" < cardinality("options"));
ALTER TABLE "synergy"."attempts" ADD CONSTRAINT "attempts_pass_mark_pct_check" CHECK ("pass_mark_pct" BETWEEN 1 AND 100);
ALTER TABLE "synergy"."attempts" ADD CONSTRAINT "attempts_expires_after_start_check" CHECK ("expires_at" > "started_at");
ALTER TABLE "synergy"."attempt_answers" ADD CONSTRAINT "attempt_answers_selected_index_check" CHECK ("selected_index" IS NULL OR ("selected_index" >= 0 AND "selected_index" < cardinality("options")));
ALTER TABLE "synergy"."reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
